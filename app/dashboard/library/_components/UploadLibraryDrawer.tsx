'use client';

import { useEffect, useId, useRef, useState, useCallback, type KeyboardEvent } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Upload, ImagePlus, Video, Check, AlertCircle } from 'lucide-react';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './library.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

const MAX_FILES = 20;

type LibraryMediaRow = {
  id: string;
  user_id: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  folder_id: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  folderId: string;
  onUploaded: (newMedia: LibraryMediaRow) => void;
};

type QueuedFile = {
  id: string;
  file: File;
  previewUrl: string | null;
  status: 'pending' | 'uploading' | 'done' | 'error';
};

// eslint-disable-next-line no-undef
type GlobalDragEvent = DragEvent;

export default function UploadLibraryDrawer({ open, onClose, folderId, onUploaded }: Props) {
  const supabase = getBrowserClient();
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);
  const isUploadingRef = useRef(false);
  const titleId = useId();
  const subId = useId();
  const limitId = useId();

  // Escape closes it, as the close button does (never mid-upload); Tab stays inside, and focus
  // returns to Add Media.
  const panelRef = useDialog<HTMLDivElement>(open, () => {
    if (!uploading) onClose();
  });

  const pendingCount = queue.filter((f) => f.status === 'pending').length;
  const totalInQueue = queue.length;
  const hasFiles = totalInQueue > 0;
  const allDone = hasFiles && queue.every((f) => f.status === 'done' || f.status === 'error');

  // ── Reset state when drawer closes ──
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

  // ── Add files to queue ──
  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      const accepted = files.filter(
        (f) => f.type.startsWith('image/') || f.type.startsWith('video/') || f.name.toLowerCase().match(/\.(heic|heif)$/)
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
          toast.error(`Only ${remaining} more file${remaining === 1 ? '' : 's'} allowed. ${accepted.length - remaining} skipped.`);
        }

        const newItems: QueuedFile[] = toAdd.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          status: 'pending',
        }));

        return [...prev, ...newItems];
      });
    },
    []
  );

  // ── Remove a file from queue ──
  const removeFile = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // ── Drag & Drop ──
  // The zone is a different element before and after the first files are added (the big drop
  // zone, then the "Add more files" row), so the listeners move with it: bound once, they stayed
  // on the first zone after it unmounted, and a file dropped on the new one opened in the tab.
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

  // The drop zone opens the file picker on a click, and now on Enter or Space too.
  const openPicker = () => document.getElementById('libraryFileInput')?.click();
  const onPickerKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  // ── Upload all ──
  const handleUploadAll = async () => {
    const pending = queue.filter((f) => f.status === 'pending');
    if (pending.length === 0) return toast.error('No files to upload.');
    if (isUploadingRef.current) return;

    if (!folderId) {
      toast.error('No folder selected.');
      return;
    }

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
        const processedFile = item.file.type.startsWith('image/') || item.file.name.toLowerCase().match(/\.(heic|heif)$/)
          ? await ensureDisplayableImage(item.file)
          : item.file;

        const isImage = processedFile.type.startsWith('image/');
        const isVideo = processedFile.type.startsWith('video/');
        const fileType = isImage ? 'image' : isVideo ? 'video' : 'other';

        const folder = Date.now();
        const filename = `${folder}_${processedFile.name}`.replace(/\s+/g, '_');
        const path = `${user.id}/${folder}/${filename}`;

        const { error: uploadErr } = await supabase.storage
          .from('library-media')
          .upload(path, processedFile);

        if (uploadErr) throw uploadErr;

        const { data, error } = await supabase
          .from('library_media')
          .insert({
            user_id: user.id,
            folder_id: folderId,
            file_path: path,
            file_type: fileType,
            file_size: processedFile.size,
          })
          .select('*')
          .single();

        if (error) throw error;

        onUploaded(data);
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
        doneCount === 1 ? 'Added to your library.' : `${doneCount} files added to your library.`
      );
      setTimeout(() => onClose(), 600);
    } else {
      toast.error(`${errCount} file${errCount > 1 ? 's' : ''} failed. ${doneCount} uploaded.`);
    }

    setUploading(false);
    isUploadingRef.current = false;
  };

  // This run's progress. The file being sent is neither pending nor counted yet, so it is added
  // here: without it, three files read "Uploading 0 of 2" and the bar filled before the last
  // one had finished.
  const inFlight = queue.filter((f) => f.status === 'uploading').length;
  const progressDone = uploadedCount + failedCount;
  const progressTotal = pendingCount + inFlight + progressDone;
  const progressCurrent = Math.min(progressDone + 1, progressTotal);
  const progress = progressTotal > 0 ? progressDone / progressTotal : 0;

  return (
    // Above the floating phone nav (z-[200], later in the DOM). It stays mounted: closed, it is
    // faded out and hidden from Tab and screen readers.
    <div
      className={cx(
        ui.scrim,
        'scrim-blur z-[9999] flex items-end justify-center sm:items-center sm:p-4',
        s.upOverlay,
        open && s.upOverlayOpen
      )}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subId}
        className={cx(
          ui.sheet,
          s.upPanel,
          'w-full max-h-[92dvh] max-sm:rounded-b-none sm:max-h-[85vh] sm:max-w-[540px]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <h2 id={titleId} className={ui.sheetTitle}>
              Upload To My Library
            </h2>
            <p id={subId} className={ui.sheetSub}>
              Store photos and videos to use anywhere inside Ancestorii.
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

        {/* ── Drop zone / Preview area ── */}
        <div className={ui.sheetBody}>
          {!hasFiles ? (
            <div
              ref={dropRef}
              role="button"
              tabIndex={0}
              aria-describedby={limitId}
              onClick={openPicker}
              onKeyDown={onPickerKey}
              // focusInset: the sheet body scrolls, which clipped the top of a ring drawn outside.
              className={cx(s.drop, ui.focusInset)}
            >
              <span className={s.dropTile} aria-hidden="true">
                <ImagePlus size={22} strokeWidth={2.4} />
                <Video size={22} strokeWidth={2.4} />
              </span>
              <span className={s.dropTitle}>Drag &amp; drop or click to upload</span>
              <span id={limitId} className={s.dropHint}>
                Up to {MAX_FILES} files at once
              </span>

              <input
                id="libraryFileInput"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            <div>
              <div
                ref={dropRef}
                role="button"
                tabIndex={0}
                onClick={openPicker}
                onKeyDown={onPickerKey}
                className={cx(s.drop, s.dropRow, ui.focusInset)}
              >
                <ImagePlus size={18} strokeWidth={2.4} aria-hidden="true" />
                Add more files
                <span className={s.dropCount}>
                  ({totalInQueue}/{MAX_FILES})
                </span>

                <input
                  id="libraryFileInput"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[14px] font-bold leading-snug">
                      Uploading {progressCurrent} of {progressTotal}
                    </span>
                    {failedCount > 0 && (
                      <span className="text-[13px] font-bold leading-snug text-brand-danger">
                        {failedCount} failed
                      </span>
                    )}
                  </div>
                  <div
                    className={ui.progress}
                    role="progressbar"
                    aria-label="Upload progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                  >
                    <div
                      className={cx(ui.progressFill, s.progressFill)}
                      style={{ transform: `scaleX(${progress})` }}
                    />
                  </div>
                </div>
              )}

              <ul role="list" className="mt-4 grid grid-cols-4 gap-2.5">
                {queue.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <div className="relative">
                      <div className={s.qThumb}>
                        {item.previewUrl ? (
                          // A local preview (blob: URL), which next/image can't optimise.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.previewUrl} alt="" className={s.qImg} />
                        ) : (
                          <span className={s.qVideo}>
                            <Video size={22} strokeWidth={2.2} aria-hidden="true" />
                          </span>
                        )}

                        {item.status === 'uploading' && (
                          <span className={cx(s.qState, s.qBusy)}>
                            <Spinner size={22} label={`Uploading ${item.file.name}`} />
                          </span>
                        )}

                        {item.status === 'done' && (
                          <span className={cx(s.qState, s.qDone)}>
                            <span className={s.qBadge}>
                              <Check size={16} strokeWidth={3} aria-hidden="true" />
                            </span>
                            <span className={ui.srOnly}>Uploaded</span>
                          </span>
                        )}

                        {item.status === 'error' && (
                          <span className={cx(s.qState, s.qError)}>
                            <span className={cx(s.qBadge, s.qBadgeError)}>
                              <AlertCircle size={17} strokeWidth={2.6} aria-hidden="true" />
                            </span>
                            <span className={ui.srOnly}>Failed</span>
                          </span>
                        )}
                      </div>

                      {item.status === 'pending' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(item.id);
                          }}
                          aria-label={`Remove ${item.file.name}`}
                          className={s.qRemove}
                        >
                          <X size={14} strokeWidth={2.8} aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    <p className={s.qName} title={item.file.name}>
                      {item.file.name}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={ui.sheetFooter}>
          <Btn
            block
            onClick={allDone ? onClose : handleUploadAll}
            disabled={uploading || (!allDone && pendingCount === 0)}
            tile={
              uploading ? (
                <Spinner />
              ) : allDone ? (
                <Check size={18} strokeWidth={2.6} />
              ) : (
                <Upload size={18} strokeWidth={2.4} />
              )
            }
          >
            {uploading ? (
              `Uploading ${progressCurrent} of ${progressTotal}…`
            ) : allDone ? (
              'Done'
            ) : pendingCount === 0 ? (
              'Select files to upload'
            ) : pendingCount === 1 ? (
              'Upload 1 File'
            ) : (
              `Upload ${pendingCount} Files`
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}