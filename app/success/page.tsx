"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import StoreBadges from "@/components/StoreBadges";

// Reached AFTER a successful web payment. This is the best moment to get people onto the
// app, so we no longer auto redirect in 800ms — we show the app prompt and a manual
// "Continue to your account" link. Showing store badges here is fine: this is not an in app
// redirect target, and no price or upgrade button is shown.
export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ee] text-[#0F2040] px-6 text-center">
      <CheckCircle className="w-20 h-20 text-[#D4AF37] mb-6" />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
        You&rsquo;re in.
      </h1>

      <p className="text-lg text-[#0F2040]/80 mb-2">
        Your space is ready.
      </p>

      <p className="text-base text-[#0F2040]/70 mb-6 max-w-md leading-relaxed">
        You are all set. Download the app to start capturing memories with your family.
      </p>

      <StoreBadges theme="light" className="mb-8 justify-center" />

      <Link
        href="/dashboard/home"
        className="text-sm font-semibold text-[#0F2040] underline underline-offset-4 hover:text-[#A9842E] transition-colors"
      >
        Continue to your account
      </Link>
    </main>
  );
}
