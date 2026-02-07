import dynamic from 'next/dynamic';
import StepIndicator from './_components/StepIndicator';

const SignupForm = dynamic(() => import('./_components/SignupForm'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md h-[420px] rounded-2xl bg-white border border-[#d4af37]/30 shadow-md" />
  ),
});

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center px-6 py-16">
      <StepIndicator />
      <SignupForm />
    </main>
  );
}
