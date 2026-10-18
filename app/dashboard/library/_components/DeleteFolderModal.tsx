'use client';

import { useEffect, useId, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ui, Btn, IconBtn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './library.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
  const titleId = useId();
  const textId = useId();

  // Escape cancels (never mid-delete, like Cancel), Tab stays inside, focus returns to the menu.
  const panelRef = useDialog<HTMLDivElement>(open, () => {
    if (!isDeleting) onClose();
  });

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

      // 3) Sweep storage in one batch. Failure here doesn't unwind DB state, 
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
    // Above the floating phone nav (z-[200], later in the DOM), like the My Family drawers.
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop: scrim-blur (globals.css) blurs only with a mouse */}
      <div
        className={cx(ui.scrim, 'scrim-blur', s.fadeIn)}
        onClick={() => !isDeleting && onClose()}
      />

      {/* Modal */}
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        className={cx(ui.sheet, s.popIn, 'w-full max-w-[460px]')}
      >
        {/* Header */}
        <div className={ui.sheetHeader}>
          <h2
            id={titleId}
            className={cx(ui.sheetTitle, 'pt-[9px] text-[22px] tracking-[-0.035em] [overflow-wrap:anywhere]')}
          >
            Delete &ldquo;{folderName}&rdquo;?
          </h2>
          <IconBtn label="Close" onClick={() => !isDeleting && onClose()}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        <div className={ui.sheetBody}>
          <p id={textId} className={ui.body}>
            This permanently removes the folder and{' '}
            <span className="font-extrabold">
              {mediaCount} {mediaCount === 1 ? 'item' : 'items'}
            </span>{' '}
            inside it. Those items will also disappear from any{' '}
            <span className="font-extrabold">
              album, timeline, capsule, book, canvas or acrylic
            </span>{' '}
            they appear in.
          </p>
          <p className={cx(ui.noticeError, 'mt-4')}>
            <AlertTriangle size={18} strokeWidth={2.4} className="mt-px flex-none" aria-hidden="true" />
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className={cx(ui.sheetFooter, 'max-[599px]:flex-col-reverse')}>
          <Btn variant="soft" onClick={() => !isDeleting && onClose()}>
            Cancel
          </Btn>

          <Btn
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            icon={isDeleting ? <Spinner /> : <Trash2 size={17} strokeWidth={2.4} aria-hidden="true" />}
          >
            {isDeleting ? 'Deleting…' : 'Delete Permanently'}
          </Btn>
        </div>
      </div>
    </div>
  );
}