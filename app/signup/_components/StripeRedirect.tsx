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
      console.log('💳 Calling create-checkout');

      const { data, error } = await supabase.functions.invoke(
        'create-checkout',
        {
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

      window.location.href = data.url;
    };

    goToCheckout();
  }, [plan]);

  return null;
}
