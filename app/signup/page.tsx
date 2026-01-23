'use client';

import StepIndicator from './_components/StepIndicator';
import SignupForm from './_components/SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center px-6 py-16">
      <StepIndicator />
      <SignupForm />
    </main>
  );
}
