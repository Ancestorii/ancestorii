'use client';

import { useEffect, useId, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import { ui, Btn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
  const titleId = useId();
  const textId = useId();

  // Escape cancels (as Cancel does, not while deleting), Tab stays inside, focus returns.
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
    try {
      setIsDeleting(true);

      // 1. The row first, checking RLS let it go: only the album's creator may delete, and a
      //    blocked delete returned 0 rows silently while the file had already been removed,
      //    leaving a memory whose photo was gone for good.
      const removed = await deleteWithOwnerCheck(supabase, 'album_media', mediaId, 'album');
      if (!removed) return;

      // 2. Then the file, best effort (the row is gone; a leftover file only costs storage).
      //    Older rows hold the bucket in the path.
      if (filePath) {
        const path = filePath.includes('album-media/') ? filePath.split('album-media/')[1] : filePath;
        await supabase.storage.from('album-media').remove([path]);
      }

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
      // Above the story sheet (z 9990) and the floating phone nav
      className={cx(ui.scrim, s.fadeIn, 'scrim-blur z-[9999] flex items-center justify-center p-4')}
      onClick={() => !isDeleting && onClose()}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        className={cx(ui.sheet, s.confirm, s.popIn, s.dialog)}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={s.confirmTitle}>
          Delete this memory?
        </h2>
        <p id={textId} className={s.confirmText}>
          This action cannot be undone. This photo or video will be permanently removed.
        </p>

        <div className={s.confirmActions}>
          <Btn variant="soft" onClick={() => !isDeleting && onClose()}>
            Cancel
          </Btn>

          <Btn
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            icon={isDeleting ? <Spinner size={16} /> : null}
          >
            {isDeleting ? 'Deleting…' : 'Delete Memory'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
