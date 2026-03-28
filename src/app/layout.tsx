import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OutreachPilot | Networking Outreach Assistant",
  description:
    "A networking outreach assistant for job seekers to personalize messages, schedule outreach, and track follow-ups.",
};

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appShell = (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main>{children}</main>
      <footer className="border-t border-indigo-100 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-2">
          <div>
            <p className="text-base font-semibold text-indigo-700">
              OutreachPilot
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Guided networking outreach for job seekers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 md:justify-items-end">
            <Link href="#" className="hover:text-indigo-600">
              Workflow Guide
            </Link>
            <Link href="#" className="hover:text-indigo-600">
              Support
            </Link>
            <Link href="#" className="hover:text-indigo-600">
              Privacy
            </Link>
            <Link href="#" className="hover:text-indigo-600">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {clerkEnabled ? <ClerkProvider>{appShell}</ClerkProvider> : appShell}
      </body>
    </html>
  );
}
