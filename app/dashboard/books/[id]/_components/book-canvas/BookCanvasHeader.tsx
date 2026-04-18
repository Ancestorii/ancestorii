'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inter } from '@/lib/fonts';
import { BOOK_CANVAS_COLORS } from './BookCanvas';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';

const EXPORT_MESSAGES = [
  'Gathering your memories…',
  'Laying out each page…',
  'Placing your photos…',
  'Binding your story…',
  'Almost there…',
];

const ORDER_MESSAGES = [
  'Preparing your order…',
  'Connecting to checkout…',
];

export default function BookCanvasHeader({
  title,
  bookId,
  tierKey,
  onSave,
  onPreview,
  onExport,
  saveState = 'idle',
}: {
  title: string;
  bookId: string;
  tierKey: string;
  onSave: () => void;
  onPreview: () => void;
  onExport: () => Promise<void>;
  saveState?: 'idle' | 'saving' | 'saved';
}) {
  const router = useRouter();
  const supabase = getBrowserClient();

  const [exporting, setExporting] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // ── Cycle through messages during export ──
  useEffect(() => {
    if (!exporting) {
      setMessageIndex(0);
      setProgress(0);
      return;
    }

    const msgInterval = setInterval(() => {
      setMessageIndex((i) =>
        i < EXPORT_MESSAGES.length - 1 ? i + 1 : i
      );
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 8 + 2;
      });
    }, 600);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [exporting]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setProgress(0);
    setMessageIndex(0);
    try {
      await onExport();
      setProgress(100);
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      setExporting(false);
    }
  };

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

      // Detect currency from browser locale
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
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-book-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            tier_key: tierKey,
            book_id: bookId,
            currency,
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

  const showOverlay = exporting || ordering;
  const overlayMessages = exporting ? EXPORT_MESSAGES : ORDER_MESSAGES;

  return (
    <>
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
          background: BOOK_CANVAS_COLORS.panel,
          borderBottom: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/books')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: BOOK_CANVAS_COLORS.mid,
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
              stroke={BOOK_CANVAS_COLORS.mid}
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
              color: BOOK_CANVAS_COLORS.dark,
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
                  ? BOOK_CANVAS_COLORS.dark
                  : BOOK_CANVAS_COLORS.accent,
              border:
                saveState === 'saved'
                  ? `1.5px solid ${BOOK_CANVAS_COLORS.dark}`
                  : `1.5px solid ${BOOK_CANVAS_COLORS.accent}`,
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
              border: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
              padding: '8px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: BOOK_CANVAS_COLORS.dark,
              cursor: 'pointer',
              fontFamily: inter.style.fontFamily,
            }}
          >
            Preview
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            style={{
              background: 'none',
              border: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
              padding: '8px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: BOOK_CANVAS_COLORS.dark,
              cursor: exporting ? 'default' : 'pointer',
              fontFamily: inter.style.fontFamily,
              opacity: exporting ? 0.6 : 1,
              transition: 'all 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke={BOOK_CANVAS_COLORS.dark}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download PDF
          </button>

          {/* Order Book */}
          <button
            type="button"
            onClick={handleOrder}
            disabled={ordering}
            style={{
              background: ordering
                ? BOOK_CANVAS_COLORS.muted
                : BOOK_CANVAS_COLORS.dark,
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
            {ordering ? 'Preparing…' : 'Order Book'}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════
          OVERLAY (export or ordering)
          ═══════════════════════════════════ */}
      {showOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 6, 4, 0.88)',
            backdropFilter: 'blur(20px)',
            animation: 'exportFadeIn 0.4s ease both',
          }}
        >
          <style>{`
            @keyframes exportFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes exportPulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.05); }
            }
            @keyframes exportBarShimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes exportMsgIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Book icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1.5px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
              animation: 'exportPulse 2s ease infinite',
            }}
          >
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M12 3v18" />
            </svg>
          </div>

          {/* Message */}
          <div
            key={`${exporting ? 'export' : 'order'}-${messageIndex}`}
            style={{
              fontFamily: inter.style.fontFamily,
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
              marginBottom: 8,
              animation: 'exportMsgIn 0.4s ease both',
            }}
          >
            {overlayMessages[Math.min(messageIndex, overlayMessages.length - 1)]}
          </div>

          <div
            style={{
              fontFamily: inter.style.fontFamily,
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: 32,
            }}
          >
            {exporting
              ? 'This may take a moment for larger books'
              : 'You\u2019ll be redirected to secure checkout'}
          </div>

          {/* Progress bar — only for export */}
          {exporting && (
            <>
              <div
                style={{
                  width: 280,
                  height: 6,
                  borderRadius: 99,
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    borderRadius: 99,
                    background:
                      'linear-gradient(90deg, #B8860B, #d4af37, #e8c84a)',
                    backgroundSize: '200% 100%',
                    animation: 'exportBarShimmer 1.5s linear infinite',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: inter.style.fontFamily,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(212, 175, 55, 0.6)',
                  marginTop: 12,
                  letterSpacing: '0.08em',
                }}
              >
                {Math.round(Math.min(progress, 100))}%
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}