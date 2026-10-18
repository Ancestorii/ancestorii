'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Camera, ImagePlus, X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { Logo } from '@/components/landing/LandingBits';
import {
  ui,
  appRoot,
  Accent,
  AppLoader,
  Btn,
  Eyebrow,
  IconBtn,
  IconTile,
  Spinner,
  toneByKey,
} from '@/components/dashboard/ui/AppBits';
import s from './firstMemory.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type PendingPhoto = { id: string; file: File; preview: string };

export default function FirstMemoryPage() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [familyName, setFamilyName] = useState('');
  // While a photo is dragged over a drop zone (the zone highlights).
  const [dragging, setDragging] = useState(false);
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

  // Labels tied to their fields.
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const init = async () => {
      // The middleware has already checked the cookie, so the local session gives the id
      // without a round trip; the two lookups then run together instead of one after the other.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        router.replace('/login');
        return;
      }

      const [{ data: profile }, { data: membership }] = await Promise.all([
        supabase
          .from('Profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('family_memberships')
          .select('family_id, families(name)')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle(),
      ]);

      if (profile?.onboarding_complete) {
        router.replace('/dashboard/home');
        return;
      }

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
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Not authenticated');
      if (!familyId) {
        // The sign-up trigger normally creates the family; without one the insert would fail
        // with a database message, so say it plainly instead.
        throw new Error(
          "We couldn't find your family library. Please log out and back in, or email support@ancestorii.com."
        );
      }

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
      <div className={cx(appRoot, s.loading)}>
        <AppLoader />
      </div>
    );
  }

  return (
    <div className={cx(appRoot, s.page)}>
      {/* ── Compact header ── */}
      <div className={s.top}>
        <Logo href="/" />
      </div>

      <main className={s.main}>
        {/* ── Headline ── */}
        <header className={cx(ui.header, s.intro)}>
          <div className={ui.headerGlow} aria-hidden="true" />
          <Eyebrow dot="var(--c0)">Private memory</Eyebrow>
          <h1 className={s.title}>
            Write your first <Accent>memory</Accent>
          </h1>
          <p className={s.lead}>
            Start {familyName || 'your family'} with something simple: a moment you
            don&apos;t want to lose.
          </p>
        </header>

        {/* ── Main card ── */}
        <div className={cx(ui.card, ui.cardLift, s.card)}>

          {/* ── Photos (top of card) ── */}
          {photos.length > 0 ? (
            <div>
              <ul
                role="list"
                className={cx(
                  s.photos,
                  'grid gap-2.5',
                  photos.length === 1
                    ? 'grid-cols-1'
                    : photos.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3'
                )}
              >
                {photos.map((photo) => (
                  <li
                    key={photo.id}
                    className={cx(
                      s.tile,
                      photos.length === 1
                        ? 'aspect-[16/9]'
                        : 'aspect-square'
                    )}
                  >
                    <Image
                      src={photo.preview}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 540px, 100vw"
                      className={s.tileImg}
                    />
                    {!submitting && (
                      <IconBtn
                        label="Remove photo"
                        size="sm"
                        onPhoto
                        onClick={() => removePhoto(photo.id)}
                        className={s.tileRemove}
                      >
                        <X size={15} strokeWidth={2.6} aria-hidden="true" />
                      </IconBtn>
                    )}
                  </li>
                ))}
              </ul>

              {/* Add more strip */}
              {photos.length < 10 && (
                <label
                  className={cx(ui.dropzone, s.addMore, (processing || dragging) && ui.dropzoneActive)}
                  onDragOver={(e) => { e.preventDefault(); if (!dragging) setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    // Without this, a photo dropped here opened in the tab and the text typed so far was lost.
                    e.preventDefault();
                    setDragging(false);
                    if (!processing && e.dataTransfer.files?.length) addPhotos(e.dataTransfer.files);
                  }}
                >
                  {processing ? (
                    <Spinner size={18} />
                  ) : (
                    <ImagePlus size={18} strokeWidth={2.4} aria-hidden="true" />
                  )}
                  <span className={s.addMoreText}>
                    {processing ? 'Processing…' : 'Add more photos'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.heic"
                    multiple
                    className={ui.srOnly}
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
          ) : (
            /* Empty state: large inviting upload area */
            <label
              className={cx(ui.dropzone, s.drop, (processing || dragging) && ui.dropzoneActive)}
              onDragOver={(e) => { e.preventDefault(); if (!dragging) setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                // Without this, a photo dropped here opened in the tab and the text typed so far was lost.
                e.preventDefault();
                setDragging(false);
                if (!processing && e.dataTransfer.files?.length) addPhotos(e.dataTransfer.files);
              }}
            >
              {processing ? (
                <>
                  <span className={s.dropSpin}>
                    <Spinner size={26} />
                  </span>
                  <span className={ui.dropzoneTitle}>
                    Processing…
                  </span>
                </>
              ) : (
                <>
                  <IconTile Icon={Camera} tone={toneByKey('orange')} size="lg" />
                  <span className={ui.dropzoneTitle}>
                    Start with a photo
                  </span>
                  <span className={ui.dropzoneHint}>
                    JPG, PNG or HEIC. Up to 10
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*,.heic"
                multiple
                className={ui.srOnly}
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
            <p className={cx(ui.noticeWarn, s.notice)}>{photoLimitNotice}</p>
          )}

          {/* ── Form ── */}
          <div className={s.fields}>
            {/* Title */}
            <div className={ui.field}>
              <label htmlFor={titleId} className={ui.label}>
                Title
              </label>
              <input
                id={titleId}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunday mornings with Nan"
                maxLength={200}
                className={ui.input}
              />
            </div>

            {/* Body */}
            <div className={ui.field}>
              <label htmlFor={bodyId} className={ui.label}>
                Your memory
              </label>
              <textarea
                id={bodyId}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a few sentences about this memory. What happened? Who was there? How did it feel?"
                rows={5}
                className={cx(ui.textarea, 'resize-none')}
              />
            </div>
          </div>

          {error && (
            <p className={cx(ui.noticeError, s.error)} role="alert">
              {error}
            </p>
          )}

          {/* Main action: ink, with the landing's arrow tile */}
          <Btn
            size="lg"
            block
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            tile={
              submitting ? (
                <Spinner size={18} />
              ) : (
                <ArrowRight size={20} strokeWidth={2.4} />
              )
            }
            className={s.submit}
          >
            {submitting
              ? submitStep || 'Saving…'
              : 'Save & Continue'}
          </Btn>
        </div>

        <p className={s.foot}>
          This will be the first memory in {familyName || 'your family'}. It won&apos;t appear on the public feed.
        </p>
      </main>
    </div>
  );
}
