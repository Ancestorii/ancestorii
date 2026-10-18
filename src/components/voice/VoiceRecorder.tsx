'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, Send, X } from 'lucide-react';
import { ui, Btn, IconBtn, Spinner, btnClass } from '@/components/dashboard/ui/AppBits';
import s from './voice.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/**
 * Record a voice note (or optionally upload an audio file), preview it, then hand
 * the resulting File to the parent via `onSubmit`. The parent owns the upload +
 * DB insert; this component only captures audio. Recordings are WebM, the
 * backend converts them to M4A on upload, so no conversion happens here.
 */
export default function VoiceRecorder({
  onSubmit,
  onCancel,
  allowUpload = false,
  compact = false,
}: {
  onSubmit: (file: File) => Promise<void>;
  onCancel?: () => void;
  allowUpload?: boolean;
  compact?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bars] = useState(() => Array.from({ length: 36 }, (_, i) => 15 + Math.sin(i * 0.4) * 12 + Math.random() * 8));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const recorded = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setPreviewUrl(URL.createObjectURL(blob));
        setFile(recorded);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setPlaying(false);
    setElapsed(0);
  };

  const handleFileUpload = (f: File) => {
    setError(null);
    setPreviewUrl(URL.createObjectURL(f));
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(file);
      if (mountedRef.current) reset();
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : 'Could not save your voice note.');
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  const iconSize = compact ? 16 : 17;

  return (
    <div className={s.recorder}>
      {/* PREVIEW: audio captured, ready to send */}
      {file && previewUrl ? (
        <div className={s.take}>
          <audio ref={audioRef} src={previewUrl} onEnded={() => setPlaying(false)} />
          <button
            type="button"
            onClick={togglePlayback}
            className={s.play}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <Pause size={iconSize} strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={iconSize} strokeWidth={2.6} fill="currentColor" className={s.playGlyph} aria-hidden="true" />
            )}
          </button>
          <div className={s.takeBars} aria-hidden="true">
            {bars.map((h, i) => (
              <span key={i} className={s.takeBar} style={{ height: `${h}%` }} />
            ))}
          </div>
          {!submitting && (
            <IconBtn label="Discard recording" size="sm" danger onClick={reset}>
              <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
            </IconBtn>
          )}
          <Btn
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            icon={submitting ? <Spinner size={15} /> : <Send size={15} strokeWidth={2.4} aria-hidden="true" />}
            className={s.sendBtn}
          >
            {submitting ? 'Saving…' : 'Send'}
          </Btn>
        </div>
      ) : recording ? (
        /* RECORDING */
        <button type="button" onClick={stopRecording} className={cx(ui.btn, s.stop)}>
          <span className={s.pulseBox} aria-hidden="true">
            <span className={s.pulse} />
          </span>
          Stop · {fmt(elapsed)}
          <Square size={13} strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
        </button>
      ) : (
        /* IDLE */
        <div className={s.idle}>
          <Btn
            onClick={startRecording}
            icon={<Mic size={18} strokeWidth={2.4} aria-hidden="true" />}
            className={s.recordBtn}
          >
            Record a voice note
          </Btn>
          {allowUpload && (
            <label className={btnClass({ variant: 'soft', className: s.uploadBtn })}>
              <Upload size={17} strokeWidth={2.4} aria-hidden="true" />
              <span>Upload</span>
              <input
                type="file"
                accept="audio/*"
                className={ui.srOnly}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }}
              />
            </label>
          )}
          {onCancel && (
            <IconBtn label="Cancel" onClick={onCancel}>
              <X size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
          )}
        </div>
      )}

      {error && <p className={cx(ui.fieldError, s.error)} role="alert">{error}</p>}
    </div>
  );
}
