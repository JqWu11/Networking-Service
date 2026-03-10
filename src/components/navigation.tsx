import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <header className="sticky top-0 z-20 border-b border-indigo-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-indigo-700">
          J Wu&apos;s Text to Speech app
        </Link>
        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="#features" className="hover:text-indigo-600">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-indigo-600">
            Pricing
          </Link>
          <Link href="#faq" className="hover:text-indigo-600">
            FAQs
          </Link>
          <Link href="#about" className="hover:text-indigo-600">
            About
          </Link>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </nav>
    </header>
  );
}
