"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { getBrowserClient } from '@/lib/supabase/browser';

export default function SuccessPage() {
  const supabase = getBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // User is authenticated, middleware will handle access
      router.replace("/dashboard/profile");
    };

    run();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ee] text-[#0F2040] px-6 text-center">
      <CheckCircle className="w-20 h-20 text-[#D4AF37] mb-6 animate-pulse" />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
        Payment Successful
      </h1>

      <p className="text-lg text-[#0F2040]/80 mb-2">
        Your account is ready.
      </p>

      <p className="text-sm text-[#0F2040]/60 mb-10">
        Taking you to your dashboard…
      </p>
    </main>
  );
}
