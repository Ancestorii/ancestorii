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
  durationMs = 4200,
  onClose,
}: LegacyCelebrationProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs, onClose]);

  const flecks = useMemo(
    () =>
      open
        ? Array.from({ length: 40 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 500 + 150;

            return {
              id: i,
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius * -0.6,
              size: Math.random() * 2.5 + 1,
              delay: Math.random() * 0.3,
              duration: Math.random() * 2 + 2.5,
              opacity: Math.random() * 0.35 + 0.15,
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
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at center, rgba(26,23,20,0.85) 0%, rgba(11,12,16,0.92) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Gold flecks — slow, sparse, elegant */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {flecks.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [0, p.opacity, 0],
                  scale: [0, 1, 0.6],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay + 0.4,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: "#d4af37",
                }}
              />
            ))}
          </div>

          {/* Centre content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
            className="relative text-center px-10"
            style={{ maxWidth: 480 }}
          >
            {/* Gold line reveal */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              style={{
                width: 48,
                height: 1.5,
                background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                margin: "0 auto 28px",
                transformOrigin: "center",
              }}
            />

            {/* Main message */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 28,
                fontWeight: 400,
                fontStyle: "italic",
                color: "#ffffff",
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
                margin: "0 0 14px",
                textShadow: "0 0 40px rgba(212,175,55,0.25)",
              }}
            >
              {message}
            </motion.p>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(212,175,55,0.6)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Ancestorii
            </motion.p>

            {/* Bottom gold line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              style={{
                width: 48,
                height: 1.5,
                background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                margin: "28px auto 0",
                transformOrigin: "center",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}