'use client';

import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanLimits } from '@/lib/usePlanLimits';


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
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (tl: Timeline) => void;
  onUpdated?: (tl: Timeline) => void;
  mode?: 'create' | 'edit';
  timeline?: Timeline | null;
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

  const { loading: limitsLoading, canCreate, limits, counts } = usePlanLimits();

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

  const handleSubmit = async () => {
    if (isSubmittingRef.current || !title.trim()) return;
    isSubmittingRef.current = true;
    setUploading(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user) throw new Error('Not signed in');

     if (mode === 'create') {
  if (limitsLoading) {
    toast.error('Checking plan limits…');
    setUploading(false);
    isSubmittingRef.current = false;
    return;
  }

  if (!canCreate.timeline) {
    toast.error(
      `Timeline limit reached (${counts?.timelines} / ${limits?.max_timelines})`
    );
    setUploading(false);
    isSubmittingRef.current = false;
    return;
  }
}



      let uploadedPath: string | null = null;
      if (coverFile) {
        const sanitized = coverFile.name.replace(/\s+/g, '_');
        const path = `${user.id}/timeline-covers/${crypto.randomUUID()}_${sanitized}`;
        const { error: upErr } = await supabase
          .storage
          .from('timeline-media')
          .upload(path, coverFile, { upsert: true });
        if (upErr) throw upErr;
        uploadedPath = path;
      }

      const coverPath = uploadedPath ?? timeline?.cover_path ?? null;


      const payload = {
         owner_id: user.id,  
         title: title.trim(),
         description: description.trim() || null,
         cover_path: coverPath,
      };
      if (mode === 'edit' && timeline) {
        const { data, error } = await supabase
          .from('timelines')
          .update(payload)
          .eq('id', timeline.id)
          .select()
          .single();
        if (error) throw error;
        onUpdated?.(data);
        toast.success('Timeline updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('timelines')
          .insert(payload)
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
          className="fixed inset-0 bg-[#0B0C10]/70 backdrop-blur-sm flex items-center justify-center z-50"
        >
          {uploading && (
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
                onClose();
              }}
              className="absolute top-4 right-4 text-[#1F2837]/70 hover:text-[#1F2837] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <h2 className="text-3xl font-bold text-[#1F2837] mb-2 text-center">
              Start Your Legacy
            </h2>
            <p className="text-sm text-[#7A8596] text-center mb-6 italic">
              Give your timeline a name and a story. The moments you save here will live forever.
            </p>
            <span className="block w-16 h-1 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] rounded-full mx-auto mb-6" />

            {/* Inputs */}
            <label className="block text-sm font-semibold text-[#1F2837] mb-1 tracking-wide">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'My Life Journey')}
              className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 mb-4 text-[#1F2837] placeholder-[#7A8596] focus:ring-2 focus:ring-[#E6C26E] focus:outline-none"
              placeholder="My Life Journey"
            />

            <label className="block text-sm font-semibold text-[#1F2837] mb-1 tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'Write a short description...')}
              rows={3}
              className="w-full border border-[#E6C26E]/50 rounded-lg px-3 py-2 mb-4 text-[#1F2837] placeholder-[#7A8596] focus:ring-2 focus:ring-[#E6C26E] focus:outline-none"
              placeholder="Write a short description..."
            />

            <label className="block text-sm font-semibold text-[#1F2837] mb-2 tracking-wide flex items-center gap-1">
              <ImagePlus className="w-4 h-4 text-[#E6C26E]" /> Cover image (optional)
            </label>
            <div
              ref={dropRef}
              onClick={() => document.getElementById('timelineCoverInput')?.click()}
              className="w-full aspect-[16/9] border-2 border-dashed border-[#E6C26E]/60 rounded-xl flex items-center justify-center text-[#1F2837]/70 hover:text-[#1F2837] hover:shadow-[0_0_10px_rgba(230,194,110,0.4)] transition cursor-pointer overflow-hidden mb-6 bg-white"
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
                id="timelineCoverInput"
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
                onClick={onClose}
                disabled={uploading}
                className="w-full sm:w-auto px-5 py-2 rounded-full border border-[#E6C26E]/40 text-[#1F2837] font-medium hover:bg-[#F9F7F2] transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={!title.trim() || uploading}
                type="button"
                className={`w-full sm:w-auto px-6 py-2 rounded-full font-semibold text-[#1F2837] transition-all shadow-md ${
                  !title.trim() || uploading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] hover:shadow-[0_0_15px_rgba(230,194,110,0.6)] hover:scale-[1.02]'
                }`}
              >
                {uploading
                  ? 'Saving…'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : 'Create My Timeline ✨'}
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
