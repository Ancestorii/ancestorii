"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PricingSection from "@/components/Pricing";

export default function ChoosePlanPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // 1️⃣ Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 🚫 Not logged in → signup
      if (!user) {
        router.replace("/signup");
        return;
      }

      // 🚫 Email not confirmed → signup (confirm email gate)
      if (!user.email_confirmed_at) {
        router.replace("/signup");
        return;
      }

      // 2️⃣ Check if user already has a subscription
      const { data: subscription } = await supabase
        .from("subscription_summary")
        .select("plan_name")
        .eq("user_id", user.id)
        .single();

      // 🚫 Already subscribed → dashboard
      if (subscription?.plan_name) {
        router.replace("/dashboard/profile");
        return;
      }

      // ✅ Allowed to choose a plan
      setLoading(false);
    };

    checkAccess();
  }, [router, supabase]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff9ee] text-[#0F2040]">
        <h2 className="text-2xl font-semibold mb-2">
          Preparing your account…
        </h2>
        <p className="text-[#0F2040]/60">
          Please wait a moment.
        </p>
      </div>
    );
  }

  // ✅ Authenticated + confirmed + no plan
  return (
    <main className="min-h-screen bg-[#fff9ee]">
      <div className="py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[#0F2040] mb-6">
          Choose Your Plan
        </h1>

        <p className="text-center text-lg text-[#0F2040]/80 mb-10">
          Start your{" "}
          <span className="text-[#D4AF37] font-semibold">
            14-day free trial
          </span>{" "}
          — no payment today.
        </p>

        <PricingSection />
      </div>
    </main>
  );
}
