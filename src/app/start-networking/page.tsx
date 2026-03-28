"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function StartNetworkingPage() {
  const router = useRouter();
  const [personName, setPersonName] = useState("");
  const [personDescription, setPersonDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canContinue = useMemo(
    () => personName.trim().length > 0 && personDescription.trim().length > 0,
    [personDescription, personName],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;

    setErrorMessage(null);
    setIsGenerating(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch("/api/generate-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          personName,
          personDescription,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | { templates: TemplateVariant[] }
        | { error?: string };

      if (!response.ok || !("templates" in data)) {
        const statusLabel =
          response.status === 429
            ? "Rate limit reached."
            : response.status === 502
              ? "Template service rejected the request."
              : response.status === 503 || response.status === 504
                ? "Template service is temporarily unavailable."
                : null;

        setErrorMessage(
          "error" in data && data.error
            ? `${statusLabel ? `${statusLabel} ` : ""}${data.error}`
            : "Failed to generate templates. Please try again.",
        );
        return;
      }

      sessionStorage.setItem("generated-outreach-templates", JSON.stringify(data.templates));
      router.push("/start-networking/templates");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setErrorMessage("Generation timed out. Please try again.");
      } else {
        setErrorMessage("Network error while generating templates.");
      }
    } finally {
      clearTimeout(timeout);
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Start Networking
        </h1>
        <p className="mt-2 text-slate-600">
          Enter the person&apos;s name and profile details to generate outreach content.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="person-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Name of the person
            </label>
            <input
              id="person-name"
              name="person-name"
              type="text"
              required
              placeholder="e.g., Jane Doe"
              className="w-full rounded-md border border-indigo-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="person-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description / LinkedIn information
            </label>
            <textarea
              id="person-description"
              name="person-description"
              rows={8}
              required
              placeholder="Paste or type work experience, hobbies, volunteering, and any context you want to use in your outreach email."
              className="w-full rounded-md border border-indigo-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              value={personDescription}
              onChange={(event) => setPersonDescription(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-slate-600">
              Fill out both fields to continue.
            </p>
            <Button type="submit" disabled={!canContinue || isGenerating}>
              {isGenerating ? "Generating..." : "Continue"}
            </Button>
          </div>
        </form>

        {errorMessage ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

