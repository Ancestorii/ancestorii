'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Image as ImageIcon,
  Music,
} from 'lucide-react';

import PublicNav from '../layout/PublicNav';
import PublicFooter from '../layout/PublicFooter';

import { getBrowserClient } from '@/lib/supabase/browser';
import {
  createStory,
  updateStory,
  publishStory,
  uploadStoryMedia,
  uploadVoiceNote,
} from '@/lib/stories/mutations';

import { ensureDisplayableImage } from '@/lib/convertImage';
import StoryAssistanceCard from '@/components/StoryAssistanceCard';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

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

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — GOLD + WHITE
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

  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [excerpt, setExcerpt] = useState(initialExcerpt);

  const [existingImages, setExistingImages] =
    useState<ExistingImage[]>(initialImages);
  const [existingVideoUrl] = useState<string | null>(initialVideoUrl);
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

  const canPublish =
    title.trim().length > 0 &&
    stripHtml(body).length > 0 &&
    category !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const { error } = await supabase.from('story_media').delete().eq('id', id);
    if (!error) {
      setExistingImages((prev) => prev.filter((img) => img.id !== id));
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
        if (!story) return;
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
          setPublishing(false);
          return;
        }
      }

      for (let i = 0; i < media.length; i++) {
        setPublishStep(`Uploading photo ${i + 1}/${media.length}…`);
        setUploadingMediaIndex(i);
        await uploadStoryMedia(supabase, targetId, media[i].file, i);
      }
      setUploadingMediaIndex(-1);

      if (videoFile) {
        setPublishStep('Uploading video…');
        setUploadingVideo(true);
        await uploadStoryMedia(
          supabase,
          targetId,
          videoFile.file,
          media.length
        );
        setUploadingVideo(false);
      }

      if (voiceFile) {
        setPublishStep('Uploading voice note…');
        const voicePath = await uploadVoiceNote(supabase, targetId, voiceFile);
        if (voicePath) {
          await updateStory(supabase, targetId, {
            voice_note_path: voicePath,
          });
        }
      } else if (!existingVoiceUrl && initialVoiceUrl) {
        setPublishStep('Updating voice note…');
        await updateStory(supabase, targetId, {
          voice_note_path: null,
        });
      }

      setPublishStep('Reviewing…');
      const modRes = await fetch('/api/moderate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: targetId }),
      });

      const modData = await modRes.json();

      if (modData.moderation_result === 'approved') {
        const { data: story } = await supabase
          .from('stories')
          .select('slug')
          .eq('id', targetId)
          .single();

        if (story?.slug) {
          router.push(`/stories/${story.slug}`);
        } else {
          router.push('/stories');
        }
      } else if (modData.moderation_result === 'flagged') {
        setModerationFlagged(true);
      } else {
        setModerationError(modData.error || 'Unable to publish at this time.');
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
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <style jsx global>{`

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .rise {
          animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .vc-editor .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid #EEECEA;
          background: #FDFCFA;
          padding: 12px 16px;
        }
        .vc-editor .ql-container.ql-snow {
          border: 0;
          font-family: 'DM Sans', sans-serif;
        }
        .vc-editor .ql-editor {
          min-height: 280px;
          padding: 24px 28px 28px;
          font-size: 16px;
          line-height: 2;
          color: #1A1A1A;
        }
        .vc-editor .ql-editor p {
          margin-bottom: 0.6rem;
        }
        .vc-editor .ql-editor ul {
          padding-left: 1.15rem;
        }
        .vc-editor .ql-editor.ql-blank::before {
          left: 28px;
          right: 28px;
          font-style: normal;
          color: #C0BDB5;
          font-family: 'DM Sans', sans-serif;
        }
        .vc-editor .ql-snow .ql-stroke {
          stroke: #7A7A72;
        }
        .vc-editor .ql-snow .ql-fill {
          fill: #7A7A72;
        }
        .vc-editor .ql-toolbar button:hover .ql-stroke,
        .vc-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #B8860B;
        }
        .vc-editor .ql-toolbar button:hover .ql-fill,
        .vc-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #B8860B;
        }
      `}</style>

      <PublicNav />

      {/* ═══════════════════════════════════════════════════════
          MODERATION FEEDBACK
          ═══════════════════════════════════════════════════════ */}
      {moderationFlagged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5">
          <div className="bg-white rounded-2xl p-8 max-w-[440px] w-full shadow-[0_24px_80px_rgba(0,0,0,0.2)] text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FBF7EE] mx-auto mb-5">
              <Eye size={24} className="text-[#B8860B]" />
            </div>
            <h3
              className="text-[20px] font-extrabold text-[#1A1A1A] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Your story is being reviewed
            </h3>
            <p
              className="text-[14px] text-[#7A7A72] leading-relaxed mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Every story published to Our Stories is reviewed before it goes live.
              You'll receive an email once your story has been approved.
            </p>
            <button
              onClick={() => router.push('/stories')}
              className="h-11 px-6 rounded-xl text-[13px] font-extrabold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #E5B000 0%, #B8860B 100%)',
              }}
            >
              Back to Our Stories
            </button>
          </div>
        </div>
      )}

      {moderationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5">
          <div className="bg-white rounded-2xl p-8 max-w-[440px] w-full shadow-[0_24px_80px_rgba(0,0,0,0.2)] text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] mx-auto mb-5">
              <X size={24} className="text-[#EF4444]" />
            </div>
            <h3
              className="text-[20px] font-extrabold text-[#1A1A1A] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Unable to publish
            </h3>
            <p
              className="text-[14px] text-[#7A7A72] leading-relaxed mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {moderationError}
            </p>
            <button
              onClick={() => setModerationError(null)}
              className="h-11 px-6 rounded-xl text-[13px] font-extrabold text-[#7A7A72] border border-[#E8E6E1] transition-all hover:bg-[#F7F6F3]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TOP BAR
          ═══════════════════════════════════════════════════════ */}
      <div
        className={`sticky top-0 z-40 bg-white border-b border-[#EEECEA] ${
          mounted ? 'rise' : 'opacity-0'
        }`}
      >
        <div className="h-[60px] px-5 sm:px-8 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBF7EE] hover:bg-[#F5EEE0] transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={16} className="text-[#B8860B]" />
            </button>
            <h2
              className="text-[15px] font-extrabold text-[#1A1A1A]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {mode === 'create' ? 'New Memory' : 'Edit Memory'}
            </h2>
            {wordCount > 0 && (
              <span
                className="hidden sm:inline text-[11px] text-[#A09E96] font-semibold tabular-nums px-2.5 py-1 rounded-full bg-[#F7F6F3]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {wordCount} {wordCount === 1 ? 'word' : 'words'} · {readTime}{' '}
                min read
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Completeness — 3 segments */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                    i < completeness ? 'bg-[#D4A017]' : 'bg-[#E8E6E1]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`hidden lg:flex h-9 items-center gap-1.5 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
                showPreview
                  ? 'bg-[#FBF7EE] text-[#B8860B]'
                  : 'bg-[#F7F6F3] text-[#A09E96] hover:text-[#7A7A72]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Eye size={13} /> Preview
            </button>

            <button
              onClick={handlePublish}
              disabled={!canPublish || publishing}
              className="flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-extrabold text-white transition-all duration-200 hover:shadow-[0_6px_24px_rgba(180,130,20,0.35)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:shadow-none disabled:hover:scale-100"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #E5B000 0%, #B8860B 100%)',
              }}
            >
              {publishing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {publishing
                ? publishStep || 'Publishing…'
                : status === 'published'
                ? 'Update'
                : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN — Two-column on lg+
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 w-full">
        <div
          className={`w-full flex gap-6 px-5 sm:px-8 lg:px-10 xl:px-14 py-8 sm:py-10 pb-24 sm:pb-32 ${
            mounted ? 'rise' : 'opacity-0'
          }`}
        >
          {/* LEFT — Editor */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* ═══════════════════════════════════════════
                SECTION 1 — CATEGORY + TITLE
                ═══════════════════════════════════════════ */}
            <Section
              icon={<Feather size={15} className="text-[#B8860B]" />}
              title="Category & Title"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => {
                  const active = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() =>
                        setCategory(active ? null : cat.value)
                      }
                      className={`h-[38px] px-4 rounded-xl text-[12px] font-bold flex items-center transition-all duration-200 ${
                        active
                          ? 'bg-[#B8860B] text-white shadow-[0_4px_16px_rgba(184,134,11,0.3)]'
                          : 'bg-white text-[#7A7A72] border border-[#E8E6E1] hover:border-[#D4A017] hover:text-[#B8860B]'
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              {!category &&
                title.trim().length > 0 &&
                stripHtml(body).length > 0 && (
                  <p
                    className="text-[12px] text-[#EF4444] font-bold mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Please select a category before publishing.
                  </p>
                )}
              <div className="bg-white border border-[#E8E6E1] rounded-2xl px-5 py-4 focus-within:border-[#D4A017] focus-within:shadow-[0_0_0_3px_rgba(212,160,23,0.1)] transition-all">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Summer We Spent at Nanna's House"
                  maxLength={200}
                  className="w-full bg-transparent outline-none text-[18px] sm:text-[20px] font-extrabold text-[#1A1A1A] placeholder:text-[#D0CEC8] caret-[#D4A017]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <div className="mt-3 bg-white border border-[#E8E6E1] rounded-2xl px-5 py-3.5 focus-within:border-[#D4A017] focus-within:shadow-[0_0_0_3px_rgba(212,160,23,0.1)] transition-all">
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short preview line (optional)…"
                  maxLength={200}
                  className="w-full bg-transparent outline-none text-[14px] text-[#7A7A72] placeholder:text-[#D0CEC8] caret-[#D4A017]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
            </Section>

            {/* ═══════════════════════════════════════════
                SECTION 2 — WRITE YOUR STORY
                ═══════════════════════════════════════════ */}
            <Section
              icon={<Feather size={15} className="text-[#B8860B]" />}
              title="Your Story"
            >
              <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden vc-editor focus-within:border-[#D4A017] transition-colors">
                <QuillEditor value={body} onChange={setBody} />
              </div>
            </Section>

            {/* ═══════════════════════════════════════════
                SECTION 3 — PHOTOS & VIDEO
                ═══════════════════════════════════════════ */}
            <Section
              icon={<ImageIcon size={15} className="text-[#B8860B]" />}
              title="Photos & Video"
            >
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-4">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-[#F0EDE8]"
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      {!publishing && (
                        <button
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      )}
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-[#10B981] rounded-full">
                        <span className="text-[8px] font-bold text-white">
                          Saved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New media with upload spinners */}
              {media.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-4">
                  {media.map((item, idx) => {
                    const isUploading =
                      publishing && uploadingMediaIndex === idx;
                    const isUploaded =
                      publishing && uploadingMediaIndex > idx;
                    return (
                      <div
                        key={item.id}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-[#F0EDE8]"
                      >
                        <Image
                          src={item.preview}
                          alt=""
                          fill
                          className={`object-cover transition-opacity ${
                            isUploading ? 'opacity-60' : ''
                          }`}
                        />
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                            <Loader2
                              size={20}
                              className="animate-spin text-[#D4A017]"
                            />
                          </div>
                        )}
                        {isUploaded && (
                          <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981]">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                        {!publishing && (
                          <button
                            onClick={() => removeMedia(item.id)}
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PhotoUploader
                  onAdd={addMedia}
                  currentCount={existingImages.length + media.length}
                />

                {existingVideoUrl && !videoFile && (
                  <div className="rounded-2xl border border-[#E8E6E1] overflow-hidden bg-white">
                    <video
                      src={existingVideoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[160px] bg-black"
                    />
                    <div className="px-4 py-2">
                      <span
                        className="text-[11px] font-bold text-[#A09E96]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Saved video
                      </span>
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
                SECTION 4 — VOICE NOTE (OPTIONAL)
                ═══════════════════════════════════════════ */}
            <Section
              icon={<Music size={15} className="text-[#B8860B]" />}
              title="Voice Note"
              optional
            >
              {existingVoiceUrl && !voiceFile && (
                <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 flex items-center gap-3">
                  <audio id="existing-voice" src={existingVoiceUrl} />
                  <button
                    onClick={() => {
                      const el = document.getElementById(
                        'existing-voice'
                      ) as HTMLAudioElement;
                      if (el) {
                        el.paused ? el.play() : el.pause();
                      }
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                    style={{
                      background:
                        'linear-gradient(135deg, #E5B000, #B8860B)',
                    }}
                  >
                    <Play size={14} className="ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-bold text-[#1A1A1A]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Saved voice note
                    </p>
                    <p
                      className="text-[11px] text-[#A09E96]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Previously recorded
                    </p>
                  </div>
                  <button
                    onClick={() => setExistingVoiceUrl(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E6E1] hover:bg-[#FEF2F2] transition-colors flex-shrink-0"
                    aria-label="Replace voice note"
                  >
                    <Trash2 size={12} className="text-[#EF4444]" />
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

          {/* RIGHT — Live preview (lg+) */}
          {showPreview && (
            <div className="hidden lg:block w-[340px] xl:w-[380px] flex-shrink-0">
              <div className="sticky top-[80px]">
                <div className="bg-white border border-[#E8E6E1] rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(30,30,20,0.06)]">
                  {/* Preview header */}
                  <div className="px-5 py-4 border-b border-[#EEECEA]">
                    <div className="flex items-center gap-2">
                      <Eye size={13} className="text-[#A09E96]" />
                      <span
                        className="text-[11px] font-extrabold text-[#A09E96] uppercase tracking-[0.1em]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Live Preview
                      </span>
                    </div>
                  </div>

                  {/* Preview image */}
                  {allImages.length > 0 ? (
                    <div className="relative h-[180px] bg-[#F0EDE8]">
                      <Image
                        src={allImages[0]}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      {allImages.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full">
                          <span className="text-[10px] font-bold text-white">
                            +{allImages.length - 1}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[120px] bg-gradient-to-br from-[#FBF7EE] to-[#F0FDF4] flex items-center justify-center">
                      <ImagePlus size={28} className="text-[#D0CEC8]" />
                    </div>
                  )}

                  {/* Preview body */}
                  <div className="p-5">
                    {categoryLabel && (
                      <span
                        className="inline-block px-2.5 py-1 rounded-full bg-[#FBF7EE] text-[10px] font-extrabold text-[#B8860B] uppercase tracking-[0.06em] mb-3"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {categoryLabel}
                      </span>
                    )}
                    <h3
                      className="text-[18px] font-extrabold text-[#1A1A1A] leading-tight mb-2"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {title || 'Your title here…'}
                    </h3>
                    {excerpt && (
                      <p
                        className="text-[13px] text-[#7A7A72] leading-relaxed mb-3"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {excerpt}
                      </p>
                    )}
                    <p
                      className="text-[13px] text-[#A09E96] leading-relaxed line-clamp-4"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {stripHtml(body) ||
                        'Your story will appear here as you write…'}
                    </p>

                    {/* Meta */}
                    <div className="mt-4 pt-4 border-t border-[#F5F3EF] flex items-center gap-3">
                      {wordCount > 0 && (
                        <span
                          className="text-[11px] font-bold text-[#C0BDB5] tabular-nums"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {readTime} min read
                        </span>
                      )}
                      {(voiceFile || existingVoiceUrl) && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-bold text-[#10B981]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <Music size={10} /> Voice
                        </span>
                      )}
                      {(videoFile || existingVideoUrl) && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-bold text-[#D4A017]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <Play size={10} /> Video
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <StoryAssistanceCard
        welcomeHeading="Need help writing your story?"
        welcomeBody="We'll ask you the right questions to help you find the words. You write it — we just help you get started."
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

      <PublicFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════ */

function Section({
  icon,
  title,
  optional,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E8E6E1] rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBF7EE]">
          {icon}
        </div>
        <h3
          className="text-[15px] font-extrabold text-[#1A1A1A]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </h3>
        {optional && (
          <span
            className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[10px] font-bold text-[#10B981] uppercase tracking-[0.06em]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Optional
          </span>
        )}
      </div>
      {children}
    </div>
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
      quill.root.innerHTML = next;
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
}: {
  onAdd: (files: File[]) => void;
  currentCount: number;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);

  const processFiles = async (rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles).filter(
      (f) =>
        f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic')
    );
    if (arr.length === 0) return;
    setProcessing(true);
    try {
      const converted = await Promise.all(
        arr.map((f) => ensureDisplayableImage(f))
      );
      onAdd(converted);
    } finally {
      setProcessing(false);
    }
  };

  if (currentCount >= 10) return null;

  return (
    <label
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 px-5 py-8 ${
        processing
          ? 'border-[#D4A017] bg-[#FBF7EE]'
          : dragOver
          ? 'border-[#D4A017] bg-[#FBF7EE]'
          : 'border-[#DDD9D2] bg-[#FDFCFA] hover:border-[#D4A017]'
      }`}
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
      {processing ? (
        <>
          <Loader2
            size={24}
            className="animate-spin text-[#D4A017] mb-2"
          />
          <p
            className="text-[13px] font-extrabold text-[#B8860B]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Processing photos…
          </p>
          <p
            className="mt-0.5 text-[11px] text-[#A09E96] font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Converting for upload
          </p>
        </>
      ) : (
        <>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBF7EE]">
            <ImagePlus size={20} className="text-[#B8860B]" />
          </div>
          <p
            className="text-[13px] font-extrabold text-[#1A1A1A]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {currentCount > 0 ? 'Add more' : 'Drop photos here'}
          </p>
          <p
            className="mt-0.5 text-[11px] text-[#A09E96] font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            JPG, PNG up to 10 photos
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
      <div className="bg-[#FDFCFA] border border-[#E8E6E1] rounded-2xl p-4 flex items-center gap-3">
        <audio
          ref={audioRef}
          src={previewUrl}
          onEnded={() => setPlaying(false)}
        />
        <button
          onClick={togglePlayback}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #E5B000, #B8860B)',
          }}
        >
          {playing ? (
            <Pause size={14} />
          ) : (
            <Play size={14} className="ml-0.5" />
          )}
        </button>
        <div className="flex-1 flex items-center gap-[1.5px] h-8">
          {Array.from({ length: 36 }, (_, i) => {
            const h = 15 + Math.sin(i * 0.4) * 12 + Math.random() * 8;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  minHeight: 3,
                  background: i < 24 ? '#D4A017' : '#DDD9D2',
                }}
              />
            );
          })}
        </div>
        <span
          className="text-[12px] text-[#7A7A72] font-extrabold tabular-nums flex-shrink-0"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {fmtTime(elapsed)}
        </span>
        <button
          onClick={handleRemove}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E6E1] hover:bg-[#FEF2F2] transition-colors flex-shrink-0"
        >
          <Trash2 size={12} className="text-[#EF4444]" />
        </button>
      </div>
    );
  }

  /* Recording */
  if (recording) {
    return (
      <button
        onClick={stopRecording}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FEF2F2] border-2 border-[#FECACA] text-[13px] font-extrabold text-[#EF4444] transition-colors hover:bg-[#FEE2E2]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Square size={12} />
        Stop Recording · {fmtTime(elapsed)}
      </button>
    );
  }

  /* Default */
  return (
    <div className="flex gap-3">
      <button
        onClick={startRecording}
        className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl border-2 border-[#DDD9D2] bg-white text-[13px] font-extrabold text-[#7A7A72] transition-all hover:border-[#D4A017] hover:text-[#B8860B]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Mic size={16} className="text-[#D4A017]" />
        Record
      </button>
      <label
        className="flex h-14 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-[#DDD9D2] bg-white text-[13px] font-extrabold text-[#7A7A72] transition-all hover:border-[#D4A017] hover:text-[#B8860B]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Upload size={16} className="text-[#D4A017]" />
        Upload
        <input
          type="file"
          accept="audio/*"
          hidden
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
  if (videoFile) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#E8E6E1] bg-white">
        <div className="relative">
          <video
            src={videoFile.preview}
            controls={!isUploading}
            playsInline
            preload="metadata"
            className={`w-full max-h-[160px] bg-black transition-opacity ${
              isUploading ? 'opacity-50' : ''
            }`}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/30">
              <Loader2
                size={28}
                className="animate-spin text-[#D4A017]"
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="min-w-0">
            <p
              className="truncate text-[12px] font-extrabold text-[#1A1A1A]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {videoFile.file.name}
            </p>
            <p
              className="text-[10px] text-[#A09E96] font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {(videoFile.file.size / (1024 * 1024)).toFixed(1)} MB
              {isUploading && ' · Uploading…'}
            </p>
          </div>
          {!isUploading && (
            <button
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#FEF2F2] flex-shrink-0 transition-colors"
            >
              <Trash2 size={12} className="text-[#EF4444]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DDD9D2] bg-[#FDFCFA] px-5 py-8 cursor-pointer transition-all duration-200 hover:border-[#D4A017]">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBF7EE]">
        <Play size={18} className="text-[#B8860B] ml-0.5" />
      </div>
      <p
        className="text-[13px] font-extrabold text-[#1A1A1A]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Add Video
      </p>
      <p
        className="mt-0.5 text-[11px] text-[#A09E96] font-medium"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        MP4, MOV, or WebM (max 5 min)
      </p>
      <input
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
              URL.revokeObjectURL(video.src);
              if (video.duration > 300) {
                alert('Video must be 5 minutes or less.');
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