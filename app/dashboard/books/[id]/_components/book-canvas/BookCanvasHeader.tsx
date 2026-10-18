'use client';

import { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Check, Download, Eye, Save } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import RewardCodeField from '@/components/dashboard/RewardCodeField';
import { Btn, IconTile, Spinner, toneByKey, ui, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './bookCanvasHeader.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// The progress card can't be dismissed (the export or the checkout carries on): Escape does nothing.
const stayOpen = () => {};

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
  const [rewardCode, setRewardCode] = useState<string | null>(null);

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

  const showOverlay = exporting || ordering;
  const overlayMessages = exporting ? EXPORT_MESSAGES : ORDER_MESSAGES;

  // While the export or the checkout runs, focus sits in the progress card (Tab can't reach
  // the editor behind it) and goes back to the button afterwards.
  const overlayRef = useDialog<HTMLDivElement>(showOverlay, stayOpen);
  const overlayTitleId = useId();
  const overlayTextId = useId();
  const pct = Math.round(Math.min(progress, 100));

  const saveIcon =
    saveState === 'saving' ? (
      <Spinner size={16} />
    ) : saveState === 'saved' ? (
      <Check size={17} strokeWidth={2.6} aria-hidden="true" />
    ) : (
      <Save size={17} strokeWidth={2.2} aria-hidden="true" />
    );

  return (
    <>
      <header
        className={cx('fade-up', s.header)}
        style={{ gridRow: '1', gridColumn: '1 / -1', zIndex: 20 }}
      >
        <Btn
          variant="soft"
          size="sm"
          onClick={() => router.push('/dashboard/books')}
          icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
          className={s.back}
        >
          <span className={s.backLabel}>Back to Books</span>
        </Btn>

        <h1 className={s.title} title={title}>
          {title}
        </h1>

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

          {/* Download PDF */}
          <Btn
            variant="soft"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            icon={<Download size={17} strokeWidth={2.2} aria-hidden="true" />}
          >
            Download PDF
          </Btn>

          <RewardCodeField product="book" tierKey={tierKey} onChange={setRewardCode} />

          {/* Order Book */}
          <Btn
            size="sm"
            onClick={handleOrder}
            disabled={ordering}
            tile={ordering ? <Spinner size={16} /> : <ArrowRight size={16} strokeWidth={2.4} />}
          >
            {ordering ? 'Preparing…' : 'Order Book'}
          </Btn>
        </div>
      </header>

      {/* Export or checkout under way: a card over the dimmed editor */}
      {showOverlay && (
        <div className={cx(ui.scrim, 'scrim-blur', ui.fadeIn, s.overlay)}>
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={overlayTitleId}
            aria-describedby={overlayTextId}
            aria-busy="true"
            className={cx(ui.sheet, ui.confirm, ui.popIn, s.progressCard)}
          >
            <IconTile Icon={BookOpen} tone={toneByKey('orange')} />

            <h2 id={overlayTitleId} className={cx(ui.confirmTitle, 'mt-[18px]')}>
              {exporting ? 'Download PDF' : 'Order Book'}
            </h2>
            <p id={overlayTextId} className={ui.confirmText}>
              {exporting
                ? 'This may take a moment for larger books'
                : 'You’ll be redirected to secure checkout'}
            </p>

            <div className={cx(ui.noticeInfo, s.progressNotice)} role="status" aria-live="polite">
              <Spinner size={18} />
              <span key={`${exporting ? 'export' : 'order'}-${messageIndex}`} className={ui.fadeIn}>
                {overlayMessages[Math.min(messageIndex, overlayMessages.length - 1)]}
              </span>
            </div>

            {/* Progress bar: only for export */}
            {exporting && (
              <div className={s.progressRow}>
                <div
                  className={cx(ui.progress, s.progressBar)}
                  role="progressbar"
                  aria-label="Export progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  <div
                    className={cx(ui.progressFill, s.progressFill)}
                    style={{ transform: `scaleX(${Math.min(progress, 100) / 100})` }}
                  />
                </div>
                <span className={s.progressPct}>{pct}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
