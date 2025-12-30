'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { Lock } from 'lucide-react';

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0B0C10]/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1.05, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative flex flex-col items-center text-center px-12 py-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lock Emblem */}
            <motion.div
              initial={{ y: -50, scale: 0.75, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.45, delay: 0.7, ease: 'easeOut' }}
                className="p-8 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] shadow-[0_0_45px_rgba(230,194,110,0.75)]"
              >
                <Lock className="w-14 h-14 text-[#1F2837]" />
              </motion.div>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-4xl font-semibold tracking-tight text-white mb-3"
            >
              Capsule Locked
            </motion.h2>

            {/* Capsule Title */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="text-base text-[#EADFB5] italic mb-5"
            >
              “{capsuleTitle}”
            </motion.p>

            {/* Unlock Date */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="text-sm text-[#F3E6BF]"
            >
              Sealed until {formattedDate}
            </motion.p>

            {/* Time Remaining */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="text-xs tracking-wide uppercase text-[#E6C26E] mt-2"
            >
              {remaining}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
