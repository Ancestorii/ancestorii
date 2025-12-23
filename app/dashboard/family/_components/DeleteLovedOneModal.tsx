"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function DeleteLovedOneModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[500]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white w-[90%] max-w-[380px] rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-[#1F2837] mb-2">
              Delete Loved One?
            </h2>

            <p className="text-[#1F2837]/70 text-sm mb-6">
              This action cannot be undone. Their memories will be permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-gray-300 text-[#1F2837] hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
