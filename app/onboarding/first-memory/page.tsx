'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';

type PendingPhoto = { id: string; file: File; preview: string };

export default function FirstMemoryPage() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [familyName, setFamilyName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('Profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_complete) {
        router.replace('/dashboard/home');
        return;
      }

      const { data: membership } = await supabase
        .from('family_memberships')
        .select('family_id, families(name)')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        setFamilyId(membership.family_id);
        setFamilyName(
          (membership as any).families?.name || 'Your Family'
        );
      }

      setLoading(false);
    };
    init();
  }, []);

  const addPhotos = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter(
        (f) =>
          f.type.startsWith('image/') ||
          f.name.toLowerCase().endsWith('.heic')
      );
      if (arr.length === 0) return;

      setProcessing(true);
      try {
        const remaining = 10 - photos.length;
        const capped = arr.slice(0, remaining);
        const converted = await Promise.all(
          capped.map((f) => ensureDisplayableImage(f))
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

  const canSubmit =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    photos.length > 0;

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
      const { data: memory, error: memoryError } = await supabase
        .from('family_memories')
        .insert({
          family_id: familyId,
          author_id: user.id,
          title: title.trim(),
          body: body.trim(),
          is_onboarding: true,
        })
        .select('id')
        .single();

      if (memoryError) throw memoryError;

      for (let i = 0; i < photos.length; i++) {
        setSubmitStep(
          `Uploading photo ${i + 1}/${photos.length}…`
        );

        const ext = photos[i].file.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${memory.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('memory-media')
          .upload(filePath, photos[i].file);

        if (uploadError) throw uploadError;

        const { error: mediaError } = await supabase
          .from('family_memory_media')
          .insert({
            memory_id: memory.id,
            family_id: familyId,
            user_id: user.id,
            file_path: filePath,
            file_type: 'image',
            display_order: i,
          });

        if (mediaError) throw mediaError;
      }

      setSubmitStep('Almost there…');
      await supabase
        .from('Profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);

      router.replace('/onboarding/share');
    } catch (err: any) {
      setError(
        err?.message || 'Something went wrong. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <Loader2 className="animate-spin text-[#B8932A]" size={24} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 sm:px-8 pt-10 sm:pt-14 md:pt-16 pb-12"
      style={{
        background: '#FFFDF8',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Link
        href="/"
        className="inline-block text-[34px] sm:text-[38px] tracking-[-0.03em] text-[#181512] no-underline mb-4"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
        }}
      >
        Ancestor<span className="text-[#C8A557]">ii</span>
      </Link>

      <h2
        className="text-[26px] sm:text-[30px] tracking-[-0.03em] text-[#181512] leading-[1.05] text-center mb-2"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
        }}
      >
        Write your first{' '}
        <span className="italic text-[#A9782F]">memory.</span>
      </h2>
      <p className="text-[13px] text-[#8A7F72] text-center mb-5 max-w-[380px] leading-relaxed">
        Start {familyName} with something simple — a moment, a
        person, a feeling you don&apos;t want to lose.
      </p>

      <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2.5 bg-[#F0EDE8] rounded-full max-w-fit mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A7F72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span className="text-[12px] font-medium text-[#6F6255] tracking-[0.01em]">This memory is private — only your family can see it</span>
      </div>

      <div className="w-full max-w-[560px]">
        <div className="border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10 space-y-6">
          {/* Title */}
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

          {/* Body */}
          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
              Your memory
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a few sentences about this memory. What happened? Who was there? How did it feel?"
              rows={6}
              className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A] resize-none leading-relaxed"
              style={{ background: '#FDFCFA' }}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
              Photos{' '}
              <span className="text-[#B5AFA6] font-normal">
                (at least one)
              </span>
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden bg-[#F0EDE8] border border-[#ECE5D8]"
                  >
                    <Image
                      src={photo.preview}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    {!submitting && (
                      <button
                        onClick={() => removePhoto(photo.id)}
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
                className={`flex flex-col items-center justify-center border-2 border-dashed px-5 py-6 cursor-pointer transition-all ${
                  processing
                    ? 'border-[#B8932A] bg-[#FBF7EE]'
                    : 'border-[#E0D6C8] bg-[#FDFCFA] hover:border-[#B8932A]'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2
                      size={24}
                      className="animate-spin text-[#B8932A] mb-2"
                    />
                    <p className="text-[13px] font-medium text-[#B8932A]">
                      Processing…
                    </p>
                  </>
                ) : (
                  <>
                    <ImagePlus
                      size={24}
                      className="text-[#B8932A] mb-2"
                    />
                    <p className="text-[13px] font-medium text-[#4A4030]">
                      {photos.length > 0
                        ? 'Add more photos'
                        : 'Tap to add photos'}
                    </p>
                    <p className="text-[11px] text-[#B5AFA6] mt-0.5">
                      JPG, PNG, or HEIC
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.heic"
                  multiple
                  hidden
                  disabled={processing}
                  onChange={(e) => {
                    if (e.target.files?.length)
                      addPhotos(e.target.files);
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
            className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40"
            style={{
              background:
                'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)',
            }}
          >
            {submitting
              ? submitStep || 'Saving…'
              : 'Save & Continue'}
          </button>
        </div>

        <p className="text-center text-[11px] text-[#B5AFA6] tracking-[0.04em] mt-5">
          This will be the first memory in {familyName}. It won&apos;t appear on the public feed.
        </p>
      </div>
    </div>
  );
}