'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Mic,
  Square,
  Trash2,
  Play,
  Pause,
  ImagePlus,
  X,
  Send,
  Loader2,
  Upload,
  ChevronLeft,
  Eye,
  Feather,
  PenLine,
  Image as ImageIcon,
  Music,
  Check,
} from 'lucide-react';

import SiteShell from '@/components/site/SiteShell';
import { Accent, PageHero } from '@/components/site/SiteBits';
import { jakarta } from '@/components/landing/fonts';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import styles from '@/components/site/story-editor/editor.module.css';

import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast } from '@/lib/safeToast';
import { revalidateStories } from '@app/stories/revalidate';
import {
  createStory,
  updateStory,
  uploadStoryMedia,
  uploadVoiceNote,
} from '@/lib/stories/mutations';

import { ensureDisplayableImage } from '@/lib/convertImage';
import { downscaleImage } from '@/lib/stories/downscaleImage';
import { usePlanLimits } from '@/lib/usePlanLimits';
// The public-site version of the writing helper (same props and behaviour as
// @/components/StoryAssistanceCard, which the dashboard keeps using).
import StoryAssistanceCard from '@/components/site/story-editor/StoryAssistanceCard';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import { sanitizeRichTextClient } from '@/lib/richText/client';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type PendingMedia = { id: string; file: File; preview: string };
type ExistingImage = { id: string; url: string };

type EditorProps = {
  mode: 'create' | 'edit';
  storyId?: string;
  initialTitle?: string;
  initialBody?: string;
  initialStatus?: 'draft' | 'published';
  initialCategory?: string | null;
  initialExcerpt?: string;
  initialImages?: ExistingImage[];
  initialVideoUrl?: string | null;
  initialVoiceUrl?: string | null;
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { value: 'family', label: 'Family' },
  { value: 'food_and_recipes', label: 'Food & Recipes' },
  { value: 'childhood', label: 'Childhood' },
  { value: 'love', label: 'Love' },
  { value: 'life_lessons', label: 'Life Lessons' },
  { value: 'traditions', label: 'Traditions' },
  { value: 'travel', label: 'Travel' },
] as const;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// The recording preview's bars: fixed heights from a small hash of each bar's position. They
// used to be re-rolled with Math.random() on every render, so they jumped as the timer ticked.
const WAVE_BARS = Array.from({ length: 36 }, (_, i) => {
  const h = ((i + 1) * 2654435761) % 4294967296;
  const noise = (((h ^ (h >>> 15)) >>> 0) % 1000) / 1000;
  return 15 + Math.sin(i * 0.4) * 12 + noise * 8;
});

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT, the landing page's look (SiteShell frame)
   ═══════════════════════════════════════════════════════════════ */

