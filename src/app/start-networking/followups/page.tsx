"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FollowupForm, type FollowupDraftView } from "@/components/followup-form";
import { MessageStatusTimeline } from "@/components/message-status-timeline";
import { Button } from "@/components/ui/button";

type FollowupSection = "needsReview" | "dueSoon" | "overdue" | "closed";

type FollowupDraftApi = FollowupDraftView & {
  message: {
    id: string;
    events: Array<{
      id: string;
      eventType: string;
      eventAt: string;
    }>;
  };
};

type FollowupResponse = {
  ok: boolean;
  error?: string;
  counts: {
    total: number;
    needsReview: number;
    dueSoon: number;
    overdue: number;
    closed: number;
  };
  sections: Record<FollowupSection, FollowupDraftApi[]>;
};

const SECTION_LABELS: Record<FollowupSection, string> = {
  needsReview: "Needs Review",
  dueSoon: "Due Soon",
  overdue: "Overdue",
  closed: "Closed",
};

export default function FollowupsPage() {
  const [data, setData] = useState<FollowupResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyDraftId, setBusyDraftId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/followups", { cache: "no-store" });
      const payload = (await response.json()) as FollowupResponse;
      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Failed to load follow-up queue.");
        return;
      }
      setData(payload);
    } catch {
      setErrorMessage("Network error while loading follow-ups.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = useCallback(
    async (
      draftId: string,
      action:
        | { action: "save"; subjectDraft: string; bodyDraft: string }
        | { action: "approve_send" }
        | { action: "snooze"; snoozeDays: number }
        | { action: "discard" }
        | { action: "mark_replied" },
    ) => {
      setBusyDraftId(draftId);
      setErrorMessage(null);
      try {
        const response = await fetch(`/api/followups/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!response.ok || !payload.ok) {
          setErrorMessage(payload.error ?? "Follow-up action failed.");
          return;
        }
        await load();
      } catch {
        setErrorMessage("Network error while updating follow-up.");
      } finally {
        setBusyDraftId(null);
      }
    },
    [load],
  );

  const orderedSections = useMemo(
    () => ["needsReview", "dueSoon", "overdue", "closed"] as FollowupSection[],
    [],
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Follow-Up Queue</h1>
            <p className="mt-2 text-slate-600">
              Review pending follow-up drafts, send approved messages, and keep status tracking in one
              place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={isLoading}>
              Refresh
            </Button>
            <Button asChild variant="outline">
              <Link href="/start-networking/send">Back to send</Link>
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="mt-6 text-sm text-slate-600">Loading follow-up queue...</p>
        ) : null}

        {!isLoading && data ? (
          <div className="mt-8 space-y-8">
            {orderedSections.map((sectionKey) => {
              const sectionDrafts = data.sections[sectionKey];
              return (
                <section key={sectionKey}>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {SECTION_LABELS[sectionKey]} ({sectionDrafts.length})
                  </h2>
                  {sectionDrafts.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">No items in this section.</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {sectionDrafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4"
                        >
                          <FollowupForm
                            draft={draft}
                            busy={busyDraftId === draft.id}
                            onAction={handleAction}
                          />
                          <div className="mt-4 rounded-md border border-indigo-100 bg-white p-3">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                              Message Timeline
                            </p>
                            <MessageStatusTimeline events={draft.message.events} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
