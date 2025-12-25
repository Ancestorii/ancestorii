"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SuccessPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAccess = async () => {
      // 1️⃣ Must be logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // 2️⃣ Optional but recommended: confirm subscription exists
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .single();

      if (!subscription) {
        router.replace('/dashboard/profile');;
        return;
      }

      // 3️⃣ Redirect after short delay
      setTimeout(() => {
        router.replace("/dashboard/plans");
      }, 4000);
    };

    checkAccess();
  }, [router, supabase]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ee] text-[#0F2040] px-6 text-center">
      <CheckCircle className="w-20 h-20 text-[#D4AF37] mb-6 animate-pulse" />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
        Payment Successful
      </h1>

      <p className="text-lg text-[#0F2040]/80 mb-2">
        Your plan has been activated successfully.
      </p>

      <p className="text-sm text-[#0F2040]/60 mb-10">
        Redirecting you to your plans page…
      </p>

      <button
        onClick={() => router.push("/dashboard/plans")}
        className="px-6 py-3 rounded-full bg-[#D4AF37] text-[#0F2040] font-semibold hover:bg-[#c9a83a] transition"
      >
        Go to Plans Now
      </button>
    </main>
  );
}