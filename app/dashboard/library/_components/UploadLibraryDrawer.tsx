'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Upload, ImagePlus, Video, CheckCircle2, AlertCircle } from 'lucide-react';
import { ensureDisplayableImage } from '@/lib/convertImage';

const MAX_FILES = 20;

type LibraryMediaRow = {
  id: string;
  user_id: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
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

export default function UploadLibraryDrawer({ open, onClose, onUploaded }: Props) {
  const supabase = getBrowserClient();
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);
  const isUploadingRef = useRef(false);

  // ── Reset state when drawer closes ──
  useEffect(() => {
    if (!open) {
      // Small delay so the closing animation isn't jarring
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
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.add('ring-2', 'ring-[#E6C26E]');
    };

    const leave = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.remove('ring-2', 'ring-[#E6C26E]');
    };

    const drop = (e: GlobalDragEvent) => {
      e.preventDefault();
      area.classList.remove('ring-2', 'ring-[#E6C26E]');
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
  }, [addFiles]);

  // ── Upload all ──
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
      // Mark uploading
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

    // Done
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

  const pendingCount = queue.filter((f) => f.status === 'pending').length;
  const totalInQueue = queue.length;
  const hasFiles = totalInQueue > 0;
  const allDone = hasFiles && queue.every((f) => f.status === 'done' || f.status === 'error');

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        open ? 'bg-black/40 opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ willChange: 'opacity' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:w-[540px] max-h-[85vh] flex flex-col rounded-2xl shadow-[0_0_25px_rgba(230,194,110,0.3)] border border-[#E6C26E]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!uploading) onClose();
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-[#1F2837] transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1F2837] mb-1">Upload To My Library</h2>
            <p className="text-sm text-[#5B6473]">
              Store photos and videos to use anywhere inside Ancestorii.
            </p>
          </div>
        </div>

        {/* ── Drop zone / Preview area ── */}
        <div className="px-6 flex-1 overflow-y-auto min-h-0">
          {!hasFiles ? (
            /* Empty state — full drop zone */
            <div
              ref={dropRef}
              onClick={() => document.getElementById('libraryFileInput')?.click()}
              className="w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-[#C8A557] hover:border-[#E6C26E] transition cursor-pointer mb-4"
            >
              <div className="flex gap-3 mb-3 text-[#C8A557]">
                <ImagePlus className="w-6 h-6" />
                <Video className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">Up to {MAX_FILES} files at once</p>

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
            /* Files selected — grid + compact drop zone */
            <div className="mb-4">
              {/* Mini drop zone / add more */}
              <div
                ref={dropRef}
                onClick={() => document.getElementById('libraryFileInput')?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-[#E6C26E] transition cursor-pointer flex items-center justify-center gap-2 py-3 mb-4 text-sm text-gray-500 hover:text-[#C8A557]"
              >
                <ImagePlus className="w-4 h-4" />
                Add more files
                <span className="text-xs text-gray-400">
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

              {/* ── Progress bar (visible during upload) ── */}
              {uploading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1F2837]">
                      Uploading {uploadedCount + failedCount} of {pendingCount + uploadedCount + failedCount}
                    </span>
                    <span className="text-xs text-[#5B6473]">
                      {failedCount > 0 && (
                        <span className="text-red-500">{failedCount} failed</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.round(
                          ((uploadedCount + failedCount) / (pendingCount + uploadedCount + failedCount)) * 100
                        )}%`,
                        background: 'linear-gradient(90deg, #C8A557, #E6C26E, #F3D99B)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── Thumbnail grid ── */}
              <div className="grid grid-cols-4 gap-2">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group"
                  >
                    {/* Thumbnail */}
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-gray-400" />
                      </div>
                    )}

                    {/* Status overlay */}
                    {item.status === 'uploading' && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#C8A557] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {item.status === 'done' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    )}

                    {item.status === 'error' && (
                      <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    )}

                    {/* Remove button (only when pending) */}
                    {item.status === 'pending' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(item.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ×
                      </button>
                    )}

                    {/* Filename */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 pb-1 pt-4">
                      <p className="text-[10px] text-white truncate leading-tight">
                        {item.file.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-3 shrink-0 border-t border-gray-100">
          <button
            onClick={allDone ? onClose : handleUploadAll}
            disabled={uploading || (!allDone && pendingCount === 0)}
            className={`w-full py-3 rounded-xl font-semibold text-[#1F2837] transition-all ${
              uploading || (!allDone && pendingCount === 0)
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] hover:shadow-md hover:scale-[1.01]'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5 animate-pulse" />
                Uploading {uploadedCount + failedCount} of {pendingCount + uploadedCount + failedCount}…
              </div>
            ) : allDone ? (
              'Done'
            ) : pendingCount === 0 ? (
              'Select files to upload'
            ) : pendingCount === 1 ? (
              'Upload 1 File'
            ) : (
              `Upload ${pendingCount} Files`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}