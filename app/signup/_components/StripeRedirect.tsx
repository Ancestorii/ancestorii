'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function StripeRedirect({ plan }: any) {
  useEffect(() => {
    const startCheckout = async () => {
      const { data, error } = await supabase.functions.invoke(
        'create-checkout',
        {
          body: {
            plan: capitalize(plan.name),
          },
        }
      );

      if (error || !data?.url) {
        console.error(error);
        alert('Checkout failed');
        return;
      }

      window.location.href = data.url;
    };

    startCheckout();
  }, [plan]);

  return null;
}

function capitalize(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}
