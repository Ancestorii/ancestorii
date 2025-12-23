"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical } from "lucide-react";

export function LovedOneMenu({
  onEdit,
  onDeleteClick,  // ← renamed: triggers modal
}: {
  onEdit: () => void;
  onDeleteClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1 rounded-full hover:bg-black/10 transition"
      >
        <MoreVertical size={18} className="text-[#1F2837]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-40 bg-white
                       rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                       overflow-hidden z-50 border border-gray-200"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="w-full text-left px-4 py-2.5
                         text-[#1F2837] font-medium
                         hover:bg-[#E6C26E]/20 transition"
            >
              Edit Loved One
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDeleteClick(); // opens modal
              }}
              className="w-full text-left px-4 py-2.5
                         text-red-600 font-medium
                         hover:bg-red-100 hover:text-red-700 transition"
            >
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
