"use client";

import { motion } from "framer-motion";

export default function LovedOneEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <h2 className="text-3xl font-bold text-[#1F2837] mb-3">
        Start With Someone You Love
      </h2>
      <p className="text-[#1F2837]/70 mb-8">
        Add your first loved one and begin preserving the people who shaped your life.
      </p>

      <button
        onClick={onAdd}
        className="px-8 py-3 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold shadow-md hover:shadow-lg transition-transform hover:scale-[1.03]"
      >
        + Add Your First Loved One
      </button>
    </motion.div>
  );
}

