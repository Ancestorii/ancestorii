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
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0B0C10]/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex flex-col items-center text-center px-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lock */}
            <motion.div
              initial={{ y: -40, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.35, delay: 0.6, ease: 'easeOut' }}
                className="p-6 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] shadow-[0_0_30px_rgba(230,194,110,0.6)]"
              >
                <Lock className="w-10 h-10 text-[#1F2837]" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-3xl font-semibold text-white mb-2"
            >
              Capsule Locked
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="text-sm text-[#EADFB5] italic mb-4"
            >
              “{capsuleTitle}”
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="text-sm text-[#F3E6BF]"
            >
              Sealed until {formattedDate}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="text-xs text-[#E6C26E] mt-1"
            >
              {remaining}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
