'use client';

import { useEffect, useId, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { LockOpen } from 'lucide-react';
import { Accent } from '@/components/dashboard/ui/AppBits';
import s from './CapsuleOverlay.module.css';

// The four colours bursting out of the badge once: where each dot lands, its size, its delay.
const SPARKS = [
  { dot: 'var(--c0)', x: '-62px', y: '-30px', size: '13px', delay: '0.35s' },
  { dot: 'var(--c1)', x: '58px', y: '-40px', size: '10px', delay: '0.41s' },
  { dot: 'var(--c2)', x: '64px', y: '26px', size: '14px', delay: '0.37s' },
  { dot: 'var(--c3)', x: '-54px', y: '38px', size: '9px', delay: '0.45s' },
];

export default function CapsuleUnlock({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2600); // animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  // It closes by itself (no buttons, nothing to focus), so it's announced, not focused.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={s.scrim}
    >
      {/* transform string (not scale) so Motion runs the pop-in on the compositor */}
      <motion.div
        role="alert"
        aria-labelledby={titleId}
        initial={{ opacity: 0, transform: 'scale(0.7)' }}
        animate={{ opacity: 1, transform: 'scale(1)' }}
        exit={{ opacity: 0, transform: 'scale(0.96)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={s.card}
      >
        {/* The corner dots sit in their own clipping layer, so the card never scrolls to them */}
        <span className={s.corners} aria-hidden="true">
          <span className={s.cornerPink} />
          <span className={s.cornerBlue} />
        </span>

        {/* Icon: the aqua tile turns open, the four colours burst out */}
        <div className={s.badge} aria-hidden="true">
          {SPARKS.map((p) => (
            <span
              key={p.dot}
              className={s.spark}
              style={{ '--dot': p.dot, '--x': p.x, '--y': p.y, '--size': p.size, '--delay': p.delay } as CSSProperties}
            />
          ))}
          <span
            className={s.tile}
            style={{ '--tile': 'var(--c3)', '--tile-fg': 'var(--ink)', '--turn': '-20deg' } as CSSProperties}
          >
            <LockOpen size={36} strokeWidth={2.2} />
          </span>
        </div>

        {/* Text */}
        <h2 id={titleId} className={s.title}>
          Capsule <Accent>Unlocked</Accent>
        </h2>

        <p className={s.text}>
          A sealed memory is now ready to be opened.
        </p>
      </motion.div>
    </motion.div>
  );
}
