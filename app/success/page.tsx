"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/dashboard/home");
    }, 800); // slightly longer for the moment to land

    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ee] text-[#0F2040] px-6 text-center">
      <CheckCircle className="w-20 h-20 text-[#D4AF37] mb-6" />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
        You’re in.
      </h1>

      <p className="text-lg text-[#0F2040]/80 mb-2">
        Your space is ready.
      </p>

      <p className="text-sm text-[#0F2040]/60">
        Taking you to your dashboard…
      </p>
    </main>
  );
}
