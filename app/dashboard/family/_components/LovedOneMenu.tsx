"use client";

import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ui, IconBtn } from "@/components/dashboard/ui/AppBits";
import s from "./lovedOnes.module.css";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export function LovedOneMenu({
  onEdit,
  onDeleteClick,  // ← renamed: triggers modal
  label = "Loved one options",
}: {
  onEdit: () => void;
  onDeleteClick: () => void;
  /** The menu button's accessible name (e.g. "Options for <name>"). */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const menuId = useId();

  // CLICK OUTSIDE closes after 0.2s
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        closeTimeout.current = setTimeout(() => {
          setOpen(false);
        }, 200);
      }
    };

    window.addEventListener("mousedown", handler);

    return () => {
      window.removeEventListener("mousedown", handler);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [open]);

  // Focus goes back to the menu button as the menu closes (its rows unmount), so the dialog a
  // row opens hands focus back to it when it closes.
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
        label={label}
        ghost
        size="sm"
        className={s.menuBtn}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical size={18} strokeWidth={2.4} aria-hidden="true" />
      </IconBtn>

      {/* Opens upwards, over the card's own portrait, so it never ends up under the phone nav.
          Closed, it is unmounted: nothing in it can take focus. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, transform: "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: "translateY(6px)" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cx(ui.menu, "absolute bottom-[calc(100%+8px)] right-0 z-50")}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                focusButton();
                onEdit();
              }}
              className={ui.menuItem}
            >
              <Pencil size={17} strokeWidth={2.2} aria-hidden="true" />
              Edit Loved One
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                focusButton();
                onDeleteClick();
              }}
              className={cx(ui.menuItem, ui.menuItemDanger)}
            >
              <Trash2 size={17} strokeWidth={2.2} aria-hidden="true" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
