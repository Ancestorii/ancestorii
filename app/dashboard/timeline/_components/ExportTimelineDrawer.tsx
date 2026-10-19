'use client';

import { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { ui, AppLoader, Btn, IconBtn, Spinner, useDialog, jsMotion } from '@/components/dashboard/ui/AppBits';
import s from './timelineList.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function ExportTimelineDrawer({
  open,
  onClose,
  timelineId,
}: {
  open: boolean;
  onClose: () => void;
  timelineId: string;
}) {
  // The PDF is built once each time the drawer opens: the preview shows it and Download saves
  // the same bytes. It used to be generated twice (once for the preview frame, again in a new
  // tab), and a failure showed as a browser error page inside the frame.
  const [pdf, setPdf] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const subId = useId();

  // Escape closes it, Tab stays inside, focus returns to whatever opened it.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setPdf(null);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/timelines/${timelineId}/export`, { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`Export failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
        const blob = await res.blob();
        if (cancelled) return;
        const match = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '');
        objectUrl = URL.createObjectURL(blob);
        setPdf({ url: objectUrl, filename: match?.[1] || 'timeline.pdf' });
      } catch (e) {
        console.error('[TIMELINE_PDF_PREVIEW]', e);
        if (!cancelled) setError('The PDF could not be prepared just now. Close this and try again in a moment.');
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, timelineId]);

  const download = () => {
    if (!pdf) return;
    const a = document.createElement('a');
    a.href = pdf.url;
    a.download = pdf.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop: scrim-blur (globals.css) blurs only with a mouse; above the floating phone nav (z-[200]) */}
          <motion.div
            {...jsMotion}
            className={cx(ui.scrim, 'scrim-blur z-[9998]')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer: transform string (not x) so Motion runs the slide on the compositor */}
          <motion.div
            {...jsMotion}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={subId}
            className={cx(ui.sheet, ui.sheetRight, s.exportPanel, 'z-[9999]')}
            initial={{ transform: 'translateX(100%)' }}
            animate={{ transform: 'translateX(0%)' }}
            exit={{ transform: 'translateX(100%)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            {/* Header */}
            <div className={ui.sheetHeader}>
              <div className="min-w-0">
                <h2 id={titleId} className={ui.sheetTitle}>
                  Preserve My Legacy
                </h2>
                <p id={subId} className={ui.sheetSub}>
                  Preview how your timeline will be preserved
                </p>
              </div>
              <IconBtn label="Close" onClick={onClose}>
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            {/* Body */}
            <div className={ui.sheetBody}>
              {/* PDF Preview */}
              <div className={s.pdf}>
                {pdf ? (
                  <iframe src={pdf.url} title="Timeline PDF preview" />
                ) : error ? (
                  <p className={cx(ui.noticeError, 'm-4')} role="alert">
                    {error}
                  </p>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <AppLoader compact label="Preparing your PDF" />
                  </div>
                )}
              </div>

              <p className={s.pdfNote}>
                This PDF includes your timeline layout, colours, one image per
                memory, and the Ancestorii watermark.
              </p>
            </div>

            {/* Footer */}
            <div className={ui.sheetFooter}>
              <Btn variant="soft" onClick={onClose}>
                Cancel
              </Btn>
              <Btn
                onClick={download}
                disabled={!pdf}
                tile={pdf || error ? <Download size={18} strokeWidth={2.6} /> : <Spinner size={16} />}
              >
                {pdf || error ? 'Download PDF' : 'Preparing…'}
              </Btn>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
