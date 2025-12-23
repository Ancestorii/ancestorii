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
  onDeleted: () => void;
};

export default function DeleteMemoryModal({
  open,
  onClose,
  mediaId,
  filePath,
  onDeleted,
}: Props) {
  const supabase = getBrowserClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // 1. Delete from storage
      const { error: storageErr } = await supabase.storage
        .from('album-media')
        .remove([filePath]);

      if (storageErr) throw storageErr;

      // 2. Delete from database
      const { error: dbErr } = await supabase
        .from('album_media')
        .delete()
        .eq('id', mediaId);

      if (dbErr) throw dbErr;

      toast.success('Memory deleted.');
      onDeleted();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete memory.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center transition-all duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => !isDeleting && onClose()}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-8
          transition-all duration-300 transform ${
            open
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2'
          }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1F2837] mb-2">
            Delete this memory?
          </h2>
          <p className="text-sm text-gray-500">
            This action cannot be undone. This photo or video will be permanently removed.
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
                       bg-red-600 text-white shadow hover:shadow-lg
                       hover:bg-red-700 disabled:opacity-60 transition"
          >
            {isDeleting ? 'Deleting…' : 'Delete Memory'}
          </button>
        </div>
      </div>
    </div>
  );
}
