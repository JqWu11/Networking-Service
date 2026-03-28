import OpenAI from "openai";
import { NextResponse } from "next/server";

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

type GenerateResult = {
  templates: TemplateVariant[];
};

const EXPECTED_FOCUS_TYPES: FocusType[] = [
  "career",
  "hobby",
  "volunteering",
  "follow-up",
  "coffee-chat",
  "referral",
];

function stripCodeFences(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
}

function parseResponseContent(content: string | null): GenerateResult | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(stripCodeFences(content)) as GenerateResult;
    if (!Array.isArray(parsed.templates) || parsed.templates.length !== EXPECTED_FOCUS_TYPES.length) {
      return null;
    }

    const seen = new Set<FocusType>();
    for (const template of parsed.templates) {
      if (
        !template ||
        typeof template.title !== "string" ||
        template.title.trim().length === 0 ||
        typeof template.message !== "string" ||
        template.message.trim().length === 0
      ) {
        return null;
      }

      if (!EXPECTED_FOCUS_TYPES.includes(template.focusType)) {
        return null;
      }

      if (seen.has(template.focusType)) {
        return null;
      }
      seen.add(template.focusType);
    }

    if (seen.size !== EXPECTED_FOCUS_TYPES.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

type RequestBody = {
  personName?: string;
  personDescription?: string;
};

function buildPrompt(personName: string, personDescription: string, strictJsonMode: boolean): string {
  return `Create exactly 6 personalized email templates for ${personName} based on this profile context:

${personDescription}

Return only JSON with this exact schema:
{
  "templates": [
    {
      "focusType": "career" | "hobby" | "volunteering" | "follow-up" | "coffee-chat" | "referral",
      "title": "string",
      "message": "string"
    }
  ]
}

Rules:
- Include exactly one template for each focusType.
- Use specific profile details, not generic statements.
- Keep each template to 90-150 words.
- Tone should be warm, professional, and concise.
- End each template with a clear low-pressure next step.
- The "title" should be short and human-readable (e.g. "Career-Focused Intro").
${strictJsonMode ? '- CRITICAL: Return valid raw JSON only. Do not include markdown fences, labels, or any extra text.' : ""}`;
}

function buildDemoTemplates(personName: string, personDescription: string): GenerateResult {
  const shortDescription = personDescription.replace(/\s+/g, " ").trim().slice(0, 280);

  return {
    templates: [
      {
        focusType: "career",
        title: "Career-Focused Intro",
        message: `Hi ${personName},

I came across your background and was really interested in your career path. I am currently exploring similar opportunities and would value your perspective on how you approached key decisions in your transition.

From what I reviewed (${shortDescription}), your experience stood out because it combines practical results with thoughtful growth. If you are open to it, I would appreciate 10-15 minutes to ask a few focused questions and learn from your approach.

Thanks for considering it, and no pressure at all if timing is busy.`,
      },
      {
        focusType: "hobby",
        title: "Common-Interest Connection",
        message: `Hi ${personName},

I noticed some overlap in interests and wanted to reach out. I have been trying to connect with people who share similar hobbies while also learning from their professional journey.

Your profile mention (${shortDescription}) caught my attention and made me think we might have a meaningful starting point for conversation beyond just work topics.

If you are open to it, I would love to connect for a brief chat and trade notes. Happy to work around your schedule.`,
      },
      {
        focusType: "volunteering",
        title: "Mission-Driven Outreach",
        message: `Hi ${personName},

I was inspired to see your involvement in community-oriented work. I care about building a career that stays connected to impact, so I am always eager to learn from professionals who balance both.

Your background (${shortDescription}) seems like a strong example of combining skill-building with contribution. I would be grateful to hear how you decide where to invest your time and how that shaped your growth.

If you have a few minutes in the next couple of weeks, I would truly appreciate a short conversation.`,
      },
      {
        focusType: "follow-up",
        title: "Thoughtful Follow-Up",
        message: `Hi ${personName},

I wanted to follow up in case my earlier note got buried. I am still very interested in learning from your experience and would really value your guidance.

What stood out to me most was (${shortDescription}), and I think your perspective could help me make better next-step decisions.

If now is not a good time, I completely understand. If you are available, even a short 10-minute conversation would be incredibly helpful. Thanks again for your time.`,
      },
      {
        focusType: "coffee-chat",
        title: "Quick Coffee Chat Request",
        message: `Hi ${personName},

I am reaching out to see whether you might be open to a quick virtual coffee chat. I am learning more about this field and trying to hear directly from people with real experience.

Your profile details (${shortDescription}) gave me a lot to think about, especially around practical growth and decision-making.

If you are available for 15 minutes sometime this month, I would be grateful. I can send a few focused questions in advance and keep the conversation concise.`,
      },
      {
        focusType: "referral",
        title: "Referral Guidance Ask",
        message: `Hi ${personName},

I appreciate your time and wanted to ask for your advice on a potential referral path. I am interested in roles aligned with your area, and I am currently preparing targeted applications.

After reviewing your background (${shortDescription}), I felt your insight would be especially valuable in understanding whether my positioning is strong enough.

If you are comfortable, I would appreciate any guidance on next steps, and only if appropriate, referral advice. No pressure either way, and thank you for considering.`,
      },
    ],
  };
}

async function createTemplates(personName: string, personDescription: string, strictJsonMode: boolean) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22000);
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    return await openai.responses.create(
      {
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You generate practical networking outreach templates for students and job seekers. Return strict JSON only.",
          },
          {
            role: "user",
            content: buildPrompt(personName, personDescription, strictJsonMode),
          },
        ],
      },
      { signal: controller.signal },
    );
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryableUpstreamError(error: unknown): boolean {
  if (error instanceof Error) {
    const loweredMessage = error.message.toLowerCase();
    if (loweredMessage.includes("aborted") || loweredMessage.includes("timeout")) {
      return true;
    }
  }

  const maybeApiError = error as { status?: number };
  return typeof maybeApiError.status === "number" && maybeApiError.status >= 500;
}

