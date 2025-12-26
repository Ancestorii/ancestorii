'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabase/browser'

const supabase = getBrowserClient()


export default function AuthConfirmPage() {
  const router = useRouter();

useEffect(() => {
  const confirmEmail = async () => {
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(window.location.href);

    if (data?.session) {
      router.replace('/dashboard/home');
    } else {
      router.replace('/login');
    }
  };

  confirmEmail();
}, [router]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F2040]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md px-6"
      >
        <div className="mb-6">
          <div className="mx-auto h-12 w-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center">
            <span className="text-[#D4AF37] text-xl">✦</span>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-2">
          Confirming your email
        </h1>

        <p className="text-sm text-white/70">
          We’re preparing your legacy space.
        </p>
      </motion.div>
    </div>
  );
}
