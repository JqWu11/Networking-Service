import Link from "next/link";
import { PricingTable } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function Home() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),transparent_50%),radial-gradient(circle_at_top_left,_rgba(139,92,246,0.14),transparent_45%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pt-24">
          <Badge variant="secondary">Networking Outreach Assistant</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Organize outreach, personalize messages, and track replies in one dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Built for job seekers who want a clear and low-stress networking workflow.
            Collect contacts, tailor outreach, schedule sends, and follow up with
            confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/start-networking">Start Networking</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/workflow">View Workflow</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Contact Pipeline</CardTitle>
              <CardDescription>
                Keep recruiter and employee contacts organized with clear status stages
                from first draft to follow-up.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Guided Personalization</CardTitle>
              <CardDescription>
                Use editable templates and profile context to craft personalized outreach
                instead of copy-paste messages.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Scheduling and Tracking</CardTitle>
              <CardDescription>
                Schedule messages, monitor send status, and maintain conversation history
                so no follow-up falls through.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pricing</h2>
          <p className="mt-2 text-slate-600">
            Simple plans for students, career changers, and growing job-seeker communities.
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-4 md:p-6">
          {clerkEnabled ? (
            <PricingTable />
          ) : (
            <p className="text-sm text-slate-600">
              Pricing checkout is disabled in local demo mode. Add Clerk keys in
              your environment to enable billing flows.
            </p>
          )}
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Who this is for</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            This assistant is designed for first-generation students, international students,
            and career changers who need structured networking support without enterprise CRM
            complexity.
          </p>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-3xl px-6 pb-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-6 rounded-xl border border-indigo-100 px-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>Can I edit every message before it is sent?</AccordionTrigger>
            <AccordionContent>
              Yes. Templates are a starting point, and every outreach message can be reviewed
              and customized before delivery.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I track follow-ups in one place?</AccordionTrigger>
            <AccordionContent>
              Yes. Each contact has a status timeline with reminders so you can monitor replies
              and pending follow-up tasks from the dashboard.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Which tools does this replace?</AccordionTrigger>
            <AccordionContent>
              It replaces scattered spreadsheets, draft documents, and inbox-only workflows by
              combining outreach planning, personalization, and tracking in one system.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Does it support email integrations?</AccordionTrigger>
            <AccordionContent>
              Yes. The platform is built to connect with common email APIs for scheduled sends
              and delivery status tracking.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
