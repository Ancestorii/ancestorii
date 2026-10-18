'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, type CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { Accent, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './CapsuleOverlay.module.css';

type CapsuleCreatedOverlayProps = {
  open: boolean;
  onClose: () => void;
  durationMs?: number;
};

// The four colours bursting out of the badge once: where each dot lands, its size, its delay.
const SPARKS = [
  { dot: 'var(--c1)', x: '-62px', y: '-30px', size: '13px', delay: '0.3s' },
  { dot: 'var(--c2)', x: '58px', y: '-40px', size: '10px', delay: '0.36s' },
  { dot: 'var(--c3)', x: '64px', y: '26px', size: '14px', delay: '0.32s' },
  { dot: 'var(--c0)', x: '-54px', y: '38px', size: '9px', delay: '0.4s' },
];

export default function CapsuleCreatedOverlay({
  open,
  onClose,
  durationMs = 3500,
}: CapsuleCreatedOverlayProps) {
  const titleId = useId();
  const textId = useId();

  // Escape closes it too (as a click does), and focus goes back where it was.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={s.scrim}
          onClick={onClose}
        >
          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
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
            {/* The corner dots sit in their own clipping layer, so the card never scrolls to them */}
            <span className={s.corners} aria-hidden="true">
              <span className={s.cornerPink} />
              <span className={s.cornerBlue} />
            </span>

            {/* Badge: the pink tile and the four colours */}
            <div className={s.badge} aria-hidden="true">
              {SPARKS.map((p) => (
                <span
                  key={p.dot}
                  className={s.spark}
                  style={{ '--dot': p.dot, '--x': p.x, '--y': p.y, '--size': p.size, '--delay': p.delay } as CSSProperties}
                />
              ))}
              <span className={s.tile} style={{ '--turn': '-12deg' } as CSSProperties}>
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
  );
}
