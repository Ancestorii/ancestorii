'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, ImagePlus, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, IconTile, Spinner, toneByKey, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './timelineList.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');


type Timeline = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  cover_path: string | null;
  owner_id?: string;
};

export default function CreateTimelineDrawer({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode = 'create',
  timeline,
  limitReached = false,
  limitMessage,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (tl: Timeline) => void;
  onUpdated?: (tl: Timeline) => void;
  mode?: 'create' | 'edit';
  timeline?: Timeline | null;
  /** The page's plan check (it runs usePlanLimits once; the drawer used to run it a second time). */
  limitReached?: boolean;
  limitMessage?: string;
}) {
  const supabase = getBrowserClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  const titleId = useId();
  const subId = useId();
  const nameId = useId();
  const descriptionId = useId();

  // Escape closes it (as the close button does), Tab stays inside, focus returns to the button.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  useEffect(() => setMounted(true), []);

useEffect(() => {
  if (!open) return;

  if (mode === 'edit' && timeline) {
    setTitle(timeline.title || '');
    setDescription(timeline.description || '');
    setCoverFile(null);

    if (timeline.cover_path) {
      supabase.storage
        .from('timeline-media')
        .createSignedUrl(timeline.cover_path, 3600)
        .then(({ data }) => {
          setPreviewUrl(data?.signedUrl ?? null);
        });
    } else {
      setPreviewUrl(null);
    }
  } else {
    setTitle('');
    setDescription('');
    setCoverFile(null);
    setPreviewUrl(null);
  }
}, [open, mode, timeline]);


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

  // Drag & drop. The zone only exists while the drawer is open, so attach each time it opens
  // (run once at mount, it found no zone and drag and drop never worked).
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: DragEvent) => {
      e.preventDefault();
      area.classList.add(ui.dropzoneActive);
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      area.classList.remove(ui.dropzoneActive);
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      area.classList.remove(ui.dropzoneActive);
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
  }, [open, mounted]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current || !title.trim()) return;
    isSubmittingRef.current = true;
    setUploading(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user) throw new Error('Not signed in');

     if (mode === 'create' && limitReached) {
  toast.error(limitMessage || 'You’ve reached your current plan limit for timelines.');
  setUploading(false);
  isSubmittingRef.current = false;
  return;
}



      let uploadedPath: string | null = null;
      if (coverFile) {
        const safeFile = await ensureDisplayableImage(coverFile);
        const sanitized = safeFile.name.replace(/\s+/g, '_');
        const path = `${user.id}/timeline-covers/${crypto.randomUUID()}_${sanitized}`;
        const { error: upErr } = await supabase
          .storage
          .from('timeline-media')
          .upload(path, safeFile, { upsert: true });
        if (upErr) throw upErr;
        uploadedPath = path;
      }

      const coverPath = uploadedPath ?? timeline?.cover_path ?? null;


      if (mode === 'edit' && timeline) {
        const { data, error } = await supabase
          .from('timelines')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            cover_path: coverPath,
          })
          .eq('id', timeline.id)
          .select()
          .single();
        if (error) throw error;
        onUpdated?.(data);
        toast.success('Timeline updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('timelines')
          .insert({
            owner_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
            cover_path: coverPath,
          })
          .select()
          .single();
        if (error) throw error;
        onCreated?.(data);
        toast.success('Timeline created successfully!');
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

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          // scrim-blur (globals.css) blurs only with a mouse; above the floating phone nav (z-[200])
          className={cx(ui.scrim, 'scrim-blur z-[9999] flex items-center justify-center p-4')}
        >
          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={subId}
            initial={{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={cx(ui.sheet, 'w-full max-w-[520px] max-h-[88vh]')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={ui.sheetHeader}>
              <div className="min-w-0">
                <h2 id={titleId} className={ui.sheetTitle}>
                  Start Your Legacy
                </h2>
                <p id={subId} className={ui.sheetSub}>
                  Give your timeline a name and a story. The moments you save here will live forever.
                </p>
              </div>

              {/* Close */}
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
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'My Life Journey')}
                  className={ui.input}
                  placeholder="My Life Journey"
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
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'Write a short description...')}
                  rows={3}
                  className={cx(ui.textarea, 'min-h-[104px]')}
                  placeholder="Write a short description..."
                />
              </div>

              {/* Cover image */}
              <div className={ui.field}>
                <label htmlFor="timelineCoverInput" className={ui.label}>
                  Cover image (optional)
                </label>
                <div
                  ref={dropRef}
                  onClick={() => document.getElementById('timelineCoverInput')?.click()}
                  className={cx(ui.dropzone, s.drop, previewUrl && s.dropPreview)}
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" />
                  ) : (
                    <>
                      <IconTile Icon={ImagePlus} tone={toneByKey('aqua')} />
                      <span className={ui.dropzoneTitle}>Drag & drop or click to upload</span>
                    </>
                  )}
                  {/* Visually hidden, not display:none, so the keyboard can reach it */}
                  <input
                    id="timelineCoverInput"
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

            {/* Buttons: on phones the main action sits on top, as in the Capsule and heirloom drawers */}
            <div className={cx(ui.sheetFooter, 'max-[599px]:flex-col-reverse')}>
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
                  : 'Create My Timeline'}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
