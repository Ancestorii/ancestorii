'use client';

import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, Upload, ImagePlus, Video, Mic } from 'lucide-react';

// ✅ Fix for native drag events typing
// eslint-disable-next-line no-undef
type GlobalDragEvent = DragEvent;

type Props = {
  capsuleId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: (newMedia: any) => void;
};

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

  // --- Drag & Drop logic ---
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
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated.');

      const ext = file.name.split('.').pop();
      const fileType = file.type.startsWith('video')
        ? 'video'
        : file.type.startsWith('audio')
        ? 'audio'
        : 'image';

      const filePath = `${user.id}/capsules/${capsuleId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('capsule-media')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: signed } = await supabase.storage
        .from('capsule-media')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);
      const fileUrl = signed?.signedUrl || null;

      const { data, error } = await supabase
        .from('capsule_media')
        .insert({
          capsule_id: capsuleId,
          file_url: fileUrl,
          file_type: fileType,
        })
        .select('*')
        .single();

      if (error) throw error;

      onUploaded(data);
      toast.success('Upload successful!');
      setFile(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload media.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Instead of returning null, just hide the modal visually
  return (
    <div
      className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
        open ? 'bg-black/40 opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:w-[480px] rounded-2xl shadow-[0_0_25px_rgba(230,194,110,0.3)] border border-[#E6C26E]/40 p-6 transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: open ? 'scale(1)' : 'scale(0.95)',
        }}
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
            Upload Your Memories
          </h2>
          <p className="text-sm text-[#5B6473]">
            Add photos, videos, or voice notes to your capsule.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          ref={dropRef}
          onClick={() => document.getElementById('capsuleFileInput')?.click()}
          className="w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-[#C8A557] transition cursor-pointer overflow-hidden mb-6"
        >
          {file ? (
            file.type.startsWith('image') ? (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-[#1F2837]">
                  Selected: {file.name}
                </p>
              </div>
            )
          ) : (
            <>
              <div className="flex gap-3 mb-3 text-[#C8A557]">
                <ImagePlus className="w-6 h-6" />
                <Video className="w-6 h-6" />
                <Mic className="w-6 h-6" />
              </div>
              <p className="text-sm">Drag & drop or click to upload</p>
            </>
          )}
          <input
            id="capsuleFileInput"
            type="file"
            accept="image/*,video/*,audio/*"
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
              Uploading...
            </div>
          ) : (
            'Upload My Memory'
          )}
        </button>
      </div>
    </div>
  );
}
