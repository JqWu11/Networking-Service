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

export default function Home() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),transparent_50%),radial-gradient(circle_at_top_left,_rgba(139,92,246,0.14),transparent_45%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pt-24">
          <Badge variant="secondary">SaaS Landing Page</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            J Wu&apos;s Text to Speech App
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Convert text into natural-sounding voice in seconds. Build narration,
            product demos, and multilingual customer experiences from one clean dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg">Start Free Trial</Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Studio Voices</CardTitle>
              <CardDescription>
                High-quality voices tuned for podcasting, tutorials, and ads.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bulk Generation</CardTitle>
              <CardDescription>
                Render batches of scripts quickly with project-based organization.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>API-Ready</CardTitle>
              <CardDescription>
                Drop voice generation into your existing SaaS stack using simple endpoints.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pricing</h2>
          <p className="mt-2 text-slate-600">Simple plans for solo builders and growing teams.</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-4 md:p-6">
          <PricingTable />
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-3xl px-6 pb-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-6 rounded-xl border border-indigo-100 px-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>Can I try the app before paying?</AccordionTrigger>
            <AccordionContent>
              Yes. Start on the Starter plan and upgrade any time as your usage grows.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Do you support team collaboration?</AccordionTrigger>
            <AccordionContent>
              Pro and Enterprise plans include team workspaces, shared projects, and role controls.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I use generated voices commercially?</AccordionTrigger>
            <AccordionContent>
              Yes, generated audio can be used in commercial content under the standard terms.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Is there an API for developers?</AccordionTrigger>
            <AccordionContent>
              Yes. The Pro and Enterprise tiers include API access with usage tracking.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
