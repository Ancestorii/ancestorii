"use client";

import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ui, IconBtn, jsMotion } from "@/components/dashboard/ui/AppBits";

// The "more" button on a card (books, canvases, acrylics, capsules, timelines, albums, the
// Library): a round white button that reads over a photo or a white card, opening the kit's
// menu with the edit and delete rows.
export function ContextMenuDots({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // A press anywhere outside closes it at once (it waited 0.2s before, which read as lag, and
  // two menus could be open together). pointerdown covers mouse, pen and touch.
  useEffect(() => {
    if (!open) return;

    const handler = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, [open]);

  // Focus goes back to the dots button as the menu closes (the rows unmount), so a drawer or
  // dialog a row opens can hand focus back to it when it closes.
  const focusButton = () => menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

  return (
    <div
      className="relative"
      ref={menuRef}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
          focusButton();
        }
      }}
    >
      <IconBtn
        label="More options"
        size="sm"
        onPhoto
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical size={18} strokeWidth={2.4} aria-hidden="true" />
      </IconBtn>

      <AnimatePresence>
        {open && (
          // transform string (not y) so Motion runs the drop-in on the compositor
          <motion.div
            {...jsMotion}
            id={menuId}
            initial={{ opacity: 0, transform: "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: "translateY(6px)" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`${ui.menu} absolute right-0 top-full z-50 mt-2 w-max min-w-[176px]`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                focusButton();
                onEdit();
              }}
              className={ui.menuItem}
            >
              <Pencil size={17} strokeWidth={2.2} aria-hidden="true" />
              {editLabel}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                focusButton();
                onDelete();
              }}
              className={`${ui.menuItem} ${ui.menuItemDanger}`}
            >
              <Trash2 size={17} strokeWidth={2.2} aria-hidden="true" />
              {deleteLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
