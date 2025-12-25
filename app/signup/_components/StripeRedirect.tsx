'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function StripeRedirect({ plan }: any) {
  useEffect(() => {
    const startCheckout = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('No session');
        }

        const { data, error } = await supabase.functions.invoke(
          'create-checkout',
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: {
              plan: capitalize(plan.name),
              billingCycle: plan.billingCycle,
              returnPath: '/dashboard/profile',
            },
          }
        );

        if (error || !data?.url) {
          throw new Error(error?.message || 'Checkout failed');
        }

        window.location.href = data.url;
      } catch (err) {
        console.error(err);
        alert('Checkout failed');
      }
    };

    startCheckout();
  }, [plan]);

  return null;
}

function capitalize(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}
