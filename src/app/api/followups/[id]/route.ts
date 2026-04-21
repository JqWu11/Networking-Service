import { FollowupDraftStatus, FollowupState, MessageKind, ResponseStatus, SendStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSignedInUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeNextFollowupDueAt, getMaxFollowups } from "@/lib/followups";

type FollowupActionBody = {
  action?: "save" | "approve_send" | "snooze" | "discard" | "mark_replied";
  subjectDraft?: string;
  bodyDraft?: string;
  snoozeDays?: number;
  dueAt?: string;
};

const DEFAULT_FROM = "onboarding@resend.dev";

function sanitizeDisplayName(name: string): string {
  return name.replace(/[<>"\\]/g, "").trim();
}

function buildFromHeader(verifiedAddress: string, displayName: string | null): string {
  if (!displayName) return verifiedAddress;
  const safe = sanitizeDisplayName(displayName);
  if (!safe) return verifiedAddress;
  return `${safe} <${verifiedAddress}>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bodyToHtml(plainBody: string): string {
  const paragraphs = plainBody
    .split(/\n{2,}/)
    .map((block) => {
      const withBreaks = escapeHtml(block).replace(/\n/g, "<br />");
      return `<p>${withBreaks}</p>`;
    })
    .join("");
  return paragraphs || "<p></p>";
}

function parseDueDate(payload: FollowupActionBody): Date {
  if (payload.dueAt) {
    const parsed = new Date(payload.dueAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (Number.isFinite(payload.snoozeDays) && (payload.snoozeDays ?? 0) > 0) {
    const date = new Date();
    date.setDate(date.getDate() + (payload.snoozeDays ?? 0));
    return date;
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 2);
  return fallback;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const signedInUser = await getSignedInUser();
  if (!signedInUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;

  let payload: FollowupActionBody;
  try {
    payload = (await request.json()) as FollowupActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = payload.action;
  if (!action) {
    return NextResponse.json({ error: "action is required." }, { status: 400 });
  }

  const draft = await db.followupDraft.findFirst({
    where: { id, userId: signedInUser.userId },
    include: {
      contact: true,
      message: true,
    },
  });
  if (!draft) {
    return NextResponse.json({ error: "Follow-up draft not found." }, { status: 404 });
  }

  if (action === "save") {
    const subjectDraft = payload.subjectDraft?.trim();
    const bodyDraft = payload.bodyDraft?.trim();
    if (!subjectDraft || !bodyDraft) {
      return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
    }

    const updated = await db.followupDraft.update({
      where: { id: draft.id },
      data: {
        subjectDraft,
        bodyDraft,
      },
    });
    return NextResponse.json({ ok: true, draft: updated });
  }

  if (action === "snooze") {
    const dueAt = parseDueDate(payload);
    const updated = await db.followupDraft.update({
      where: { id: draft.id },
      data: { dueAt },
    });
    await db.messageEvent.create({
      data: {
        messageId: draft.messageId,
        eventType: "followup.snoozed",
        payloadJson: JSON.stringify({ draftId: draft.id, dueAt: dueAt.toISOString() }),
      },
    });
    return NextResponse.json({ ok: true, draft: updated });
  }

  if (action === "discard") {
    await db.$transaction([
      db.followupDraft.update({
        where: { id: draft.id },
        data: { status: FollowupDraftStatus.discarded },
      }),
      db.outreachMessage.update({
        where: { id: draft.messageId },
        data: { followupState: FollowupState.skipped },
      }),
      db.messageEvent.create({
        data: {
          messageId: draft.messageId,
          eventType: "followup.discarded",
          payloadJson: JSON.stringify({ draftId: draft.id }),
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (action === "mark_replied") {
    await db.$transaction([
      db.outreachMessage.update({
        where: { id: draft.messageId },
        data: {
          responseStatus: ResponseStatus.replied,
          followupState: FollowupState.closed,
        },
      }),
      db.followupDraft.updateMany({
        where: {
          messageId: draft.messageId,
          status: {
            in: [FollowupDraftStatus.pending_review, FollowupDraftStatus.approved],
          },
        },
        data: {
          status: FollowupDraftStatus.discarded,
        },
      }),
      db.messageEvent.create({
        data: {
          messageId: draft.messageId,
          eventType: "message.replied",
          payloadJson: JSON.stringify({ source: "followup_queue" }),
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (action !== "approve_send") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY is missing." }, { status: 503 });
  }

  if (draft.message.sequenceNumber >= getMaxFollowups()) {
    return NextResponse.json({ error: "Maximum follow-up sequence reached." }, { status: 400 });
  }

  const verifiedAddress = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromHeader = buildFromHeader(verifiedAddress, signedInUser.displayName);

  const { data, error } = await resend.emails.send({
    from: fromHeader,
    to: draft.contact.email,
    replyTo: signedInUser.email,
    subject: draft.subjectDraft,
    text: draft.bodyDraft,
    html: bodyToHtml(draft.bodyDraft),
  });

  if (error) {
    await db.messageEvent.create({
      data: {
        messageId: draft.messageId,
        eventType: "followup.send_failed",
        payloadJson: JSON.stringify(error),
      },
    });
    return NextResponse.json({ error: error.message ?? "Failed to send follow-up." }, { status: 502 });
  }

  const sentAt = new Date();
  const followupMessage = await db.outreachMessage.create({
    data: {
      userId: signedInUser.userId,
      contactId: draft.contactId,
      kind: MessageKind.followup,
      sequenceNumber: draft.message.sequenceNumber + 1,
      parentMessageId: draft.messageId,
      subject: draft.subjectDraft,
      bodyText: draft.bodyDraft,
      bodyHtml: bodyToHtml(draft.bodyDraft),
      provider: "resend",
      providerMessageId: data?.id ?? null,
      sendStatus: SendStatus.sent,
      sentAt,
      nextFollowupDueAt: computeNextFollowupDueAt(sentAt),
      followupState: FollowupState.none,
      responseStatus: ResponseStatus.unknown,
    },
  });

  await db.$transaction([
    db.followupDraft.update({
      where: { id: draft.id },
      data: { status: FollowupDraftStatus.sent },
    }),
    db.outreachMessage.update({
      where: { id: draft.messageId },
      data: { followupState: FollowupState.sent },
    }),
    db.messageEvent.create({
      data: {
        messageId: draft.messageId,
        eventType: "followup.sent",
        payloadJson: JSON.stringify({
          draftId: draft.id,
          followupMessageId: followupMessage.id,
          providerMessageId: data?.id ?? null,
        }),
      },
    }),
    db.messageEvent.create({
      data: {
        messageId: followupMessage.id,
        eventType: "message.sent",
        payloadJson: JSON.stringify({
          providerMessageId: data?.id ?? null,
          sourceDraftId: draft.id,
        }),
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    followupMessageId: followupMessage.id,
    providerMessageId: data?.id ?? null,
  });
}
