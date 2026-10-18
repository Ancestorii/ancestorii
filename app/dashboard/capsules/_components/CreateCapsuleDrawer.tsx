'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabase/browser';
import { X, ImagePlus, CalendarDays, Check, Package, Plus } from 'lucide-react';
import { safeToast as toast } from '@/lib/safeToast';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, IconTile, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './capsules.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Today as YYYY-MM-DD on the visitor's own calendar (toISOString() gave the UTC day, which is
// a day out for part of the world around midnight).
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};


export type CreatedCapsule = {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
  cover_image: string | null;
};

export type Capsule = {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
  cover_image: string | null;
};

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  capsule: Capsule | null;
  // The plan's say on a new capsule, from the page (it already asks usePlanLimits; asking
  // again here ran the same five reads twice on every visit).
  limitsLoading: boolean;
  canCreateCapsule: boolean;
  limitMessage: string;
  onClose: () => void;
  onCreated: (cap: Capsule) => void;
  onUpdated: (cap: Capsule) => void;
};

export default function CreateCapsuleDrawer({
    open,
  mode,
  capsule,
  limitsLoading,
  canCreateCapsule,
  limitMessage,
  onClose,
  onCreated,
  onUpdated,
}: Props) {
  const supabase = getBrowserClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const headingId = useId();
  const titleFieldId = useId();
  const descriptionId = useId();
  const dateId = useId();
  const dateHintId = useId();


  const getSignedCoverUrl = async (path: string | null) => {
  if (!path) return null;

  // A link is not a path and can't be signed (storage answered 400): show it as it is.
  if (/^https?:\/\//.test(path)) return path;

  const cleanPath = path.replace(/^capsule-media\//, '');

  const { data } = await supabase.storage
    .from('capsule-media')
    .createSignedUrl(cleanPath, 60 * 60);

  return data?.signedUrl ?? null;
};

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

  useEffect(() => {
  if (mode !== 'edit' || !capsule) return;
  setTitle(capsule.title);
  setDescription(capsule.description ?? '');
  setUnlockDate(capsule.unlock_date);

  // The list hands over the cover's storage path; sign it for the preview. Closed before the
  // answer came back, the answer is dropped (it used to land as the next capsule's preview).
  let cancelled = false;
  (async () => {
    const signed = await getSignedCoverUrl(capsule.cover_image);
    if (!cancelled) setPreviewUrl(signed);
  })();
  return () => {
    cancelled = true;
  };
}, [mode, capsule]);

  // Drag & drop. The zone only exists while the drawer is open, so attach each time it
  // opens (run once at mount, it found no zone: drag and drop never worked, and a dropped
  // file opened in the browser tab instead).
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: DragEvent) => {
      e.preventDefault();
      area.setAttribute('data-drag', 'true');
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      area.removeAttribute('data-drag');
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      area.removeAttribute('data-drag');
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


  const isSubmittingRef = useRef(false);

  const handleClose = () => {
  setTitle('');
  setDescription('');
  setUnlockDate('');
  setCoverFile(null);
  setPreviewUrl(null);
  onClose();
};

  // Escape closes it (as the close button does), Tab stays inside, focus returns to the button.
  const panelRef = useDialog<HTMLDivElement>(open, handleClose);

const handleSubmit = async () => {
  if (isSubmittingRef.current || !title.trim() || !unlockDate) return;
  isSubmittingRef.current = true;
  setLoading(true);

  try {
    // The session is local (no round trip); RLS is the boundary for every write below.
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) throw new Error('Not authenticated');

    // The date field's "min" is only a hint (a typed date gets past it): a date that has
    // gone is refused here, unless it is an existing capsule's own date left as it was.
    if (unlockDate !== (capsule?.unlock_date ?? '') && unlockDate.slice(0, 10) < todayLocal()) {
      toast.error('Choose a date in the future.');
      return;
    }

    // 🔒 CAPSULE PLAN LIMIT GUARD (CREATE ONLY)
    if (mode === 'create') {
      if (limitsLoading) {
        toast.error('Checking plan limits…');
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      if (!canCreateCapsule) {
        toast.error(limitMessage);
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }
    }

    let coverUrl: string | null = capsule?.cover_image ?? null;

    if (coverFile) {
      const safeFile = await ensureDisplayableImage(coverFile);
      const fileExt = safeFile.name.split('.').pop();
      const uniqueId =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const filePath = `${user.id}/capsules/cover_${uniqueId}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('capsule-media')
        .upload(filePath, safeFile);

      if (uploadErr) throw uploadErr;

      coverUrl = filePath;}

    if (mode === 'edit' && capsule) {
      // Only write cover_image when a new cover was uploaded. capsule.cover_image here is the
      // list's signed URL (it carries an expiring token), and writing it back replaced the
      // stored file path with a link that stops working after a week.
      const { data, error } = await supabase
        .from('memory_capsules')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          unlock_date: unlockDate,
          ...(coverFile ? { cover_image: coverUrl } : {}),
        })
        .eq('id', capsule.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Capsule not found or access denied.');

      onUpdated(data);
    } else {
      const { data, error } = await supabase
        .from('memory_capsules')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          unlock_date: unlockDate,
          cover_image: coverUrl,
          is_locked: false,
        })
        .select()
        .single();

      if (error) throw error;

      onCreated(data);
    }

    handleClose()
  } catch (err: any) {
    toast.error(err.message || 'Failed to save capsule');
  } finally {
    isSubmittingRef.current = false;
    setLoading(false);
  }
};


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
            initial={{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={cx(ui.sheet, 'w-full max-w-[520px] max-h-[min(88vh,100%)]')}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-busy={loading || undefined}
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={ui.sheetHeader}>
              <div className="flex min-w-0 flex-col items-start gap-3">
                <IconTile Icon={Package} size="sm" />
                <div className="min-w-0">
                  <h2 id={headingId} className={ui.sheetTitle}>
                    {mode === 'edit' ? 'Edit Capsule' : 'Create New Capsule'}
                  </h2>
                  <p className={ui.sheetSub}>
                    {mode === 'edit'
                    ? 'Update your capsule details.'
                    : 'Seal your memories for your future self.'}
                  </p>
                </div>
              </div>
              {/* Close */}
              <IconBtn
                label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose()

                }}
              >
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            <div className={ui.sheetBody}>
              {/* Inputs */}
              <div className={ui.field}>
                <label htmlFor={titleFieldId} className={ui.label}>
                  Title
                </label>
                <input
                  id={titleFieldId}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-required="true"
                  className={ui.input}
                  placeholder="My 30th Birthday"
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
                  placeholder="Write a short message for your future self..."
                />
              </div>

              <div className={ui.field}>
                <label htmlFor={dateId} className={cx(ui.label, s.fieldLabel)}>
                  <CalendarDays size={17} strokeWidth={2.2} aria-hidden="true" /> Unlock Date
                </label>

                <div className={s.dateWrap}>
                  {!unlockDate && (
                    <span className={s.datePlaceholder} aria-hidden="true">
                      DD/MM/YYYY
                    </span>
                  )}
                  <input
                    id={dateId}
                    type="date"
                    // An edited capsule's date arrives as a full timestamp, which a date field
                    // can't show (it stayed blank): show its day; the saved value is unchanged.
                    value={unlockDate.slice(0, 10)}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    aria-required="true"
                    aria-describedby={dateHintId}
                    data-empty={!unlockDate}
                    className={cx(ui.input, s.dateInput)}
                    min={todayLocal()}
                  />
                </div>

                <p id={dateHintId} className={ui.hint}>
                  Choose a date in the future
                </p>
              </div>

              {/* Cover Image */}
              <div className={ui.field}>
                <label htmlFor="capsuleCoverInput" className={cx(ui.label, s.fieldLabel)}>
                  <ImagePlus size={17} strokeWidth={2.2} aria-hidden="true" /> Cover Image (optional)
                </label>
                <div
                  ref={dropRef}
                  onClick={() => document.getElementById('capsuleCoverInput')?.click()}
                  className={cx(ui.dropzone, s.zone, previewUrl && s.coverZone)}
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" />
                  ) : (
                    <>
                      <span className={s.dropIcon} aria-hidden="true">
                        <ImagePlus size={20} strokeWidth={2.2} />
                      </span>
                      <span className={ui.dropzoneTitle}>Drag & drop or click to upload</span>
                    </>
                  )}
                  {/* Visually hidden, not display:none, so the keyboard can reach it */}
                  <input
                    id="capsuleCoverInput"
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

            {/* Buttons: on phones the main action sits on top */}
            <div className={cx(ui.sheetFooter, 'max-[599px]:flex-col-reverse')}>
              <Btn variant="soft" onClick={handleClose} disabled={loading}>
                Cancel
              </Btn>

              <Btn
                onClick={handleSubmit}
                disabled={!title.trim() || !unlockDate || loading}
                tile={
                  loading ? (
                    <Spinner size={16} />
                  ) : mode === 'edit' ? (
                    <Check size={18} strokeWidth={2.6} />
                  ) : (
                    <Plus size={18} strokeWidth={2.6} />
                  )
                }
              >
                {loading
                  ? 'Saving…'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : 'Create Capsule'}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
