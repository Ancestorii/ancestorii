'use client';

import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Upload, ImagePlus, Video } from 'lucide-react';

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

export default function UploadLibraryDrawer({
  open,
  onClose,
  onUploaded,
}: Props) {
  const supabase = getBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // --- Drag & Drop ---
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: DragEvent) => {
      e.preventDefault();
      area.classList.add('ring-2', 'ring-[#E6C26E]');
    };

    const leave = (e: DragEvent) => {
      e.preventDefault();
      area.classList.remove('ring-2', 'ring-[#E6C26E]');
    };

    const drop = (e: DragEvent) => {
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

  // --- Upload to Library ---
  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file.');
    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated.');

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const fileType = isImage ? 'image' : isVideo ? 'video' : 'other';

      const folder = Date.now();
      const filename = `${folder}_${file.name}`.replace(/\s+/g, '_');
      const path = `${user.id}/${folder}/${filename}`;

      // Upload to library-media bucket
      const { error: uploadErr } = await supabase.storage
        .from('library-media')
        .upload(path, file);

      if (uploadErr) throw uploadErr;

      // Insert into library_media table
      const { data, error } = await supabase
        .from('library_media')
        .insert({
          user_id: user.id,
          file_path: path,
          file_type: fileType,
          file_size: file.size,
        })
        .select('*')
        .single();

      if (error) throw error;

      onUploaded(data);

      toast.success('Added to your library.');
      setFile(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#1F2837]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1F2837] mb-2">
            Upload To My Library
          </h2>
          <p className="text-sm text-[#5B6473]">
            Store photos and videos to use anywhere inside Ancestorii.
          </p>
        </div>

        <div
          ref={dropRef}
          onClick={() => document.getElementById('libraryFileInput')?.click()}
          className="w-full aspect-[16/9] border-2 border-dashed border-gray-300
          rounded-xl flex flex-col items-center justify-center
          text-gray-500 hover:text-[#C8A557]
          transition cursor-pointer overflow-hidden mb-6"
        >
          {file ? (
            file.type.startsWith('image') ? (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover"
              />
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
            id="libraryFileInput"
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

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
              Uploading…
            </div>
          ) : (
            'Add To Library'
          )}
        </button>
      </div>
    </div>
  );
}