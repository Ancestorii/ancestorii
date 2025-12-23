'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ExportTimelineDrawer({
  open,
  onClose,
  timelineId,
}: {
  open: boolean;
  onClose: () => void;
  timelineId: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    window.open(`/api/timelines/${timelineId}/export`, '_blank');
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white z-50 shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-lg font-semibold text-[#8A6A1E]">
                  🕊 Preserve My Legacy
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Preview how your timeline will be preserved
                </p>
              </div>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {/* PDF Preview */}
              <div className="rounded-xl overflow-hidden border bg-gray-50 h-[420px]">
                <iframe
                  src={`/api/timelines/${timelineId}/export?preview=true`}
                  className="w-full h-full"
                />
              </div>

              <p className="text-sm text-gray-500">
                This PDF includes your timeline layout, colours, one image per
                memory, and the Ancestorii watermark.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-[42px] rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={download}
                disabled={downloading}
                className="flex-1 h-[42px] rounded-full bg-[#FFF7E3] border border-[#E6C26E]/60 text-[#8A6A1E] hover:bg-[#FFF1C7] transition disabled:opacity-60"
              >
                {downloading ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
