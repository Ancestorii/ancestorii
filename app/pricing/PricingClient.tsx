'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Billing = 'monthly' | 'yearly';

type Plan = {
  name: string;
  monthly: string;
  yearly: string;
  popular?: boolean;
  features: string[];
};

export default function PricingClient() {
  const [billing, setBilling] = useState<Billing>('monthly');

  const plans: Plan[] = useMemo(
    () => [
      {
        name: 'Basic',
        monthly: '£4.99',
        yearly: '£49.99',
        features: [
          '25GB secure storage',
          '3 timelines, albums and capsules',
          '1GB max upload per file',
          'Videos up to 5 minutes',
          'Voice and written memories',
          'Priority email support',
        ],
      },
      {
        name: 'Standard',
        monthly: '£9.99',
        yearly: '£99.99',
        popular: true,
        features: [
          '250GB secure storage',
          'Unlimited timelines and albums',
          'Organise everything into one private legacy',
          '5GB max upload per file',
          'Videos up to 15 minutes',
          'Appoint one legacy contact',
          '24 hour priority support',
        ],
      },
      {
        name: 'Premium',
        monthly: '£14.99',
        yearly: '£149.99',
        features: [
          '500GB secure storage',
          '10GB max upload per file',
          'Videos up to 30 minutes with priority processing',
          'Two legacy contacts',
          '30 day recovery window',
          'Early access to new features',
          'Future digital will integration',
        ],
      },
    ],
    []
  );

  return (
    <div className="mt-10 sm:mt-12">
      {/* Toggle sits with plans */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="text-sm text-[#0F2040]">
          Choose how you’d like to pay.
        </div>

        <div className="inline-flex rounded-full border border-[#D4AF37] overflow-hidden bg-white shadow-sm w-fit">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 text-sm font-semibold transition ${
              billing === 'monthly'
                ? 'bg-[#D4AF37] text-[#0F2040]'
                : 'text-[#0F2040] hover:bg-[#FFF9EE]'
            }`}
          >
            Monthly
          </button>

          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 text-sm font-semibold transition ${
              billing === 'yearly'
                ? 'bg-[#D4AF37] text-[#0F2040]'
                : 'text-[#0F2040] hover:bg-[#FFF9EE]'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Cards — perfectly even */}
<div className="mt-10 grid gap-8 md:grid-cols-3">
  {plans.map((plan) => {
    const isPopular = !!plan.popular;

    return (
      <div
        key={plan.name}
        className={[
          'relative rounded-[2rem] border bg-white',
          'flex flex-col h-full',
          isPopular
            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]'
            : 'border-[#E5C45C]',
        ].join(' ')}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 text-xs font-semibold bg-[#D4AF37] text-[#0F2040] rounded-full">
              Most Chosen
            </span>
          </div>
        )}

        <div className="p-8 sm:p-9 flex flex-col flex-1">

          {/* Header */}
          <div className="text-center">
            <h4 className="text-xl font-semibold">{plan.name}</h4>

            <div className="mt-4">
              <div className="text-4xl font-extrabold leading-none">
                {billing === 'monthly' ? plan.monthly : plan.yearly}
              </div>
              <div className="mt-2 text-xs text-[#0F2040]/60">
                per {billing === 'monthly' ? 'month' : 'year'}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-7 flex-1">
            <ul className="space-y-2.5 text-sm text-[#0F2040]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <span className="text-[#D4AF37]">●</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/signup"
              className={[
                'inline-flex w-full justify-center items-center px-7 py-3.5 rounded-full font-semibold transition',
                isPopular
                  ? 'bg-[#0F2040] text-white'
                  : 'bg-[#E6C26E] text-[#0F2040]',
              ].join(' ')}
            >
              Create your library
            </Link>

            <p className="mt-3 text-xs text-center text-[#0F2040]">
              You can start free first. Upgrade inside the app.
            </p>
          </div>

        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}