'use client';

import { useState } from 'react';

type PricingSectionProps = {
  onPlanSelect?: (plan: {
    name: string;
    billingCycle: 'monthly' | 'yearly';
  }) => void;
};


export default function PricingSection({ onPlanSelect }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Basic',
      desc: 'Perfect for individuals getting started with preserving their story.',
      monthlyPrice: '£4.99',
      yearlyPrice: '£49.99',
      features: [
        '25GB of secure storage',
        '3 timelines, 3 capsules & 3 albums',
        'Max upload 1GB per file, videos up to 5 minutes',
        'Add voice & written notes to your memories',
        'Access anywhere, anytime',
        'Priority email support',
      ],
    },
    {
      name: 'Standard',
      desc: 'Our most popular plan, designed for preserving and organising a complete digital legacy.',
      monthlyPrice: '£9.99',
      yearlyPrice: '£99.99',
      features: [
        'Everything in Basic plan plus',
        '250GB of secure storage',
        'Unlimited timelines, albums & capsules',
        'Organise timelines, albums & capsules into one private legacy',
        'Max upload 5GB per file, videos up to 15 minutes',
        'Appoint 1 person to inherit your digital legacy',
        'Priority 24/7 support',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      desc: 'For families who want total peace of mind and access to new features first.',
      monthlyPrice: '£14.99',
      yearlyPrice: '£149.99',
      features: [
        'Everything in Basic & Standard plans plus',
        '500GB of secure storage',
        'Max upload 10GB per file, videos up to 30 minutes with 4K processing priority',
        'Appoint 2 people to inherit your digital legacy',
        '30-day vault recovery for deleted items',
        'Future legal integration: Secure Digital Will & Asset Vault',
        'Access new features early such as Memorials & Tributes',
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="bg-[#fff9ee] py-20 sm:py-24 md:py-28 lg:py-32 text-[#0F2040]"
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 text-center">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#0F2040]">
          Simple, transparent pricing.
        </h2>
        <p className="text-lg mb-10 text-[#0F2040]">
          Every plan includes a{' '}
          <span className="font-semibold text-[#D4AF37] underline decoration-[#0F2040] decoration-2 underline-offset-4">
            14-day free trial
          </span>.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center mb-12">
          <span
            onClick={() => setBillingCycle('monthly')}
            className={`cursor-pointer w-40 h-[70px] flex flex-col items-center justify-center rounded-l-lg border text-lg font-medium transition-all duration-300 ${
              billingCycle === 'monthly'
                ? 'bg-[#D4AF37] text-[#0F2040] border-[#D4AF37]'
                : 'bg-white text-[#0F2040] border-gray-300'
            }`}
          >
            Monthly
          </span>

          <span
            onClick={() => setBillingCycle('yearly')}
            className={`cursor-pointer w-40 h-[70px] flex flex-col items-center justify-center rounded-r-lg border text-lg font-medium transition-all duration-300 ${
              billingCycle === 'yearly'
                ? 'bg-[#D4AF37] text-[#0F2040] border-[#D4AF37]'
                : 'bg-white text-[#0F2040] border-gray-300'
            }`}
          >
            Yearly
            <span className="text-xs text-[#DC2626] font-semibold leading-tight">
              2 months FREE
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-14 lg:grid-cols-3 md:grid-cols-2 sm:gap-10">
          {plans.map((plan, idx) => {
            const yearlyValue = parseFloat(plan.yearlyPrice.replace('£', ''));
            const monthlyBreakdown = (yearlyValue / 12).toFixed(2);

            return (
              <div
                key={idx}
                className={`flex flex-col justify-between p-10 rounded-2xl shadow-lg border transition-all text-left bg-white ${
                  plan.popular
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.4)]'
                    : 'border-[#D4AF37]'
                }`}
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#0F2040]">{plan.name}</h3>
                  {plan.popular && (
                    <span className="inline-block bg-[#D4AF37] text-[#0F2040] text-xs font-semibold px-3 py-1 rounded-full mt-2">
                      Most Popular
                    </span>
                  )}
                  <p className="mt-3 text-[#0F2040]/90">{plan.desc}</p>

                  {/* Price */}
                  <div className="mt-8 mb-8">
                    <span className="text-4xl font-extrabold text-[#0F2040]">
                      {billingCycle === 'monthly'
                        ? plan.monthlyPrice
                        : plan.yearlyPrice}
                    </span>
                    <span className="text-[#0F2040]/70 ml-2">
                      {billingCycle === 'monthly' ? '/month' : '/year'}
                    </span>

                    {billingCycle === 'yearly' && (
                      <span className="block text-sm text-[#0F2040]/60 mt-1">
                        (~£{monthlyBreakdown}/month)
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-[#D4AF37] mr-3 mt-1">✔</span>
                        <span className="text-[#0F2040]/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Buttons with shimmer */}
                <button
                type="button"
                onClick={() => {
                if (onPlanSelect) {
                // 🟢 Signup flow → go to Stripe step
                 onPlanSelect({
                 name: plan.name.toLowerCase(),
                 billingCycle,
                });
                } else {
                // 🟢 Landing page → go to signup
                 window.location.href = `/signup?plan=${plan.name.toLowerCase()}&billing=${billingCycle}`;
                 }
                }}

                  className={`relative overflow-hidden mt-auto inline-flex justify-center px-6 py-4 font-semibold rounded-full shadow-md transition-transform duration-300 hover:scale-105 ${
                  plan.popular
                  ? 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837]'
                  : 'bg-gradient-to-r from-[#0F2040] to-[#182C54] border-2 border-[#D4AF37] text-white'
                  }`}
                     >
                  <span className="relative z-10">
                    {plan.popular
                      ? 'Begin Your Legacy'
                      : 'Begin Your Legacy'}
                  </span>
                  <span
                  className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_3s_linear_infinite]"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
