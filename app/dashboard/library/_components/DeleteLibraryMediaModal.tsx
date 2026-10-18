'use client';

import { useEffect, useId, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import { LIBRARY_BUCKET, forgetLibraryPaths } from '@/lib/libraryData';
import { ui, Btn, IconBtn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './library.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
  const titleId = useId();
  const textId = useId();

  // Escape cancels (never mid-delete, like Cancel), Tab stays inside, focus returns to the tile.
  const panelRef = useDialog<HTMLDivElement>(open, () => {
    if (!isDeleting) onClose();
  });

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

      // 1) Delete the row (the cascade handles albums, capsules, timelines, books, canvases and
      //    acrylics). Row security lets only the uploader delete it, and says so with zero rows,
      //    not an error: checked here, so nobody else sees "deleted" while the item stays.
      const deleted = await deleteWithOwnerCheck(supabase, 'library_media', mediaId, 'memory');
      if (!deleted) return;

      // 2) Then the file itself, now that nothing points at it.
      await supabase.storage
        .from(LIBRARY_BUCKET)
        .remove([filePath]);
      forgetLibraryPaths(LIBRARY_BUCKET, [filePath]);

      // The sidebar's memory count follows.
      window.dispatchEvent(new Event('dashboard-data-changed'));

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
          <h2 id={titleId} className={cx(ui.sheetTitle, 'pt-[9px] text-[22px] tracking-[-0.035em]')}>
            Delete this memory?
          </h2>
          <IconBtn label="Close" onClick={() => !isDeleting && onClose()}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        <div className={ui.sheetBody}>
          <p id={textId} className={ui.body}>
            This will permanently remove this file from your entire library, and from any{' '}
            <span className="font-extrabold">album, timeline, capsule, book, canvas or acrylic</span>{' '}
            it appears in.
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