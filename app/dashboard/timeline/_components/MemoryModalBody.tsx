'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Mic, UploadCloud, Square } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { AudioLines, Check, FileText, ImageOff, Images, RotateCcw } from 'lucide-react';
import {
  ui,
  AppLoader,
  Avatar,
  Btn,
  IconBtn,
  IconTile,
  Spinner,
  Tag,
  btnClass,
  toneByKey,
} from '@/components/dashboard/ui/AppBits';
import s from './memoryModal.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Timelines' colour on the landing's feature index, and the voice notes' one.
const AQUA = toneByKey('aqua');
const BLUE = toneByKey('blue');


type MediaItem = {
  id: string;
  url: string;
  type: 'photo' | 'video' | 'audio' | 'file';
  created_at: string | null;
};


type CommentItem = {
  id: string;
  comment: string;
  created_at: string;
  event_id: string;
  user_id: string;
  profile?: { full_name: string | null }[] | null;
};


type VoiceItem = {
  id: string;
  url: string;
  created_at: string;
  event_id: string;
  user_id: string;
  profile?: { full_name: string | null }[] | null;
};

// The Profiles join comes back as one object (the declared type says an array, so reading
// [0] showed "You" for everyone): read either shape.
function authorName(
  profile: { full_name: string | null }[] | { full_name: string | null } | null | undefined
) {
  const one = Array.isArray(profile) ? profile[0] : profile;
  return one?.full_name ?? 'You';
}

const deleteLabel = {
  photo: 'Delete this photo',
  video: 'Delete this video',
  audio: 'Delete this recording',
  file: 'Delete this file',
} as const;

function SmoothMediaImage({
  src,
  alt = '',
}: {
  src: string;
  alt?: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [src]);

  // The whole photo, never cropped: it keeps its own shape, centred on the tile's light grey
  // (a 4:3 photo fills the tile), with its own rounded corners.
  return (
    <div className="relative w-full h-full bg-[var(--hover)]">
      {/* placeholder: the tile's light grey until the photo has decoded */}
      <div
        className={`absolute inset-0 bg-[var(--hover)] transition-opacity duration-500 ease-out ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <img
        key={src}
        src={src}
        fetchPriority="high"
        alt={alt}
        draggable={false}
        loading="eager"
        decoding="async"
        onLoad={async (e) => {
          const img = e.currentTarget;

          // decode = smoother than raw onLoad
          try {
            if ('decode' in img) await (img as HTMLImageElement).decode();
          } catch {}

          requestAnimationFrame(() => setReady(true));
        }}
        className={`absolute inset-0 m-auto block w-auto h-auto max-w-full max-h-full rounded-[16px] transition-opacity duration-500 ease-out ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'opacity',
        }}
      />
    </div>
  );
}


export default function MemoryModalBody({
  loading,
  media,
  comments,
  voices,
  newComment,
  addingComment,
  addingVoice,
  onChangeComment,
  onAddComment,
  onUploadVoice,
  onDeleteComment,
  onDeleteVoice,
  onUploadMedia,
  uploadingMedia,
  onDeleteMedia, // 👈 ADD THIS
}: {
  loading: boolean;
  media: MediaItem[];
  comments: CommentItem[];
  voices: VoiceItem[];
  newComment: string;
  addingComment: boolean;
  addingVoice: boolean;
  onChangeComment: (value: string) => void;
  onAddComment: () => void;
  onUploadVoice: (file: File) => Promise<void>;
  onDeleteComment: (commentId: string) => void;
  onDeleteVoice: (voiceId: string) => void;
  onUploadMedia: (file: File) => void;
  uploadingMedia: boolean;
  onDeleteMedia: (media: MediaItem) => void;
}) {


  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const writtenId = useId();
  const spokenId = useId();

const streamRef = useRef<MediaStream | null>(null);

useEffect(() => {
  return () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };
}, []);

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
if (!stream) return;
  streamRef.current = stream;
  const recorder = new MediaRecorder(stream);
  recorderRef.current = recorder;
  chunks.current = [];

  recorder.ondataavailable = (e) => chunks.current.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks.current, { type: 'audio/webm' });
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));
    setRecording(false);
  };

  recorder.start();
  setRecording(true);
};

