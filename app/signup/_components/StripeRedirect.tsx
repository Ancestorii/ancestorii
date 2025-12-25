'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

type Plan = {
  name: string;
  billingCycle: 'monthly' | 'yearly';
};

export default function StripeRedirect({ plan }: { plan: Plan }) {
  useEffect(() => {
    const startCheckout = async () => {
      try {
        // 1️⃣ Get session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.access_token) {
          throw new Error('No session or access token');
        }

        // 2️⃣ Call Edge Function
        const { data, error } = await supabase.functions.invoke(
          'create-checkout',
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: {
              plan: plan.name, // MUST be "Basic" | "Standard" | "Premium"
              billingCycle: plan.billingCycle, // "monthly" | "yearly"
              returnPath: '/dashboard/profile',
            },
          }
        );

        // 🔍 Log response so we can SEE what Supabase returns
        console.log('create-checkout response:', { data, error });

        if (error) {
          throw error;
        }

        if (!data?.url) {
          throw new Error('No checkout URL returned');
        }

        // 3️⃣ Redirect to Stripe
        window.location.href = data.url;
      } catch (err: any) {
        console.error('Checkout error:', err);

        alert(
          err?.message ||
            err?.error?.message ||
            JSON.stringify(err)
        );
      }
    };

    if (plan?.name && plan?.billingCycle) {
      startCheckout();
    }
  }, [plan]);

  return null;
}
