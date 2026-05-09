'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inter } from '@/lib/fonts';
import { ACRYLIC_COLORS } from './AcrylicEditor';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';

export default function AcrylicHeader({
  title,
  acrylicId,
  tierKey,
  onSave,
  onPreview,
  saveState = 'idle',
}: {
  title: string;
  acrylicId: string;
  tierKey: string;
  onSave: () => void;
  onPreview: () => void;
  saveState?: 'idle' | 'saving' | 'saved';
}) {
  const router = useRouter();
  const supabase = getBrowserClient();
  const [ordering, setOrdering] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Express'>('Standard');

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
            shipping_method: shippingMethod,
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
        background: ACRYLIC_COLORS.panel,
        borderBottom: `1.5px solid ${ACRYLIC_COLORS.line}`,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={() => router.push('/dashboard/acrylic')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: ACRYLIC_COLORS.mid,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: inter.style.fontFamily,
          }}
        >
          <svg width="16" height="16" fill="none" stroke={ACRYLIC_COLORS.mid} strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 24,
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 700,
            color: ACRYLIC_COLORS.dark,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === 'saving'}
          style={{
            background: saveState === 'saved' ? ACRYLIC_COLORS.dark : ACRYLIC_COLORS.accent,
            border: saveState === 'saved' ? `1.5px solid ${ACRYLIC_COLORS.dark}` : `1.5px solid ${ACRYLIC_COLORS.accent}`,
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
            border: `1.5px solid ${ACRYLIC_COLORS.line}`,
            padding: '8px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            color: ACRYLIC_COLORS.dark,
            cursor: 'pointer',
            fontFamily: inter.style.fontFamily,
          }}
        >
          Preview
        </button>

       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: ACRYLIC_COLORS.canvas, borderRadius: 10, padding: 3, border: `1.5px solid ${ACRYLIC_COLORS.line}` }}>
          {(['Standard', 'Express'] as const).map((method) => {
            const active = shippingMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => setShippingMethod(method)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: active ? ACRYLIC_COLORS.dark : 'transparent',
                  color: active ? '#fff' : ACRYLIC_COLORS.mid,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: inter.style.fontFamily,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {method === 'Standard' ? 'Free Shipping' : 'Express (£5.99 / $7.99 / €6.99)'}
              </button>
            );
          })}
        </div>
        {shippingMethod === 'Express' && (
          <span style={{ fontFamily: inter.style.fontFamily, fontSize: 9, fontWeight: 500, color: ACRYLIC_COLORS.muted }}>
            Charged in your local currency
          </span>
        )}
        </div>

        <button
          type="button"
          onClick={handleOrder}
          disabled={ordering}
          style={{
            background: ordering
              ? ACRYLIC_COLORS.muted
              : ACRYLIC_COLORS.dark,
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
          {ordering ? 'Preparing…' : 'Order Print'}
        </button>
      </div>
    </header>
  );
}