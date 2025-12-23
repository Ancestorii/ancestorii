'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard/plans'); // ✅ replaces in history (no "Back" bug)
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ee] text-[#0F2040] px-6 text-center">
      <CheckCircle className="w-20 h-20 text-[#D4AF37] mb-6 animate-pulse" />
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
        Payment Successful 🎉
      </h1>
      <p className="text-lg text-[#0F2040]/80 mb-2">
        Your plan has been upgraded successfully.
      </p>
      <p className="text-sm text-[#0F2040]/60 mb-10">
        Redirecting you to your plans page shortly…
      </p>

      <button
        onClick={() => router.push('/dashboard/plans')} // ✅ goes straight back to plans
        className="px-6 py-3 rounded-full bg-[#D4AF37] text-[#0F2040] font-semibold hover:bg-[#c9a83a] transition"
      >
        Go to Plans Now
      </button>
    </main>
  );
}

