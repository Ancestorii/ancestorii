'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { Mic, UploadCloud } from 'lucide-react';

type UploadedVoice = {
  id: string;
  capsule_id: string;
  user_id: string;
  file_path: string;
  created_at: string;
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
      .select('id, capsule_id, user_id, file_path, created_at')
      .single();

    if (insertErr) throw insertErr;

    // ✅ sign URL for immediate playback
    const { data: signed } = await supabase.storage
      .from('capsule-media')
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
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#1F2837]">
            Leave a Voice Memory
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full text-sm border hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Your voice will be sealed inside this capsule — a moment, preserved exactly as you were.
        </p>

        {/* MODE TOGGLE */}
        <div className="flex mb-8 border rounded-full overflow-hidden">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              mode === 'upload'
                ? 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837]'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setMode('record')}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              mode === 'record'
                ? 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837]'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Record
          </button>
        </div>

        {/* EMOTIONAL DROP ZONE */}
        {mode === 'upload' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="
                cursor-pointer
                border-2 border-dashed border-[#E6C26E]/50
                rounded-2xl
                py-16 px-6
                text-center
                bg-[#FFFDF7]
                hover:border-[#E6C26E]
                hover:shadow-[0_0_18px_rgba(230,194,110,0.35)]
                transition
              "
            >
              <UploadCloud className="mx-auto w-10 h-10 text-[#C8A557] mb-4" />
              <p className="text-sm font-medium text-[#1F2837]">
                Click to upload a voice note
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your voice becomes part of this memory
              </p>

              {file && (
                <p className="mt-3 text-xs text-[#1F2837] font-semibold">
                  {file.name}
                </p>
              )}
            </div>
          </>
        )}

        {/* RECORD MODE */}
        {mode === 'record' && (
          <div className="flex flex-col items-center justify-center py-16">
            {!recording && !audioUrl && (
              <button
                onClick={handleStartRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
                  flex items-center justify-center
                  shadow-lg transition duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_12px_28px_rgba(230,194,110,0.45)]
                   animate-pulse-slow
                  "
              >
                <Mic className="w-10 h-10 text-[#1F2837]" />
              </button>
            )}

            {recording && (
              <button
                onClick={handleStopRecording}
                className="w-24 h-24 rounded-full bg-red-500
                  flex items-center justify-center shadow-lg animate-pulse-fast"
              >
                <Mic className="w-10 h-10 text-white" />
              </button>
            )}

            {audioUrl && !recording && (
              <div className="w-full mt-6">
                <audio controls src={audioUrl} className="w-full mb-4" />
                <button
                  onClick={() => {
                    setAudioUrl(null);
                    setAudioBlob(null);
                  }}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-800"
                >
                  Re-record
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT */}
        <button
          disabled={disabled}
          onClick={handleUpload}
          className={`w-full mt-10 rounded-full py-3 font-semibold transition ${
            disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] hover:shadow-lg hover:scale-[1.01]'
          }`}
        >
          {submitting
            ? 'Saving...'
            : mode === 'upload'
            ? 'Save Voice Note'
            : 'Save Recording'}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
