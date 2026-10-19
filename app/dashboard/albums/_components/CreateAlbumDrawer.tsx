'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';
import { X, ImagePlus, Check, Plus } from 'lucide-react';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, Spinner, useDialog, jsMotion } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function CreateAlbumDrawer({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode = 'create',
  album,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (album: any) => void;
  onUpdated?: (album: any) => void;
  mode?: 'create' | 'edit';
  album?: any;
}) {
  const supabase = getBrowserClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  const titleId = useId();
  const nameId = useId();
  const descriptionId = useId();

  // Escape closes it (as the close button does), Tab stays inside, focus returns to the button.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  // The fields follow the album as the drawer opens. Set during render (not in an effect after
  // it), so the first frame never shows the previous album's words or cover.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? `${mode}:${album?.id ?? 'new'}` : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      if (mode === 'edit' && album) {
        setTitle(album.title || '');
        setDescription(album.description || '');
        setPreviewUrl(album._signed_cover || album.cover_image || null);
        setCoverFile(null);
      } else {
        setTitle('');
        setDescription('');
        setCoverFile(null);
        setPreviewUrl(null);
      }
    }
  }

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [coverFile]);

  const handleFileSelect = (file: File) => {
    if (file) setCoverFile(file);
  };

  // Drag & drop logic. The zone only exists while the drawer is open, so attach each time it
  // opens (run once at mount, it found no zone and drag and drop never worked).
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: DragEvent) => {
      e.preventDefault();
      area.classList.add(s.dropActive);
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      area.classList.remove(s.dropActive);
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      area.classList.remove(s.dropActive);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileSelect(file);
    };

    area.addEventListener('dragover', over);
    area.addEventListener('dragleave', leave);
    area.addEventListener('drop', drop);
    return () => {
      area.removeEventListener('dragover', over);
      area.removeEventListener('dragleave', leave);
      area.removeEventListener('drop', drop);
    };
  }, [open]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current || !title.trim()) return;
    isSubmittingRef.current = true;
    setUploading(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user) throw new Error('Not signed in');

      let uploadedPath: string | null = null;
      if (coverFile) {
        const safeFile = await ensureDisplayableImage(coverFile);
        const path = `${user.id}/${Date.now()}_${safeFile.name}`.replace(/\s+/g, '_');
        const { error: upErr } = await supabase.storage
          .from('album-media')
          .upload(path, safeFile, { upsert: true });
        if (upErr) throw upErr;
        uploadedPath = path;
      }

      if (mode === 'edit' && album) {
        // Without a new photo the cover column is left alone. It used to be rewritten with the
        // list's signed URL (which expires after a week), so the cover later went blank.
        const { data, error } = await supabase
          .from('albums')
          .update({ title, description, ...(uploadedPath ? { cover_image: uploadedPath } : {}) })
          .eq('id', album.id)
          .select()
          .single();
        if (error) throw error;
        onUpdated?.(data);
        toast.success('Album updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('albums')
          .insert({ title, description, cover_image: uploadedPath, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        onCreated?.(data);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setUploading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...jsMotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          // scrim-blur (globals.css) blurs only with a mouse; above the floating phone nav (z-[200])
          className={cx(ui.scrim, 'scrim-blur z-[9999] flex items-center justify-center p-4')}
        >
          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
            {...jsMotion}
            initial={{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={cx(ui.sheet, s.dialog, 'w-full max-w-[520px] max-h-[88vh]')}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={ui.sheetHeader}>
              <div className="min-w-0">
                <h2 id={titleId} className={ui.sheetTitle}>
                  {mode === 'edit' ? 'Edit Album' : 'Create New Album'}
                </h2>
                <p className={ui.sheetSub}>
                  Collect and preserve your favourite memories in one place.
                </p>
              </div>
              <IconBtn
                label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            <div className={ui.sheetBody}>
              {/* Inputs */}
              <div className={ui.field}>
                <label htmlFor={nameId} className={ui.label}>
                  Title
                </label>
                <input
                  id={nameId}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={ui.input}
                  placeholder="Family Holiday"
                />
              </div>

              <div className={ui.field}>
                <label htmlFor={descriptionId} className={ui.label}>
                  Description
                </label>
                <textarea
                  id={descriptionId}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={cx(ui.textarea, 'min-h-[104px]')}
                  placeholder="Write a short description..."
                />
              </div>

              {/* Cover Image */}
              <div className={ui.field}>
                <label htmlFor="fileInput" className={cx(ui.label, s.fieldLabel)}>
                  <ImagePlus size={17} strokeWidth={2.2} aria-hidden="true" /> Cover Image (optional)
                </label>
                <div
                  ref={dropRef}
                  onClick={() => document.getElementById('fileInput')?.click()}
                  className={cx(s.drop, previewUrl ? s.coverZone : 'min-h-[168px]')}
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" />
                  ) : (
                    <p className={s.dropTitle}>Drag & drop or click to upload</p>
                  )}
                  {/* Visually hidden, not display:none, so the keyboard can reach it */}
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    className={ui.srOnly}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className={ui.sheetFooter}>
              <Btn variant="soft" onClick={onClose} disabled={uploading}>
                Cancel
              </Btn>

              <Btn
                onClick={handleSubmit}
                disabled={!title.trim() || uploading}
                tile={
                  uploading ? (
                    <Spinner size={16} />
                  ) : mode === 'edit' ? (
                    <Check size={18} strokeWidth={2.6} />
                  ) : (
                    <Plus size={18} strokeWidth={2.6} />
                  )
                }
              >
                {uploading
                  ? 'Saving…'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : 'Create Album'}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
