'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

type Plan = {
  name: string;
  billingCycle: 'monthly' | 'yearly';
};

export default function StripeRedirect({ plan }: { plan: Plan }) {
  useEffect(() => {
    let unsub: (() => void) | null = null;

    const goToCheckout = async (accessToken: string) => {
      const { data, error } = await supabase.functions.invoke(
        'create-checkout',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            plan: plan.name,
            billingCycle: plan.billingCycle,
            returnPath: '/dashboard/profile',
          },
        }
      );

      if (error || !data?.url) {
        alert(error?.message || 'Checkout failed');
        return;
      }

      window.location.href = data.url;
    };

    // 1️⃣ Try immediate session (already signed in case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        goToCheckout(session.access_token);
      } else {
        // 2️⃣ Wait for sign-in (fresh signup case)
        const { data } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' && session?.access_token) {
              goToCheckout(session.access_token);
            }
          }
        );

        unsub = () => data.subscription.unsubscribe();
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [plan]);

  return null;
}
