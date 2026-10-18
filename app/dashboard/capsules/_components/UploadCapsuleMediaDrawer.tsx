'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Upload, ImagePlus, Video, Mic } from 'lucide-react';
import Image from "next/image";
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './capsuleDetail.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// ✅ Fix for native drag events typing
// eslint-disable-next-line no-undef
type GlobalDragEvent = DragEvent;

type Props = {
  capsuleId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: (newMedia: any) => void;
};

function CapsulePreviewImage({ file }: { file: File }) {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setLoaded(false);
    const url = URL.createObjectURL(file);
    setSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="preview"
      className={`w-full h-full object-cover transition-opacity duration-300 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      onLoad={() => setLoaded(true)}
    />
  );
}

export default function UploadCapsuleMediaDrawer({
  capsuleId,
  open,
  onClose,
  onUploaded,
}: Props) {
  const supabase = getBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Escape closes it (as the close button does), Tab stays inside while it is open, and
  // focus returns to Upload Memory.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

useEffect(() => {
  if (!file) {
    setPreviewUrl(null);
    return;
  }

  const url = URL.createObjectURL(file);
  setPreviewUrl(url);

  return () => URL.revokeObjectURL(url);
}, [file]);

  // --- Drag & Drop logic ---
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.add(ui.dropzoneActive);
    };
    const leave = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.remove(ui.dropzoneActive);
    };
    const drop = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.remove(ui.dropzoneActive);
      const file = e.dataTransfer?.files?.[0];
      if (file) setFile(file);
    };

    area.addEventListener('dragover', over);
    area.addEventListener('dragleave', leave);
    area.addEventListener('drop', drop);

    return () => {
      area.removeEventListener('dragover', over);
      area.removeEventListener('dragleave', leave);
      area.removeEventListener('drop', drop);
    };
  }, []);

  // --- Upload handler ---
  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file to upload.');
    setLoading(true);

    try {
      // The session is local (no round trip); RLS is the boundary for the writes below.
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
if (!user) throw new Error('User not authenticated.');

const processedFile =
  file.type.startsWith('image/') || file.name.toLowerCase().match(/\.(heic|heif)$/)
    ? await ensureDisplayableImage(file)
    : file;

const ext = processedFile.name.split('.').pop();  // ← processedFile from here down
const fileType = processedFile.type.startsWith('video')
  ? 'video'
  : processedFile.type.startsWith('audio')
  ? 'audio'
  : 'image';

const filePath = `${user.id}/capsules/${capsuleId}/${Date.now()}.${ext}`;
const { error: uploadErr } = await supabase.storage
  .from('capsule-media')
  .upload(filePath, processedFile);  // ← processedFile
      if (uploadErr) throw uploadErr;

const { data, error } = await supabase
  .from('capsule_media')
  .insert({
    capsule_id: capsuleId,
    file_path: filePath,
    file_type: fileType,
  })
  .select('*')
  .single();

if (error) throw error;

// The row as stored (file_path is the storage path): the page signs it for display. A
// signed link in file_path was signed again by the page and, on delete, the file it named
// could not be removed.
onUploaded(data);
      toast.success('Memory preserved.');
      setFile(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  // The chosen photo or video fills the zone; any other file shows its name.
  const showsPreview =
    !!file && (file.type.startsWith('image') || file.type.startsWith('video'));

  // Stays mounted: closed, it fades out and is then hidden from taps, Tab and screen readers.
  return (
    <div
      className={cx(s.layer, 'scrim-blur')}
      data-open={open ? 'true' : 'false'}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(ui.sheet, ui.sheetBottom, s.layerPanel)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <h2 id={titleId} className={ui.sheetTitle}>
              Upload Your Memories
            </h2>
            <p className={ui.sheetSub}>
              Add photos, videos, or voice notes to your capsule.
            </p>
          </div>

          {/* Close Button */}
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
          {/* Drag & Drop Zone */}
          <div
            ref={dropRef}
            onClick={() => document.getElementById('capsuleFileInput')?.click()}
            className={cx(ui.dropzone, s.uploadZone, showsPreview && s.uploadZoneFilled)}
          >
            {file ? (
  file.type.startsWith('image') ? (
    <CapsulePreviewImage file={file} />
  ) : file.type.startsWith('video') ? (
  previewUrl ? (
      <video
        src={previewUrl}
        className="w-full h-full object-cover"
        muted
        playsInline
      />
  ) : null
) : (
      <p className={s.fileName}>
        Selected: {file.name}
      </p>
  )
) : (
  <>
    <div className={s.dropIcons} aria-hidden="true">
      <ImagePlus size={26} strokeWidth={2} />
      <Video size={26} strokeWidth={2} />
      <Mic size={26} strokeWidth={2} />
    </div>
    <p className={ui.dropzoneTitle}>Drag & drop or click to upload</p>
  </>
)}
            {/* Visually hidden, not display:none, so the keyboard can reach it */}
            <input
              id="capsuleFileInput"
              type="file"
              accept="image/*,video/*,audio/*"
              className={ui.srOnly}
              aria-label="Choose a photo, video or voice note to upload"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                // So the same file can be chosen again after an upload
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {/* Upload Button */}
        <div className={ui.sheetFooter}>
          <Btn
            block
            onClick={handleUpload}
            disabled={loading}
            tile={loading ? <Spinner size={16} /> : <Upload size={18} strokeWidth={2.4} />}
          >
            {loading ? 'Uploading...' : 'Upload My Memory'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
