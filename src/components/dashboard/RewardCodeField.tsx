'use client';

import { useEffect, useRef, useState } from 'react';
import { inter } from '@/lib/fonts';

// Public-app palette (CLAUDE.md): ink + gold, pure white surfaces.
const INK = '#191512';
const GOLD = '#C8A557';
const GOLD_DEEP = '#A9842E';
const OK = '#1A6B3C';
const ERR = '#8B2020';
const LINE = '#E8E4DC';

type Product = 'book' | 'canvas' | 'acrylic';

/**
 * Compact reward-code entry for the print checkout headers. Lets a family member
 * preview a reward code (read-only /api/rewards/validate) before checkout, and
 * reports the applied code up via onChange. The code is re-sent to the checkout
 * edge function, which is the authoritative validate → redeem → mint path.
 */
export default function RewardCodeField({
  product,
  tierKey,
  onChange,
}: {
  product: Product;
  tierKey: string;
  onChange: (code: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  // Monotonic request token: rapid tier switches / Apply clicks can put two
  // /api/rewards/validate calls in flight — only the latest may write state.
  const seqRef = useRef(0);

  const validate = async (raw: string) => {
    const value = raw.trim().toUpperCase();
    if (!value) {
      seqRef.current += 1; // invalidate any in-flight request
      setStatus('idle');
      setMessage('');
      onChange(null);
      return;
    }
    const seq = ++seqRef.current;
    setChecking(true);
    try {
      const res = await fetch('/api/rewards/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: value, product, tier_key: tierKey }),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (seq !== seqRef.current) return; // a newer request superseded this one
      if (data?.ok) {
        setStatus('ok');
        setMessage(`${data.label} — applied at checkout`);
        onChange(value);
      } else {
        setStatus('err');
        setMessage(data?.message ?? 'That reward code could not be applied.');
        onChange(null);
      }
    } catch {
      if (seq !== seqRef.current) return;
      setStatus('err');
      setMessage('Could not check that code right now.');
      onChange(null);
    } finally {
      if (seq === seqRef.current) setChecking(false);
    }
  };

  // Eligibility depends on the chosen tier — re-check an applied code if the tier changes.
  useEffect(() => {
    if (status === 'ok' && code.trim()) {
      validate(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierKey]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const applied = status === 'ok';

  return (
    <div ref={wrapRef} style={{ position: 'relative', fontFamily: inter.style.fontFamily }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: applied ? 'rgba(200, 165, 87, 0.12)' : 'none',
          border: `1.5px solid ${applied ? GOLD : LINE}`,
          padding: '8px 16px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          color: applied ? GOLD_DEEP : INK,
          cursor: 'pointer',
          fontFamily: inter.style.fontFamily,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="14" height="14" fill="none" stroke={applied ? GOLD_DEEP : INK} strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
          <path d="M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
        </svg>
        {applied ? 'Reward applied' : 'Reward code'}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 50,
            width: 280,
            background: '#FFFFFF',
            border: `1px solid ${LINE}`,
            borderRadius: 14,
            boxShadow: '0 14px 40px rgba(0,0,0,0.12)',
            padding: 16,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: INK, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Have a family reward code?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={code}
              placeholder="REWARD-XXXXXX"
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (status !== 'idle') {
                  setStatus('idle');
                  setMessage('');
                  onChange(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') validate(code);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '9px 10px',
                borderRadius: 9,
                border: `1.5px solid ${status === 'err' ? ERR : status === 'ok' ? GOLD : LINE}`,
                fontSize: 13,
                fontWeight: 600,
                color: INK,
                fontFamily: inter.style.fontFamily,
                letterSpacing: '0.02em',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => validate(code)}
              disabled={checking || !code.trim()}
              style={{
                background: INK,
                border: 'none',
                padding: '0 14px',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                cursor: checking || !code.trim() ? 'default' : 'pointer',
                opacity: checking || !code.trim() ? 0.6 : 1,
                fontFamily: inter.style.fontFamily,
              }}
            >
              {checking ? '…' : 'Apply'}
            </button>
          </div>

          {message && (
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: status === 'ok' ? OK : ERR,
                margin: '10px 0 0',
                lineHeight: 1.45,
              }}
            >
              {message}
            </p>
          )}

          {applied && (
            <button
              type="button"
              onClick={() => {
                setCode('');
                setStatus('idle');
                setMessage('');
                onChange(null);
              }}
              style={{
                marginTop: 10,
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 12,
                fontWeight: 600,
                color: GOLD_DEEP,
                cursor: 'pointer',
                fontFamily: inter.style.fontFamily,
              }}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
