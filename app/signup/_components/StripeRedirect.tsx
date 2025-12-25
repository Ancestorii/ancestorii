'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function StripeRedirect({ plan }: any) {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session?.access_token) return;

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
          alert(error?.message || 'Checkout failed');
          return;
        }

        window.location.href = data.url;
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [plan]);

  return null;
}
