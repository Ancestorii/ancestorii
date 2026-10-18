'use client';

import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { LockOpen } from 'lucide-react';
import { Accent } from '@/components/dashboard/ui/AppBits';
import s from './Celebration.module.css';

export default function CapsuleUnlock({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const titleId = useId();

  // The page passes a fresh onComplete on every render; held in a ref so the timer runs
  // once from mounting, not again from each render of the list behind it.
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      completeRef.current();
    }, 2600); // animation duration

    return () => clearTimeout(timer);
  }, []);

  // It closes by itself (no buttons, nothing to focus), so it's announced, not focused.
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={s.scrim}
      >
        {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
        <motion.div
          role="alert"
          aria-labelledby={titleId}
          initial={{ opacity: 0, transform: 'translateY(30px) scale(0.92)' }}
          animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
          exit={{ opacity: 0, transform: 'translateY(20px) scale(0.95)' }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className={s.card}
        >
          <span className={s.corners} aria-hidden="true">
            <span className={s.cornerPink} />
            <span className={s.cornerBlue} />
          </span>

          {/* Icon: the aqua tile, open, and the four colours bursting out of it once */}
          <div className={s.badge} aria-hidden="true">
            <span className={s.spark} />
            <span className={s.spark} />
            <span className={s.spark} />
            <span className={s.spark} />
            <span className={s.tile} style={{ '--tile': 'var(--c3)', '--tile-fg': 'var(--ink)' } as CSSProperties}>
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
    </MotionConfig>
  );
}
