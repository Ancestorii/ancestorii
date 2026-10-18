"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { ui } from "@/components/dashboard/ui/AppBits";
import s from "./LegacyCelebration.module.css";

type LegacyCelebrationProps = {
  open: boolean;
  message: string;
  emoji?: string;
  durationMs?: number;
  onClose: () => void;
};

// The burst's dots, in the four brand colours (pink, blue, orange, aqua).
const DOT_COLOURS = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--c3)"];

export default function LegacyCelebration({
  open,
  message,
  durationMs = 4200,
  onClose,
}: LegacyCelebrationProps) {
  // The latest onClose, so a parent re-rendering mid-celebration (a new arrow function each
  // time) doesn't restart the timer and keep the overlay up longer than durationMs.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current(), durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs]);

  const dots = useMemo(
    () =>
      open
        ? Array.from({ length: 36 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 340 + 220;

            return {
              id: i,
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius * 0.75,
              size: Math.random() * 8 + 6,
              delay: Math.random() * 0.3 + 0.25,
              duration: Math.random() * 1.2 + 1.8,
              colour: DOT_COLOURS[i % DOT_COLOURS.length],
            };
          })
        : [],
    [open]
  );

  return (
    <>
      {/* Read out once by screen readers (the picture below is decorative). */}
      <p className={ui.srOnly} role="status" aria-live="polite">
        {open ? message : ""}
      </p>

      <AnimatePresence>
        {open && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            // scrim-blur (globals.css) blurs only with a mouse
            className={`${ui.scrim} scrim-blur ${s.overlay}`}
          >
            {/* A burst of round dots in the four colours, played once */}
            <div className={s.burst}>
              {dots.map((p) => (
                <span
                  key={p.id}
                  className={s.dot}
                  style={
                    {
                      "--x": `${p.x.toFixed(1)}px`,
                      "--y": `${p.y.toFixed(1)}px`,
                      "--size": `${p.size.toFixed(1)}px`,
                      "--delay": `${p.delay.toFixed(2)}s`,
                      "--dur": `${p.duration.toFixed(2)}s`,
                      background: p.colour,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            {/* The card: transform string (not y/scale) so Motion runs it on the compositor */}
            <motion.div
              initial={{ opacity: 0, transform: "translateY(18px) scale(0.96)" }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={{
                opacity: 0,
                transform: "translateY(10px) scale(0.98)",
                transition: { duration: 0.3, ease: "easeIn" },
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className={`${ui.inkCard} ${s.card}`}
            >
              <span className={ui.dotPink} />
              <span className={ui.dotBlue} />

              <p className={s.tag}>Ancestorii</p>
              <p className={s.message}>{message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