const stopRecording = () => {
  const rec = recorderRef.current;
  if (!rec) return;

  const stream = rec.stream;
  rec.stop();
  stream.getTracks().forEach((t) => t.stop());
};

  if (loading) {
  return <AppLoader compact label="Preserving memories" className={s.loading} />;
}

if (uploadingMedia) {
  return <AppLoader compact label="Preserving memory" className={s.loading} />;
}

  return (
    <div className={s.layout}>

      {/* LEFT SIDE: MEDIA */}
      <div className="min-w-0">

        {/* EMPTY STATE */}
        {media.length === 0 && (
          <div className={cx(ui.empty, s.empty)}>
            <IconTile Icon={Images} tone={AQUA} size="lg" />
            <h3 className={ui.emptyTitle}>No memories have been added yet.</h3>
            <p className={ui.emptyText}>
              Use the <span className="font-extrabold">Upload</span> or{' '}
              <span className="font-extrabold">My Library</span> buttons above to begin
              preserving this moment.
            </p>
          </div>
        )}

        {/* MEDIA GRID */}
        {media.length > 0 && (
          <ul className={s.grid}>
            {media.map((m) =>
              m.type === 'audio' ? (
                // A recording: its player in a card across the row
                <li key={m.id} className={s.audioCard}>
                  <IconTile Icon={AudioLines} tone={BLUE} size="sm" />
                  {m.url ? <audio controls src={m.url} className={s.audio} /> : <span className="flex-1" />}
                  <IconBtn label={deleteLabel.audio} ghost size="sm" onClick={() => onDeleteMedia(m)}>
                    <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                  </IconBtn>
                </li>
              ) : (
                <li key={m.id} className={cx(s.tile, m.type === 'video' && m.url && s.tileVideo)}>
                  {m.type === 'photo' && m.url && (
                    <SmoothMediaImage src={m.url} alt="" />
                  )}

                  {m.type === 'video' && m.url && (
                    <video
                      key={m.url}
                      src={m.url}
                      controls
                      playsInline
                      preload="metadata"
                    />
                  )}

                  {/* No preview: a file, or a link that didn't sign */}
                  {(m.type === 'file' || !m.url) && (
                    <span className={s.tileIcon} aria-hidden="true">
                      <IconTile Icon={m.type === 'file' ? FileText : ImageOff} tone={AQUA} />
                    </span>
                  )}

                  <IconBtn
                    label={deleteLabel[m.type] ?? 'Delete'}
                    onPhoto
                    size="sm"
                    onClick={() => onDeleteMedia(m)}
                    className={s.tileDel}
                  >
                    <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                  </IconBtn>
                </li>
              )
            )}
          </ul>
        )}

      </div>

      {/* RIGHT PANEL: the words, written and spoken */}
      <div className={s.words}>

        {/* WRITTEN MEMORY */}
        <section aria-labelledby={writtenId}>
          <Tag dot="var(--c0)">Written memory</Tag>
          <h3 id={writtenId} className={cx(ui.h3, s.sectionTitle)}>
            Write something meaningful, take your time.
          </h3>

          {comments.length > 0 && (
            <ul className={s.entries}>
              {comments.map((c) => {
                const name = authorName(c.profile);
                return (
                  <li key={c.id} className={s.entry}>
                    <p className={s.entryText}>{c.comment}</p>

                    <div className={s.entryMeta}>
                      <span className={s.author}>
                        <span className="flex" aria-hidden="true">
                          <Avatar name={name} size={24} plain />
                        </span>
                        <span className="min-w-0">
                          {name} · {new Date(c.created_at).toLocaleString()}
                        </span>
                      </span>

                      <IconBtn label="Delete this comment" ghost size="sm" onClick={() => onDeleteComment(c.id)}>
                        <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                      </IconBtn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={s.composer}>
            <textarea
              value={newComment}
              onChange={(e) => onChangeComment(e.target.value)}
              placeholder="Add a thought, detail or feeling..."
              aria-label="Add a thought, detail or feeling"
              className={ui.textarea}
            />

            <div className={s.composerActions}>
              <Btn
                size="sm"
                onClick={onAddComment}
                disabled={addingComment}
                icon={addingComment ? <Spinner size={16} /> : null}
              >
                Save
              </Btn>
            </div>
          </div>
        </section>

        {/* SPOKEN MEMORY */}
        <section aria-labelledby={spokenId}>
          <Tag dot="var(--c1)">Spoken memory</Tag>
          <h3 id={spokenId} className={cx(ui.h3, s.sectionTitle)}>
            A voice carries emotion no photograph ever could.
          </h3>

          {voices.length > 0 && (
            <ul className={s.voices}>
              {voices.map((v) => {
                const name = authorName(v.profile);
                return (
                  <li key={v.id} className={cx(ui.card, s.voiceCard)}>
                    <div className={s.voiceRow}>
                      <IconTile Icon={Mic} tone={BLUE} size="sm" />
                      <audio controls src={v.url} className={s.audio} />
                      <IconBtn label="Delete this voice note" ghost size="sm" onClick={() => onDeleteVoice(v.id)}>
                        <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                      </IconBtn>
                    </div>

                    <p className={cx(s.author, s.voiceMeta)}>
                      <span className="flex" aria-hidden="true">
                        <Avatar name={name} size={24} plain />
                      </span>
                      <span className="min-w-0">
                        {name} · {new Date(v.created_at).toLocaleString()}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Hidden while recording, so a second tap on Record can't start a second
              recorder (the first would keep the microphone on) */}
          {!audioUrl && !recording && (
            <div className={s.voiceActions}>
              <label className={btnClass({ variant: 'soft', className: s.fileBtn })}>
                {addingVoice ? (
                  <Spinner size={16} />
                ) : (
                  <UploadCloud size={18} strokeWidth={2.2} aria-hidden="true" />
                )}
                <span>Upload voice</span>
                <input
                  type="file"
                  accept="audio/*"
                  className={ui.srOnly}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    await onUploadVoice(f);
                  }}
                />
              </label>

              <Btn
                onClick={startRecording}
                icon={<Mic size={18} strokeWidth={2.2} aria-hidden="true" />}
              >
                Record
              </Btn>
            </div>
          )}

          {recording && (
            <div className={s.recording}>
              <button
                type="button"
                onClick={stopRecording}
                aria-label="Stop recording"
                className={s.stopBtn}
              >
                <Square size={26} strokeWidth={2.4} fill="currentColor" aria-hidden="true" />
              </button>

              <p className={s.recordingText} role="status">
                Recording… speak freely
              </p>
            </div>
          )}

          {audioUrl && (
            <div className={s.take}>
              <div className={cx(ui.card, s.takeCard)}>
                <audio controls src={audioUrl} className={s.takeAudio} />
              </div>

              <Btn
                block
                onClick={async () => {
                  if (!audioBlob) return;
                  await onUploadVoice(new File([audioBlob], 'recording.webm'));
                  setRecording(false);
                  setAudioBlob(null);
                  setAudioUrl(null);
                }}
                disabled={addingVoice}
                tile={addingVoice ? <Spinner size={16} /> : <Check size={18} strokeWidth={2.6} />}
              >
                Seal voice into memory
              </Btn>

              <Btn
                block
                variant="soft"
                onClick={() => {
                  setRecording(false);
                  setAudioBlob(null);
                  setAudioUrl(null);
                }}
                icon={<RotateCcw size={16} strokeWidth={2.4} aria-hidden="true" />}
              >
                Discard & re-record
              </Btn>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
