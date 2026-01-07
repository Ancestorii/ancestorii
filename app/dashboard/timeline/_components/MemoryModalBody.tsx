'use client';

import { useRef, useState } from 'react';
import { Mic, UploadCloud, Square } from 'lucide-react';
import { Trash2 } from 'lucide-react';


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
  onUploadMedia,
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
  onUploadMedia: (file: File) => void;
  onDeleteMedia: (media: MediaItem) => void; // 👈 ADD THIS
}) {


  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
if (!stream) return;
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

  const UploadMediaBox = ({ compact = false }: { compact?: boolean }) => (
  <label
    className={`
      flex flex-col items-center justify-center
      w-full max-w-lg
      border-2 border-dashed border-[#E6C26E]/50
      rounded-2xl
      ${compact ? 'p-6' : 'p-12'}
      text-center
      cursor-pointer
      bg-[#FFFDF7]
      hover:bg-[#FFF7DF]
      transition
    `}
  >
    <UploadCloud className="w-8 h-8 text-[#D4AF37] mb-3" />

    <p className="text-sm font-semibold text-[#1F2837]">
      {compact ? 'Add another memory' : 'Add media to this memory'}
    </p>

    {!compact && (
      <p className="text-sm text-gray-500 mt-1">
        Photos, videos, or audio help bring this moment to life
      </p>
    )}

    <input
      type="file"
      accept="image/*,video/*,audio/*"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onUploadMedia(file);
      }}
    />
  </label>
);


  if (loading) {
    return (
      <div className="h-[55vh] grid place-items-center text-gray-500 italic">
        Preserving memories…
      </div>
    );
  }


  return (
    <div className="max-h-[78vh] overflow-y-auto bg-white">
      <div>
       {media.length === 0 && (
  <div className="h-[55vh] flex items-center justify-center">
    <UploadMediaBox />
  </div>
)}
        {media.map((m, index) => {

          return (
            <div key={m.id} className="grid lg:grid-cols-3 gap-0 px-10 py-6">
              {/* MEDIA */}
              <div className="lg:col-span-2 pr-4">

               <div className="relative rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-200 bg-white group">

  {/* DELETE MEDIA BUTTON */}
  <button
    onClick={() => onDeleteMedia(m)}
    className="
      absolute top-3 right-3 z-10
      opacity-0 group-hover:opacity-100
      transition
      bg-white/90 backdrop-blur
      border border-red-200
      text-red-600
      text-xs font-semibold
      px-3 py-1 rounded-full
      hover:bg-red-50
    "
  >
    Delete
  </button>


                   {m.type === 'photo' && (
                    <img  src={m.url}  className="w-full max-h-[60vh] object-contain"/>
                  )}
                   {m.type === 'video' && (
                    <video src={m.url} controls className="w-full max-h-[70vh] object-contain bg-black" />
                  )}
                   {m.type === 'audio' && (
                    <div className="p-6">
                      <audio controls src={m.url} className="w-full" />
                    </div>
                  )}
                </div>
                    {/* 👇 THIS IS THE KEY */}
                    {index === media.length - 1 && (
                   <div className="mt-10 flex justify-center">
                   <UploadMediaBox compact />
                   </div>
                    )}
                  </div>

              {/* RIGHT PANEL */}
              {index === 0 && (
              <div className="border-l border-[#E6C26E]/50 pl-10 space-y-12">
                {/* WRITTEN */}
                <section>
                  <h3
                    className="text-2xl font-bold italic mb-2"
                    style={{ color: '#D4AF37' }}
                  >
                    Written memory
                  </h3>

                  {comments.length ? (
                    <div className="space-y-4 mb-5">
                     {comments.map((c) => (
                  <div
                       key={c.id}
                      className="relative rounded-xl bg-[#FFFDF7] border border-[#E6C26E]/40 p-4"
  >
    {/* DELETE ICON — ALWAYS VISIBLE */}
    <button
      onClick={() => onDeleteComment(c.id)}
      title="Delete comment"
      className="
        absolute
        top-3
        right-3
        text-gray-400
        hover:text-red-500
        transition-colors
        duration-150
      "
    >
      <Trash2 className="w-4 h-4" />
    </button>

    <p className="text-sm text-gray-800 leading-relaxed pr-8">
      {c.comment}
    </p>

    <p className="text-xs text-gray-500 mt-2 italic">
  {c.profile?.[0]?.full_name ?? 'You'} · {new Date(c.created_at).toLocaleString()}
</p>
</div>
))}

                    </div>
                  ) : (
                    <p className="text-s text-gray-500 mb-4">
                      Write something meaningful, take your time.
                    </p>
                  )}

                  <div className="rounded-2xl border border-[#E6C26E]/40 bg-[#FFFDF7] p-4 shadow-sm">
                    <textarea
                      value={newComment}
                      onChange={(e) => onChangeComment(e.target.value)}
                      placeholder="Add a thought, detail or feeling..."
                     className="
                         w-full
                         resize-none
                         bg-transparent
                         text-sm
                         text-[#1F2837]
                         placeholder:text-gray-500 
                         outline-none
                         leading-relaxed
                        "
                    />
                      <div className="mt-3 flex justify-end">
                    <button
                      onClick={onAddComment}
                      disabled={addingComment}
                      className="
                     px-6 h-[40px]
                     rounded-full
                     text-sm font-semibold
                      transition
                      border border-[#E6C26E]/60
                     text-[#1F2837]
                      hover:bg-[#FFF7DF]
                     hover:shadow-sm
                      disabled:opacity-50
                       disabled:cursor-not-allowed
                     "
                    >
                      Save
                    </button>
                  </div>
                  </div>
                </section>

                {/* VOICE */}
                <section>
                  <h3
                    className="text-2xl font-bold italic mb-2"
                    style={{ color: '#D4AF37' }}
                  >
                    Spoken memory
                  </h3>
                  <p className="text-s text-gray-500 mb-6">
                    A voice carries emotion no photograph ever could.
                  </p>

                  {voices.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {voices.map((v) => (
                        <div
                          key={v.id}
                          className="rounded-xl bg-[#FFFDF7] border border-[#E6C26E]/40 p-4"
                        >
                          <audio controls src={v.url} className="w-full" />
                          <p className="text-xs text-gray-500 italic mt-2">
                          {v.profile?.[0]?.full_name ?? 'You'} · {new Date(v.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ACTIONS */}
                  {!audioUrl && (
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer rounded-full border border-[#E6C26E]/60 px-4 py-2 text-sm text-center hover:bg-[#FFF7DF]">
                        <UploadCloud className="inline w-4 h-4 mr-1" />
                        Upload voice
                        <input
                          type="file"
                          accept="audio/*"
                          hidden
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            await onUploadVoice(f);
                          }}
                        />
                      </label>

                      <button
                        onClick={startRecording}
                        className="flex-1 rounded-full bg-[#1F2837] text-white px-4 py-2 text-sm hover:opacity-90"
                      >
                        <Mic className="inline w-4 h-4 mr-1" />
                        Record
                      </button>
                    </div>
                  )}

                  {recording && (
                    <div className="flex flex-col items-center mt-6">
                      <button
                        onClick={stopRecording}
                        className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse"
                      >
                        <Square className="w-6 h-6 text-white" />
                      </button>
                      <p className="text-xs italic text-gray-500 mt-3">
                        Recording… speak freely
                      </p>
                    </div>
                  )}

                  {audioUrl && (
                    <div className="mt-6 space-y-3">
                      <audio controls src={audioUrl} className="w-full" />
                      <button
                        onClick={async () => {
                          if (!audioBlob) return;
                          await onUploadVoice(new File([audioBlob], 'recording.webm'));
                          setRecording(false);
                          setAudioBlob(null);
                          setAudioUrl(null);
                        }}
                        className="w-full rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] py-2 text-sm font-semibold text-[#1F2837]"
                      >
                        Seal voice into memory
                      </button>
                    </div>
                  )}
                </section>
              </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
