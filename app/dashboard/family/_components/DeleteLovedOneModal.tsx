"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ui, Btn, useDialog } from "@/components/dashboard/ui/AppBits";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export default function DeleteLovedOneModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const titleId = useId();
  // One delete per tap: a quick second tap used to send a second delete, which then found
  // nothing and showed the "nothing was deleted" toast.
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };
  const textId = useId();

  // Escape cancels, Tab stays inside, focus goes back to where it was.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // scrim-blur (globals.css) blurs only with a mouse. Above the floating phone nav (z-[200]).
          className={cx(ui.scrim, "scrim-blur z-[9999] flex items-center justify-center p-4")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={textId}
            initial={{ opacity: 0, transform: "translateY(20px) scale(0.96)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{ opacity: 0, transform: "translateY(20px) scale(0.96)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cx(ui.sheet, "w-full max-w-[400px] p-6 outline-none")}
          >
            <h2
              id={titleId}
              className="text-[22px] font-extrabold leading-tight tracking-[-0.04em]"
            >
              Delete Loved One?
            </h2>

            <p id={textId} className={cx(ui.body, "mt-2")}>
              This action cannot be undone. Their memories will be permanently removed.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <Btn variant="soft" onClick={onClose}>
                Cancel
              </Btn>

              <Btn variant="danger" onClick={confirm} disabled={busy} aria-busy={busy}>
                Delete
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
