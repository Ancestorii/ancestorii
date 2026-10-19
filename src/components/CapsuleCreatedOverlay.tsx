'use client';

import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { Accent, useDialog, jsMotion } from '@/components/dashboard/ui/AppBits';
import s from './Celebration.module.css';

type CapsuleCreatedOverlayProps = {
  open: boolean;
  onClose: () => void;
  durationMs?: number;
};

export default function CapsuleCreatedOverlay({
  open,
  onClose,
  durationMs = 3500,
}: CapsuleCreatedOverlayProps) {
  const titleId = useId();
  const textId = useId();

  // Escape closes it too (as a click does), and focus goes back where it was.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  // The page passes a fresh onClose on every render; held in a ref so the timer runs once
  // from opening, not again from each render of the list behind it.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current(), durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            {...jsMotion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={s.scrim}
            onClick={onClose}
          >
            {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
            <motion.div
              {...jsMotion}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={textId}
              initial={{ opacity: 0, transform: 'translateY(30px) scale(0.92)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
              exit={{ opacity: 0, transform: 'translateY(20px) scale(0.95)' }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className={s.card}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={s.corners} aria-hidden="true">
                <span className={s.cornerPink} />
                <span className={s.cornerBlue} />
              </span>

              {/* Badge: the pink Capsules tile, and the four colours bursting out of it once */}
              <div className={s.badge} aria-hidden="true">
                <span className={s.spark} />
                <span className={s.spark} />
                <span className={s.spark} />
                <span className={s.spark} />
                <span className={s.tile} style={{ '--tile': 'var(--c0)', '--tile-fg': '#fff' } as CSSProperties}>
                  <Sparkles size={36} strokeWidth={2.2} />
                </span>
              </div>

              {/* Text */}
              <h2 id={titleId} className={s.title}>
                Your Capsule Has Been <Accent>Created</Accent>
              </h2>

              <p id={textId} className={s.text}>
                Now shape it: preserve your stories, moments, and voice for your future self.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
