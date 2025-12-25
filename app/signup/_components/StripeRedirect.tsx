'use client';

import { useEffect, useRef } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

type Plan = {
  name: string;
  billingCycle: 'monthly' | 'yearly';
};

const supabase = getBrowserClient();

export default function StripeRedirect({ plan }: { plan: Plan }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const start = async () => {
      // 1️⃣ Get session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        alert('No session or access token');
        return;
      }

      // 2️⃣ Call edge function WITH auth
      const { data, error } = await supabase.functions.invoke(
        'create-checkout',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            plan: plan.name,
            billingCycle: plan.billingCycle,
            returnPath: '/dashboard/profile',
          },
        }
      );

      if (error || !data?.url) {
        alert(error?.message || data?.error || 'Checkout failed');
        return;
      }

      // 3️⃣ Redirect to Stripe
      window.location.href = data.url;
    };

    start();
  }, [plan]);

  return null;
}
