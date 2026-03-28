import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function Navigation() {
  return (
    <header className="sticky top-0 z-20 border-b border-indigo-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-indigo-700">
          OutreachPilot
        </Link>
        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/workflow" className="hover:text-indigo-600">
            Workflow
          </Link>
          <Link href="/pricing" className="hover:text-indigo-600">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-indigo-600">
            FAQs
          </Link>
          <Link href="/#about" className="hover:text-indigo-600">
            Users
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {clerkEnabled ? (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Get started</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          ) : (
            <span className="rounded-md border border-indigo-200 px-2 py-1 text-xs text-indigo-700">
              Demo mode
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}
