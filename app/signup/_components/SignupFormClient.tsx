'use client';

import dynamic from 'next/dynamic';

const SignupForm = dynamic(() => import('./SignupForm'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md h-[420px] rounded-2xl bg-white border border-[#d4af37]/30 shadow-md" />
  ),
});

export default function SignupFormClient() {
  return <SignupForm />;
}
