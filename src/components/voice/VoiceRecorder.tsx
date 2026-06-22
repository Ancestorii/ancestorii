'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, Send, Loader2, X } from 'lucide-react';

/**
 * Record a voice note (or optionally upload an audio file), preview it, then hand
 * the resulting File to the parent via `onSubmit`. The parent owns the upload +
 * DB insert; this component only captures audio. Recordings are WebM — the
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

  const btnSize = compact ? 'h-10 w-10' : 'h-11 w-11';

  return (
    <div className="border border-[#E8E0D2] bg-[#FDFCFA] p-3 sm:p-4">
      {/* PREVIEW — audio captured, ready to send */}
      {file && previewUrl ? (
        <div className="flex items-center gap-3">
          <audio ref={audioRef} src={previewUrl} onEnded={() => setPlaying(false)} />
          <button
            onClick={togglePlayback}
            className={`flex ${btnSize} items-center justify-center text-white flex-shrink-0 transition-transform hover:scale-105 active:scale-95`}
            style={{ background: 'linear-gradient(135deg, #D8BE8B 0%, #A9782F 100%)' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <div className="flex-1 flex items-center gap-[1.5px] h-7 min-w-0">
            {bars.map((h, i) => (
              <div key={i} className="flex-1" style={{ height: `${h}%`, minHeight: 3, background: '#D8BE8B' }} />
            ))}
          </div>
          {!submitting && (
            <button onClick={reset} className="flex h-8 w-8 items-center justify-center border border-[#E8E0D2] hover:bg-[#FEF2F2] transition-colors flex-shrink-0" aria-label="Discard recording">
              <Trash2 size={13} className="text-[#C0392B]" />
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex h-9 items-center gap-1.5 px-4 text-[12px] font-semibold text-white transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {submitting ? 'Saving…' : 'Send'}
          </button>
        </div>
      ) : recording ? (
        /* RECORDING */
        <div className="flex items-center gap-3">
          <button
            onClick={stopRecording}
            className="flex h-11 flex-1 items-center justify-center gap-2.5 bg-[#FEF2F2] border border-[#F3C9C4] text-[13px] font-semibold text-[#C0392B] transition-colors hover:bg-[#FCE8E6]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#C0392B] animate-pulse" />
            Stop · {fmt(elapsed)}
            <Square size={11} />
          </button>
        </div>
      ) : (
        /* IDLE */
        <div className="flex items-center gap-2.5">
          <button
            onClick={startRecording}
            className="flex h-11 flex-1 items-center justify-center gap-2.5 border border-[#DCC7A4] bg-white text-[13px] font-semibold text-[#A9782F] transition-all hover:border-[#C8A557] hover:bg-[#FBF7EE]"
          >
            <Mic size={16} className="text-[#C8A557]" />
            Record a voice note
          </button>
          {allowUpload && (
            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 px-4 border border-[#DCC7A4] bg-white text-[13px] font-semibold text-[#A9782F] transition-all hover:border-[#C8A557] hover:bg-[#FBF7EE]">
              <Upload size={15} className="text-[#C8A557]" />
              Upload
              <input
                type="file"
                accept="audio/*"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }}
              />
            </label>
          )}
          {onCancel && (
            <button onClick={onCancel} className="flex h-11 w-11 items-center justify-center border border-[#E8E0D2] text-[#9C9488] transition-colors hover:bg-[#F5F0E8]" aria-label="Cancel">
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-2.5 text-[12px] text-[#C0392B]">{error}</p>}
    </div>
  );
}
