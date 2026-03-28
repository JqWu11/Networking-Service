import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const workflowSteps = [
  {
    step: "Step 1",
    title: "Collect and Organize Contacts",
    description:
      "Create and manage contact records with role, company, source links, and outreach status.",
  },
  {
    step: "Step 2",
    title: "Personalize Outreach",
    description:
      "Start from reusable templates, fill placeholders, and tailor each message to the recipient.",
  },
  {
    step: "Step 3",
    title: "Review Before Send",
    description:
      "Preview every message so users keep tone authentic and avoid robotic copy-paste outreach.",
  },
  {
    step: "Step 4",
    title: "Schedule Delivery",
    description:
      "Plan outreach for specific times and monitor scheduled, sent, failed, and canceled states.",
  },
  {
    step: "Step 5",
    title: "Track Replies and Status",
    description:
      "Log responses, update contact pipeline stages, and keep conversation history in one place.",
  },
  {
    step: "Step 6",
    title: "Follow Up with Confidence",
    description:
      "Use reminders and pending follow-up queues so important outreach never gets lost.",
  },
];

const phasePlan = [
  "Startup and Team Education",
  "User Requirements and Context Design",
  "Solution Development",
  "System Integration",
  "Testing and Evaluation",
  "Redesign and Improvements",
  "Final Reporting",
];

export default function WorkflowPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),transparent_50%),radial-gradient(circle_at_top_left,_rgba(139,92,246,0.14),transparent_45%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-14 md:pt-20">
          <Badge variant="secondary">Requirements Workflow</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            End-to-end networking outreach workflow for job seekers
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            This page translates the requirements into a clear product flow covering contact
            management, personalization, scheduling, tracking, and follow-up.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Core User Workflow</h2>
          <p className="mt-2 text-slate-600">
            Every step is designed to reduce networking anxiety and create a guided process.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workflowSteps.map((item) => (
            <Card key={item.step}>
              <CardHeader>
                <CardDescription className="font-medium text-indigo-600">{item.step}</CardDescription>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Functional Requirements</h2>
          <Accordion type="single" collapsible className="mt-4 rounded-xl bg-white px-4">
            <AccordionItem value="fr-contact">
              <AccordionTrigger>Contact Management (FR-1 to FR-4)</AccordionTrigger>
              <AccordionContent>
                Create/edit/delete contacts, store key contact details, track outreach status,
                and support labels for grouping outreach objectives.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fr-personalization">
              <AccordionTrigger>Personalization and Templates (FR-5 to FR-8)</AccordionTrigger>
              <AccordionContent>
                Reusable templates with editable placeholders, full message preview, and
                guidance that maintains authentic personalized outreach.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fr-scheduling">
              <AccordionTrigger>Scheduling and Sending (FR-9 to FR-12)</AccordionTrigger>
              <AccordionContent>
                Schedule outreach messages, integrate with at least one email provider, and
                display complete delivery state visibility.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fr-tracking">
              <AccordionTrigger>Tracking and Follow-Up (FR-13 to FR-16)</AccordionTrigger>
              <AccordionContent>
                Maintain outreach history, log replies, surface follow-up queues, and support
                reminders for pending outreach actions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fr-dashboard">
              <AccordionTrigger>Dashboard and Guided Flow (FR-17 to FR-20)</AccordionTrigger>
              <AccordionContent>
                Show pipeline progress and upcoming tasks, then guide users from contact
                selection to drafting and scheduling in one coherent workflow.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Non-Functional Standards</CardTitle>
              <CardDescription>Usability, reliability, and maintainability guardrails</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Novice-friendly UI with plain language and clear actions.</li>
                <li>Visible error handling for send/sync failures with recovery guidance.</li>
                <li>Secure handling of user data and integration credentials.</li>
                <li>Modular architecture to support parallel frontend/backend work.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Data and Integrations</CardTitle>
              <CardDescription>Core entities and external dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  Entities: Contact, Template, OutreachMessage, InteractionLog, ReminderTask.
                </li>
                <li>Email delivery support through Gmail API or SendGrid.</li>
                <li>Lifecycle tracking for scheduled, sent, failed, and canceled messages.</li>
                <li>Policy-compliant handling of LinkedIn profile URL enrichment.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Milestone Phases</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {phasePlan.map((phase, index) => (
            <Card key={phase} className="border-indigo-100">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription className="font-medium text-indigo-600">
                    Phase {index + 1}
                  </CardDescription>
                  <CardTitle className="mt-1 text-xl">{phase}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Risks and Mitigations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>API limits and outages: use queueing, retries, and manual resend paths.</li>
                <li>Robotic message quality: keep template edits and preview mandatory.</li>
                <li>Scope creep: enforce MVP boundaries with weekly scope review.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">MVP Acceptance Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Contacts can be managed and tracked through outreach lifecycle stages.</li>
                <li>Users can personalize, review, and schedule messages in one flow.</li>
                <li>Replies and follow-up tasks are visible in a single dashboard.</li>
                <li>Core flows are usable for job seekers without external tools.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

