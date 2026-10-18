'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Eye, Save } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import RewardCodeField from '@/components/dashboard/RewardCodeField';
import { Btn, Spinner, Tag } from '@/components/dashboard/ui/AppBits';
import s from './canvasEditor.module.css';

export default function CanvasHeader({
  title,
  canvasId,
  tierKey,
  filledSlots,
  onSave,
  onPreview,
  saveState = 'idle',
}: {
  title: string;
  canvasId: string;
  tierKey: string;
  filledSlots: number;
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
    // A canvas with no photo at all would be printed blank.
    if (filledSlots === 0) {
      toast.error('Add at least one photo before ordering your canvas.');
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
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-canvas-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            tier_key: tierKey,
            canvas_id: canvasId,
            currency,
            reward_code: rewardCode ?? undefined,
          }),
          cache: 'no-store',
          mode: 'cors',
        }
      );

      const text = await res.text();
      let data: { url?: string; error?: string } | null = null;
      try {
        data = JSON.parse(text) as { url?: string; error?: string };
      } catch {
        data = null;
      }
      // The checkout function answers errors as { error: "plain English" }: show that, not the
      // raw JSON.
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}: ${text}`);

      if (data?.url) {
        // Stripe Checkout lives on stripe.com: a full navigation is the only way there.
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

  // As in the Book and Acrylic Print editors: the save icon, a spinner while it saves, a tick.
  const saveIcon =
    saveState === 'saving' ? (
      <Spinner size={16} />
    ) : saveState === 'saved' ? (
      <Check size={17} strokeWidth={2.6} aria-hidden="true" />
    ) : (
      <Save size={17} strokeWidth={2.2} aria-hidden="true" />
    );

  return (
    <header className={`fade-up ${s.header}`}>
      <div className={s.headerStart}>
        <Btn
          variant="soft"
          size="sm"
          onClick={() => router.push('/dashboard/canvas')}
          icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
        >
          Back to Canvases
        </Btn>

        <span className={s.headerRule} aria-hidden="true" />

        <div className={s.titleBlock}>
          <Tag dot="var(--c2)">Memory Canvas</Tag>
          <h1 className={s.title} title={title}>
            {title}
          </h1>
        </div>
      </div>

      <div className={s.headerActions}>
        <Btn
          variant="soft"
          size="sm"
          onClick={onSave}
          disabled={saveState === 'saving'}
          icon={saveIcon}
          className={s.saveBtn}
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

        <RewardCodeField product="canvas" tierKey={tierKey} onChange={setRewardCode} />

        <Btn
          size="sm"
          onClick={handleOrder}
          disabled={ordering}
          tile={ordering ? <Spinner size={15} /> : <ArrowRight size={16} strokeWidth={2.4} />}
        >
          {ordering ? 'Preparing…' : 'Order Canvas'}
        </Btn>
      </div>
    </header>
  );
}