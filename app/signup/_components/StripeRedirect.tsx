'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

type Plan = {
  name: string;
  billingCycle: 'monthly' | 'yearly';
};

export default function StripeRedirect({ plan }: { plan: Plan }) {
  useEffect(() => {
    console.log('🚀 StripeRedirect mounted', plan);

    let unsub: (() => void) | null = null;

    const goToCheckout = async (accessToken: string) => {
      console.log('💳 Calling create-checkout');

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

      console.log('📦 create-checkout response', { data, error });

      if (error || !data?.url) {
        alert(error?.message || 'Checkout failed');
        return;
      }

      window.location.href = data.url;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Session result', session);

      if (session?.access_token) {
        goToCheckout(session.access_token);
      } else {
        const { data } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('🧠 Auth event', event, session);

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
