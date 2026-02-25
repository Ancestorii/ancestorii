'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { Trash2 } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  mediaId: string;
  filePath: string;
  onDeleted: () => void; // parent removes item from UI
};

export default function DeleteLibraryMediaModal({
  open,
  onClose,
  mediaId,
  filePath,
  onDeleted,
}: Props) {
  const supabase = getBrowserClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock body scroll while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // 1️⃣ Delete from DB (cascade handles albums, capsules, timelines)
      const { error: dbErr } = await supabase
        .from('library_media')
        .delete()
        .eq('id', mediaId);

      if (dbErr) throw dbErr;

      // 2️⃣ Delete physical file from storage
      await supabase.storage
        .from('library-media')
        .remove([filePath]);

      toast.success('Media permanently deleted.');

      // Remove from UI instantly
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete media.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isDeleting && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1F2837] mb-3">
            Delete this memory?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            This will permanently remove this file from your entire library,
            including all albums, timelines and capsules.
            <br />
            <span className="font-medium text-red-600">
              This action cannot be undone.
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => !isDeleting && onClose()}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2 rounded-full text-sm font-semibold
                       bg-red-600 text-white shadow
                       hover:bg-red-700 hover:shadow-lg
                       disabled:opacity-60 transition"
          >
            {isDeleting ? 'Deleting…' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}