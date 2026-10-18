'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { Check, Mic, RotateCcw, UploadCloud, X } from 'lucide-react';
import { ui, Btn, IconBtn, IconTile, Spinner, toneByKey, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type UploadedVoice = {
  id: string;
  media_id: string;
  user_id: string;
  file_path: string;
  created_at: string;
};

type Props = {
  albumId: string;
  mediaId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: (note: UploadedVoice) => void;
};

export default function VoiceNoteDrawer({
  albumId,
  mediaId,
  open,
  onClose,
  onUploaded,
}: Props) {
  const supabase = getBrowserClient();

  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const titleId = useId();
  const fileId = useId();

  // Escape closes it (as the close button does), Tab stays inside, focus returns to Record.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  const disabled = useMemo(() => {
    if (mode === 'upload') return submitting || !file;
    if (mode === 'record') return submitting || !audioBlob;
    return true;
  }, [mode, submitting, file, audioBlob]);

  // Closing the drawer (Close, Escape, the backdrop) or leaving the page mid-recording used to
  // leave the recorder running and the microphone on. Drop the take and let go of the mic.
  useEffect(() => {
    if (open) return;
    const r = mediaRecorderRef.current;
    if (r && r.state !== 'inactive') {
      r.onstop = () => r.stream.getTracks().forEach((t) => t.stop());
      r.stop();
    }
    mediaRecorderRef.current = null;
  }, [open]);

  useEffect(() => {
    const recorderRef = mediaRecorderRef;
    return () => {
      const r = recorderRef.current;
      if (r && r.state !== 'inactive') {
        r.onstop = () => r.stream.getTracks().forEach((t) => t.stop());
        r.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setMode('upload');
      setFile(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecording(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunks.current = [];
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Release the microphone (the browser's recording light stayed on before).
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError('Microphone access denied.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleUpload = async () => {
  try {
    setSubmitting(true);
    setError(null);

    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) throw new Error('You must be signed in.');

    let blobToUpload: Blob;
    let fileName: string;

    if (mode === 'upload' && file) {
      blobToUpload = file;
      fileName = file.name;
    } else if (mode === 'record' && audioBlob) {
      blobToUpload = audioBlob;
      fileName = `recording-${Date.now()}.webm`;
    } else {
      throw new Error('No audio selected.');
    }

    const path = `${user.id}/${albumId}/${mediaId}/voice-${Date.now()}-${fileName}`.replace(
      /\s+/g,
      '_'
    );

    // ✅ UPLOAD WITH CORRECT MIME TYPE
    const { error: uploadErr } = await supabase.storage
      .from('album-media')
      .upload(path, blobToUpload, {
        upsert: true,
        contentType: blobToUpload.type || 'audio/webm',
      });

    if (uploadErr) throw uploadErr;

    // ✅ INSERT DB ROW
    const { data, error: insertErr } = await supabase
      .from('album_media_voice_notes')
      .insert({
        media_id: mediaId,
        user_id: user.id,
        file_path: path,
      })
      .select('id, media_id, user_id, file_path, created_at, Profiles(full_name)')
      .single();

    if (insertErr) throw insertErr;

    // ✅ SIGN URL FOR IMMEDIATE PLAYBACK
    const { data: signed } = await supabase.storage
      .from('album-media')
      .createSignedUrl(path, 3600);

    onUploaded({
      ...data,
      file_path: signed?.signedUrl ?? '',
    });

    onClose();
  } catch (e: any) {
    console.error(e);
    toast.error('Failed to upload voice note.');
    setError(e.message || String(e));
  } finally {
    setSubmitting(false);
  }
};


  if (!open) return null;

  return (
    <div className={s.voiceLayer}>
      <div className={cx(ui.scrim, s.fadeIn, 'scrim-blur')} onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(ui.sheet, ui.sheetRight, s.voicePanel, s.dialog)}
      >
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <h2 id={titleId} className={ui.sheetTitle}>
              Leave a Voice Memory
            </h2>
            <p className={ui.sheetSub}>
              Your voice will be sealed inside this memory, preserved exactly as it was.
            </p>
          </div>
          <IconBtn label="Close" onClick={onClose}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        <div className={ui.sheetBody}>
          {/* MODE TOGGLE */}
          <div className={cx(ui.tabs, 'flex w-full')} role="group" aria-label="Add a voice note by">
            <button
              type="button"
              onClick={() => setMode('upload')}
              aria-pressed={mode === 'upload'}
              className={cx(ui.tab, 'flex-1 justify-center')}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode('record')}
              aria-pressed={mode === 'record'}
              className={cx(ui.tab, 'flex-1 justify-center')}
            >
              Record
            </button>
          </div>

          {/* UPLOAD DROP ZONE */}
          {mode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cx(s.drop, s.dropLarge, 'mt-5')}
            >
              <IconTile Icon={UploadCloud} tone={toneByKey('blue')} size="lg" />
              <p className={cx(s.dropTitle, 'mt-3')}>
                Click to upload a voice note
              </p>
              <p className={s.dropHint}>
                Your voice becomes part of this memory
              </p>

              {file && (
                <p className={s.dropFile}>
                  {file.name}
                </p>
              )}

              {/* Visually hidden, not display:none, so the keyboard can reach it */}
              <input
                ref={fileInputRef}
                id={fileId}
                type="file"
                accept="audio/*"
                className={ui.srOnly}
                aria-label="Choose a voice note to upload"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {/* RECORD MODE */}
          {mode === 'record' && (
            <div className={s.recorder}>
              {!recording && !audioUrl && (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  aria-label="Start recording"
                  className={s.recBtn}
                >
                  <Mic size={38} strokeWidth={2.2} aria-hidden="true" />
                </button>
              )}

              {recording && (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  aria-label="Stop recording"
                  className={cx(s.recBtn, s.recBtnOn)}
                >
                  <Mic size={38} strokeWidth={2.2} aria-hidden="true" />
                </button>
              )}

              {audioUrl && !recording && (
                <div className={cx(ui.card, s.take)}>
                  <audio controls src={audioUrl} />
                  <Btn
                    variant="soft"
                    size="sm"
                    onClick={() => {
                      setAudioUrl(null);
                      setAudioBlob(null);
                    }}
                    icon={<RotateCcw size={16} strokeWidth={2.4} aria-hidden="true" />}
                    className="mt-4"
                  >
                    Re-record
                  </Btn>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className={cx(ui.noticeError, 'mt-5')} role="alert">{error}</p>
          )}
        </div>

        {/* SUBMIT */}
        <div className={ui.sheetFooter}>
          <Btn
            block
            disabled={disabled}
            onClick={handleUpload}
            tile={submitting ? <Spinner size={16} /> : <Check size={18} strokeWidth={2.6} />}
          >
            {submitting
              ? 'Saving...'
              : mode === 'upload'
              ? 'Save Voice Note'
              : 'Save Recording'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
