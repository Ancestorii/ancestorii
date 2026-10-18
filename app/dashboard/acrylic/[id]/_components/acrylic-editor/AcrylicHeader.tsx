'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Eye, Save } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import RewardCodeField from '@/components/dashboard/RewardCodeField';
import { Btn, Spinner, Tag } from '@/components/dashboard/ui/AppBits';
import s from './acrylicEditor.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function AcrylicHeader({
  title,
  acrylicId,
  tierKey,
  emptySlots = 0,
  onSave,
  onPreview,
  saveState = 'idle',
}: {
  title: string;
  acrylicId: string;
  tierKey: string;
  emptySlots?: number;
  onSave: () => void;
  onPreview: () => void;
  saveState?: 'idle' | 'saving' | 'saved';
}) {
  const router = useRouter();
  const supabase = getBrowserClient();
  const [ordering, setOrdering] = useState(false);
  const [rewardCode, setRewardCode] = useState<string | null>(null);

  const handleOrder = async () => {
    if (ordering) return;

    // An empty slot prints as an empty slot (the export draws the print as it stands), so the
    // order waits until every slot has a photo.
    if (emptySlots > 0) {
      toast.error(
        emptySlots === 1
          ? 'Add a photo to the empty slot before ordering.'
          : `Add a photo to every slot before ordering (${emptySlots} still empty).`
      );
      return;
    }

    setOrdering(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token ?? '';
      if (!accessToken) {
        toast.error('Please sign in to order.');
        return;
      }

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
      const lang = navigator.language ?? '';
      let currency = 'GBP';
      if (tz.startsWith('America/') || lang.startsWith('en-US')) {
        currency = 'USD';
      } else if (
        tz.startsWith('Europe/') &&
        !tz.startsWith('Europe/London') &&
        !tz.startsWith('Europe/Belfast')
      ) {
        currency = 'EUR';
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-acrylic-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            tier_key: tierKey,
            acrylic_id: acrylicId,
            currency,
            reward_code: rewardCode ?? undefined,
          }),
          cache: 'no-store',
          mode: 'cors',
        }
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      const data = JSON.parse(text);

      if (data?.url) {
        // Stripe Checkout lives on checkout.stripe.com: a full navigation is the only way there
        // (the router only moves within this site).
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err: any) {
      console.error('Order error:', err);
      toast.error('Failed to start checkout: ' + err.message);
    } finally {
      setOrdering(false);
    }
  };

  const saveLabel =
    saveState === 'saving'
      ? 'Saving...'
      : saveState === 'saved'
      ? 'Saved!'
      : 'Save';

  const saveIcon =
    saveState === 'saving' ? (
      <Spinner size={16} />
    ) : saveState === 'saved' ? (
      <Check size={17} strokeWidth={2.6} aria-hidden="true" />
    ) : (
      <Save size={17} strokeWidth={2.2} aria-hidden="true" />
    );

  return (
    <header
      className={cx('fade-up', s.header)}
      style={{ gridRow: '1', gridColumn: '1 / -1', zIndex: 20 }}
    >
      <div className={s.headerStart}>
        <Btn
          variant="soft"
          size="sm"
          onClick={() => router.push('/dashboard/acrylic')}
          icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
          className={s.back}
        >
          Back to Acrylics
        </Btn>
        <span className={s.headerRule} aria-hidden="true" />

        <div className={s.titleBlock}>
          <Tag dot="var(--c2)">Acrylic Print</Tag>
          <h1 className={s.title} title={title}>
            {title}
          </h1>
        </div>
      </div>

      <div className={s.actions}>
        <Btn
          variant="soft"
          size="sm"
          onClick={onSave}
          disabled={saveState === 'saving'}
          icon={saveIcon}
          className={s.save}
        >
          {saveLabel}
        </Btn>

        <Btn
          variant="soft"
          size="sm"
          onClick={onPreview}
          aria-haspopup="dialog"
          icon={<Eye size={17} strokeWidth={2.2} aria-hidden="true" />}
        >
          Preview
        </Btn>

        <RewardCodeField product="acrylic" tierKey={tierKey} onChange={setRewardCode} />

        <Btn
          size="sm"
          onClick={handleOrder}
          disabled={ordering}
          tile={ordering ? <Spinner size={16} /> : <ArrowRight size={16} strokeWidth={2.4} />}
        >
          {ordering ? 'Preparing…' : 'Order Print'}
        </Btn>
      </div>
    </header>
  );
}