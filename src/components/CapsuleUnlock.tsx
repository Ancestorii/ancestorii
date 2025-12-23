'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Unlock } from 'lucide-react';

export default function CapsuleUnlock({
  onComplete,
}: {
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2600); // animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative bg-white rounded-3xl px-14 py-12 shadow-2xl border border-[#E6C26E]/60 text-center"
      >
        {/* Glow */}
        <div className="absolute inset-0 rounded-3xl bg-[#E6C26E]/30 blur-2xl" />

        {/* Icon */}
        <motion.div
          initial={{ rotate: -20, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-[#E6C26E] to-[#F3D99B] flex items-center justify-center shadow-lg"
        >
          <Unlock className="w-10 h-10 text-[#1F2837]" />
        </motion.div>

        {/* Text */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 text-3xl font-bold text-[#1F2837] mb-3"
        >
          Capsule Unlocked ✨
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="relative z-10 text-[#6B7280] text-sm"
        >
          A sealed memory is now ready to be opened.
        </motion.p>
      </motion.div>
    </div>
  );
}
