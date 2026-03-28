# Template Planning Document

## Purpose

This document defines a starter template library for the networking outreach assistant. Templates are designed to use LinkedIn-derived context (career, hobbies, volunteering, projects, and shared background) to generate personalized, low-friction outreach messages.

## Core Template Categories

1. **Career-Focused**
   - Best when the target person has relevant role experience, promotions, or domain expertise.
2. **Hobby-Focused**
   - Best when there is a shared extracurricular interest to build rapport.
3. **Volunteering/Values-Focused**
   - Best when target profile highlights nonprofit or service contributions.
4. **Mixed (Career + Personal)**
   - Best when both professional relevance and shared personal context are available.
5. **Project/Post-Focused**
   - Best when the target has recent posts, launches, publications, or visible project work.
6. **Alumni/Shared Background**
   - Best when there is overlap in school, club, org, geography, or event history.
7. **Recruiter-Focused**
   - Best for concise role-fit messaging with clear next steps.
8. **Follow-Up**
   - Best for no-response nudges, value-add follow-ups, and graceful closeout.

## Template Generation Rules

- Generate at least 3 variants per contact: `career`, `hobby`, and `mixed`.
- If volunteering data exists, also generate a `volunteering` variant.
- Keep first message between 80 and 140 words.
- Include one clear CTA (advice request, short call, or targeted question).
- Use only one primary ask per message.
- Prefer specific references over generic compliments.

## Personalization Tokens

Use these placeholders in template bodies:

- `{{recipient_name}}`
- `{{recipient_role}}`
- `{{recipient_company}}`
- `{{career_signal}}` (promotion, role shift, project impact)
- `{{hobby_signal}}` (shared hobby or interest)
- `{{volunteer_signal}}` (cause, organization, contribution)
- `{{shared_background}}` (school, club, location, event)
- `{{sender_name}}`
- `{{sender_context}}` (major, experience, goal)
- `{{cta}}` (single specific ask)

## Ready-to-Use Starter Templates

### 1) Career-Focused (Advice Ask)

Subject: Quick question about your path at {{recipient_company}}

Hi {{recipient_name}},

I came across your background and was really interested in your experience as a {{recipient_role}}, especially {{career_signal}}. I am currently {{sender_context}} and exploring a similar path.

If you are open to it, I would really value your perspective on one thing: {{cta}}.

Thanks for your time,
{{sender_name}}

---

### 2) Hobby-Focused (Warm Intro)

Subject: Shared interest in {{hobby_signal}} + quick intro

Hi {{recipient_name}},

I noticed your interest in {{hobby_signal}} and wanted to reach out. I am {{sender_context}}, and it was great seeing someone in {{recipient_company}} with a similar interest.

I would love to learn a bit about your journey into your current role and how you balanced that with your interests. If you have time, {{cta}}.

Best,
{{sender_name}}

---

### 3) Volunteering-Focused (Values Connection)

Subject: Inspired by your work with {{volunteer_signal}}

Hi {{recipient_name}},

I saw your involvement with {{volunteer_signal}} and wanted to say it stood out to me. I am {{sender_context}} and care a lot about similar impact-driven work.

I would appreciate learning how that experience has influenced your professional path. If you are available, {{cta}}.

Thank you,
{{sender_name}}

---

### 4) Mixed (Career + Personal)

Subject: Loved your background in {{career_signal}}

Hi {{recipient_name}},

Your profile caught my attention because of your work in {{career_signal}} and your interest in {{hobby_signal}}. I am {{sender_context}}, and I am currently trying to grow in a similar direction.

If you are open to a quick conversation, {{cta}}.

Appreciate it,
{{sender_name}}

---

### 5) Project/Post-Focused

Subject: Question about your recent {{career_signal}}

Hi {{recipient_name}},

I really enjoyed seeing your recent work on {{career_signal}}. I am {{sender_context}}, and the way you approached that stood out to me.

I had one quick question: {{cta}}.

Thanks again,
{{sender_name}}

---

### 6) Alumni/Shared Background

Subject: Fellow {{shared_background}} reaching out

Hi {{recipient_name}},

I noticed we share {{shared_background}}, and I wanted to introduce myself. I am {{sender_context}} and interested in the path you took to {{recipient_company}}.

If you are open, {{cta}}.

Best,
{{sender_name}}

---

### 7) Recruiter-Focused (Direct)

Subject: Interest in opportunities at {{recipient_company}}

Hi {{recipient_name}},

I am {{sender_context}} and interested in opportunities aligned with {{career_signal}}. I have been following {{recipient_company}} and would love to learn where my background may best fit.

If helpful, I can share my resume. {{cta}}.

Thanks,
{{sender_name}}

---

### 8) Follow-Up (No Response)

Subject: Quick follow-up

Hi {{recipient_name}},

Wanted to quickly follow up in case my previous note got buried. I would still value your perspective on {{career_signal}}.

If you have a few minutes, {{cta}}.

Thank you,
{{sender_name}}

## CTA Suggestions

- "Would you be open to a 15-minute chat next week?"
- "Could I ask you 2-3 quick questions over email?"
- "What would you recommend I focus on to prepare for this path?"
- "Would it be okay if I sent my resume for brief feedback?"

## Tone Variants

For each generated template, provide:

- `Professional`: formal, concise, minimal personal detail
- `Warm`: personable and conversational
- `Direct`: shortest version with explicit ask

## Quality Checklist

- Mentions at least one specific profile-derived signal.
- Keeps one clear CTA.
- Avoids overlong paragraphs and generic praise.
- Avoids assumptions not present in provided profile data.
- Maintains respectful, non-demanding tone.

