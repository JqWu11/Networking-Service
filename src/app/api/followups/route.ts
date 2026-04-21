import { FollowupDraftStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSignedInUser } from "@/lib/auth";
import { db } from "@/lib/db";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const signedInUser = await getSignedInUser();
  if (!signedInUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const drafts = await db.followupDraft.findMany({
    where: {
      userId: signedInUser.userId,
    },
    include: {
      contact: true,
      message: {
        include: {
          events: {
            orderBy: { eventAt: "desc" },
            take: 12,
          },
        },
      },
      template: true,
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
    take: 200,
  });

  const now = Date.now();
  const dueSoonThreshold = now + ONE_DAY_MS;

  const needsReview = drafts.filter((draft) => draft.status === FollowupDraftStatus.pending_review);
  const dueSoon = drafts.filter(
    (draft) =>
      draft.status === FollowupDraftStatus.pending_review &&
      draft.dueAt.getTime() > now &&
      draft.dueAt.getTime() <= dueSoonThreshold,
  );
  const overdue = drafts.filter(
    (draft) =>
      draft.status === FollowupDraftStatus.pending_review && draft.dueAt.getTime() <= now,
  );
  const closed = drafts.filter((draft) =>
    [FollowupDraftStatus.sent, FollowupDraftStatus.discarded].includes(draft.status),
  );

  return NextResponse.json({
    ok: true,
    counts: {
      total: drafts.length,
      needsReview: needsReview.length,
      dueSoon: dueSoon.length,
      overdue: overdue.length,
      closed: closed.length,
    },
    sections: {
      needsReview,
      dueSoon,
      overdue,
      closed,
    },
  });
}
