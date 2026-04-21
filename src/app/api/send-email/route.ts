import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSignedInUser } from "@/lib/auth";
import { db, isDbConfigured } from "@/lib/db";
import { computeNextFollowupDueAt, getMaxFollowups } from "@/lib/followups";

type SendEmailBody = {
  to?: string;
  subject?: string;
  body?: string;
  contactId?: string;
  contactName?: string;
  contactCompany?: string;
  kind?: "initial" | "followup";
  sequenceNumber?: number;
  parentMessageId?: string;
  scheduledAt?: string;
};

const DEFAULT_FROM = "onboarding@resend.dev";

function sanitizeDisplayName(name: string): string {
  return name.replace(/[<>"\\]/g, "").trim();
}

function buildFromHeader(
  verifiedAddress: string,
  signedInUser: { displayName: string | null } | null,
): string {
  if (!signedInUser?.displayName) return verifiedAddress;
  const safe = sanitizeDisplayName(signedInUser.displayName);
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

function mapDatabaseErrorToResponse(err: unknown): NextResponse | null {
  const maybePrismaError = err as { code?: string };
  if (!maybePrismaError?.code) return null;

  if (maybePrismaError.code === "P1001") {
    return NextResponse.json(
      {
        error:
          "Cannot connect to the database server. Verify DATABASE_URL, database status, and network access.",
      },
      { status: 503 },
    );
  }

  return null;
}

export async function POST(request: Request) {
  let payload: SendEmailBody;
  try {
    payload = (await request.json()) as SendEmailBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const to = payload.to?.trim();
  const subject = payload.subject?.trim();
  const body = payload.body?.trim();
  const kind = payload.kind === "followup" ? "followup" : "initial";
  const sequenceNumber = Number.isFinite(payload.sequenceNumber) ? Math.max(0, payload.sequenceNumber ?? 0) : 0;
  const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;

  if (!to || !subject || !body) {
    return NextResponse.json(
      { error: "Recipient, subject, and body are all required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { error: "Recipient email address looks invalid." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email sending is disabled. Add RESEND_API_KEY to .env.local to enable Resend.",
      },
      { status: 503 },
    );
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email tracking is disabled. Add DATABASE_URL to .env and restart the dev server.",
      },
      { status: 503 },
    );
  }

  const signedInUser = await getSignedInUser();

  if (!signedInUser?.email || !signedInUser.userId) {
    return NextResponse.json(
      {
        error:
          "You must be signed in with a verified email to send. Please log in and try again.",
      },
      { status: 401 },
    );
  }

  const verifiedAddress = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const fromHeader = buildFromHeader(verifiedAddress, signedInUser);

  const resend = new Resend(apiKey);
  const normalizedEmail = to.toLowerCase();
  const shouldQueueFollowup = sequenceNumber < getMaxFollowups();

  try {
    const contact =
      payload.contactId && payload.contactId.trim().length > 0
        ? await db.contact.findFirst({
            where: { id: payload.contactId, userId: signedInUser.userId },
          })
        : await db.contact.upsert({
            where: {
              userId_email: {
                userId: signedInUser.userId,
                email: normalizedEmail,
              },
            },
            update: {
              name: payload.contactName?.trim() || undefined,
              company: payload.contactCompany?.trim() || undefined,
            },
            create: {
              userId: signedInUser.userId,
              email: normalizedEmail,
              name: payload.contactName?.trim() || undefined,
              company: payload.contactCompany?.trim() || undefined,
            },
          });

    if (!contact) {
      return NextResponse.json({ error: "Unable to resolve contact for this email." }, { status: 400 });
    }

    const trackedMessage = await db.outreachMessage.create({
      data: {
        userId: signedInUser.userId,
        contactId: contact.id,
        kind,
        sequenceNumber,
        parentMessageId: payload.parentMessageId?.trim() || null,
        subject,
        bodyText: body,
        bodyHtml: bodyToHtml(body),
        sendStatus: "queued",
        scheduledAt: scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : null,
      },
    });

    await db.messageEvent.create({
      data: {
        messageId: trackedMessage.id,
        eventType: "message.queued",
        payloadJson: JSON.stringify({
          to: normalizedEmail,
          scheduledAt: trackedMessage.scheduledAt?.toISOString() ?? null,
        }),
      },
    });

    const { data, error } = await resend.emails.send({
      from: fromHeader,
      to,
      replyTo: signedInUser.email,
      subject,
      html: bodyToHtml(body),
      text: body,
    });

    if (error) {
      console.error("Resend send error", error);
      await db.$transaction([
        db.outreachMessage.update({
          where: { id: trackedMessage.id },
          data: {
            sendStatus: "failed",
            failedAt: new Date(),
            followupState: "closed",
          },
        }),
        db.messageEvent.create({
          data: {
            messageId: trackedMessage.id,
            eventType: "message.failed",
            payloadJson: JSON.stringify(error),
          },
        }),
      ]);
      return NextResponse.json(
        { error: error.message ?? "Failed to send email." },
        { status: 502 },
      );
    }

      const sentAt = new Date();
      const nextFollowupDueAt = shouldQueueFollowup ? computeNextFollowupDueAt(sentAt) : null;

      await db.$transaction([
        db.outreachMessage.update({
          where: { id: trackedMessage.id },
          data: {
            providerMessageId: data?.id ?? null,
            sendStatus: "sent",
            sentAt,
            nextFollowupDueAt,
            followupState: shouldQueueFollowup ? "none" : "closed",
          },
        }),
        db.messageEvent.create({
          data: {
            messageId: trackedMessage.id,
            eventType: "message.sent",
            payloadJson: JSON.stringify({
              providerMessageId: data?.id ?? null,
              provider: "resend",
            }),
          },
        }),
      ]);

      return NextResponse.json({ ok: true, id: data?.id, messageId: trackedMessage.id, contactId: contact.id });
  } catch (err) {
    const mappedDbError = mapDatabaseErrorToResponse(err);
    if (mappedDbError) return mappedDbError;

    console.error("Resend send exception", err);

    const errorMessage = err instanceof Error ? err.message : "Unexpected error sending email.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
