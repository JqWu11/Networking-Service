"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

function readTemplatesFromSession(): TemplateVariant[] {
  if (typeof window === "undefined") return [];

  const raw = sessionStorage.getItem("generated-outreach-templates");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TemplateVariant[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function TemplateLibraryPage() {
  const [templates] = useState<TemplateVariant[]>(readTemplatesFromSession);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hasTemplates = useMemo(() => templates.length > 0, [templates]);

  async function copyTemplate(template: TemplateVariant) {
    const fullText = `${template.title}\n\n${template.message}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedKey(template.focusType);
      setTimeout(() => {
        setCopiedKey(null);
      }, 1500);
    } catch {
      setCopiedKey(null);
    }
  }

  if (!hasTemplates) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            No templates generated yet
          </h1>
          <p className="mt-2 text-slate-600">
            Go back to Start Networking, enter the person details, and click Continue.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/start-networking">Back to Start Networking</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Template Options</h1>
        <p className="mt-2 text-slate-600">
          Choose from the six generated templates and copy the one you want to use.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {templates.map((template) => (
            <article
              key={template.focusType}
              className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
                  {template.title}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyTemplate(template)}
                >
                  {copiedKey === template.focusType ? "Copied!" : "Copy"}
                </Button>
              </div>
              <textarea
                readOnly
                value={template.message}
                rows={10}
                className="w-full resize-none rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
