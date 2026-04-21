import { SendStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { Resend, type WebhookEventPayload } from "resend";
import { db } from "@/lib/db";

const STATUS_WEIGHT: Record<SendStatus, number> = {
  queued: 0,
  accepted: 1,
  sent: 2,
  delivered: 3,
  failed: 4,
  bounced: 5,
  complained: 6,
  canceled: 7,
};

function mapEventToStatus(eventType: string): SendStatus | null {
  switch (eventType) {
    case "email.scheduled":
      return SendStatus.accepted;
    case "email.sent":
      return SendStatus.sent;
    case "email.delivered":
      return SendStatus.delivered;
    case "email.failed":
      return SendStatus.failed;
    case "email.bounced":
      return SendStatus.bounced;
    case "email.complained":
      return SendStatus.complained;
    default:
      return null;
  }
}

function shouldAdvanceStatus(current: SendStatus, next: SendStatus): boolean {
  return STATUS_WEIGHT[next] >= STATUS_WEIGHT[current];
}

function getEventTimestamp(payload: WebhookEventPayload): Date {
  const maybeDate = new Date(payload.created_at);
  return Number.isNaN(maybeDate.getTime()) ? new Date() : maybeDate;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "RESEND_WEBHOOK_SECRET is not configured." }, { status: 503 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing webhook signature headers." }, { status: 400 });
  }

  const rawBody = await request.text();
  const resend = new Resend(process.env.RESEND_API_KEY);

  let payload: WebhookEventPayload;
  try {
    payload = resend.webhooks.verify({
      payload: rawBody,
      webhookSecret,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
    });
  } catch (err) {
    console.error("Invalid Resend webhook signature", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (!("email_id" in payload.data)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const providerMessageId = payload.data.email_id;
  const message = await db.outreachMessage.findUnique({
    where: {
      provider_providerMessageId: {
        provider: "resend",
        providerMessageId,
      },
    },
  });

  if (!message) {
    return NextResponse.json({ ok: true, ignored: true, reason: "message_not_found" });
  }

  try {
    await db.messageEvent.create({
      data: {
        messageId: message.id,
        providerEventId: svixId,
        eventType: payload.type,
        eventAt: getEventTimestamp(payload),
        payloadJson: rawBody,
      },
    });
  } catch (err) {
    const maybeKnown = err as { code?: string };
    if (maybeKnown.code === "P2002") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    throw err;
  }

  const nextStatus = mapEventToStatus(payload.type);
  if (!nextStatus || !shouldAdvanceStatus(message.sendStatus, nextStatus)) {
    return NextResponse.json({ ok: true, ignored: true, reason: "no_status_transition" });
  }

  const eventTime = getEventTimestamp(payload);
  await db.outreachMessage.update({
    where: { id: message.id },
    data: {
      sendStatus: nextStatus,
      deliveredAt: nextStatus === SendStatus.delivered ? eventTime : undefined,
      failedAt:
        nextStatus === SendStatus.failed || nextStatus === SendStatus.bounced
          ? eventTime
          : undefined,
      followupState:
        nextStatus === SendStatus.failed || nextStatus === SendStatus.bounced
          ? "closed"
          : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
