'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { Check, Mic, RotateCcw, UploadCloud, X } from 'lucide-react';
import { ui, Btn, IconBtn, IconTile, Spinner, toneByKey, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './capsuleDetail.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type UploadedVoice = {
  id: string;
  capsule_id: string;
  user_id: string;
  file_path: string;
  created_at: string;
  signed_url?: string | null;
};

type Props = {
  capsuleId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: (note: UploadedVoice) => void;
};

export default function VoiceNoteDrawer({
  capsuleId,
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

  // Escape closes it (as the close button does), Tab stays inside, focus returns to the
  // button that opened it.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  const disabled = useMemo(() => {
    if (mode === 'upload') return submitting || !file;
    if (mode === 'record') return submitting || !audioBlob;
    return true;
  }, [mode, submitting, file, audioBlob]);

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

    const path = `${user.id}/${capsuleId}/voice/${Date.now()}-${fileName}`.replace(
      /\s+/g,
      '_'
    );

    // ✅ upload with correct MIME type
    const { error: uploadErr } = await supabase.storage
      .from('capsule-media')
      .upload(path, blobToUpload, {
        upsert: true,
        contentType: blobToUpload.type || 'audio/webm',
      });

    if (uploadErr) throw uploadErr;

    const { data, error: insertErr } = await supabase
      .from('capsule_voice_notes')
      .insert({
        capsule_id: capsuleId,
        user_id: user.id,
        file_path: path,
      })
      .select('id, capsule_id, user_id, file_path, created_at,Profiles(full_name)')
      .single();

    if (insertErr) throw insertErr;

    // ✅ sign URL for immediate playback
    const { data: signed } = await supabase.storage
      .from('capsule-media')
      .createSignedUrl(path, 3600);

    onUploaded({
      ...data,
      signed_url: signed?.signedUrl ?? null,
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
      {/* Overlay */}
      <div className={cx(ui.scrim, s.fadeIn, 'scrim-blur')} onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(ui.sheet, ui.sheetRight, s.voicePanel)}
      >
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <h2 id={titleId} className={ui.sheetTitle}>
              Leave a Voice Memory
            </h2>
            <p className={ui.sheetSub}>
              Your voice will be sealed inside this capsule: a moment, preserved exactly as you were.
            </p>
          </div>
          <IconBtn label="Close" onClick={onClose}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        <div className={ui.sheetBody}>
          {/* MODE TOGGLE */}
          <div className={cx(ui.tabs, ui.tabsBlock)} role="group" aria-label="Add a voice note by">
            <button
              type="button"
              onClick={() => setMode('upload')}
              aria-pressed={mode === 'upload'}
              className={ui.tab}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode('record')}
              aria-pressed={mode === 'record'}
              className={ui.tab}
            >
              Record
            </button>
          </div>

          {/* DROP ZONE */}
          {mode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cx(ui.dropzone, s.voiceDrop)}
            >
              <IconTile Icon={UploadCloud} tone={toneByKey('blue')} size="lg" />
              <p className={cx(ui.dropzoneTitle, 'mt-2')}>
                Click to upload a voice note
              </p>
              <p className={ui.dropzoneHint}>
                Your voice becomes part of this memory
              </p>

              {file && (
                <p className={s.fileName}>
                  {file.name}
                </p>
              )}

              {/* Visually hidden, not display:none, so the keyboard can reach it */}
              <input
                ref={fileInputRef}
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
            <p className={cx(ui.noticeError, 'mt-5')} role="alert">
              {error}
            </p>
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
