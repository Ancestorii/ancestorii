'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';

type Plan = {
  name: string;
  billingCycle: 'monthly' | 'yearly';
};

export default function StripeRedirect({ plan }: { plan: Plan }) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    console.log('🚀 StripeRedirect mounted', plan);

    const goToCheckout = async () => {
      // 1️⃣ Get session (token)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log('🔐 Session', session);

      if (sessionError || !session?.access_token) {
        alert('Not authenticated');
        return;
      }

      console.log('💳 Calling create-checkout');

      // 2️⃣ Call Edge Function WITH HEADERS
      const { data, error } = await supabase.functions.invoke(
        'create-checkout',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: {
            plan: plan.name,
            billingCycle: plan.billingCycle,
            returnPath: '/dashboard/profile',
          },
        }
      );

      console.log('📦 create-checkout response', { data, error });

      if (error || !data?.url) {
        alert(data?.error || error?.message || 'Checkout failed');
        return;
      }

      // 3️⃣ Redirect to Stripe
      window.location.href = data.url;
    };

    goToCheckout();
  }, [plan]);

  return null;
}
