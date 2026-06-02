'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { AlertTriangle } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  folderId: string;
  folderName: string;
  mediaCount: number;
  bucket?: string;
  onDeleted: () => void;
};

export default function DeleteFolderModal({
  open,
  onClose,
  folderId,
  folderName,
  mediaCount,
  bucket = 'library-media',
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
    if (isDeleting || !folderId) return;

    try {
      setIsDeleting(true);

      // 1) Grab every file path BEFORE deletion so storage doesn't orphan.
      const { data: mediaRows, error: fetchErr } = await supabase
        .from('library_media')
        .select('file_path')
        .eq('folder_id', folderId);

      if (fetchErr) throw fetchErr;

      const filePaths = (mediaRows || [])
        .map((r: { file_path: string | null }) => r.file_path)
        .filter((p): p is string => !!p);

      // 2) Delete the folder. FK cascades through:
      //    library_media → album_media, capsule_media, timeline_event_media,
      //    memory_book_page_assets, memory_canvas_assets, acrylic_print_assets.
      //    memory_books.cover_asset_id / back_cover_asset_id get SET NULL.
      const { error: dbErr } = await supabase
        .from('library_folders')
        .delete()
        .eq('id', folderId);

      if (dbErr) throw dbErr;

      // 3) Sweep storage in one batch. Failure here doesn't unwind DB state —
      //    any orphans can be cleaned later, the user-facing state is correct.
      if (filePaths.length > 0) {
        await supabase.storage.from(bucket).remove(filePaths);
      }

      toast.success('Folder deleted.');
      onDeleted();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to delete folder.');
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
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1F2837] mb-3">
            Delete &ldquo;{folderName}&rdquo;?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            This permanently removes the folder and{' '}
            <span className="font-semibold text-[#1F2837]">
              {mediaCount} {mediaCount === 1 ? 'item' : 'items'}
            </span>{' '}
            inside it. Those items will also disappear from any{' '}
            <span className="font-medium text-[#1F2837]">
              album, timeline, capsule, book, canvas or acrylic
            </span>{' '}
            they appear in.
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