import { FollowupDraftStatus, FollowupState, ResponseStatus, SendStatus, TemplateKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  buildDefaultFollowupBody,
  buildDefaultFollowupSubject,
  computeNextFollowupDueAt,
  getMaxFollowups,
} from "@/lib/followups";

function isJobAuthorized(request: Request): boolean {
  const configuredSecret = process.env.FOLLOWUP_JOB_SECRET;
  if (!configuredSecret) return false;
  const requestSecret = request.headers.get("x-job-secret");
  return Boolean(requestSecret) && requestSecret === configuredSecret;
}

export async function POST(request: Request) {
  if (!isJobAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized job trigger." }, { status: 401 });
  }

  const now = new Date();
  const maxFollowups = getMaxFollowups();

  const eligibleMessages = await db.outreachMessage.findMany({
    where: {
      sendStatus: {
        in: [SendStatus.sent, SendStatus.delivered],
      },
      responseStatus: {
        not: ResponseStatus.replied,
      },
      followupState: {
        in: [FollowupState.none, FollowupState.due],
      },
      nextFollowupDueAt: {
        lte: now,
      },
      sequenceNumber: {
        lt: maxFollowups,
      },
      followupDrafts: {
        none: {
          status: {
            in: [FollowupDraftStatus.pending_review, FollowupDraftStatus.approved],
          },
        },
      },
    },
    include: {
      contact: true,
    },
    orderBy: {
      nextFollowupDueAt: "asc",
    },
    take: 200,
  });

  let draftedCount = 0;
  for (const message of eligibleMessages) {
    const template = await db.template.findFirst({
      where: {
        kind: TemplateKind.followup,
        OR: [{ userId: message.userId }, { isDefault: true }],
      },
      orderBy: [{ userId: "desc" }, { isDefault: "desc" }, { createdAt: "desc" }],
    });

    const nextSequence = message.sequenceNumber + 1;
    const dueAt = computeNextFollowupDueAt(now);

    await db.$transaction([
      db.followupDraft.create({
        data: {
          messageId: message.id,
          contactId: message.contactId,
          userId: message.userId,
          templateId: template?.id ?? null,
          subjectDraft:
            template?.subject && template.subject.trim().length > 0
              ? template.subject
              : buildDefaultFollowupSubject(message.subject, nextSequence),
          bodyDraft:
            template?.bodyText && template.bodyText.trim().length > 0
              ? template.bodyText
              : buildDefaultFollowupBody(message.contact.name),
          dueAt: message.nextFollowupDueAt ?? now,
        },
      }),
      db.outreachMessage.update({
        where: { id: message.id },
        data: {
          followupState: FollowupState.drafted,
          responseStatus: ResponseStatus.no_response,
          nextFollowupDueAt: dueAt,
        },
      }),
      db.messageEvent.create({
        data: {
          messageId: message.id,
          eventType: "followup.draft_created",
          payloadJson: JSON.stringify({
            sequenceNumber: nextSequence,
            contactId: message.contactId,
          }),
        },
      }),
    ]);

    draftedCount += 1;
  }

  return NextResponse.json({
    ok: true,
    scanned: eligibleMessages.length,
    drafted: draftedCount,
  });
}
