"use client";

import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ee] text-[#0F2040] px-6 text-center">
      <h1 className="text-3xl font-extrabold mb-4">
        Payment cancelled
      </h1>

      <p className="text-lg text-[#0F2040]/70 mb-8">
        No charges were made. You can choose a plan anytime.
      </p>

      <button
        onClick={() => router.push("/choose-plan")}
        className="px-6 py-3 rounded-full bg-[#D4AF37] text-[#0F2040] font-semibold"
      >
        Back to plans
      </button>
    </main>
  );
}
