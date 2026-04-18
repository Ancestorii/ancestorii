'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
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

  const FREE_PLAN_STORAGE = 5 * 1024 ** 3;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (url.searchParams.get('success') || url.searchParams.get('canceled')) {
      url.searchParams.delete('success');
      url.searchParams.delete('canceled');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: authResp } = await supabase.auth.getUser();
      const uid = authResp?.user?.id ?? null;

      const { data: planRows, error: planErr } = await supabase
        .from('plans')
        .select('id, name, max_storage')
        .order('max_storage', { ascending: true });

      if (planErr) console.warn('Plans error:', planErr.message);

      const planList = (planRows ?? []) as Plan[];
      setPlans(planList);

      let sub: SubscriptionRow | null = null;

      if (uid) {
        const { data: subRows, error: subErr } = await supabase
          .from('subscriptions')
          .select('user_id, plan_id, status, cancel_at_period_end, current_period_end')
          .eq('user_id', uid)
          .maybeSingle();

        if (subErr) console.warn('Subscription fetch error:', subErr.message);

        sub = (subRows ?? null) as SubscriptionRow | null;
        setSubscription(sub);

        const { data: usageRow, error: usageErr } = await supabase
          .from('storage_usage')
          .select('used_bytes')
          .eq('user_id', uid)
          .maybeSingle();

        if (usageErr) console.warn('Usage error:', usageErr.message);

        setUsage((usageRow ?? null) as UsageRow | null);
        setUsageLoading(false);
      }

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

  useEffect(() => {
    if (!subscription?.user_id) return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('storage_usage')
        .select('used_bytes')
        .eq('user_id', subscription.user_id)
        .maybeSingle();

      setUsage({ used_bytes: data?.used_bytes ?? 0 });
      setUsageLoading(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [subscription?.user_id, supabase]);

  function formatBytes(bytes?: number | null) {
    if (!bytes || bytes <= 0) return '0 MB';

    const mb = bytes / 1024 ** 2;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;

    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  const formatDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString() : '—';

  const handleUpgrade = async (planName: PlanName) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token ?? '';

      const res = await fetch(
        'https://wekebqaooixjngznycnm.supabase.co/functions/v1/create-checkout',
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
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      const data = JSON.parse(text);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from Supabase.');
      }
    } catch (err: any) {
      console.error('Upgrade error:', err);
      alert('Error starting checkout: ' + err.message);
    }
  };

  const PRICE: Record<Currency, string> = {
    GBP: '£49 / year',
    USD: '$69 / year',
    EUR: '€59 / year',
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
      freePlanStorage={FREE_PLAN_STORAGE}
      showPlanChangeInfo={showPlanChangeInfo}
      setShowPlanChangeInfo={setShowPlanChangeInfo}
      formatBytes={formatBytes}
      formatDate={formatDate}
      handleUpgrade={handleUpgrade}
      price={PRICE}
    />
  );
}