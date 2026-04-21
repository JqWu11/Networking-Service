const DEFAULT_MAX_FOLLOWUPS = 2;
const DEFAULT_FOLLOWUP_DELAY_DAYS = 5;

export function getMaxFollowups(): number {
  const raw = process.env.FOLLOWUP_MAX_SEQUENCE;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : DEFAULT_MAX_FOLLOWUPS;
}

export function getFollowupDelayDays(): number {
  const raw = process.env.FOLLOWUP_DELAY_DAYS;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : DEFAULT_FOLLOWUP_DELAY_DAYS;
}

export function computeNextFollowupDueAt(from: Date): Date {
  const due = new Date(from);
  due.setDate(due.getDate() + getFollowupDelayDays());
  return due;
}

export function buildDefaultFollowupSubject(subject: string, sequenceNumber: number): string {
  if (sequenceNumber <= 1) {
    return `Following up: ${subject}`;
  }

  return `Follow-up #${sequenceNumber}: ${subject}`;
}

export function buildDefaultFollowupBody(contactName: string | null): string {
  const greeting = contactName ? `Hi ${contactName},` : "Hi there,";
  return `${greeting}

I wanted to follow up on my previous note in case it got buried in your inbox. I would still appreciate the chance to connect when you have time.

Thanks again,
`;
}
