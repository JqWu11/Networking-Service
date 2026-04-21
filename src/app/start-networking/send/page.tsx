"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

type FocusType =
  | "career"
  | "hobby"
  | "volunteering"
  | "follow-up"
  | "coffee-chat"
  | "referral";

type TemplateVariant = {
  focusType: FocusType;
  title: string;
  message: string;
};

let cachedTemplateRaw: string | null = null;
let cachedTemplateValue: TemplateVariant | null = null;

function readSelectedTemplate(): TemplateVariant | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem("selected-outreach-template");
  if (raw === cachedTemplateRaw) {
    return cachedTemplateValue;
  }

  if (!raw) {
    cachedTemplateRaw = null;
    cachedTemplateValue = null;
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as TemplateVariant;
    if (
      parsed &&
      typeof parsed.title === "string" &&
      typeof parsed.message === "string"
    ) {
      cachedTemplateRaw = raw;
      cachedTemplateValue = parsed;
      return cachedTemplateValue;
    }
    cachedTemplateRaw = raw;
    cachedTemplateValue = null;
    return null;
  } catch {
    cachedTemplateRaw = raw;
    cachedTemplateValue = null;
    return null;
  }
}

function subscribeSelectedTemplate(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key && event.key !== "selected-outreach-template") return;
    onStoreChange();
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getServerSelectedTemplate(): TemplateVariant | null {
  return null;
}

type SendStatus = "idle" | "sending" | "sent" | "error";

export default function SendEmailPage() {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const senderEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null;
  const senderName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || null;

  const selectedTemplate = useSyncExternalStore(
    subscribeSelectedTemplate,
    readSelectedTemplate,
    getServerSelectedTemplate,
  );

  const [to, setTo] = useState<string>("");
  const [subjectDraft, setSubjectDraft] = useState<string | null>(null);
  const [bodyDraft, setBodyDraft] = useState<string | null>(null);

  const subject = subjectDraft ?? selectedTemplate?.title ?? "";
  const body = bodyDraft ?? selectedTemplate?.message ?? "";

  const [status, setStatus] = useState<SendStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [trackedMessageId, setTrackedMessageId] = useState<string | null>(null);

  const canSend = useMemo(
    () =>
      to.trim().length > 0 &&
      subject.trim().length > 0 &&
      body.trim().length > 0 &&
      status !== "sending",
    [to, subject, body, status],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    setStatus("sending");
    setFeedback(null);
    setTrackedMessageId(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          body,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        messageId?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus("error");
        setFeedback(data.error ?? "Failed to send email. Please try again.");
        return;
      }

      setStatus("sent");
      setFeedback(`Email sent to ${to.trim()}.`);
      setTrackedMessageId(data.messageId ?? null);
    } catch {
      setStatus("error");
      setFeedback("Network error while sending email.");
    }
  }

  if (!selectedTemplate) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            No template selected
          </h1>
          <p className="mt-2 text-slate-600">
            Pick a template first, then come back to send it.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/start-networking/templates">Back to templates</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Send Email</h1>
            <p className="mt-2 text-slate-600">
              Review the details below and send it directly from the app.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/start-networking/templates">Back</Link>
          </Button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email-to"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Recipient email
            </label>
            <input
              id="email-to"
              name="email-to"
              type="email"
              required
              placeholder="person@example.com"
              className="w-full rounded-md border border-indigo-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="email-subject"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Subject
            </label>
            <input
              id="email-subject"
              name="email-subject"
              type="text"
              required
              placeholder="Subject line"
              className="w-full rounded-md border border-indigo-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              value={subject}
              onChange={(event) => setSubjectDraft(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="email-body"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Body
            </label>
            <textarea
              id="email-body"
              name="email-body"
              rows={14}
              required
              className="w-full rounded-md border border-indigo-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              value={body}
              onChange={(event) => setBodyDraft(event.target.value)}
            />
          </div>

          <div className="rounded-md border border-indigo-100 bg-indigo-50/40 px-4 py-3 text-sm text-slate-700">
            {isUserLoaded && isSignedIn && senderEmail ? (
              <>
                Replies will go to your account email{" "}
                <span className="font-mono text-slate-900">{senderEmail}</span>
                {senderName ? (
                  <>
                    {" "}
                    (shown as <span className="font-semibold">{senderName}</span>)
                  </>
                ) : null}
                .
              </>
            ) : isUserLoaded ? (
              <>
                You need to be signed in to send. Your account email will be set as the
                reply-to address.
              </>
            ) : (
              <>Loading your account...</>
            )}
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              disabled={!canSend || !isSignedIn || !senderEmail}
            >
              {status === "sending" ? "Sending..." : status === "sent" ? "Send again" : "Send Email"}
            </Button>
          </div>
        </form>

        {feedback ? (
          <div
            className={`mt-6 rounded-md border px-4 py-3 text-sm ${
              status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback}
            {status === "sent" && trackedMessageId ? (
              <div className="mt-3">
                <Link className="underline underline-offset-2" href="/start-networking/followups">
                  View tracked status and follow-up queue
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
