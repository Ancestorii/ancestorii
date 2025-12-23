'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

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
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0B0C10]/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex flex-col items-center text-center px-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Shooting Star / Spark */}
            <motion.div
              initial={{ y: -30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
                className="p-6 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] shadow-[0_0_35px_rgba(230,194,110,0.55)]"
              >
                <Sparkles className="w-10 h-10 text-[#1F2837]" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-3xl font-semibold text-white mb-3"
            >
              Your Capsule Has Been Created
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-sm text-[#EADFB5] italic max-w-sm"
            >
              Now shape it — preserve your stories, moments, and voice for your future self.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
