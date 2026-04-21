import { FollowupDraftStatus, FollowupState, ResponseStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSignedInUser } from "@/lib/auth";
import { db } from "@/lib/db";

type ReplyBody = {
  messageId?: string;
  replyText?: string;
};

export async function POST(request: Request) {
  const signedInUser = await getSignedInUser();
  if (!signedInUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let payload: ReplyBody;
  try {
    payload = (await request.json()) as ReplyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messageId = payload.messageId?.trim();
  if (!messageId) {
    return NextResponse.json({ error: "messageId is required." }, { status: 400 });
  }

  const message = await db.outreachMessage.findFirst({
    where: {
      id: messageId,
      userId: signedInUser.userId,
    },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  await db.$transaction([
    db.outreachMessage.update({
      where: { id: messageId },
      data: {
        responseStatus: ResponseStatus.replied,
        followupState: FollowupState.closed,
      },
    }),
    db.followupDraft.updateMany({
      where: {
        messageId,
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
        messageId,
        eventType: "message.replied",
        payloadJson: JSON.stringify({
          replyText: payload.replyText?.trim() ?? null,
        }),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
