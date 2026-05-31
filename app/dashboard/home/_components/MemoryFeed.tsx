'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MessageSquarePlus,
  BookOpen,
  PenLine,
  ImagePlus,
  X,
  Loader2,
  Send,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';
import MemoryCard from './MemoryCard';

type PendingPhoto = { id: string; file: File; preview: string };

export type FeedMemory = {
  id: string;
  title: string;
  body: string;
  author_name: string;
  author_avatar_url: string | null;
  cover_url: string | null;
  voice_note_path: string | null;
  reaction_count: number;
  comment_count: number;
  tab_count: number;
  created_at: string;
};

export default function MemoryFeed({
  initialMemories,
  familyName,
  familyId,
}: {
  initialMemories: FeedMemory[];
  familyName: string;
  familyId: string;
}) {
  const router = useRouter();
  const [showWriteModal, setShowWriteModal] = useState(false);

  if (initialMemories.length === 0) {
    return (
      <>
        <div className="w-full px-4 sm:px-6 py-16">
          <div className="mx-auto max-w-[440px] text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDD8]">
              <BookOpen className="h-7 w-7 text-[#A9782F]" strokeWidth={1.5} />
            </div>
            <h3
              className="text-[24px] text-[#17120E] leading-[1.15]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
              }}
            >
              Your family&apos;s memories{' '}
              <span className="italic text-[#A9782F]">start here.</span>
            </h3>
            <p className="mt-3 text-[14px] text-[#7D6F5F] leading-relaxed">
              Write a memory or send a question to a family member. Their answer will appear in your feed.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowWriteModal(true)}
                className="px-5 py-2.5 text-[13px] font-semibold text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}
              >
                Write a memory
              </button>
              <button
                onClick={() => router.push('/dashboard/prompts')}
                className="px-5 py-2.5 text-[13px] font-semibold text-[#4A4030] border border-[#ECE5D8] transition-all hover:border-[#B8932A]"
              >
                Ask a question
              </button>
            </div>
          </div>
        </div>

        {showWriteModal && (
          <WriteMemoryModal
            familyId={familyId}
            onClose={() => setShowWriteModal(false)}
            onSuccess={() => {
              setShowWriteModal(false);
              router.refresh();
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-[640px] space-y-5">
          {/* Write a memory card */}
          <div
            className="rounded-[16px] border border-dashed border-[#DCC7A4] bg-[#FFFDF9] px-5 py-4 flex items-center gap-4 cursor-pointer transition hover:border-[#C8A557] hover:shadow-sm"
            onClick={() => setShowWriteModal(true)}
          >
            <div className="h-10 w-10 rounded-full bg-[#F5EDD8] flex items-center justify-center flex-shrink-0">
              <PenLine
                className="h-5 w-5 text-[#A9782F]"
                strokeWidth={1.6}
              />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#17120E]">
                Write a memory
              </p>
              <p className="text-[12px] text-[#7D6F5F] mt-0.5">
                A moment, a person, a feeling you don&apos;t want to lose
              </p>
            </div>
          </div>

          {/* Ask a question card */}
          <div
            className="rounded-[16px] border border-dashed border-[#DCC7A4] bg-[#FFFDF9] px-5 py-4 flex items-center gap-4 cursor-pointer transition hover:border-[#C8A557] hover:shadow-sm"
            onClick={() => router.push('/dashboard/prompts')}
          >
            <div className="h-10 w-10 rounded-full bg-[#F5EDD8] flex items-center justify-center flex-shrink-0">
              <MessageSquarePlus
                className="h-5 w-5 text-[#A9782F]"
                strokeWidth={1.6}
              />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#17120E]">
                Ask your family a question
              </p>
              <p className="text-[12px] text-[#7D6F5F] mt-0.5">
                Send a memory prompt and their answer appears here
              </p>
            </div>
          </div>

          {/* Feed */}
          {initialMemories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      </div>

      {showWriteModal && (
        <WriteMemoryModal
          familyId={familyId}
          onClose={() => setShowWriteModal(false)}
          onSuccess={() => {
            setShowWriteModal(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WRITE MEMORY MODAL
   ═══════════════════════════════════════════════════════════════ */

function WriteMemoryModal({
  familyId,
  onClose,
  onSuccess,
}: {
  familyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = getBrowserClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [error, setError] = useState('');

  const addPhotos = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter(
        (f) => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic')
      );
      if (!arr.length) return;
      setProcessing(true);
      try {
        const converted = await Promise.all(
          arr.slice(0, 10 - photos.length).map((f) => ensureDisplayableImage(f))
        );
        setPhotos((prev) => [
          ...prev,
          ...converted.map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            preview: URL.createObjectURL(file),
          })),
        ]);
      } finally {
        setProcessing(false);
      }
    },
    [photos.length]
  );

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setSubmitStep('Saving your memory…');
      const { data: memory, error: memErr } = await supabase
        .from('family_memories')
        .insert({
          family_id: familyId,
          author_id: user.id,
          title: title.trim(),
          body: body.trim(),
        })
        .select('id')
        .single();

      if (memErr) throw memErr;

      for (let i = 0; i < photos.length; i++) {
        setSubmitStep(`Uploading photo ${i + 1}/${photos.length}…`);
        const ext = photos[i].file.name.split('.').pop() || 'jpg';
        const filePath = `${familyId}/${memory.id}/${Date.now()}-${i}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('memory-media')
          .upload(filePath, photos[i].file);
        if (upErr) throw upErr;

        await supabase.from('family_memory_media').insert({
          memory_id: memory.id,
          family_id: familyId,
          user_id: user.id,
          file_path: filePath,
          file_type: 'image',
          display_order: i,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />
      <div
        className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-white border border-[#EAD8B8] shadow-xl"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3
              className="text-[20px] font-semibold text-[#1A1612]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
            >
              Write a <span className="italic text-[#A9782F]">memory</span>
            </h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"
            >
              <X size={16} className="text-[#7D6F5F]" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#F0EDE8] rounded-full max-w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A7F72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="text-[11px] font-medium text-[#6F6255]">Private — only your family can see this</span>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunday mornings with Nan"
              maxLength={200}
              className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
              style={{ background: '#FDFCFA' }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
              Your memory
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened? Who was there? How did it feel?"
              rows={5}
              className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A] resize-none leading-relaxed"
              style={{ background: '#FDFCFA' }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
              Photos <span className="text-[#B5AFA6] font-normal">(optional)</span>
            </label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="group relative aspect-square overflow-hidden bg-[#F0EDE8] border border-[#ECE5D8]"
                  >
                    <Image src={p.preview} alt="" fill className="object-cover" />
                    {!submitting && (
                      <button
                        onClick={() => removePhoto(p.id)}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center bg-white/90 text-[#8B3A32] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {photos.length < 10 && (
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed px-5 py-4 cursor-pointer transition-all ${
                  processing
                    ? 'border-[#B8932A] bg-[#FBF7EE]'
                    : 'border-[#E0D6C8] bg-[#FDFCFA] hover:border-[#B8932A]'
                }`}
              >
                {processing ? (
                  <Loader2 size={20} className="animate-spin text-[#B8932A] mb-1" />
                ) : (
                  <ImagePlus size={20} className="text-[#B8932A] mb-1" />
                )}
                <p className="text-[12px] font-medium text-[#4A4030]">
                  {processing ? 'Processing…' : photos.length > 0 ? 'Add more' : 'Add a photo'}
                </p>
                <input
                  type="file"
                  accept="image/*,.heic"
                  multiple
                  hidden
                  disabled={processing}
                  onChange={(e) => {
                    if (e.target.files?.length) addPhotos(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>

          {error && (
            <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3">
              <p className="text-[13px] text-[#8B3A32]">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitting ? submitStep || 'Saving…' : 'Share your memory'}
          </button>
        </div>
      </div>
    </div>
  );
}