"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";
import {
  Book,
  Calendar,
  Frame,
  Gem,
  HandHeart,
  Image as ImageIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ui } from "@/components/dashboard/ui/AppBits";
import s from "./Celebration.module.css";

type LegacyCelebrationProps = {
  open: boolean;
  message: string;
  emoji?: string;
  durationMs?: number;
  onClose: () => void;
};

type Moment = { Icon: LucideIcon; tile: string; fg: string };

// The tile for the moment each page names with its emoji: that feature's own icon in its
// colour (Timelines and Loved Ones aqua; Albums and the heirlooms orange), ink on both.
const MOMENTS: Record<string, Moment> = {
  "\u{2728}": { Icon: Calendar, tile: "var(--c3)", fg: "var(--ink)" }, // a new timeline
  "\u{1F389}": { Icon: ImageIcon, tile: "var(--c2)", fg: "var(--ink)" }, // a new album
  "\u{1F4D6}": { Icon: Book, tile: "var(--c2)", fg: "var(--ink)" }, // a new memory book
  "\u{1F5BC}": { Icon: Frame, tile: "var(--c2)", fg: "var(--ink)" }, // a new memory canvas
  "\u{1F48E}": { Icon: Gem, tile: "var(--c2)", fg: "var(--ink)" }, // a new acrylic print
  "\u{1F54A}": { Icon: HandHeart, tile: "var(--c3)", fg: "var(--ink)" }, // a new loved one
};

// Anything else: the pink tile with sparkles.
const DEFAULT_MOMENT: Moment = { Icon: Sparkles, tile: "var(--c0)", fg: "#fff" };

export default function LegacyCelebration({
  open,
  message,
  emoji,
  durationMs = 4200,
  onClose,
}: LegacyCelebrationProps) {
  // The latest onClose, so a parent re-rendering mid-celebration (a new arrow function each
  // time) doesn't restart the timer and keep the overlay up longer than durationMs.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // It closes on its own after durationMs; a tap on it or Escape closes it sooner (it used to
  // hold the whole screen for four seconds with no way out).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current(), durationMs);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, durationMs]);

  // The emoji's variation selector (U+FE0F) is dropped, so an emoji finds its tile with or
  // without it (the canvas and loved one pages pass it).
  const moment = MOMENTS[(emoji ?? "").replace(/\uFE0F/g, "")] ?? DEFAULT_MOMENT;
  const { Icon } = moment;

  return (
    <>
      {/* Read out once by screen readers (the picture below is decorative). */}
      <p className={ui.srOnly} role="status" aria-live="polite">
        {open ? message : ""}
      </p>

      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={s.scrim}
              onClick={() => closeRef.current()}
            >
              {/* The card: transform string (not y/scale) so Motion runs it on the compositor */}
              <motion.div
                initial={{ opacity: 0, transform: "translateY(30px) scale(0.92)" }}
                animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                exit={{ opacity: 0, transform: "translateY(20px) scale(0.95)" }}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                className={s.card}
              >
                <span className={s.corners}>
                  <span className={s.cornerPink} />
                  <span className={s.cornerBlue} />
                </span>

                {/* The moment's tile, and the four colours bursting out of it once */}
                <div className={s.badge}>
                  <span className={s.spark} />
                  <span className={s.spark} />
                  <span className={s.spark} />
                  <span className={s.spark} />
                  <span
                    className={s.tile}
                    style={{ "--tile": moment.tile, "--tile-fg": moment.fg } as CSSProperties}
                  >
                    <Icon size={36} strokeWidth={2.2} />
                  </span>
                </div>

                <p className={s.tag} style={{ "--dot": moment.tile } as CSSProperties}>
                  Ancestorii
                </p>
                <p className={s.title}>{message}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}
