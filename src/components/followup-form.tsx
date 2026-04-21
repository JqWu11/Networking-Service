"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type FollowupDraftView = {
  id: string;
  dueAt: string;
  status: "pending_review" | "approved" | "sent" | "discarded";
  subjectDraft: string;
  bodyDraft: string;
  contact: {
    name: string | null;
    email: string;
  };
  messageId: string;
};

type FollowupAction =
  | { action: "save"; subjectDraft: string; bodyDraft: string }
  | { action: "approve_send" }
  | { action: "snooze"; snoozeDays: number }
  | { action: "discard" }
  | { action: "mark_replied" };

type FollowupFormProps = {
  draft: FollowupDraftView;
  busy: boolean;
  onAction: (draftId: string, action: FollowupAction) => Promise<void>;
};

export function FollowupForm({ draft, busy, onAction }: FollowupFormProps) {
  const [subjectDraft, setSubjectDraft] = useState(draft.subjectDraft);
  const [bodyDraft, setBodyDraft] = useState(draft.bodyDraft);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {draft.contact.name || "Unnamed contact"} ({draft.contact.email})
        </p>
        <p className="text-xs text-slate-500">
          Due {new Date(draft.dueAt).toLocaleString()}
        </p>
      </div>

      <input
        className="w-full rounded-md border border-indigo-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        value={subjectDraft}
        onChange={(event) => setSubjectDraft(event.target.value)}
      />

      <textarea
        rows={7}
        className="w-full rounded-md border border-indigo-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        value={bodyDraft}
        onChange={(event) => setBodyDraft(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onAction(draft.id, { action: "save", subjectDraft, bodyDraft })}
          type="button"
        >
          Save
        </Button>
        <Button
          size="sm"
          disabled={busy}
          onClick={() => onAction(draft.id, { action: "approve_send" })}
          type="button"
        >
          Approve & Send
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onAction(draft.id, { action: "snooze", snoozeDays: 2 })}
          type="button"
        >
          Snooze 2d
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onAction(draft.id, { action: "mark_replied" })}
          type="button"
        >
          Mark Replied
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onAction(draft.id, { action: "discard" })}
          type="button"
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
