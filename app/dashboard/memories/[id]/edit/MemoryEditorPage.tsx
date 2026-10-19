'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  Mic,
  Square,
  Trash2,
  Play,
  Pause,
  ImagePlus,
  X,
  Send,
  Upload,
  ArrowLeft,
  Check,
  Eye,
  Feather,
  Image as ImageIcon,
  Music,
} from 'lucide-react';

import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import { safeToast } from '@/lib/safeToast';
import { usePlanLimits } from '@/lib/usePlanLimits';
import StoryAssistanceCard from '@/components/StoryAssistanceCard';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import {
  ui,
  Btn,
  IconBtn,
  IconTile,
  PageHeader,
  Spinner,
  Tag,
  btnClass,
  toneByKey,
  type Tone,
} from '@/components/dashboard/ui/AppBits';
import s from './memoryEditor.module.css';
import { sanitizeRichTextClient } from '@/lib/richText/client';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Each section's tile takes its own colour: the title and the words in My Family's pink and
// aqua, photos and video in the albums' orange, the voice note in the voice notes' blue.
const PINK = toneByKey('pink');
const AQUA = toneByKey('aqua');
const ORANGE = toneByKey('orange');
const BLUE = toneByKey('blue');

const TILE_SIZES = '(max-width: 639px) 31vw, 180px';

type PendingMedia = { id: string; file: File; preview: string };
/** A photo already saved: its id, a signed URL, and its storage path (for the delete). */
type ExistingImage = { id: string; url: string; path: string };

/** A voice note the author already saved on this memory (a family_memory_voice_notes row). */
type SavedVoiceNote = { id: string; url: string; path: string };

type EditorProps = {
  mode: 'create' | 'edit';
  memoryId?: string;
  familyId: string;
  initialTitle?: string;
  initialBody?: string;
  initialImages?: ExistingImage[];
  initialVideoUrl?: string | null;
  initialVoiceNotes?: SavedVoiceNote[];
  /** Profiles.writing_assistance_enabled: off hides the Story Assistance card. */
  assistanceEnabled?: boolean;
};

