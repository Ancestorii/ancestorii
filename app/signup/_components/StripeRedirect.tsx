'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

type StripeRedirectProps = {
  plan: {
    name: string; // 'basic' | 'standard' | 'premium'
    billingCycle: 'monthly' | 'yearly'; // kept for future use
  };
};

export default function StripeRedirect({ plan }: StripeRedirectProps) {
  useEffect(() => {
    const startCheckout = async () => {
      try {
        // 🔑 Get session (needed for auth header)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('User not authenticated');
        }

        // 🔥 Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke(
          'create-checkout',
          {
            body: {
              plan: capitalize(plan.name), // Basic | Standard | Premium
              returnPath: '/dashboard/profile',
            },
          }
        );

        if (error || !data?.url) {
          throw new Error(error?.message || 'Failed to create checkout');
        }

        // 🚀 Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch (err) {
        console.error(err);
        alert('Something went wrong. Please try again.');
      }
    };

    startCheckout();
  }, [plan]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mb-6" />

      <h2 className="text-2xl font-bold text-[#0F2040] mb-2">
        Securing your plan
      </h2>

      <p className="text-[#0F2040]/70 max-w-sm">
        You’re being redirected to our secure checkout.
        <br />
        This will only take a moment.
      </p>
    </div>
  );
}

// helper — keeps backend mapping clean
function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