export default function StoryEditorPage({
  mode,
  storyId: existingStoryId,
  initialTitle = '',
  initialBody = '',
  initialStatus = 'draft',
  initialCategory = null,
  initialExcerpt = '',
  initialImages = [],
  initialVideoUrl = null,
  initialVoiceUrl = null,
}: EditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [excerpt, setExcerpt] = useState(initialExcerpt);

  const [existingImages, setExistingImages] =
    useState<ExistingImage[]>(initialImages);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(initialVideoUrl);
  const [existingVoiceUrl, setExistingVoiceUrl] = useState<string | null>(
    initialVoiceUrl
  );
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [videoFile, setVideoFile] = useState<PendingMedia | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  const [storyId, setStoryId] = useState<string | null>(
    existingStoryId || null
  );

  const [status] = useState<'draft' | 'published'>(initialStatus);

  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('');
  const [uploadingMediaIndex, setUploadingMediaIndex] = useState<number>(-1);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [showPreview, setShowPreview] = useState(true);
  const [moderationFlagged, setModerationFlagged] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [photoLimitNotice, setPhotoLimitNotice] = useState('');

  const canPublish =
    title.trim().length > 0 &&
    stripHtml(body).length > 0 &&
    category !== null;

  // Unpublished work on the page: the browser asks before a refresh or a closed tab loses it,
  // and the Back button asks too.
  const dirty =
    !publishing &&
    (title.trim() !== initialTitle.trim() ||
      stripHtml(body) !== stripHtml(initialBody) ||
      excerpt.trim() !== initialExcerpt.trim() ||
      (category ?? null) !== (initialCategory ?? null) ||
      media.length > 0 ||
      !!videoFile ||
      !!voiceFile);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /* ── Media handlers ── */

  const addMedia = useCallback(
    (files: File[]) => {
      setMedia((prev) => {
        const remaining = 10 - prev.length - existingImages.length;
        if (remaining <= 0) return prev;
        const capped = files.slice(0, remaining);
        const newItems: PendingMedia[] = capped.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: URL.createObjectURL(file),
        }));
        return [...prev, ...newItems];
      });
    },
    [existingImages.length]
  );

  const removeMedia = useCallback((id: string) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const addVideo = useCallback((file: File) => {
    setVideoFile({
      id: `vid-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
    });
  }, []);

  const removeExistingImage = useCallback(async (id: string) => {
    const supabase = getBrowserClient();
    // RLS blocks silently (0 rows), so the row is checked before the thumbnail goes.
    const { data, error } = await supabase.from('story_media').delete().eq('id', id).select('id');
    if (!error && (data?.length ?? 0) > 0) {
      setExistingImages((prev) => prev.filter((img) => img.id !== id));
    } else {
      safeToast.error('This photo could not be removed. Please try again.');
    }
  }, []);

  const removeVideo = useCallback(() => {
    setVideoFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
  }, []);

  /* ── Publish ── */

  const handlePublish = async () => {
    if (!canPublish || publishing) return;
    setPublishing(true);
    setUploadingMediaIndex(-1);
    setUploadingVideo(false);
    const supabase = getBrowserClient();
    const publicUrl = (path: string) =>
      supabase.storage.from('story-media').getPublicUrl(path).data.publicUrl;

    try {
      let targetId = storyId;

      setPublishStep('Saving story…');
      if (!targetId) {
        const story = await createStory(supabase, {
          title,
          body,
          category,
          excerpt: excerpt.trim() || null,
        });
        if (!story) {
          setModerationError('Your story could not be saved. Please check your connection and try again.');
          return;
        }
        targetId = story.id;
        setStoryId(story.id);
      } else {
        const updated = await updateStory(supabase, targetId, {
          title,
          body,
          category,
          excerpt: excerpt.trim() || null,
        });
        if (!updated) {
          setModerationError('Your changes could not be saved. Please check your connection and try again.');
          return;
        }
      }

      // Photos. Each one that goes up becomes a saved photo at once, so publishing again after
      // a failure sends only the ones that are left (and never the same photo twice).
      const uploaded: { pendingId: string; id: string; path: string }[] = [];
      let failed = 0;
      for (let i = 0; i < media.length; i++) {
        setPublishStep(`Uploading photo ${i + 1}/${media.length}…`);
        setUploadingMediaIndex(i);
        const result = await uploadStoryMedia(
          supabase,
          targetId,
          media[i].file,
          existingImages.length + i
        );
        if (result) uploaded.push({ pendingId: media[i].id, ...result });
        else failed++;
      }
      setUploadingMediaIndex(-1);
      if (uploaded.length) {
        const done = new Set(uploaded.map((u) => u.pendingId));
        setExistingImages((prev) => [
          ...prev,
          ...uploaded.map((u) => ({ id: u.id, url: publicUrl(u.path) })),
        ]);
        setMedia((prev) => {
          prev.filter((m) => done.has(m.id)).forEach((m) => URL.revokeObjectURL(m.preview));
          return prev.filter((m) => !done.has(m.id));
        });
      }
      if (failed > 0) {
        setModerationError(
          `${failed === 1 ? 'One photo' : `${failed} photos`} could not be uploaded. Please try publishing again.`
        );
        return;
      }

      if (videoFile) {
        setPublishStep('Uploading video…');
        setUploadingVideo(true);
        const result = await uploadStoryMedia(
          supabase,
          targetId,
          videoFile.file,
          existingImages.length + media.length
        );
        setUploadingVideo(false);
        if (!result) {
          setModerationError('Your video could not be uploaded. Please try publishing again.');
          return;
        }
        setExistingVideoUrl(publicUrl(result.path));
        removeVideo();
      }

      if (voiceFile) {
        setPublishStep('Uploading voice note…');
        const voicePath = await uploadVoiceNote(supabase, targetId, voiceFile);
        const saved =
          !!voicePath &&
          (await updateStory(supabase, targetId, {
            voice_note_path: voicePath,
          }));
        if (!saved) {
          setModerationError('Your voice note could not be uploaded. Please try publishing again.');
          return;
        }
        setExistingVoiceUrl(publicUrl(voicePath!));
        setVoiceFile(null);
      } else if (!existingVoiceUrl && initialVoiceUrl) {
        setPublishStep('Updating voice note…');
        await updateStory(supabase, targetId, {
          voice_note_path: null,
        });
      }

      setPublishStep('Reviewing…');
      // A network failure or a non-JSON answer reads as "not published", not a hung button.
      let modData: { moderation_result?: string; error?: string } | null = null;
      try {
        const modRes = await fetch('/api/moderate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story_id: targetId }),
        });
        modData = await modRes.json();
      } catch {
        modData = null;
      }

      if (modData?.moderation_result === 'approved') {
        // The cached feed picks the story up at once instead of within the minute.
        await revalidateStories().catch(() => {});
        const { data: story } = await supabase
          .from('stories')
          .select('slug')
          .eq('id', targetId)
          .maybeSingle();

        if (story?.slug) {
          router.push(`/stories/${story.slug}`);
        } else {
          router.push('/stories');
        }
      } else if (modData?.moderation_result === 'flagged') {
        setModerationFlagged(true);
      } else {
        setModerationError(modData?.error || 'Unable to publish at this time. Please try again.');
      }
    } finally {
      setPublishing(false);
      setUploadingMediaIndex(-1);
      setUploadingVideo(false);
    }
  };

  /* ── Derived ── */

  const wordCount = stripHtml(body)
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const allImages = [
    ...existingImages.map((i) => i.url),
    ...media.map((m) => m.preview),
  ];
  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label;
  const completeness = [
    title.trim().length > 0,
    category !== null,
    stripHtml(body).length > 0,
  ].filter(Boolean).length;

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          MODERATION FEEDBACK
          Rendered beside the page frame (not inside its <main>) so the
          overlay also covers the site nav. Own landing root for the tokens.
          ═══════════════════════════════════════════════════════ */}
      {(moderationFlagged || moderationError) && (
        <div className={`${jakarta.variable} ${landing.page}`}>
          {moderationFlagged && (
            <div className={styles.overlay}>
              <div
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="story-review-title"
              >
                <div
                  className={styles.dialogTile}
                  style={{ '--tile': 'var(--c1)' } as CSSProperties}
                >
                  <Eye size={30} strokeWidth={2.4} aria-hidden="true" />
                </div>
                <h2 id="story-review-title" className={styles.dialogTitle}>
                  Your story is being reviewed
                </h2>
                <p className={styles.dialogText}>
                  Every story is checked when it&apos;s published, and yours has been passed
                  to our team to review. You&apos;ll get an email once a decision has been made.
                </p>
                <div className={styles.dialogActions}>
                  <button
                    type="button"
                    onClick={() => router.push('/stories')}
                    className={`${landing.btnPrimary} ${landing.btnShadow} ${styles.asButton}`}
                    autoFocus
                  >
                    Back to Our Stories
                    <span className={landing.arrowTile} aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {moderationError && (
            <div className={styles.overlay}>
              <div
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="story-error-title"
              >
                <div
                  className={styles.dialogTile}
                  style={{ '--tile': 'var(--c0)' } as CSSProperties}
                >
                  <X size={30} strokeWidth={2.6} aria-hidden="true" />
                </div>
                <h2 id="story-error-title" className={styles.dialogTitle}>
                  Unable to publish
                </h2>
                <p className={styles.dialogText}>{moderationError}</p>
                <div className={styles.dialogActions}>
                  <button
                    type="button"
                    onClick={() => setModerationError(null)}
                    className={site.btnLine}
                    autoFocus
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Both editor routes send signed-out visitors to /login first, so the
          reader is always signed in here. */}
      <SiteShell isLoggedIn storiesBar>
        <PageHero
          align="left"
          size="md"
          title={
            mode === 'create' ? (
              <>
                New <Accent>Memory</Accent>
              </>
            ) : (
              <>
                Edit <Accent>Memory</Accent>
              </>
            )
          }
        />

        {/* ═══════════════════════════════════════════════════════
            TOOLBAR (sticky)
            ═══════════════════════════════════════════════════════ */}
        {/* The entrance is CSS alone (it ran from the first paint anyway), so the page is no
            longer invisible until its script has loaded. */}
        <div className={`${landing.wrap} ${styles.toolbarWrap} ${styles.rise}`}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarStart}>
              <button
                type="button"
                onClick={() => {
                  if (
                    dirty &&
                    !window.confirm('Leave this page? Your unpublished changes will be lost.')
                  ) {
                    return;
                  }
                  router.back();
                }}
                className={styles.backBtn}
                aria-label="Go back"
              >
                <ChevronLeft size={24} strokeWidth={2.4} aria-hidden="true" />
              </button>
              {wordCount > 0 && (
                <span className={styles.count}>
                  <span className={styles.countText}>
                    {wordCount} {wordCount === 1 ? 'word' : 'words'} · {readTime}{' '}
                    min read
                  </span>
                </span>
              )}
            </div>

            <div className={styles.toolbarEnd}>
              {/* Completeness: 3 segments */}
              <div className={styles.progress}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={styles.progressSeg}
                    data-done={i < completeness}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`${styles.toggle} ${showPreview ? styles.toggleOn : ''}`}
                aria-pressed={showPreview}
              >
                <Eye size={18} strokeWidth={2.4} aria-hidden="true" /> Preview
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish || publishing}
                className={`${styles.publish} ${publishing ? styles.publishBusy : ''}`}
              >
                <span className={styles.publishLabel}>
                  {publishing
                    ? publishStep || 'Publishing…'
                    : status === 'published'
                    ? 'Update'
                    : 'Publish'}
                </span>
                <span className={styles.publishTile} aria-hidden="true">
                  {publishing ? (
                    <Loader2 size={18} strokeWidth={2.6} className={styles.spin} />
                  ) : (
                    <Send size={17} strokeWidth={2.4} />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            MAIN, editor, plus the live preview on wide screens
            ═══════════════════════════════════════════════════════ */}
        <div className={`${landing.wrap} ${styles.layout} ${styles.rise}`}>
          {/* LEFT: Editor */}
          <div className={styles.editorCol}>
            {/* ═══════════════════════════════════════════
                SECTION 1. CATEGORY + TITLE
                ═══════════════════════════════════════════ */}
            <Section
              icon={<Feather size={22} strokeWidth={2.4} aria-hidden="true" />}
              title="Category & Title"
              tone="var(--c0)"
              tilt="-4deg"
            >
              <div className={styles.chips} role="group" aria-label="Category">
                {CATEGORIES.map((cat) => {
                  const active = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() =>
                        setCategory(active ? null : cat.value)
                      }
                      aria-pressed={active}
                      className={`${landing.topic} ${
                        active ? landing.topicActive : ''
                      } ${styles.chip}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              {!category &&
                title.trim().length > 0 &&
                stripHtml(body).length > 0 && (
                  <p className={styles.notice}>
                    Please select a category before publishing.
                  </p>
                )}
              <div className={styles.fields}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Summer We Spent at Nanna's House"
                  maxLength={200}
                  aria-label="Title"
                  className={`${styles.input} ${styles.titleInput}`}
                />
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short preview line (optional)…"
                  maxLength={200}
                  aria-label="A short preview line (optional)"
                  className={`${styles.input} ${styles.excerptInput}`}
                />
              </div>
            </Section>

            {/* ═══════════════════════════════════════════
                SECTION 2. WRITE YOUR STORY
                ═══════════════════════════════════════════ */}
            <Section
              icon={<PenLine size={22} strokeWidth={2.4} aria-hidden="true" />}
              title="Your Story"
              tone="var(--c1)"
              tilt="3deg"
            >
              <div className={styles.quill}>
                <QuillEditor value={body} onChange={setBody} />
              </div>
            </Section>

            {/* ═══════════════════════════════════════════
                SECTION 3. PHOTOS & VIDEO
                ═══════════════════════════════════════════ */}
            <Section
              icon={<ImageIcon size={22} strokeWidth={2.4} aria-hidden="true" />}
              title="Photos & Video"
              tone="var(--c2)"
              toneInk
              tilt="-3deg"
            >
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className={styles.thumbs}>
                  {existingImages.map((img) => (
                    <div key={img.id} className={styles.thumb}>
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="(max-width: 639px) 30vw, 170px"
                        className={styles.thumbImg}
                      />
                      {!publishing && (
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className={styles.thumbRemove}
                          aria-label="Remove photo"
                        >
                          <X size={15} strokeWidth={2.8} aria-hidden="true" />
                        </button>
                      )}
                      <span className={`${styles.savedChip} ${styles.thumbSaved}`}>
                        Saved
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* New media with upload spinners */}
              {media.length > 0 && (
                <div className={styles.thumbs}>
                  {media.map((item, idx) => {
                    const isUploading =
                      publishing && uploadingMediaIndex === idx;
                    const isUploaded =
                      publishing && uploadingMediaIndex > idx;
                    return (
                      <div key={item.id} className={styles.thumb}>
                        <Image
                          src={item.preview}
                          alt=""
                          fill
                          sizes="(max-width: 639px) 30vw, 170px"
                          className={`${styles.thumbImg} ${
                            isUploading ? styles.thumbImgBusy : ''
                          }`}
                        />
                        {isUploading && (
                          <div className={styles.thumbBusy}>
                            <span className={styles.spinDisc}>
                              <Loader2
                                size={20}
                                strokeWidth={2.6}
                                className={styles.spin}
                                aria-hidden="true"
                              />
                            </span>
                          </div>
                        )}
                        {isUploaded && (
                          <div className={styles.thumbDone}>
                            <Check size={14} strokeWidth={3.2} aria-hidden="true" />
                          </div>
                        )}
                        {!publishing && (
                          <button
                            type="button"
                            onClick={() => removeMedia(item.id)}
                            className={styles.thumbRemove}
                            aria-label="Remove photo"
                          >
                            <X size={15} strokeWidth={2.8} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {photoLimitNotice && (
                <p
                  className={styles.notice}
                  style={{ '--dot': 'var(--c2)' } as CSSProperties}
                >
                  {photoLimitNotice}
                </p>
              )}

              <div className={styles.dropGrid}>
                <PhotoUploader
                  onAdd={addMedia}
                  currentCount={existingImages.length + media.length}
                  onNotice={setPhotoLimitNotice}
                />

                {existingVideoUrl && !videoFile && (
                  <div className={styles.media}>
                    <div className={styles.mediaFrame}>
                      <video
                        src={existingVideoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className={styles.video}
                      />
                    </div>
                    <div className={styles.mediaFoot}>
                      <span className={styles.savedChip}>Saved video</span>
                    </div>
                  </div>
                )}
                {!existingVideoUrl && (
                  <VideoUploader
                    videoFile={videoFile}
                    onAdd={addVideo}
                    onRemove={removeVideo}
                    isUploading={uploadingVideo}
                  />
                )}
              </div>
            </Section>

            {/* ═══════════════════════════════════════════
                SECTION 4. VOICE NOTE (OPTIONAL)
                ═══════════════════════════════════════════ */}
            <Section
              icon={<Music size={22} strokeWidth={2.4} aria-hidden="true" />}
              title="Voice Note"
              optional
              tone="var(--c3)"
              toneInk
              tilt="4deg"
            >
              {existingVoiceUrl && !voiceFile && (
                <div className={styles.voiceCard}>
                  <audio id="existing-voice" src={existingVoiceUrl} />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(
                        'existing-voice'
                      ) as HTMLAudioElement;
                      if (el) {
                        if (el.paused) el.play();
                        else el.pause();
                      }
                    }}
                    className={styles.playBtn}
                    aria-label="Play"
                  >
                    <Play size={18} strokeWidth={2.4} className={styles.playIcon} aria-hidden="true" />
                  </button>
                  <div className={styles.voiceInfo}>
                    <p className={styles.voiceTitle}>Saved voice note</p>
                    <p className={styles.voiceNote}>Previously recorded</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExistingVoiceUrl(null)}
                    className={styles.iconBtn}
                    aria-label="Replace voice note"
                  >
                    <Trash2 size={18} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </div>
              )}
              {!existingVoiceUrl && (
                <VoiceNoteUploader
                  voiceFile={voiceFile}
                  onRecord={setVoiceFile}
                  onRemove={() => setVoiceFile(null)}
                />
              )}
            </Section>
          </div>

          {/* RIGHT: Live preview (wide screens) */}
          {showPreview && (
            <aside className={styles.previewCol} aria-labelledby="live-preview-title">
              <h2
                id="live-preview-title"
                className={`${landing.badge} ${styles.previewHead}`}
              >
                <span
                  className={landing.badgeDot}
                  style={{ '--dot': 'var(--c3)' } as CSSProperties}
                />
                Live Preview
              </h2>
              <div className={styles.previewCard}>
                {/* Preview image */}
                {allImages.length > 0 ? (
                  <div className={styles.previewMedia}>
                    <Image
                      src={allImages[0]}
                      alt=""
                      fill
                      sizes="380px"
                      className={styles.previewImg}
                    />
                    {allImages.length > 1 && (
                      <span className={styles.previewMore}>
                        +{allImages.length - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className={styles.previewEmpty}>
                    <div className={styles.previewEmptyTile}>
                      <ImagePlus size={30} strokeWidth={2.4} aria-hidden="true" />
                    </div>
                  </div>
                )}

                {/* Preview body */}
                <div className={styles.previewBody}>
                  {categoryLabel && (
                    <span className={styles.previewTopic}>{categoryLabel}</span>
                  )}
                  <h3 className={styles.previewTitle}>
                    {title || 'Your title here…'}
                  </h3>
                  {excerpt && <p className={styles.previewExcerpt}>{excerpt}</p>}
                  <p className={styles.previewText}>
                    {stripHtml(body) ||
                      'Your story will appear here as you write…'}
                  </p>

                  {/* Meta */}
                  <div className={styles.previewMeta}>
                    {wordCount > 0 && (
                      <span className={`${styles.metaChip} ${styles.metaDot}`}>
                        {readTime} min read
                      </span>
                    )}
                    {(voiceFile || existingVoiceUrl) && (
                      <span
                        className={styles.metaChip}
                        style={{ '--chip': 'var(--c0)' } as CSSProperties}
                      >
                        <Music size={13} strokeWidth={2.6} aria-hidden="true" /> Voice
                      </span>
                    )}
                    {(videoFile || existingVideoUrl) && (
                      <span className={styles.metaChip}>
                        <Play size={13} strokeWidth={2.6} aria-hidden="true" /> Video
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        <StoryAssistanceCard
          welcomeHeading="Need help writing your story?"
          welcomeBody="We'll ask you the right questions to help you find the words. You write it. We just help you get started."
          entityName="your story"
          apiEndpoint="/api/story-assist-public"
          options={[
            {
              key: 'story-opening',
              label: 'Help me start',
              icon: '✦',
              description: 'Find your opening line',
              assistType: 'story-opening',
            },
            {
              key: 'story-feeling',
              label: 'Help me go deeper',
              icon: '❋',
              description: 'Find the emotional core',
              assistType: 'story-feeling',
            },
            {
              key: 'story-closing',
              label: 'Help me end it',
              icon: '◆',
              description: 'Find the right landing',
              assistType: 'story-closing',
            },
          ]}
          assistContext={{
            title,
            category,
            excerpt,
            existing_body: stripHtml(body),
          }}
        />
      </SiteShell>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION WRAPPER, white card, tilted colour tile, heavy title
   ═══════════════════════════════════════════════════════════════ */

function Section({
  icon,
  title,
  optional,
  children,
  tone = 'var(--c0)',
  toneInk = false,
  tilt = '-4deg',
}: {
  icon: ReactNode;
  title: string;
  optional?: boolean;
  children: ReactNode;
  tone?: string;
  toneInk?: boolean;
  tilt?: string;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div
          className={styles.tile}
          style={
            {
              '--tile': tone,
              '--tilt': tilt,
              ...(toneInk ? { '--tile-fg': 'var(--ink)' } : {}),
            } as CSSProperties
          }
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2 className={styles.cardTitle}>{title}</h2>
        {optional && <span className={styles.optional}>Optional</span>}
      </div>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUILL EDITOR
   ═══════════════════════════════════════════════════════════════ */

function QuillEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'bullet' }, { list: 'ordered' }],
      ],
    },
    placeholder: 'Start writing your memory...',
  });

  const lastAppliedRef = useRef('');

  // Quill binds Tab to indenting lists and typing a tab character, which traps keyboard
  // users in the editor. Drop those bindings (on this editor only) so Tab and Shift+Tab
  // move focus on, like any other field.
  useEffect(() => {
    if (!quill) return;
    delete quill.keyboard.bindings.Tab;
  }, [quill]);

  useEffect(() => {
    if (!quill) return;
    const handler = () => {
      const html = quill.root.innerHTML;
      lastAppliedRef.current = html;
      onChange(html);
    };
    quill.on('text-change', handler);
    return () => {
      quill.off('text-change', handler);
    };
  }, [quill, onChange]);

  useEffect(() => {
    if (!quill) return;
    const current = quill.root.innerHTML;
    const next = value || '';
    if (current !== next && lastAppliedRef.current !== next) {
      // Cleaned first: innerHTML runs inline handlers.
      quill.root.innerHTML = sanitizeRichTextClient(next);
      lastAppliedRef.current = next;
    }
  }, [quill, value]);

  return <div ref={quillRef} />;
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO UPLOADER
   ═══════════════════════════════════════════════════════════════ */

function PhotoUploader({
  onAdd,
  currentCount,
  onNotice,
}: {
  onAdd: (files: File[]) => void;
  currentCount: number;
  onNotice: (msg: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);

  const processFiles = async (rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles).filter(
      (f) =>
        f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic')
    );
    if (arr.length === 0) return;
    onNotice(
      arr.length > 10 - currentCount
        ? "You can add up to 10 photos. The rest weren't added."
        : ''
    );
    setProcessing(true);
    try {
      const converted = await Promise.all(
        arr.map((f) => ensureDisplayableImage(f))
      );
      // Then shrink camera-size photos (long edge 2560px), one at a time so a phone never
      // holds several full-size photos in memory at once. Only photos within the 10-photo
      // limit are worth the work: addMedia drops the rest anyway.
      const resized: File[] = [];
      for (const file of converted.slice(0, Math.max(0, 10 - currentCount))) {
        resized.push(await downscaleImage(file));
      }
      onAdd(resized);
    } finally {
      setProcessing(false);
    }
  };

  if (currentCount >= 10) return null;

  return (
    <label
      className={`${styles.drop} ${
        processing || dragOver ? styles.dropActive : ''
      } ${processing ? styles.dropBusy : ''}`}
      style={{ '--panel': 'var(--c1)', '--tilt': '-4deg' } as CSSProperties}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
      }}
    >
      <span className={styles.dropPanel}>
        <span className={styles.dropTile}>
          {processing ? (
            <Loader2 size={30} strokeWidth={2.6} className={styles.spin} aria-hidden="true" />
          ) : (
            <ImagePlus size={32} strokeWidth={2.4} aria-hidden="true" />
          )}
        </span>
      </span>
      <span className={styles.dropBody}>
        {processing ? (
          <>
            <span className={styles.dropTitle}>Processing photos…</span>
            <span className={styles.dropText}>Converting for upload</span>
          </>
        ) : (
          <>
            <span className={styles.dropTitle}>
              {currentCount > 0 ? 'Add more' : 'Drop photos here'}
            </span>
            <span className={styles.dropText}>JPG, PNG up to 10 photos</span>
          </>
        )}
      </span>
      <input
        type="file"
        accept="image/*,.heic"
        multiple
        className={styles.fileInput}
        disabled={processing}
        onChange={(e) => {
          if (e.target.files?.length) processFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VOICE NOTE UPLOADER
   ═══════════════════════════════════════════════════════════════ */

function VoiceNoteUploader({
  voiceFile,
  onRecord,
  onRemove,
}: {
  voiceFile: File | null;
  onRecord: (file: File) => void;
  onRemove: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((p) => p + 1);
      }, 1000);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onRecord(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
    } catch {
      // Microphone permission denied
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPlaying(false);
    setElapsed(0);
    onRemove();
  };

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onRecord(file);
  };

  /* Has recording */
  if (voiceFile && previewUrl) {
    return (
      <div className={styles.voiceCard}>
        <audio
          ref={audioRef}
          src={previewUrl}
          onEnded={() => setPlaying(false)}
        />
        <button
          type="button"
          onClick={togglePlayback}
          className={styles.playBtn}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause size={18} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <Play size={18} strokeWidth={2.4} className={styles.playIcon} aria-hidden="true" />
          )}
        </button>
        <div className={styles.wave} aria-hidden="true">
          {WAVE_BARS.map((h, i) => (
            <div
              key={i}
              className={`${styles.bar} ${i < 24 ? styles.barOn : ''}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <span className={styles.time}>{fmtTime(elapsed)}</span>
        <button
          type="button"
          onClick={handleRemove}
          className={styles.iconBtn}
          aria-label="Remove voice note"
        >
          <Trash2 size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    );
  }

  /* Recording */
  if (recording) {
    return (
      <button type="button" onClick={stopRecording} className={styles.stopBtn}>
        <Square size={14} fill="currentColor" aria-hidden="true" />
        Stop Recording · {fmtTime(elapsed)}
      </button>
    );
  }

  /* Default */
  return (
    <div className={styles.voiceActions}>
      <button
        type="button"
        onClick={startRecording}
        className={`${styles.voiceBtn} ${styles.recordBtn}`}
      >
        <Mic size={20} strokeWidth={2.4} aria-hidden="true" />
        Record
      </button>
      <label className={`${styles.voiceBtn} ${styles.uploadBtn}`}>
        <Upload size={20} strokeWidth={2.4} aria-hidden="true" />
        Upload
        <input
          type="file"
          accept="audio/*"
          className={styles.fileInput}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO UPLOADER
   ═══════════════════════════════════════════════════════════════ */

function VideoUploader({
  videoFile,
  onAdd,
  onRemove,
  isUploading,
}: {
  videoFile: PendingMedia | null;
  onAdd: (file: File) => void;
  onRemove: () => void;
  isUploading: boolean;
}) {
  const { maxVideoLength } = usePlanLimits();
  const maxSeconds = maxVideoLength ?? 300;
  const maxMinutes = Math.round(maxSeconds / 60);
  if (videoFile) {
    return (
      <div className={styles.media}>
        <div className={styles.mediaFrame}>
          <video
            src={videoFile.preview}
            controls={!isUploading}
            playsInline
            preload="metadata"
            className={`${styles.video} ${isUploading ? styles.videoBusy : ''}`}
          />
          {isUploading && (
            <div className={styles.mediaBusy}>
              <span className={styles.spinDisc}>
                <Loader2
                  size={22}
                  strokeWidth={2.6}
                  className={styles.spin}
                  aria-hidden="true"
                />
              </span>
            </div>
          )}
        </div>
        <div className={styles.mediaFoot}>
          <div className={styles.mediaInfo}>
            <p className={styles.mediaName}>{videoFile.file.name}</p>
            <p className={styles.mediaSize}>
              {(videoFile.file.size / (1024 * 1024)).toFixed(1)} MB
              {isUploading && ' · Uploading…'}
            </p>
          </div>
          {!isUploading && (
            <button
              type="button"
              onClick={onRemove}
              className={styles.iconBtn}
              aria-label="Remove video"
            >
              <Trash2 size={18} strokeWidth={2.2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <label
      className={styles.drop}
      style={{ '--panel': 'var(--c2)', '--tilt': '3deg' } as CSSProperties}
    >
      <span className={styles.dropPanel}>
        <span className={styles.dropTile}>
          <Play size={30} strokeWidth={2.4} className={styles.playIcon} aria-hidden="true" />
        </span>
      </span>
      <span className={styles.dropBody}>
        <span className={styles.dropTitle}>Add Video</span>
        <span className={styles.dropText}>
          MP4, MOV, or WebM (max {maxMinutes} min)
        </span>
      </span>
      <input
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className={styles.fileInput}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
              URL.revokeObjectURL(video.src);
              if (video.duration > maxSeconds) {
                safeToast.error(`Video must be ${maxMinutes} minutes or less.`);
              } else {
                onAdd(f);
              }
            };
            video.src = URL.createObjectURL(f);
          }
          e.target.value = '';
        }}
      />
    </label>
  );
}