// The words without their tags, for the preview and the count; the entities the editor
// writes ("Mum &amp; Dad") read as typed.
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function MemoryEditorPage({
  mode,
  memoryId: existingMemoryId,
  familyId,
  initialTitle = '',
  initialBody = '',
  initialImages = [],
  initialVideoUrl = null,
  initialVoiceNotes = [],
  assistanceEnabled = true,
}: EditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialImages);
  const [existingVideoUrl] = useState<string | null>(initialVideoUrl);
  // "Replace" takes a saved note off this list; it is deleted when the memory is saved.
  const [existingVoiceNotes, setExistingVoiceNotes] = useState<SavedVoiceNote[]>(initialVoiceNotes);
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [videoFile, setVideoFile] = useState<PendingMedia | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  const [memoryId, setMemoryId] = useState<string | null>(existingMemoryId || null);

  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('');
  const [uploadingMediaIndex, setUploadingMediaIndex] = useState<number>(-1);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [photoLimitNotice, setPhotoLimitNotice] = useState('');

  const [showPreview, setShowPreview] = useState(true);

  const titleHeadingId = useId();

  const canPublish = title.trim().length > 0 && stripHtml(body).length > 0;

  const addMedia = useCallback((files: File[]) => {
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
  }, [existingImages.length]);

  const removeMedia = useCallback((id: string) => {
    setMedia((prev) => { const item = prev.find((m) => m.id === id); if (item) URL.revokeObjectURL(item.preview); return prev.filter((m) => m.id !== id); });
  }, []);

  const addVideo = useCallback((file: File) => {
    setVideoFile({ id: `vid-${Date.now()}`, file, preview: URL.createObjectURL(file) });
  }, []);

  // The row first (a refused delete shows a toast and changes nothing), then the file.
  const removeExistingImage = useCallback(async (img: ExistingImage) => {
    const supabase = getBrowserClient();
    try {
      const ok = await deleteWithOwnerCheck(supabase, 'family_memory_media', img.id, 'photo');
      if (!ok) return;
      setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
      try { await supabase.storage.from('memory-media').remove([img.path]); } catch {}
    } catch {
      safeToast.error('Could not delete this photo. Please try again.');
    }
  }, []);

  const removeVideo = useCallback(() => {
    setVideoFile((prev) => { if (prev) URL.revokeObjectURL(prev.preview); return null; });
  }, []);

  const handlePublish = async () => {
    if (!canPublish || publishing) return;
    setPublishing(true);
    setPublishError('');
    setUploadingMediaIndex(-1);
    setUploadingVideo(false);
    const supabase = getBrowserClient();
    // Stays true after a successful save, so the button can't be pressed again while the
    // memory page loads (a second press would upload every photo twice).
    let saved = false;

    try {
      // The session is local (no round trip); row security is the real check.
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) throw new Error('Your session has expired. Please sign in again.');

      let targetId = memoryId;
      // Quill only writes its own HTML, but the clean-up on save costs nothing and the page
      // cleans again when it shows the memory.
      const cleanBody = sanitizeRichTextClient(body);

      setPublishStep('Saving memory…');
      if (!targetId) {
        const { data: newMemory, error: createErr } = await supabase
          .from('family_memories')
          .insert({ family_id: familyId, author_id: uid, title: title.trim(), body: cleanBody })
          .select('id')
          .single();
        if (createErr || !newMemory) { setPublishError(createErr?.message || 'Failed to save memory.'); return; }
        targetId = newMemory.id;
        setMemoryId(newMemory.id);
      } else {
        // Row security refuses silently (no rows back), so the rows are checked.
        const { data: updated, error: updateErr } = await supabase
          .from('family_memories')
          .update({ title: title.trim(), body: cleanBody })
          .eq('id', targetId)
          .select('id');
        if (updateErr || !updated?.length) { setPublishError(updateErr?.message || 'This memory could not be updated.'); return; }
      }

      // The memory is saved by now: a photo that fails is reported, not a reason to stop.
      let failed = 0;
      for (let i = 0; i < media.length; i++) {
        setPublishStep(`Uploading photo ${i + 1}/${media.length}…`);
        setUploadingMediaIndex(i);
        const ext = media[i].file.name.split('.').pop() || 'jpg';
        const filePath = `${uid}/${targetId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from('memory-media').upload(filePath, media[i].file);
        if (upErr) { failed++; continue; }
        const { error: rowErr } = await supabase.from('family_memory_media').insert({
          memory_id: targetId, family_id: familyId, user_id: uid,
          file_path: filePath, file_type: 'image',
          display_order: existingImages.length + i,
        });
        if (rowErr) failed++;
      }
      setUploadingMediaIndex(-1);

      if (videoFile) {
        setPublishStep('Uploading video…');
        setUploadingVideo(true);
        const ext = videoFile.file.name.split('.').pop() || 'mp4';
        const videoPath = `${uid}/${targetId}/video-${Date.now()}.${ext}`;
        const { error: vidErr } = await supabase.storage.from('memory-media').upload(videoPath, videoFile.file);
        const { error: vidRowErr } = vidErr
          ? { error: vidErr }
          : await supabase.from('family_memories').update({ video_path: videoPath }).eq('id', targetId);
        if (vidRowErr) safeToast.error('The video could not be uploaded.');
        setUploadingVideo(false);
      }

      // Voice notes are family_memory_voice_notes rows, as the memory page and the app keep
      // them: that is what both play (the memory's old voice_note_path column is no longer
      // written). The new recording is saved first, so a failed upload never costs the memory
      // the note it is replacing.
      let voiceSaved = true;
      if (voiceFile) {
        setPublishStep('Uploading voice note…');
        const voicePath = `${uid}/${targetId}/voice-${Date.now()}.webm`;
        const { error: voiceErr } = await supabase.storage
          .from('memory-media')
          .upload(voicePath, voiceFile, { contentType: voiceFile.type || 'audio/webm' });
        const { error: voiceRowErr } = voiceErr
          ? { error: voiceErr }
          : await supabase
              .from('family_memory_voice_notes')
              .insert({ memory_id: targetId, family_id: familyId, user_id: uid, file_path: voicePath });
        if (voiceRowErr) {
          voiceSaved = false;
          // The file landed but its row didn't: take the orphaned audio back off.
          if (!voiceErr) { try { await supabase.storage.from('memory-media').remove([voicePath]); } catch {} }
          safeToast.error('The voice note could not be uploaded.');
        }
      }

      // Replaced notes: the row first (a refused delete shows a toast), then its files, both the
      // uploaded .webm and the converted .m4a (the row may still have pointed at the .webm when
      // the editor opened).
      const replaced = voiceSaved
        ? initialVoiceNotes.filter((v) => !existingVoiceNotes.some((e) => e.id === v.id))
        : [];
      for (const v of replaced) {
        setPublishStep('Updating voice note…');
        try {
          if (await deleteWithOwnerCheck(supabase, 'family_memory_voice_notes', v.id, 'voice note')) {
            const stem = v.path.replace(/\.[^/.]+$/, '');
            try { await supabase.storage.from('memory-media').remove([...new Set([v.path, `${stem}.webm`, `${stem}.m4a`])]); } catch {}
          }
        } catch {
          safeToast.error('The old voice note could not be removed.');
        }
      }

      if (failed) safeToast.error(failed === 1 ? 'One photo could not be uploaded.' : `${failed} photos could not be uploaded.`);
      if (!memoryId) window.dispatchEvent(new Event('dashboard-data-changed'));
      saved = true;
      setPublishStep('Opening your memory…');
      router.push(`/dashboard/memories/${targetId}`);
    } catch (err) {
      setPublishError(err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.');
    } finally {
      if (!saved) setPublishing(false);
      setUploadingMediaIndex(-1);
      setUploadingVideo(false);
    }
  };

  const wordCount = stripHtml(body).split(/\s+/).filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const allImages = [...existingImages.map((i) => i.url), ...media.map((m) => m.preview)];
  const completeness = [title.trim().length > 0, stripHtml(body).length > 0].filter(Boolean).length;
  const previewText = stripHtml(body);
  const hasVoice = !!(voiceFile || existingVoiceNotes.length);
  const hasVideo = !!(videoFile || existingVideoUrl);

  return (
    <div>
      {/* ═══ STICKY BAR: back; the count, preview and save ═══ */}
      <div className={cx(s.bar, s.rise)}>
        <div className={s.barPad}>
          <div className={cx(ui.wrap, s.barRow)}>
            {/* A real link: the shell hides its navigation here, and a fresh tab has no page to
                go back to. Editing goes back to the memory, writing to My Family. */}
            <Btn
              variant="soft"
              size="sm"
              href={mode === 'edit' && existingMemoryId ? `/dashboard/memories/${existingMemoryId}` : '/dashboard/our-family'}
              icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
            >
              Back
            </Btn>

            <div className={s.barActions}>
              {wordCount > 0 && (
                <span className={cx(ui.chip, ui.chipSm, s.words)}>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} · {readTime} min read
                </span>
              )}
              <span className={s.progress} aria-hidden="true">
                {[0, 1].map((i) => (
                  <span key={i} className={cx(s.progressDot, i < completeness && s.progressDotOn)} />
                ))}
              </span>
              <Btn
                variant="soft"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                aria-pressed={showPreview}
                icon={<Eye size={17} strokeWidth={2.4} aria-hidden="true" />}
                className={s.previewToggle}
              >
                Preview
              </Btn>
              <Btn
                size="sm"
                onClick={handlePublish}
                disabled={!canPublish || publishing}
                tile={publishing ? <Spinner size={15} /> : <Send size={15} strokeWidth={2.4} />}
                className={s.saveBtn}
              >
                {publishing ? publishStep || 'Saving…' : mode === 'edit' ? 'Update' : 'Save Memory'}
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div className={cx(ui.page, s.page)}>
        <div className={cx(ui.wrap, s.rise)}>
          <PageHeader
            eyebrow="Memory"
            eyebrowDot="var(--c0)"
            title={mode === 'create' ? 'New Memory' : 'Edit Memory'}
            size="md"
          />

          {publishError && (
            <div className={cx(ui.noticeError, s.error)} role="alert">
              <p className={s.errorText}>{publishError}</p>
              <IconBtn label="Dismiss" ghost size="sm" onClick={() => setPublishError('')}>
                <X size={16} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>
          )}

          <div className={cx(s.layout, showPreview && s.layoutPreview)}>
            {/* LEFT: Editor */}
            <div className={s.form}>

              {/* SECTION 1: TITLE */}
              <Section Icon={Feather} tone={PINK} title="Title" headingId={titleHeadingId}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sunday mornings with Nan"
                  maxLength={200}
                  aria-labelledby={titleHeadingId}
                  className={cx(ui.input, s.titleInput)}
                />
              </Section>

              {/* SECTION 2: YOUR MEMORY */}
              <Section Icon={Feather} tone={AQUA} title="Your Memory">
                <div className={s.editor}>
                  <QuillEditor value={body} onChange={setBody} />
                </div>
              </Section>

              {/* SECTION 3: PHOTOS & VIDEO */}
              <Section Icon={ImageIcon} tone={ORANGE} title="Photos & Video">
                {existingImages.length > 0 && (
                  <ul className={s.mediaGrid}>
                    {existingImages.map((img) => (
                      <li key={img.id} className={s.tile}>
                        <Image src={img.url} alt="" fill sizes={TILE_SIZES} className={s.tileImg} />
                        {!publishing && (
                          <IconBtn label="Delete this photo" size="sm" onPhoto danger onClick={() => removeExistingImage(img)} className={s.tileRemove}>
                            <X size={15} strokeWidth={2.6} aria-hidden="true" />
                          </IconBtn>
                        )}
                        <span className={cx(ui.photoChip, ui.photoChipInk, s.savedChip)}>Saved</span>
                      </li>
                    ))}
                  </ul>
                )}
                {media.length > 0 && (
                  <ul className={s.mediaGrid}>
                    {media.map((item, idx) => {
                      const isUploading = publishing && uploadingMediaIndex === idx;
                      const isUploaded = publishing && uploadingMediaIndex > idx;
                      return (
                        <li key={item.id} className={s.tile}>
                          <Image src={item.preview} alt="" fill sizes={TILE_SIZES} className={cx(s.tileImg, isUploading && s.busy)} />
                          {isUploading && (<div className={s.tileBusy}><Spinner size={22} label="Uploading" /></div>)}
                          {isUploaded && (
                            <span className={cx(ui.photoChip, ui.photoChipIcon, s.doneChip)}>
                              <Check size={14} strokeWidth={3} aria-hidden="true" />
                              <span className={ui.srOnly}>Uploaded</span>
                            </span>
                          )}
                          {!publishing && (
                            <IconBtn label="Remove photo" size="sm" onPhoto onClick={() => removeMedia(item.id)} className={s.tileRemove}>
                              <X size={15} strokeWidth={2.6} aria-hidden="true" />
                            </IconBtn>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className={s.uploaders}>
                  <PhotoUploader onAdd={addMedia} currentCount={existingImages.length + media.length} onNotice={setPhotoLimitNotice} />
                  {existingVideoUrl && !videoFile && (
                    <div className={s.videoCard}>
                      <div className={s.videoBox}>
                        <video src={existingVideoUrl} controls playsInline preload="metadata" className={s.videoPreview} />
                      </div>
                      <div className={s.videoMeta}>
                        <p className={s.videoName}>Saved video</p>
                      </div>
                    </div>
                  )}
                  {!existingVideoUrl && (<VideoUploader videoFile={videoFile} onAdd={addVideo} onRemove={removeVideo} isUploading={uploadingVideo} />)}
                </div>
                {photoLimitNotice && (<p className={cx(ui.noticeWarn, s.notice)}>{photoLimitNotice}</p>)}
              </Section>

              {/* SECTION 4: VOICE NOTE */}
              <Section Icon={Music} tone={BLUE} title="Voice Note" optional>
                {existingVoiceNotes.map((v) => (
                  <div key={v.id} className={s.voiceRow}>
                    <audio id={`existing-voice-${v.id}`} src={v.url} />
                    <button type="button" onClick={() => { const el = document.getElementById(`existing-voice-${v.id}`) as HTMLAudioElement | null; if (el) { el.paused ? el.play() : el.pause(); } }} className={s.voicePlay} aria-label="Play saved voice note">
                      <Play size={16} strokeWidth={2.6} fill="currentColor" className={s.playGlyph} aria-hidden="true" />
                    </button>
                    <div className={s.voiceText}>
                      <p className={s.voiceTitle}>Saved voice note</p>
                      <p className={s.voiceSub}>Previously recorded</p>
                    </div>
                    <IconBtn label="Replace voice note" size="sm" danger onClick={() => setExistingVoiceNotes((prev) => prev.filter((n) => n.id !== v.id))}>
                      <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                    </IconBtn>
                  </div>
                ))}
                {/* One recording per save: shown when there is no saved note, or one was replaced */}
                {(existingVoiceNotes.length === 0 || existingVoiceNotes.length < initialVoiceNotes.length) && (<VoiceNoteUploader voiceFile={voiceFile} onRecord={setVoiceFile} onRemove={() => setVoiceFile(null)} />)}
              </Section>
            </div>

            {/* RIGHT: Live preview */}
            {showPreview && (
              <aside className={s.preview} aria-label="Live Preview">
                <div className={cx(ui.card, ui.cardFlush)}>
                  <div className={s.previewHead}>
                    <Tag dot="var(--c0)">Live Preview</Tag>
                  </div>
                  {allImages.length > 0 ? (
                    <div className={s.previewMedia}>
                      <Image src={allImages[0]} alt="" fill sizes="380px" className={s.previewImg} />
                      {allImages.length > 1 && (<span className={cx(ui.photoChip, ui.photoChipInk, s.previewMore)}>+{allImages.length - 1}</span>)}
                    </div>
                  ) : (
                    <div className={cx(s.previewMedia, s.previewEmpty)}>
                      <IconTile Icon={ImagePlus} tone={ORANGE} />
                    </div>
                  )}
                  <div className={s.previewBody}>
                    <h2 className={cx(s.previewTitle, !title && s.placeholder)}>{title || 'Your title here…'}</h2>
                    <p className={cx(s.previewText, !previewText && s.placeholder)}>{previewText || 'Your memory will appear here as you write…'}</p>
                    {(wordCount > 0 || hasVoice || hasVideo) && (
                      <div className={s.previewFoot}>
                        {wordCount > 0 && (<span className={cx(ui.chip, ui.chipSm)}>{readTime} min read</span>)}
                        {hasVoice && (<span className={cx(ui.chip, ui.chipSm)}><Music size={12} strokeWidth={2.6} aria-hidden="true" /> Voice</span>)}
                        {hasVideo && (<span className={cx(ui.chip, ui.chipSm)}><Play size={12} strokeWidth={2.6} aria-hidden="true" /> Video</span>)}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      <StoryAssistanceCard
        assistanceEnabled={assistanceEnabled}
        welcomeHeading="Need help writing your memory?"
        welcomeBody="We'll ask you the right questions to help you find the words. You write it. We just help you get started."
        entityName="your memory"
        apiEndpoint="/api/story-assist-public"
        options={[
          { key: 'story-opening', label: 'Help me start', icon: '✦', description: 'Find your opening line', assistType: 'story-opening' },
          { key: 'story-feeling', label: 'Help me go deeper', icon: '❋', description: 'Find the emotional core', assistType: 'story-feeling' },
          { key: 'story-closing', label: 'Help me end it', icon: '◆', description: 'Find the right landing', assistType: 'story-closing' },
        ]}
        assistContext={{ title, existing_body: stripHtml(body) }}
      />
    </div>
  );
}

function Section({
  Icon,
  tone,
  title,
  headingId,
  optional,
  children,
}: {
  Icon: LucideIcon;
  tone: Tone;
  title: string;
  headingId?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const ownId = useId();
  const id = headingId ?? ownId;
  return (
    <section className={cx(ui.card, s.section)} aria-labelledby={id}>
      <div className={s.sectionHead}>
        <IconTile Icon={Icon} tone={tone} size="sm" />
        <h2 id={id} className={s.sectionTitle}>{title}</h2>
        {optional && (<span className={cx(ui.chip, ui.chipSm)}>Optional</span>)}
      </div>
      {children}
    </section>
  );
}

function QuillEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const { quill, quillRef } = useQuill({ theme: 'snow', modules: { toolbar: [['bold', 'italic', 'underline'], [{ list: 'bullet' }, { list: 'ordered' }]] }, placeholder: 'Start writing your memory...' });
  const lastAppliedRef = useRef('');
  useEffect(() => { if (!quill) return; const handler = () => { const html = quill.root.innerHTML; lastAppliedRef.current = html; onChange(html); }; quill.on('text-change', handler); return () => { quill.off('text-change', handler); }; }, [quill, onChange]);
  useEffect(() => { if (!quill) return; const current = quill.root.innerHTML; const next = value || ''; if (current !== next && lastAppliedRef.current !== next) { quill.root.innerHTML = sanitizeRichTextClient(next); lastAppliedRef.current = next; } }, [quill, value]);
  return <div ref={quillRef} />;
}

function PhotoUploader({ onAdd, currentCount, onNotice }: { onAdd: (files: File[]) => void; currentCount: number; onNotice: (msg: string) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processFiles = async (rawFiles: FileList | File[]) => { const arr = Array.from(rawFiles).filter((f) => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic')); if (arr.length === 0) return; onNotice(arr.length > 10 - currentCount ? "You can add up to 10 photos. The rest weren't added." : ''); setProcessing(true); try { const converted = await Promise.all(arr.map((f) => ensureDisplayableImage(f))); onAdd(converted); } finally { setProcessing(false); } };
  if (currentCount >= 10) return null;
  return (
    <label className={cx(ui.dropzone, (processing || dragOver) && ui.dropzoneActive, s.drop)} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files); }}>
      {processing ? (
        <>
          <span className={s.dropSpin}><Spinner size={24} /></span>
          <span className={ui.dropzoneTitle}>Processing photos…</span>
          <span className={ui.dropzoneHint}>Converting for upload</span>
        </>
      ) : (
        <>
          <IconTile Icon={ImagePlus} tone={ORANGE} />
          <span className={ui.dropzoneTitle}>{currentCount > 0 ? 'Add more' : 'Drop photos here'}</span>
          <span className={ui.dropzoneHint}>JPG, PNG up to 10 photos</span>
        </>
      )}
      <input type="file" accept="image/*,.heic" multiple className={ui.srOnly} disabled={processing} onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = ''; }} />
    </label>
  );
}

function VoiceNoteUploader({ voiceFile, onRecord, onRemove }: { voiceFile: File | null; onRecord: (file: File) => void; onRemove: () => void }) {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bars] = useState(() => Array.from({ length: 36 }, (_, i) => 15 + Math.sin(i * 0.4) * 12 + Math.random() * 8));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const recorder = new MediaRecorder(stream); mediaRecorderRef.current = recorder; chunksRef.current = []; setElapsed(0); timerRef.current = setInterval(() => { setElapsed((p) => p + 1); }, 1000); recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); }; recorder.onstop = () => { if (timerRef.current) clearInterval(timerRef.current); const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' }); const url = URL.createObjectURL(blob); setPreviewUrl(url); onRecord(file); stream.getTracks().forEach((t) => t.stop()); }; recorder.start(); setRecording(true); } catch {} };
  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };
  const togglePlayback = () => { if (!audioRef.current) return; playing ? audioRef.current.pause() : audioRef.current.play(); setPlaying(!playing); };
  const handleRemove = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setPlaying(false); setElapsed(0); onRemove(); };
  const handleFileUpload = (file: File) => { const url = URL.createObjectURL(file); setPreviewUrl(url); onRecord(file); };

  if (voiceFile && previewUrl) {
    return (
      <div className={s.voiceRow}>
        <audio ref={audioRef} src={previewUrl} onEnded={() => setPlaying(false)} />
        <button type="button" onClick={togglePlayback} className={s.voicePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={16} strokeWidth={2.6} fill="currentColor" aria-hidden="true" /> : <Play size={16} strokeWidth={2.6} fill="currentColor" className={s.playGlyph} aria-hidden="true" />}
        </button>
        <div className={s.wave} aria-hidden="true">{bars.map((h, i) => (<span key={i} className={cx(s.waveBar, i < 24 && s.waveBarOn)} style={{ height: `${h}%` }} />))}</div>
        <span className={s.time}>{fmtTime(elapsed)}</span>
        <IconBtn label="Remove voice note" size="sm" danger onClick={handleRemove}>
          <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
        </IconBtn>
      </div>
    );
  }
  if (recording) {
    return (
      <button type="button" onClick={stopRecording} className={cx(ui.btn, s.stopRec)}>
        <span className={s.pulseBox} aria-hidden="true"><span className={s.pulse} /></span>
        <Square size={13} strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
        Stop Recording · {fmtTime(elapsed)}
      </button>
    );
  }
  return (
    <div className={s.voiceActions}>
      <Btn variant="soft" onClick={startRecording} icon={<Mic size={18} strokeWidth={2.4} aria-hidden="true" />}>
        Record
      </Btn>
      <label className={btnClass({ variant: 'soft' })}>
        <Upload size={18} strokeWidth={2.4} aria-hidden="true" />
        <span>Upload</span>
        <input type="file" accept="audio/*" className={ui.srOnly} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
      </label>
    </div>
  );
}

function VideoUploader({ videoFile, onAdd, onRemove, isUploading }: { videoFile: PendingMedia | null; onAdd: (file: File) => void; onRemove: () => void; isUploading: boolean }) {
  const { maxVideoLength } = usePlanLimits();
  const maxSeconds = maxVideoLength ?? 300;
  const maxMinutes = Math.round(maxSeconds / 60);
  if (videoFile) {
    return (
      <div className={s.videoCard}>
        <div className={s.videoBox}>
          <video src={videoFile.preview} controls={!isUploading} playsInline preload="metadata" className={cx(s.videoPreview, isUploading && s.busy)} />
          {isUploading && (<div className={s.videoBusy}><Spinner size={28} label="Uploading" /></div>)}
        </div>
        <div className={s.videoMeta}>
          <div className={s.videoText}>
            <p className={s.videoName}>{videoFile.file.name}</p>
            <p className={s.videoSize}>{(videoFile.file.size / (1024 * 1024)).toFixed(1)} MB{isUploading && ' · Uploading…'}</p>
          </div>
          {!isUploading && (
            <IconBtn label="Remove video" ghost size="sm" onClick={onRemove}>
              <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
            </IconBtn>
          )}
        </div>
      </div>
    );
  }
  return (
    <label className={cx(ui.dropzone, s.drop)}>
      <IconTile Icon={Play} tone={ORANGE} />
      <span className={ui.dropzoneTitle}>Add Video</span>
      <span className={ui.dropzoneHint}>MP4, MOV, or WebM (max {maxMinutes} min)</span>
      <input type="file" accept="video/mp4,video/quicktime,video/webm" className={ui.srOnly} onChange={(e) => { const f = e.target.files?.[0]; if (f) { const video = document.createElement('video'); video.preload = 'metadata'; video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); if (video.duration > maxSeconds) { safeToast.error(`Video must be ${maxMinutes} minutes or less.`); } else { onAdd(f); } }; video.src = URL.createObjectURL(f); } e.target.value = ''; }} />
    </label>
  );
}
