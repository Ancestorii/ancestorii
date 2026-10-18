'use client';

import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { ui, Btn, IconBtn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
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
  const [downloading, setDownloading] = useState(false);
  const titleId = useId();
  const subId = useId();

  // Escape closes it, Tab stays inside, focus returns to whatever opened it.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  const download = () => {
    setDownloading(true);
    window.open(`/api/timelines/${timelineId}/export`, '_blank');
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop: scrim-blur (globals.css) blurs only with a mouse; above the floating phone nav (z-[200]) */}
          <motion.div
            className={cx(ui.scrim, 'scrim-blur z-[9998]')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer: transform string (not x) so Motion runs the slide on the compositor */}
          <motion.div
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
                <iframe
                  src={`/api/timelines/${timelineId}/export?preview=true`}
                  title="Timeline PDF preview"
                />
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
                disabled={downloading}
                tile={downloading ? <Spinner size={16} /> : <Download size={18} strokeWidth={2.6} />}
              >
                {downloading ? 'Preparing…' : 'Download PDF'}
              </Btn>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
