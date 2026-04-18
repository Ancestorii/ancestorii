'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { LayoutType } from '@/types/memory-book';

export default function LayoutSelectorModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (layout: LayoutType) => void;
}) {
  const layouts: {
    id: LayoutType;
    title: string;
    description: string;
  }[] = [
    {
      id: 'portrait_layout',
      title: 'Portrait',
      description: 'One large image with text',
    },
    {
      id: 'duo_layout',
      title: 'Duo',
      description: 'Two stacked memories',
    },
    {
      id: 'grid_layout',
      title: 'Grid',
      description: 'Four images, clean layout',
    },
    {
      id: 'feature_layout',
      title: 'Feature',
      description: 'Hero image + two supporting',
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-lg"
          >
            <h2 className="text-xl font-semibold text-[#1F2837] mb-4 text-center">
              Choose a layout
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => onSelect(layout.id)}
                  className="p-4 rounded-xl border border-gray-200 hover:border-[#E6C26E] hover:bg-[#faf7ed] transition text-left"
                >
                  <h3 className="font-semibold text-[#1F2837]">
                    {layout.title}
                  </h3>
                  <p className="text-xs text-[#5B6473] mt-1">
                    {layout.description}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}