'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabase/browser';
import { X, ImagePlus, CalendarDays } from 'lucide-react';
import { safeToast as toast } from '@/lib/safeToast';

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
  onClose: () => void;
  onCreated: (cap: Capsule) => void;
  onUpdated: (cap: Capsule) => void;
};

export default function CreateCapsuleDrawer({
    open,
  mode,
  capsule,
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
  const [mounted, setMounted] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const getSignedCoverUrl = async (path: string | null) => {
  if (!path) return null;

  const cleanPath = path.replace(/^capsule-media\//, '');

  const { data } = await supabase.storage
    .from('capsule-media')
    .createSignedUrl(cleanPath, 60 * 60);

  return data?.signedUrl ?? null;
};

  useEffect(() => setMounted(true), []);

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
  if (mode === 'edit' && capsule) {
    setTitle(capsule.title);
    setDescription(capsule.description ?? '');
    setUnlockDate(capsule.unlock_date);

    (async () => {
      const signed = await getSignedCoverUrl(capsule.cover_image);
      setPreviewUrl(signed || null);
    })();
  }
}, [mode, capsule]);

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
  }, []);


  const isSubmittingRef = useRef(false);

  const handleClose = () => {
  setTitle('');
  setDescription('');
  setUnlockDate('');
  setCoverFile(null);
  setPreviewUrl(null);
  onClose();
};

const handleSubmit = async () => {
  if (isSubmittingRef.current || !title.trim() || !unlockDate) return;
  isSubmittingRef.current = true;
  setLoading(true);

  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    let coverUrl: string | null = capsule?.cover_image ?? null;

    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const filePath = `${user.id}/capsules/cover_${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('capsule-media')
        .upload(filePath, coverFile);

      if (uploadErr) throw uploadErr;

      coverUrl = `capsule-media/${filePath}`;}

    if (mode === 'edit' && capsule) {
      const { data, error } = await supabase
        .from('memory_capsules')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          unlock_date: unlockDate,
          cover_image: coverUrl,
        })
        .eq('id', capsule.id)
        .select()
        .single();

      if (error) throw error;

      onUpdated(data);
      toast.success('Capsule updated');
    } else {
      const { data, error } = await supabase
        .from('memory_capsules')
        .insert({
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


  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 bg-[#0B0C10]/70 backdrop-blur-sm flex items-center justify-center z-50"
        >
          {loading && (
            <div className="fixed top-0 left-0 w-full h-[3px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-[#E6C26E] via-[#F3D99B] to-[#E6C26E] animate-[shimmer_1.6s_linear_infinite]" />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative bg-white w-[88%] sm:w-[360px] md:w-[450px] max-h-[85vh] overflow-y-auto rounded-2xl p-6 border-[2px] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.5)] font-[Inter]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose()
              
              }}
              className="absolute top-4 right-4 text-[#1F2837]/70 hover:text-[#1F2837] transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <h2 className="text-3xl font-bold text-[#1F2837] mb-2 text-center relative">
              {mode === 'edit' ? 'Edit Capsule' : 'Create New Capsule'}
            </h2>
            <p className="text-sm text-[#7A8596] text-center mb-6 italic">
              {mode === 'edit'
              ? 'Update your capsule details.'
              : 'Seal your memories for your future self.'}
            </p>
            <span className="block w-16 h-1 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] rounded-full mx-auto mb-6" />

            {/* Inputs */}
            <label className="block text-sm font-semibold text-[#1F2837] mb-1 tracking-wide">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 mb-4 text-[#1F2837] placeholder-[#7A8596] focus:ring-2 focus:ring-[#E6C26E] focus:outline-none"
              placeholder="My 30th Birthday"
            />

            <label className="block text-sm font-semibold text-[#1F2837] mb-1 tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 mb-4 text-[#1F2837] placeholder-[#7A8596] focus:ring-2 focus:ring-[#E6C26E] focus:outline-none"
              placeholder="Write a short message for your future self..."
            />

            <label className="block text-sm font-semibold text-[#1F2837] mb-1 tracking-wide flex items-center gap-1">
              <CalendarDays className="w-4 h-4 text-[#E6C26E]" /> Unlock Date
            </label>

            <div className="relative mb-1">
              {!unlockDate && (
                <span className="absolute left-3 top-2.5 text-[#7A8596] pointer-events-none select-none sm:hidden">
                  DD/MM/YYYY
                </span>
              )}
              <input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 text-[#1F2837] focus:ring-2 focus:ring-[#E6C26E] focus:outline-none uppercase bg-transparent"
                min={new Date().toISOString().split('T')[0]}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <p className="text-center text-[#7A8596] text-xs italic mb-4">
              Choose a date in the future
            </p>

            {/* Cover Image */}
            <label className="block text-sm font-semibold text-[#1F2837] mb-2 tracking-wide flex items-center gap-1">
              <ImagePlus className="w-4 h-4 text-[#E6C26E]" /> Cover Image (optional)
            </label>
            <div
              ref={dropRef}
              onClick={() => document.getElementById('capsuleCoverInput')?.click()}
              className="w-full h-[120px] sm:h-[140px] md:h-[150px] border-2 border-dashed border-[#E6C26E]/60 rounded-xl flex items-center justify-center text-[#1F2837]/70 hover:text-[#1F2837] hover:shadow-[0_0_10px_rgba(230,194,110,0.4)] transition cursor-pointer overflow-hidden mb-6 bg-white"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <span>Drag & drop or click to upload</span>
              )}
              <input
                id="capsuleCoverInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2 rounded-full border border-[#E6C26E]/40 text-[#1F2837] font-medium hover:bg-[#F9F7F2] transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !unlockDate || loading}
                className={`w-full sm:w-auto px-6 py-2 rounded-full font-semibold text-[#1F2837] transition-all shadow-md ${
                  !title.trim() || !unlockDate || loading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] hover:shadow-[0_0_15px_rgba(230,194,110,0.6)] hover:scale-[1.02]'
                }`}
              >
                {loading
             ? 'Saving…'
             : mode === 'edit'
             ? 'Save Changes'
             : 'Create Capsule ✨'}
              </button>
            </div>

            <style jsx>{`
              @keyframes shimmer {
                0% {
                  background-position: -200% 0;
                }
                100% {
                  background-position: 200% 0;
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
