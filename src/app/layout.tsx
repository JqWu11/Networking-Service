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
  title: "J Wu's Text to Speech App",
  description: "AI-powered text to speech for creators and teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <div className="min-h-screen bg-white text-slate-900">
            <Navigation />
            <main>{children}</main>
            <footer className="border-t border-indigo-100 bg-white">
              <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-2">
                <div>
                  <p className="text-base font-semibold text-indigo-700">
                    J Wu&apos;s Text to Speech app
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Voice generation for modern product teams.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 md:justify-items-end">
                  <Link href="#" className="hover:text-indigo-600">
                    Docs
                  </Link>
                  <Link href="#" className="hover:text-indigo-600">
                    Contact
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
        </ClerkProvider>
      </body>
    </html>
  );
}
