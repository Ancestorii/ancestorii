'use client';

import PricingSection from '@/components/Pricing';

type ChoosePlanProps = {
  onSelectPlan: (plan: {
    name: string;
    billingCycle: 'monthly' | 'yearly';
  }) => void;
};

export default function ChoosePlan({ onSelectPlan }: ChoosePlanProps) {
  return (
    <div className="w-full max-w-screen-xl mx-auto flex flex-col items-center px-6 lg:px-16">
      <div className="max-w-4xl w-full text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F2040] mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-[#0F2040]/80">
          Start preserving your legacy today.
        </p>
      </div>

      <PricingSection onPlanSelect={onSelectPlan} />
    </div>
  );
}
