'use client';

import { useEffect, useId, useRef, useState, useCallback } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Upload, ImagePlus, Video, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

const MAX_FILES = 20;

type AlbumMediaRow = {
  id: string;
  album_id: string;
  user_id?: string | null;
  file_path: string;
  file_type: string;
  created_at: string;
};

type Props = {
  albumId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: (newMedia: AlbumMediaRow) => void;
};

type QueuedFile = {
  id: string;
  file: File;
  previewUrl: string | null;
  status: 'pending' | 'uploading' | 'done' | 'error';
};

// eslint-disable-next-line no-undef
type GlobalDragEvent = DragEvent;

export default function UploadMemoryDrawer({ albumId, open, onClose, onUploaded }: Props) {
  const supabase = getBrowserClient();
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);
  const isUploadingRef = useRef(false);
  const titleId = useId();

  // The close button's rule (not while uploading), for Escape too. Tab stays inside while open.
  const panelRef = useDialog<HTMLDivElement>(open, () => {
    if (!uploading) onClose();
  });

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setQueue((prev) => {
          prev.forEach((f) => {
            if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
          });
          return [];
        });
        setUploading(false);
        setUploadedCount(0);
        setFailedCount(0);
        isUploadingRef.current = false;
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Add files to queue
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    const accepted = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.type.startsWith('video/') ||
        f.name.toLowerCase().match(/\.(heic|heif)$/)
    );

    if (accepted.length === 0) {
      toast.error('Only images and videos are supported.');
      return;
    }

    setQueue((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_FILES} files per upload.`);
        return prev;
      }

      const toAdd = accepted.slice(0, remaining);
      if (accepted.length > remaining) {
        toast.error(
          `Only ${remaining} more file${remaining === 1 ? '' : 's'} allowed. ${accepted.length - remaining} skipped.`
        );
      }

      const newItems: QueuedFile[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        status: 'pending',
      }));

      return [...prev, ...newItems];
    });
  }, []);

  // Remove a file from queue
  const removeFile = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const hasFiles = queue.length > 0;

  // Drag & Drop. The big zone and the slim "add more" zone are different elements, so attach
  // again when one replaces the other (attached once, the slim zone and every later big zone
  // had no listeners and a dropped file opened in the browser instead).
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.add(s.dropActive);
    };
    const leave = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.remove(s.dropActive);
    };
    const drop = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.remove(s.dropActive);
      if (e.dataTransfer?.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    };

    area.addEventListener('dragover', over);
    area.addEventListener('dragleave', leave);
    area.addEventListener('drop', drop);

    return () => {
      area.removeEventListener('dragover', over);
      area.removeEventListener('dragleave', leave);
      area.removeEventListener('drop', drop);
    };
  }, [addFiles, hasFiles]);

  // Upload all
  const handleUploadAll = async () => {
    const pending = queue.filter((f) => f.status === 'pending');
    if (pending.length === 0) return toast.error('No files to upload.');
    if (isUploadingRef.current) return;

    isUploadingRef.current = true;
    setUploading(true);
    setUploadedCount(0);
    setFailedCount(0);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error('Not authenticated.');
      setUploading(false);
      isUploadingRef.current = false;
      return;
    }

    let doneCount = 0;
    let errCount = 0;

    for (const item of pending) {
      setQueue((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
      );

      try {
        const processedFile =
          item.file.type.startsWith('image/') ||
          item.file.name.toLowerCase().match(/\.(heic|heif)$/)
            ? await ensureDisplayableImage(item.file)
            : item.file;

        const isImage = processedFile.type.startsWith('image/');
        const isVideo = processedFile.type.startsWith('video/');
        const fileType = isImage ? 'photo' : isVideo ? 'video' : 'unknown';

        const filename = `${Date.now()}_${processedFile.name}`.replace(/\s+/g, '_');
        const path = `${user.id}/${albumId}/${filename}`;

        const { error: uploadErr } = await supabase.storage
          .from('album-media')
          .upload(path, processedFile, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: signed } = await supabase.storage
          .from('album-media')
          .createSignedUrl(path, 60 * 60 * 24 * 7);

        const signedUrl = signed?.signedUrl;
        if (!signedUrl) throw new Error('Failed to generate signed URL.');

        const { data, error } = await supabase
          .from('album_media')
          .insert({
            album_id: albumId,
            file_path: path,
            file_type: fileType,
          })
          .select('*')
          .single();

        if (error) throw error;

        onUploaded({ ...data, file_path: signedUrl });
        doneCount++;
        setUploadedCount(doneCount);

        setQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'done' } : f))
        );
      } catch (err: any) {
        console.error(`Upload failed for ${item.file.name}:`, err);
        errCount++;
        setFailedCount(errCount);

        setQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'error' } : f))
        );
      }
    }

    if (errCount === 0) {
      toast.success(
        doneCount === 1 ? 'Memory preserved.' : `${doneCount} memories preserved.`
      );
      setTimeout(() => onClose(), 600);
    } else {
      toast.error(`${errCount} file${errCount > 1 ? 's' : ''} failed. ${doneCount} uploaded.`);
    }

    setUploading(false);
    isUploadingRef.current = false;
  };

  const pendingCount = queue.filter((f) => f.status === 'pending').length;
  const totalInQueue = queue.length;
  const allDone = hasFiles && queue.every((f) => f.status === 'done' || f.status === 'error');

  const fileInput = (
    // Visually hidden, not display:none, so the keyboard can reach it
    <input
      id="albumFileInput"
      type="file"
      accept="image/*,video/*"
      multiple
      className={ui.srOnly}
      aria-label="Choose photos or videos to upload"
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        if (e.target.files?.length) addFiles(e.target.files);
        e.target.value = '';
      }}
    />
  );

  return (
    <div
      className={cx(ui.scrim, s.layer, 'scrim-blur z-[9999] flex items-center justify-center p-4')}
      data-open={open ? 'true' : 'false'}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(ui.sheet, s.layerPanel, s.dialog, 'w-full max-w-[560px] max-h-[88vh]')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <h2 id={titleId} className={ui.sheetTitle}>
              Preserve Your Memories
            </h2>
            <p className={ui.sheetSub}>
              Add photos or videos to this album.
            </p>
          </div>
          <IconBtn
            label="Close"
            onClick={(e) => {
              e.stopPropagation();
              if (!uploading) onClose();
            }}
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        {/* Drop zone / Preview area */}
        <div className={ui.sheetBody}>
          {!hasFiles ? (
            <div
              ref={dropRef}
              onClick={() => document.getElementById('albumFileInput')?.click()}
              className={cx(s.drop, s.dropLarge)}
            >
              <div className={s.dropIcons} aria-hidden="true">
                <ImagePlus size={26} strokeWidth={2} />
                <Video size={26} strokeWidth={2} />
              </div>
              <p className={s.dropTitle}>Drag & drop or click to upload</p>
              <p className={s.dropHint}>Up to {MAX_FILES} files at once</p>

              {fileInput}
            </div>
          ) : (
            <div>
              {/* Mini drop zone / add more */}
              <div
                ref={dropRef}
                onClick={() => document.getElementById('albumFileInput')?.click()}
                className={cx(s.drop, s.dropSlim)}
              >
                <ImagePlus size={18} strokeWidth={2.2} aria-hidden="true" />
                Add more files
                <span className="font-semibold">
                  ({totalInQueue}/{MAX_FILES})
                </span>

                {fileInput}
              </div>

              {/* Progress bar */}
              {uploading && (
                <div>
                  <div className={s.progressRow}>
                    <span>
                      Uploading {uploadedCount + failedCount} of{' '}
                      {pendingCount + uploadedCount + failedCount}
                    </span>
                    {failedCount > 0 && (
                      <span className={s.progressFail}>{failedCount} failed</span>
                    )}
                  </div>
                  <div className={ui.progress}>
                    <div
                      className={ui.progressFill}
                      style={{
                        width: `${Math.round(
                          ((uploadedCount + failedCount) /
                            (pendingCount + uploadedCount + failedCount)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail grid */}
              <ul className={cx(s.queue, 'list-none p-0')}>
                {queue.map((item) => (
                  <li key={item.id} className={s.queueItem}>
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt="" />
                    ) : (
                      <div className={s.queueVideo}>
                        <Video size={22} strokeWidth={2} aria-hidden="true" />
                      </div>
                    )}

                    {item.status === 'uploading' && (
                      <div className={cx(s.queueState, s.queueBusy)}>
                        <Spinner size={24} label="Uploading" />
                      </div>
                    )}

                    {item.status === 'done' && (
                      <div className={cx(s.queueState, s.queueDone)}>
                        <CheckCircle2 size={26} strokeWidth={2.4} aria-hidden="true" />
                        <span className={ui.srOnly}>Uploaded</span>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <div className={cx(s.queueState, s.queueFail)}>
                        <AlertCircle size={26} strokeWidth={2.4} aria-hidden="true" />
                        <span className={ui.srOnly}>Failed</span>
                      </div>
                    )}

                    {item.status === 'pending' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(item.id);
                        }}
                        aria-label={`Remove ${item.file.name}`}
                        className={s.queueRemove}
                      >
                        <X size={15} strokeWidth={2.6} aria-hidden="true" />
                      </button>
                    )}

                    <p className={cx(s.queueName, 'm-0')}>
                      {item.file.name}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={ui.sheetFooter}>
          <Btn
            block
            onClick={allDone ? onClose : handleUploadAll}
            disabled={uploading || (!allDone && pendingCount === 0)}
            tile={
              uploading ? (
                <Spinner size={16} />
              ) : allDone ? (
                <Check size={18} strokeWidth={2.6} />
              ) : (
                <Upload size={18} strokeWidth={2.4} />
              )
            }
          >
            {uploading ? (
              <>
                Preserving {uploadedCount + failedCount} of{' '}
                {pendingCount + uploadedCount + failedCount}…
              </>
            ) : allDone ? (
              'Done'
            ) : pendingCount === 0 ? (
              'Select files to upload'
            ) : pendingCount === 1 ? (
              'Preserve My Memory'
            ) : (
              `Preserve ${pendingCount} Memories`
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}
