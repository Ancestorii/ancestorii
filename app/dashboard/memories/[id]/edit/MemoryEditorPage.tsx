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

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Each section's tile takes its own colour: the title and the words in My Family's pink and
// aqua, photos and video in the albums' orange, the voice note in the voice notes' blue.
const PINK = toneByKey('pink');
const AQUA = toneByKey('aqua');
const ORANGE = toneByKey('orange');
const BLUE = toneByKey('blue');

const TILE_SIZES = '(max-width: 639px) 31vw, 180px';

type PendingMedia = { id: string; file: File; preview: string };
type ExistingImage = { id: string; url: string };

type EditorProps = {
  mode: 'create' | 'edit';
  memoryId?: string;
  familyId: string;
  initialTitle?: string;
  initialBody?: string;
  initialImages?: ExistingImage[];
  initialVideoUrl?: string | null;
  initialVoiceUrl?: string | null;
};

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function MemoryEditorPage({
  mode,
  memoryId: existingMemoryId,
  familyId,
  initialTitle = '',
  initialBody = '',
  initialImages = [],
  initialVideoUrl = null,
  initialVoiceUrl = null,
}: EditorProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialImages);
  const [existingVideoUrl] = useState<string | null>(initialVideoUrl);
  const [existingVoiceUrl, setExistingVoiceUrl] = useState<string | null>(initialVoiceUrl);
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

  useEffect(() => { setMounted(true); }, []);

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

  const removeExistingImage = useCallback(async (id: string) => {
    const supabase = getBrowserClient();
    const { error } = await supabase.from('family_memory_media').delete().eq('id', id);
    if (!error) { setExistingImages((prev) => prev.filter((img) => img.id !== id)); }
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let targetId = memoryId;

      setPublishStep('Saving memory…');
      if (!targetId) {
        const { data: newMemory, error: createErr } = await supabase
          .from('family_memories')
          .insert({ family_id: familyId, author_id: user.id, title: title.trim(), body })
          .select('id')
          .single();
        if (createErr || !newMemory) { setPublishError(createErr?.message || 'Failed to save memory.'); setPublishing(false); return; }
        targetId = newMemory.id;
        setMemoryId(newMemory.id);
      } else {
        const { error: updateErr } = await supabase
          .from('family_memories')
          .update({ title: title.trim(), body, updated_at: new Date().toISOString() })
          .eq('id', targetId);
       if (updateErr) { setPublishError(updateErr.message || 'Failed to update memory.'); setPublishing(false); return; }
      }

      for (let i = 0; i < media.length; i++) {
        setPublishStep(`Uploading photo ${i + 1}/${media.length}…`);
        setUploadingMediaIndex(i);
        const ext = media[i].file.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${targetId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from('memory-media').upload(filePath, media[i].file);
        if (!upErr) {
          await supabase.from('family_memory_media').insert({
            memory_id: targetId, family_id: familyId, user_id: user.id,
            file_path: filePath, file_type: 'image',
            display_order: existingImages.length + i,
          });
        }
      }
      setUploadingMediaIndex(-1);

      if (videoFile) {
        setPublishStep('Uploading video…');
        setUploadingVideo(true);
        const ext = videoFile.file.name.split('.').pop() || 'mp4';
        const videoPath = `${user.id}/${targetId}/video-${Date.now()}.${ext}`;
        const { error: vidErr } = await supabase.storage.from('memory-media').upload(videoPath, videoFile.file);
        if (!vidErr) {
          await supabase.from('family_memories').update({ video_path: videoPath }).eq('id', targetId);
        }
        setUploadingVideo(false);
      }

      if (voiceFile) {
        setPublishStep('Uploading voice note…');
        const voicePath = `${user.id}/${targetId}/voice-${Date.now()}.webm`;
        const { error: voiceErr } = await supabase.storage.from('memory-media').upload(voicePath, voiceFile);
        if (!voiceErr) {
          await supabase.from('family_memories').update({ voice_note_path: voicePath }).eq('id', targetId);
        }
      } else if (!existingVoiceUrl && initialVoiceUrl) {
        setPublishStep('Updating voice note…');
        await supabase.from('family_memories').update({ voice_note_path: null }).eq('id', targetId);
      }

      router.push(`/dashboard/memories/${targetId}`);
    } finally {
      setPublishing(false);
      setUploadingMediaIndex(-1);
      setUploadingVideo(false);
    }
  };

  const wordCount = stripHtml(body).split(/\s+/).filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const allImages = [...existingImages.map((i) => i.url), ...media.map((m) => m.preview)];
  const completeness = [title.trim().length > 0, stripHtml(body).length > 0].filter(Boolean).length;
  const previewText = stripHtml(body);
  const hasVoice = !!(voiceFile || existingVoiceUrl);
  const hasVideo = !!(videoFile || existingVideoUrl);

  return (
    <div>
      {/* ═══ STICKY BAR: back; the count, preview and save ═══ */}
      <div className={cx(s.bar, mounted ? s.rise : s.preMount)}>
        <div className={s.barPad}>
          <div className={cx(ui.wrap, s.barRow)}>
            <Btn
              variant="soft"
              size="sm"
              onClick={() => router.back()}
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
        <div className={cx(ui.wrap, mounted ? s.rise : s.preMount)}>
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
                          <IconBtn label="Delete this photo" size="sm" onPhoto danger onClick={() => removeExistingImage(img.id)} className={s.tileRemove}>
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
                {existingVoiceUrl && !voiceFile && (
                  <div className={s.voiceRow}>
                    <audio id="existing-voice" src={existingVoiceUrl} />
                    <button type="button" onClick={() => { const el = document.getElementById('existing-voice') as HTMLAudioElement; if (el) { el.paused ? el.play() : el.pause(); } }} className={s.voicePlay} aria-label="Play saved voice note">
                      <Play size={16} strokeWidth={2.6} fill="currentColor" className={s.playGlyph} aria-hidden="true" />
                    </button>
                    <div className={s.voiceText}>
                      <p className={s.voiceTitle}>Saved voice note</p>
                      <p className={s.voiceSub}>Previously recorded</p>
                    </div>
                    <IconBtn label="Replace voice note" size="sm" danger onClick={() => setExistingVoiceUrl(null)}>
                      <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                    </IconBtn>
                  </div>
                )}
                {!existingVoiceUrl && (<VoiceNoteUploader voiceFile={voiceFile} onRecord={setVoiceFile} onRemove={() => setVoiceFile(null)} />)}
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
  useEffect(() => { if (!quill) return; const current = quill.root.innerHTML; const next = value || ''; if (current !== next && lastAppliedRef.current !== next) { quill.root.innerHTML = next; lastAppliedRef.current = next; } }, [quill, value]);
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
      <input type="file" accept="video/mp4,video/quicktime,video/webm" className={ui.srOnly} onChange={(e) => { const f = e.target.files?.[0]; if (f) { const video = document.createElement('video'); video.preload = 'metadata'; video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); if (video.duration > maxSeconds) { alert(`Video must be ${maxMinutes} minutes or less.`); } else { onAdd(f); } }; video.src = URL.createObjectURL(f); } e.target.value = ''; }} />
    </label>
  );
}
