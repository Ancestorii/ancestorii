'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ImagePlus, X, Loader2, Lock, Camera } from 'lucide-react';
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
  const [photoLimitNotice, setPhotoLimitNotice] = useState('');

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
        setPhotoLimitNotice(
          arr.length > remaining
            ? "You can add up to 10 photos. The rest weren't added."
            : ''
        );
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#B8932A]" size={24} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-white px-5 sm:px-8 pt-8 sm:pt-12 pb-12"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Compact header ── */}
      <Link
        href="/"
        className="inline-block text-[30px] sm:text-[34px] tracking-[-0.03em] text-[#181512] no-underline mb-6"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
        }}
      >
        Ancestor<span className="text-[#C8A557]">ii</span>
      </Link>

      <div className="w-full max-w-[560px]">

        {/* ── Main card ── */}
        <div className="border border-[#E8E2D6] bg-white overflow-hidden">

          {/* ── PHOTO HERO ZONE (top of card) ── */}
          <div className="bg-[#F5F0E5]">
            {photos.length > 0 ? (
              <div>
                {/* Photo grid inside warm background */}
                <div className="p-4">
                  <div className={`grid gap-2 ${
                    photos.length === 1
                      ? 'grid-cols-1'
                      : photos.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}>
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`group relative overflow-hidden bg-[#E8E0D0] ${
                          photos.length === 1
                            ? 'aspect-[16/9]'
                            : 'aspect-square'
                        }`}
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
                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-[#181512]/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add more strip */}
                  {photos.length < 10 && (
                    <label className="flex items-center justify-center gap-2 mt-3 py-2.5 border border-dashed border-[#C8B898] cursor-pointer hover:border-[#B8932A] transition-colors">
                      <ImagePlus size={14} className="text-[#B8932A]" />
                      <span className="text-[12px] font-medium text-[#6F6255]">
                        Add more photos
                      </span>
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
              </div>
            ) : (
              /* Empty state — large inviting upload area */
              <label
                className={`flex flex-col items-center justify-center py-16 sm:py-20 cursor-pointer transition-all ${
                  processing ? '' : 'hover:bg-[#F0E9D8]'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2
                      size={28}
                      className="animate-spin text-[#B8932A] mb-3"
                    />
                    <p className="text-[14px] font-medium text-[#B8932A]">
                      Processing…
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-14 h-14 bg-white border border-[#D4C9B2] mb-4">
                      <Camera size={24} className="text-[#B8932A]" />
                    </div>
                    <p className="text-[15px] font-semibold text-[#2A2318] mb-1">
                      Start with a photo
                    </p>
                    <p className="text-[12px] text-[#9C9488]">
                      JPG, PNG, or HEIC — up to 10
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
            {photoLimitNotice && (
              <p className="mt-3 text-[12px] text-[#A9782F]">{photoLimitNotice}</p>
            )}
          </div>

          {/* ── FORM SECTION ── */}
          <div className="px-7 py-8 sm:px-9 sm:py-10">

            {/* Headline inside the card */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={10} className="text-[#C8A557]" />
                <span className="text-[10px] font-semibold text-[#C8A557] tracking-[0.1em] uppercase">
                  Private memory
                </span>
              </div>
              <h2
                className="text-[24px] sm:text-[28px] tracking-[-0.03em] text-[#181512] leading-[1.1] mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                }}
              >
                Write your first{' '}
                <span className="italic text-[#A9782F]">memory</span>
              </h2>
              <p className="text-[13px] text-[#8A7F72] leading-relaxed">
                Start {familyName} with something simple — a moment you
                don&apos;t want to lose.
              </p>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A4030] mb-1.5 tracking-[0.04em] uppercase">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunday mornings with Nan"
                  maxLength={200}
                  className="w-full border border-[#E2DCD2] bg-[#FAFAF7] px-4 py-3 text-[14px] text-[#181512] placeholder-[#C5BEB2] focus:outline-none focus:border-[#B8932A] focus:ring-2 focus:ring-[#B8932A]/12 focus:bg-white transition-all"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A4030] mb-1.5 tracking-[0.04em] uppercase">
                  Your memory
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a few sentences about this memory. What happened? Who was there? How did it feel?"
                  rows={5}
                  className="w-full border border-[#E2DCD2] bg-[#FAFAF7] px-4 py-3 text-[14px] text-[#181512] placeholder-[#C5BEB2] focus:outline-none focus:border-[#B8932A] focus:ring-2 focus:ring-[#B8932A]/12 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              {error && (
                <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3">
                  <p className="text-[13px] text-[#8B3A32]">{error}</p>
                </div>
              )}

              {/* Gold gradient CTA with depth */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full py-3.5 text-[13px] font-bold tracking-[0.06em] uppercase text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-30"
                style={{
                  background: 'linear-gradient(180deg, #C8A557 0%, #A88530 100%)',
                  boxShadow: canSubmit && !submitting
                    ? '0 2px 8px rgba(184, 147, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : 'none',
                }}
              >
                {submitting
                  ? submitStep || 'Saving…'
                  : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#B5AFA6] tracking-[0.02em] mt-5">
          This will be the first memory in {familyName}. It won&apos;t appear on the public feed.
        </p>
      </div>
    </div>
  );
}