function mapUpstreamError(error: unknown): { status: number; message: string } {
  if (error instanceof Error) {
    const loweredMessage = error.message.toLowerCase();
    if (error.name === "AbortError" || loweredMessage.includes("aborted") || loweredMessage.includes("timeout")) {
      return { status: 504, message: "Template generation timed out. Please try again." };
    }
  }

  if (error instanceof Error && error.name === "AbortError") {
    return { status: 504, message: "Template generation timed out. Please try again." };
  }

  const maybeApiError = error as { status?: number; message?: string; code?: string; request_id?: string };
  const status = maybeApiError.status;
  const message = maybeApiError.message ?? "Unknown OpenAI error";

  console.error("Template generation upstream error", {
    status,
    code: maybeApiError.code,
    requestId: maybeApiError.request_id,
    message,
  });

  if (status === 401 || status === 403) {
    return {
      status: 502,
      message: "OpenAI authentication failed. Check OPENAI_API_KEY and billing access.",
    };
  }

  if (status === 429) {
    return {
      status: 429,
      message: "Rate limit or quota reached. Please wait and try again.",
    };
  }

  if (typeof status === "number" && status >= 500) {
    return {
      status: 503,
      message: "OpenAI service is temporarily unavailable. Please retry shortly.",
    };
  }

  return {
    status: 500,
    message: "Failed to generate templates. Please try again.",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const personName = body.personName?.trim();
    const personDescription = body.personDescription?.trim();

    if (!personName || !personDescription) {
      return NextResponse.json(
        { error: "Both personName and personDescription are required." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(buildDemoTemplates(personName, personDescription));
    }

    let completion;
    try {
      completion = await createTemplates(personName, personDescription, false);
    } catch (error) {
      if (!isRetryableUpstreamError(error)) throw error;
      completion = await createTemplates(personName, personDescription, false);
    }
    let result = parseResponseContent(completion.output_text);

    if (!result) {
      const retryCompletion = await createTemplates(personName, personDescription, true);
      result = parseResponseContent(retryCompletion.output_text);
    }

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Generated output format was invalid. Please retry with slightly more profile detail.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const mapped = mapUpstreamError(error);
    return NextResponse.json(
      { error: mapped.message },
      { status: mapped.status },
    );
  }
}
