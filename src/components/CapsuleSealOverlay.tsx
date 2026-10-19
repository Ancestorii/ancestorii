'use client';

import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect, useId, useMemo, useRef, type CSSProperties } from 'react';
import { Lock } from 'lucide-react';
import { ui, Accent, useDialog, jsMotion } from '@/components/dashboard/ui/AppBits';
import s from './Celebration.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type CapsuleSealedOverlayProps = {
  open: boolean;
  capsuleTitle: string;
  unlockDate: string; // ISO string
  onClose: () => void;
  durationMs?: number;
};

function getTimeRemaining(unlockDate: string) {
  const now = new Date();
  const target = new Date(unlockDate);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Ready to open';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  if (years > 0) return `Opens in ${years} year${years > 1 ? 's' : ''}`;
  if (months > 0) return `Opens in ${months} month${months > 1 ? 's' : ''}`;
  return `Opens in ${days} day${days > 1 ? 's' : ''}`;
}

export default function CapsuleSealedOverlay({
  open,
  capsuleTitle,
  unlockDate,
  onClose,
  durationMs = 4000,
}: CapsuleSealedOverlayProps) {
  // The page passes a fresh onClose on every render; held in a ref so the timer runs once
  // from opening, not again from each render of the page behind it.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current(), durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs]);

  // The British way, as on the capsule's card and page.
  const formattedDate = useMemo(
    () =>
      new Date(unlockDate).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [unlockDate]
  );

  const remaining = useMemo(() => getTimeRemaining(unlockDate), [unlockDate]);

  // Escape closes it (as a click does); focus moves onto the card while it shows.
  const titleId = useId();
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

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

              {/* Lock: the pink Capsules tile, and the four colours bursting out of it once */}
              <div className={s.badge} aria-hidden="true">
                <span className={s.spark} />
                <span className={s.spark} />
                <span className={s.spark} />
                <span className={s.spark} />
                <span className={s.tile} style={{ '--tile': 'var(--c0)', '--tile-fg': '#fff' } as CSSProperties}>
                  <Lock size={36} strokeWidth={2.2} />
                </span>
              </div>

              {/* Headline */}
              <h2 id={titleId} className={s.title}>
                Capsule <Accent>Locked</Accent>
              </h2>

              {/* Capsule Title */}
              <p className={s.name}>“{capsuleTitle}”</p>

              {/* Unlock Date */}
              <div className={s.meta}>
                <span className={cx(ui.chip, ui.chipDot, s.chip)}>Sealed until {formattedDate}</span>
              </div>

              {/* Time Remaining */}
              <p className={s.note}>{remaining}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
