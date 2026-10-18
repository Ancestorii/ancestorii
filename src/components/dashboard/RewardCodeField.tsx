'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, Check, Gift } from 'lucide-react';
import { ui, Btn, Spinner, btnClass } from '@/components/dashboard/ui/AppBits';
import s from './RewardCodeField.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const inputId = useId();
  const messageId = useId();
  // Monotonic request token: rapid tier switches / Apply clicks can put two
  // /api/rewards/validate calls in flight, only the latest may write state.
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
        setMessage(`${data.label}, applied at checkout`);
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

  // Eligibility depends on the chosen tier, re-check an applied code if the tier changes.
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

  // Escape closes the panel and hands focus back to the button: while focus is in the panel,
  // or after it dropped to the page (Apply is disabled while a code is checked). Focus in
  // anything else (a dialog opened over the editor) keeps its own Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const focused = document.activeElement;
      if (focused && focused !== document.body && !wrapRef.current?.contains(focused)) return;
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const applied = status === 'ok';

  return (
    <div ref={wrapRef} className={s.root}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={btnClass({ variant: 'soft', size: 'sm', className: open ? s.triggerOpen : undefined })}
      >
        {applied ? (
          <span className={s.okBadge} aria-hidden="true">
            <Check size={13} strokeWidth={3.2} />
          </span>
        ) : (
          <Gift size={17} strokeWidth={2.2} aria-hidden="true" />
        )}
        <span>{applied ? 'Reward applied' : 'Reward code'}</span>
      </button>

      {open && (
        <div id={panelId} role="group" aria-labelledby={`${inputId}-label`} className={cx(ui.menu, ui.fadeIn, s.panel)}>
          <label id={`${inputId}-label`} htmlFor={inputId} className={cx(ui.label, s.label)}>
            Have a family reward code?
          </label>
          <div className={cx(s.field, status === 'err' && s.fieldError)}>
            <input
              id={inputId}
              type="text"
              value={code}
              placeholder="REWARD-XXXXXX"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={status === 'err' || undefined}
              aria-describedby={message ? messageId : undefined}
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
              className={s.input}
            />
            <Btn
              variant="soft"
              size="sm"
              onClick={() => validate(code)}
              disabled={checking || !code.trim()}
              aria-busy={checking || undefined}
              className={s.apply}
            >
              {checking ? (
                <>
                  <Spinner size={16} />
                  <span className={ui.srOnly}>Checking</span>
                </>
              ) : (
                'Apply'
              )}
            </Btn>
          </div>

          {message && (
            <p
              id={messageId}
              role={status === 'err' ? 'alert' : 'status'}
              className={cx(status === 'ok' ? ui.notice : ui.noticeError, s.message)}
            >
              {status === 'ok' ? (
                <Check size={17} strokeWidth={2.6} aria-hidden="true" />
              ) : (
                <AlertCircle size={17} strokeWidth={2.4} aria-hidden="true" />
              )}
              <span>{message}</span>
            </p>
          )}

          {applied && (
            <Btn
              variant="soft"
              size="sm"
              className={s.remove}
              onClick={() => {
                setCode('');
                setStatus('idle');
                setMessage('');
                onChange(null);
              }}
            >
              Remove
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
