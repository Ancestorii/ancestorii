'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PricingSection from '@/components/Pricing'; // ✅ adjust path if needed

export default function ChoosePlanPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 🚫 If not logged in, send back to signup
      if (!user) {
        router.push('/signup');
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff9ee] text-[#0F2040]">
        <h2 className="text-2xl font-semibold mb-2">Loading your account...</h2>
        <p className="text-[#0F2040]/60">Please wait a moment.</p>
      </div>
    );
  }

  // ✅ Once authenticated, show the pricing section (same design as landing)
  return (
    <main className="min-h-screen bg-[#fff9ee]">
      <div className="py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[#0F2040] mb-6">
          Choose Your Plan
        </h1>
        <p className="text-center text-lg text-[#0F2040]/80 mb-10">
          Start your <span className="text-[#D4AF37] font-semibold">14-day free trial</span> — no
          payment today.
        </p>
        <PricingSection />
      </div>
    </main>
  );
}
