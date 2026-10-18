'use client';

import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect, useId, useMemo, type CSSProperties } from 'react';
import { Lock } from 'lucide-react';
import { ui, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './CapsuleSealOverlay.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type CapsuleSealedOverlayProps = {
  open: boolean;
  capsuleTitle: string;
  unlockDate: string; // ISO string
  onClose: () => void;
  durationMs?: number;
};

// The four colours burst out of the seal once, to where they rest around it.
const DOTS = [
  { color: 'var(--c1, #2b4bff)', x: -78, y: -40, size: 14 },
  { color: 'var(--c2, #ff7a1a)', x: 80, y: -32, size: 12 },
  { color: 'var(--c3, #12d3ac)', x: -70, y: 50, size: 11 },
  { color: 'var(--c0, #ff2d87)', x: 74, y: 46, size: 16 },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

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
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs, onClose]);

  const formattedDate = useMemo(
    () =>
      new Date(unlockDate).toLocaleDateString(undefined, {
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={s.overlay}
            onClick={onClose}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ scale: 0.92, opacity: 0, y: 32 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 16 }}
              transition={{ duration: 0.55, ease: EASE }}
              className={s.card}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lock Emblem */}
              <div className={s.emblemWrap} aria-hidden="true">
                {DOTS.map((d) => (
                  <motion.span
                    key={d.color}
                    className={s.dot}
                    style={{
                      width: d.size,
                      height: d.size,
                      marginLeft: -d.size / 2,
                      marginTop: -d.size / 2,
                      background: d.color,
                    } as CSSProperties}
                    initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
                    animate={{ x: d.x, y: d.y, scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
                  />
                ))}

                <motion.div
                  initial={{ y: -40, scale: 0.7, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 17, delay: 0.1 }}
                  className={s.emblem}
                >
                  <Lock size={40} strokeWidth={2.4} />
                </motion.div>
              </div>

              {/* Headline */}
              <motion.h2
                id={titleId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
                className={s.title}
              >
                Capsule <span className={s.accent}>Locked</span>
              </motion.h2>

              {/* Capsule Title */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
                className={s.name}
              >
                “{capsuleTitle}”
              </motion.p>

              {/* Unlock Date */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
                className={s.meta}
              >
                <span className={cx(ui.chip, ui.chipDot, s.chip)}>Sealed until {formattedDate}</span>
              </motion.div>

              {/* Time Remaining */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5, ease: EASE }}
                className={s.remaining}
              >
                {remaining}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
