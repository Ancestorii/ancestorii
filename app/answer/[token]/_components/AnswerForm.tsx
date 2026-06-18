'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ImagePlus, X, Loader2, Send } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';

type PendingPhoto = { id: string; file: File; preview: string };

type Props = {
  token: string;
  question: string;
  senderName: string;
  senderId: string;
  familyName: string;
  recipientName: string;
  parentMemory: {
    title: string;
    body: string;
    photo_url: string | null;
  } | null;
  sentPromptId: string;
  familyId: string;
  promptId: string | null;
  parentMemoryId: string | null;
  inviteToken: string | null;
};

export default function AnswerForm({
  question,
  senderName,
  senderId,
  familyName,
  recipientName,
  parentMemory,
  sentPromptId,
  familyId,
  promptId,
  parentMemoryId,
  inviteToken,
}: Props) {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [isFamilyMember, setIsFamilyMember] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [processing, setProcessing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [error, setError] = useState('');
  const [photoLimitNotice, setPhotoLimitNotice] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        setAuthState('authenticated');

        const { data: membership } = await supabase
          .from('family_memberships')
          .select('id')
          .eq('user_id', user.id)
          .eq('family_id', familyId)
          .maybeSingle();

        setIsFamilyMember(!!membership);
      } else {
        setAuthState('unauthenticated');
      }
    };
    checkAuth();
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

  const canSubmit = body.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      let userId = currentUserId;

      // ── SIGNUP ──
      if (authState === 'unauthenticated') {
        if (
          !fullName.trim() ||
          !email.trim() ||
          !password.trim()
        ) {
          setError(
            'Please fill in your name, email, and password.'
          );
          setSubmitting(false);
          return;
        }

        setSubmitStep('Creating your account…');
        const { error: signUpError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                invite_token: inviteToken,
              },
            },
          });

        if (signUpError) throw signUpError;

        await new Promise((res) => setTimeout(res, 500));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user)
          throw new Error(
            'Account created but session not found. Please try logging in.'
          );
        userId = user.id;
      }

      // ── JOIN FAMILY (anyone not yet a member) ──
      if (inviteToken) {
        const { data: memberCheck } = await supabase
          .from('family_memberships')
          .select('id')
          .eq('user_id', userId)
          .eq('family_id', familyId)
          .maybeSingle();

        if (!memberCheck) {
          setSubmitStep('Joining the family…');
          const joinRes = await fetch('/api/accept-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: inviteToken }),
          });
          if (!joinRes.ok) {
            const joinData = await joinRes.json().catch(() => ({}));
            throw new Error(joinData.error || 'Could not join the family. Please try again.');
          }
          await new Promise((res) => setTimeout(res, 500));
        }
      }

      // ── CREATE MEMORY ──
      setSubmitStep('Saving your memory…');
      const { data: memory, error: memoryError } = await supabase
        .from('family_memories')
        .insert({
          family_id: familyId,
          author_id: userId,
          title: question,
          body: body.trim(),
          prompt_id: promptId,
          parent_memory_id: parentMemoryId,
        })
        .select('id')
        .single();

      if (memoryError) throw memoryError;

      // ── UPLOAD PHOTOS ──
      for (let i = 0; i < photos.length; i++) {
        setSubmitStep(
          `Uploading photo ${i + 1}/${photos.length}…`
        );
        const ext =
          photos[i].file.name.split('.').pop() || 'jpg';
        const filePath = `${userId}/${memory.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('memory-media')
          .upload(filePath, photos[i].file);

        if (uploadError) throw uploadError;

        await supabase.from('family_memory_media').insert({
          memory_id: memory.id,
          family_id: familyId,
          user_id: userId,
          file_path: filePath,
          file_type: 'image',
          display_order: i,
        });
      }

      // ── UPDATE SENT PROMPT ──
      setSubmitStep('Almost there…');
      await supabase
        .from('sent_prompts')
        .update({
          status: 'answered',
          response_memory_id: memory.id,
          answered_at: new Date().toISOString(),
        })
        .eq('id', sentPromptId);

      // ── NOTIFY SENDER ──
      if (senderId && senderId !== userId) {
        try {
          await supabase.from('notifications').insert({
            user_id: senderId,
            type: 'prompt_answered',
            actor_id: userId,
            target_id: memory.id,
            target_type: 'family_memory',
          });
        } catch {}
      }

      // ── MARK ONBOARDING COMPLETE ──
      await supabase
        .from('Profiles')
        .update({ onboarding_complete: true })
        .eq('id', userId);

      // ── DONE ──
      router.replace('/dashboard/home');
    } catch (err: any) {
      setError(
        err?.message || 'Something went wrong. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <Loader2
          className="animate-spin text-[#B8932A]"
          size={24}
        />
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
        className="inline-block text-[34px] sm:text-[38px] tracking-[-0.03em] text-[#181512] no-underline mb-8"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
        }}
      >
        Ancestor<span className="text-[#C8A557]">ii</span>
      </Link>

      <div className="w-full max-w-[560px]">
        {/* Who asked */}
        <p className="text-[13px] text-[#B8932A] font-medium text-center mb-1 tracking-[0.02em]">
          {senderName} asked you
        </p>

        {/* The question */}
        <h1
          className="text-[24px] sm:text-[30px] tracking-[-0.03em] text-[#181512] leading-[1.15] text-center mb-2"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
          }}
        >
          &ldquo;{question}&rdquo;
        </h1>

        <p className="text-[13px] text-[#8A7F72] text-center mb-8 leading-relaxed">
          Your answer will be added to {familyName}.
        </p>

        {/* Parent memory */}
        {parentMemory && (
          <div className="border border-[#ECE5D8] bg-white mb-6 overflow-hidden">
            {parentMemory.photo_url && (
              <div className="relative h-[180px] bg-[#F0EDE8]">
                <Image
                  src={parentMemory.photo_url}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="px-5 py-4">
              <p className="text-[11px] font-medium text-[#B8932A] uppercase tracking-[0.1em] mb-1">
                {senderName}&apos;s memory
              </p>
              <h3
                className="text-[16px] font-semibold text-[#181512] mb-1.5"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                }}
              >
                {parentMemory.title}
              </h3>
              <p className="text-[13px] text-[#8A7F72] leading-relaxed line-clamp-3">
                {parentMemory.body}
              </p>
            </div>
          </div>
        )}

        {/* ── ANSWER FORM ── */}
        <div className="border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10 space-y-6">
          {/* Body */}
          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
              Your answer
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write what comes to mind. A few sentences is all it takes."
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
                (optional)
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
                className={`flex flex-col items-center justify-center border-2 border-dashed px-5 py-5 cursor-pointer transition-all ${
                  processing
                    ? 'border-[#B8932A] bg-[#FBF7EE]'
                    : 'border-[#E0D6C8] bg-[#FDFCFA] hover:border-[#B8932A]'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin text-[#B8932A] mb-1.5"
                    />
                    <p className="text-[12px] font-medium text-[#B8932A]">
                      Processing…
                    </p>
                  </>
                ) : (
                  <>
                    <ImagePlus
                      size={20}
                      className="text-[#B8932A] mb-1.5"
                    />
                    <p className="text-[12px] font-medium text-[#4A4030]">
                      {photos.length > 0
                        ? 'Add more'
                        : 'Add a photo'}
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
              <p className="mt-2 text-[12px] text-[#A9782F]">{photoLimitNotice}</p>
            )}
          </div>

          {/* ── SIGNUP FIELDS ── */}
          {authState === 'unauthenticated' && (
            <div className="border-t border-[#ECE5D8] pt-6">
              <p className="text-[12px] font-medium text-[#B8932A] uppercase tracking-[0.08em] mb-4">
                Create your account to save this memory
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={recipientName || ''}
                    className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                    style={{ background: '#FDFCFA' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                    style={{ background: '#FDFCFA' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      className="w-full border border-[#E0D6C8] px-3.5 py-2.5 pr-16 text-[14px] text-[#181512] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                      style={{ background: '#FDFCFA' }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((v) => !v)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#8A7F72] hover:text-[#B8932A] transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3">
              <p className="text-[13px] text-[#8B3A32]">
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            style={{
              background:
                'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)',
            }}
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitting
              ? submitStep || 'Saving…'
              : 'Share your memory'}
          </button>

          {authState === 'unauthenticated' && (
            <p className="text-center text-[11px] text-[#B5AFA6]">
              By answering, you agree to the{' '}
              <Link
                href="/terms"
                className="text-[#B8932A]"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                className="text-[#B8932A]"
              >
                Privacy Policy
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}