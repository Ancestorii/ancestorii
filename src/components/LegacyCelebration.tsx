"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";

type LegacyCelebrationProps = {
  open: boolean;
  message: string;
  emoji?: string;
  durationMs?: number;
  onClose: () => void;
};

export default function LegacyCelebration({
  open,
  message,
  emoji,
  durationMs = 4200, // ✅ longer so you can actually read
  onClose,
}: LegacyCelebrationProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs, onClose]);

  // ✅ FULL SCREEN 3D SPLASH GOLD DUST
  const particles = useMemo(
    () =>
      open
        ? Array.from({ length: 260 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 900 + 200;

            return {
              id: i,
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius * -1,
              size: Math.random() * 4 + 2,
              blur: Math.random() * 1.2,
              delay: Math.random() * 0.12,
              duration: Math.random() * 1.4 + 1.6,
              opacity: Math.random() * 0.6 + 0.3,
              scale: Math.random() * 1.8 + 0.6, // ✅ fake 3D depth
            };
          })
        : [],
    [open]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
         className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0B0C10]/60 overflow-hidden"

        >
          {/* ✅ 3D SPLASH GOLD DUST */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: p.opacity, scale: 0.2 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: p.scale,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background:
                    "radial-gradient(circle, rgba(255,241,181,1) 0%, rgba(230,194,110,0.9) 55%, rgba(212,175,55,0.3) 100%)",
                  filter: "none",
                }}
              />
            ))}
          </div>

          {/* ✅ SLOWER, READABLE FLOATING MESSAGE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.9, ease: "easeOut" }} // ✅ slower reveal
            className="relative text-center px-10"
          >
            {emoji && (
              <div className="text-7xl mb-4 animate-popSlow">{emoji}</div>
            )}

            <p className="text-4xl font-semibold text-white drop-shadow-[0_0_18px_rgba(230,194,110,0.95)] animate-riseSlow delay-300">
              {message}
            </p>

            <p className="text-base text-[#EADFB5] mt-3 italic animate-riseSlow delay-600">
              This moment is now part of your legacy.
            </p>
          </motion.div>

          <style jsx global>{`
            @keyframes riseSlow {
              from {
                opacity: 0;
                transform: translateY(22px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes popSlow {
              0% {
                transform: scale(0.4);
                opacity: 0;
              }
              80% {
                transform: scale(1.15);
                opacity: 1;
              }
              100% {
                transform: scale(1);
              }
            }

            .animate-riseSlow {
              animation: riseSlow 0.9s ease-out both;
            }

            .animate-popSlow {
              animation: popSlow 0.9s ease-out both;
            }

            .delay-300 {
              animation-delay: 0.3s;
            }

            .delay-600 {
              animation-delay: 0.6s;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
