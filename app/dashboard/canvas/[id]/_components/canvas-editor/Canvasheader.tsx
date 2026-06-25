'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inter } from '@/lib/fonts';
import { CANVAS_COLORS } from './Canvaseditor';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import RewardCodeField from '@/components/dashboard/RewardCodeField';

export default function CanvasHeader({
  title,
  canvasId,
  tierKey,
  onSave,
  onPreview,
  saveState = 'idle',
}: {
  title: string;
  canvasId: string;
  tierKey: string;
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
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      const data = JSON.parse(text);

      if (data?.url) {
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

  return (
    <header
      className="fade-up"
      style={{
        gridRow: '1',
        gridColumn: '1 / -1',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        alignContent: 'center',
        padding: '0 28px',
        minHeight: 72,
        background: CANVAS_COLORS.panel,
        borderBottom: `1.5px solid ${CANVAS_COLORS.line}`,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={() => router.push('/dashboard/canvas')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: CANVAS_COLORS.mid,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: inter.style.fontFamily,
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke={CANVAS_COLORS.mid}
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 24,
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 700,
            color: CANVAS_COLORS.dark,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === 'saving'}
          style={{
            background:
              saveState === 'saved'
                ? CANVAS_COLORS.dark
                : CANVAS_COLORS.accent,
            border:
              saveState === 'saved'
                ? `1.5px solid ${CANVAS_COLORS.dark}`
                : `1.5px solid ${CANVAS_COLORS.accent}`,
            padding: '8px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            cursor: saveState === 'saving' ? 'default' : 'pointer',
            fontFamily: inter.style.fontFamily,
            transition: 'all 0.18s ease',
            opacity: saveState === 'saving' ? 0.85 : 1,
            minWidth: 88,
          }}
        >
          {saveLabel}
        </button>

        <button
          type="button"
          onClick={onPreview}
          style={{
            background: 'none',
            border: `1.5px solid ${CANVAS_COLORS.line}`,
            padding: '8px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            color: CANVAS_COLORS.dark,
            cursor: 'pointer',
            fontFamily: inter.style.fontFamily,
          }}
        >
          Preview
        </button>

        <RewardCodeField product="canvas" tierKey={tierKey} onChange={setRewardCode} />

        <button
          type="button"
          onClick={handleOrder}
          disabled={ordering}
          style={{
            background: ordering
              ? CANVAS_COLORS.muted
              : CANVAS_COLORS.dark,
            border: 'none',
            padding: '9px 22px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            cursor: ordering ? 'default' : 'pointer',
            fontFamily: inter.style.fontFamily,
            opacity: ordering ? 0.7 : 1,
            transition: 'all 0.18s ease',
          }}
        >
          {ordering ? 'Preparing…' : 'Order Canvas'}
        </button>
      </div>
    </header>
  );
}