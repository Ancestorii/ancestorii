import StepIndicator from './_components/StepIndicator';
import SignupFormClient from './_components/SignupFormClient';

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center px-6 py-16">
      <StepIndicator />
      <SignupFormClient />
    </main>
  );
}
