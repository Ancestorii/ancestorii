'use client';

import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Upload, ImagePlus, Video } from 'lucide-react';
import Image from "next/image";

// eslint-disable-next-line no-undef
type GlobalDragEvent = DragEvent;

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

function AlbumPreviewImage({ file }: { file: File }) {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setLoaded(false);
    const url = URL.createObjectURL(file);
    setSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!src) return null; // ✅ prevents empty src error

  return (
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

export default function UploadMemoryDrawer({
  albumId,
  open,
  onClose,
  onUploaded,
}: Props) {
  const supabase = getBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // --- Drag & Drop logic (IDENTICAL to Capsule) ---
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
      const f = e.dataTransfer?.files?.[0];
      if (f) setFile(f);
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

  // --- Upload handler (ALBUM LOGIC) ---
  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file to upload.');
    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated.');

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const fileType = isImage ? 'photo' : isVideo ? 'video' : 'unknown';

      const filename = `${Date.now()}_${file.name}`.replace(/\s+/g, '_');
      const path = `${user.id}/${albumId}/${filename}`;

      const { error: uploadErr } = await supabase.storage
        .from('album-media')
        .upload(path, file, { upsert: true });

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

      onUploaded({
        ...data,
        file_path: signedUrl,
      });

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

  // --- MODAL (IDENTICAL TO CAPSULE) ---
  return (
    <div
      className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
        open ? 'bg-black/40 opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:w-[480px] rounded-2xl
        shadow-[0_0_25px_rgba(230,194,110,0.3)]
        border border-[#E6C26E]/40 p-6
        transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: open ? 'scale(1)' : 'scale(0.95)' }}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#1F2837] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1F2837] mb-2">
            Preserve Your Memories
          </h2>
          <p className="text-sm text-[#5B6473]">
            Add photos or videos to this album.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          ref={dropRef}
          onClick={() => document.getElementById('albumFileInput')?.click()}
          className="w-full aspect-[16/9] border-2 border-dashed border-gray-300
          rounded-xl flex flex-col items-center justify-center
          text-gray-500 hover:text-[#C8A557]
          transition cursor-pointer overflow-hidden mb-6"
        >
          {file ? (
  file.type.startsWith('image') ? (
    <AlbumPreviewImage file={file} />
 ) : file.type.startsWith('video') ? (
  previewUrl ? (
    <div className="relative w-full h-full overflow-hidden">
      <video
        src={previewUrl}
        className="w-full h-full object-cover"
        muted
        playsInline
      />
    </div>
  ) : null
) : (
    <p className="text-sm font-medium text-[#1F2837]">
      Selected: {file.name}
    </p>
  )
) : (
            <>
              <div className="flex gap-3 mb-3 text-[#C8A557]">
                <ImagePlus className="w-6 h-6" />
                <Video className="w-6 h-6" />
              </div>
              <p className="text-sm">Drag & drop or click to upload</p>
            </>
          )}

          <input
            id="albumFileInput"
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition text-[#1F2837] ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] hover:shadow-md hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5 animate-pulse" />
              Preserving…
            </div>
          ) : (
            'Preserve My Memory'
          )}
        </button>
      </div>
    </div>
  );
}
