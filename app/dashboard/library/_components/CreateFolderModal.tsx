'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Folder } from 'lucide-react';
import { ui, Btn, IconBtn, IconTile, Spinner, toneByKey, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './library.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export type LibraryFolderRow = {
  id: string;
  family_id: string | null;
  user_id: string;
  name: string;
  description: string | null;
  folder_date: string | null;
  created_at: string;
  updated_at: string;
};

type EditableFolder = {
  id: string;
  name: string;
  description: string | null;
  folder_date: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  folder?: EditableFolder | null;
  onCreated?: (folder: LibraryFolderRow) => void;
  onUpdated?: (folder: LibraryFolderRow) => void;
};

export default function CreateFolderModal({
  open,
  onClose,
  mode = 'create',
  folder = null,
  onCreated,
  onUpdated,
}: Props) {
  const supabase = getBrowserClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [folderDate, setFolderDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();
  const subId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const dateId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  // Escape closes it (never mid-save, like the buttons), Tab stays inside, and focus returns
  // to the button that opened it.
  const panelRef = useDialog<HTMLDivElement>(open, () => {
    if (!submitting) onClose();
  });

  // Then the name field takes focus, as autoFocus did (after useDialog has noted the opener,
  // so focus can go back to it).
  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // The fields follow the folder as the modal opens. Set during render (not in an effect after
  // it), so the first frame never shows empty fields, or the previous folder's words, in edit.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? `${mode}:${folder?.id ?? 'new'}` : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      const editing = mode === 'edit' && folder ? folder : null;
      setName(editing?.name ?? '');
      setDescription(editing?.description ?? '');
      setFolderDate(editing?.folder_date ?? '');
      setSubmitting(false);
    }
  }

  const handleSubmit = async () => {
    if (submitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Folder name is required.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'edit' && folder) {
        const { data, error } = await supabase
          .from('library_folders')
          .update({
            name: trimmedName,
            description: description.trim() || null,
            folder_date: folderDate || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', folder.id)
          .select('*')
          .maybeSingle();

        if (error) throw error;
        // Row security returns no row, not an error, when the update is not allowed.
        if (!data) {
          toast.error('This folder could not be updated.');
          return;
        }
        toast.success('Folder updated.');
        onUpdated?.(data as LibraryFolderRow);
      } else {
        // The local session, not a round trip to the auth server.
        const user = (await supabase.auth.getSession()).data.session?.user;
        if (!user) {
          toast.error('Not authenticated.');
          setSubmitting(false);
          return;
        }

        const { data, error } = await supabase
          .from('library_folders')
          .insert({
            user_id: user.id,
            name: trimmedName,
            description: description.trim() || null,
            folder_date: folderDate || null,
          })
          .select('*')
          .single();

        if (error) throw error;
        toast.success('Folder created.');
        onCreated?.(data as LibraryFolderRow);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message ||
          (mode === 'edit' ? 'Failed to update folder.' : 'Failed to create folder.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isEdit = mode === 'edit';

  return (
    // Above the floating phone nav (z-[200], later in the DOM), like the My Family drawers.
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop: scrim-blur (globals.css) blurs only with a mouse */}
      <div
        className={cx(ui.scrim, 'scrim-blur', s.fadeIn)}
        onClick={() => !submitting && onClose()}
      />

      {/* Modal */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subId}
        className={cx(ui.sheet, s.popIn, 'w-full max-w-[480px]')}
      >
        {/* Header */}
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <IconTile Icon={Folder} tone={toneByKey('orange')} size="sm" className="mb-4" />
            <h2 id={titleId} className={ui.sheetTitle}>
              {isEdit ? 'Edit folder' : 'Create a folder'}
            </h2>
            <p id={subId} className={ui.sheetSub}>
              {isEdit
                ? "Update this folder's name, description, or date."
                : 'Group photos and videos together, like “Holiday 2026” or “Family Portraits”.'}
            </p>
          </div>

          {/* Close X */}
          <IconBtn label="Close" onClick={() => !submitting && onClose()}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        {/* Form */}
        <div className={ui.sheetBody}>
          <div className={ui.field}>
            <label htmlFor={nameId} className={ui.label}>
              Folder Name
            </label>
            <input
              ref={nameRef}
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Holiday 2026"
              disabled={submitting}
              className={ui.input}
            />
          </div>

          <div className={ui.field}>
            <label htmlFor={descriptionId} className={ui.label}>
              Description <span className="font-medium">(optional)</span>
            </label>
            <textarea
              id={descriptionId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              placeholder="A short note about what's in this folder."
              disabled={submitting}
              rows={2}
              className={cx(ui.textarea, 'min-h-[96px] resize-none')}
            />
          </div>

          <div className={ui.field}>
            <label htmlFor={dateId} className={ui.label}>
              Folder Date <span className="font-medium">(optional)</span>
            </label>
            <input
              id={dateId}
              type="date"
              value={folderDate}
              onChange={(e) => setFolderDate(e.target.value)}
              disabled={submitting}
              className={cx(ui.input, '[&::-webkit-datetime-edit]:uppercase')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className={cx(ui.sheetFooter, 'max-[599px]:flex-col-reverse')}>
          <Btn variant="soft" onClick={() => !submitting && onClose()}>
            Cancel
          </Btn>

          <Btn
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            icon={submitting ? <Spinner /> : undefined}
          >
            {submitting
              ? (isEdit ? 'Saving…' : 'Creating…')
              : (isEdit ? 'Save Changes' : 'Create Folder')}
          </Btn>
        </div>
      </div>
    </div>
  );
}