'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast } from '@/lib/safeToast';
import PlansClient from './PlansClient';

type PlanName = 'Free' | 'Premium';
type Currency = 'GBP' | 'USD' | 'EUR';

type Plan = {
  id: string;
  name: PlanName;
  max_storage: number;
};

type SubscriptionRow = {
  user_id: string;
  plan_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
};

type UsageRow = {
  used_bytes: number;
};

export default function PlansLogic() {
  const supabase = getBrowserClient();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [usage, setUsage] = useState<UsageRow | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [showPlanChangeInfo, setShowPlanChangeInfo] = useState(false);
  const [usageLoading, setUsageLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [upgrading, setUpgrading] = useState(false);

  // The Free tier's storage comes from the plans table (1GB today); the constant is the
  // fallback for the moment before that row has loaded or if it cannot be read.
  const FREE_PLAN_STORAGE = 1 * 1024 ** 3;
  const freePlanStorage = plans.find((pl) => pl.name === 'Free')?.max_storage ?? FREE_PLAN_STORAGE;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const paidSuccess = url.searchParams.get('success');
    if (paidSuccess || url.searchParams.get('canceled')) {
      url.searchParams.delete('success');
      url.searchParams.delete('canceled');
      window.history.replaceState({}, '', url.toString());
    }
    if (paidSuccess) {
      safeToast.success("Payment successful. You're on Premium.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // The uid comes from the local session (no round trip); row security is the real check.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;

      // The three reads are independent, so they go out together (they used to run one after
      // another, after a network call to verify the user: four round trips in a row).
      const [planRes, subRes, usageRes] = await Promise.all([
        supabase.from('plans').select('id, name, max_storage').order('max_storage', { ascending: true }),
        uid
          ? supabase
              .from('subscriptions')
              .select('user_id, plan_id, status, cancel_at_period_end, current_period_end')
              .eq('user_id', uid)
              .maybeSingle()
          : null,
        // Storage is the FAMILY-WIDE shared pool, not this user's uploads alone.
        // get_total_storage_used(uid) is family-scoped: it sums storage across every
        // member who shares this user's family_id (see the RPC definition).
        uid ? supabase.rpc('get_total_storage_used', { uid }) : null,
      ]);

      if (planRes.error) console.warn('Plans error:', planRes.error.message);
      if (subRes?.error) console.warn('Subscription fetch error:', subRes.error.message);
      if (usageRes?.error) console.warn('Usage error:', usageRes.error.message);

      const planList = (planRes.data ?? []) as Plan[];
      setPlans(planList);

      const sub = (subRes?.data ?? null) as SubscriptionRow | null;
      setSubscription(sub);

      setUsage({ used_bytes: Number(usageRes?.data ?? 0) });
      setUsageLoading(false);

      const matchedPlan = planList.find((pl) => pl.id === sub?.plan_id) ?? null;

      if (matchedPlan?.name === 'Premium') {
        const isPremiumActive =
          sub?.status === 'active' &&
          sub?.cancel_at_period_end === false &&
          (!sub?.current_period_end || new Date(sub.current_period_end) > new Date());

        setCurrentPlan(isPremiumActive ? matchedPlan : null);
      } else {
        setCurrentPlan(null);
      }

      setLoading(false);
    })();
  }, [supabase]);

  function formatBytes(bytes?: number | null) {
    if (!bytes || bytes <= 0) return '0 MB';

    const mb = bytes / 1024 ** 2;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;

    // One decimal, as the sidebar's Library card shows the same figures ("100.0 GB").
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  }

  const formatDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString() : '';

  const handleUpgrade = async (planName: PlanName) => {
    // One checkout at a time: a second click while the first is in flight would open a
    // second Stripe session for the same person.
    if (upgrading) return;
    setUpgrading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token ?? '';

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            plan: planName,
            currency,
            returnPath: window.location.pathname,
          }),
          cache: 'no-store',
          mode: 'cors',
        }
      );

      const text = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        // Not JSON: the status line below is the message.
      }
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      if (data?.url) {
        // Stripe's page is off site, so this is a real navigation. The button stays busy until
        // the browser has left, so it cannot be pressed again on the way out.
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err: any) {
      console.error('Upgrade error:', err);
      safeToast.error('Error starting checkout: ' + err.message);
      setUpgrading(false);
    }
  };

  const PRICE: Record<Currency, string> = {
    GBP: '£3.99 / month',
    USD: '$5.99 / month',
    EUR: '€4.99 / month',
  };

  return (
    <PlansClient
      loading={loading}
      currency={currency}
      setCurrency={setCurrency}
      currentPlan={currentPlan}
      subscription={subscription}
      usage={usage}
      usageLoading={usageLoading}
      freePlanStorage={freePlanStorage}
      showPlanChangeInfo={showPlanChangeInfo}
      setShowPlanChangeInfo={setShowPlanChangeInfo}
      formatBytes={formatBytes}
      formatDate={formatDate}
      handleUpgrade={handleUpgrade}
      upgrading={upgrading}
      price={PRICE}
    />
  );
}