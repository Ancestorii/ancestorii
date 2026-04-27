'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getSignedMediaUrl } from '@app/dashboard/timeline/_actions/uploadMedia';
import MemoryModalBody from './MemoryModalBody';
import { safeToast as toast } from '@/lib/safeToast';
import { Trash2 } from 'lucide-react';
import { Save, BookOpen } from 'lucide-react';
import LibraryPickerModal, { LibraryPickerItem } from '@/components/LibraryPickerModal';
import { ensureDisplayableImage } from '@/lib/convertImage';

const signedUrlCache = new Map<string, string>();

type DbMedia = {
  id: string;
  file_path: string | null;
  file_type: 'photo' | 'video' | 'audio' | 'file';
  created_at: string | null;

  library_media_id?: string | null;
  library_media?:
    | {
        id: string;
        file_path: string;
        file_type: string;
        created_at: string | null;
      }
    | {
        id: string;
        file_path: string;
        file_type: string;
        created_at: string | null;
      }[]
    | null;
};

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

function SmoothMediaImage({
  src,
  alt = "",
}: {
  src: string;
  alt?: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [src]);

  return (
    <div className="relative w-full bg-black">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-500 ease-out ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="eager"
        decoding="async"
        onLoad={async (e) => {
          const img = e.currentTarget;
          try {
            if ("decode" in img) await (img as HTMLImageElement).decode();
          } catch {}
          requestAnimationFrame(() => setReady(true));
        }}
        className={`w-full h-auto object-cover block transition-opacity duration-500 ease-out ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          willChange: "opacity",
        }}
      />
    </div>
  );
}
export default function MemoryModal({
  open,
  onOpenChange,
  eventId,
  eventTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eventId: string;
  eventTitle?: string;
}) {
  const supabase = getBrowserClient();

  // top bar (editable title)
  const [title, setTitle] = useState<string>(eventTitle || '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // media + per-media meta
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // per-media comments & voices
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [voices, setVoices] = useState<VoiceItem[]>([]);

  // new per-media comment inputs
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // new per-media voice uploads
  const [addingVoice, setAddingVoice] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false);

  async function loadMedia() {
  const { data: m, error } = await supabase
    .from('timeline_event_media')
    .select(`
      id,
      file_path,
      file_type,
      created_at,
      library_media_id,
      library_media:library_media_id (
        id,
        file_path,
        file_type,
        created_at
      )
    `)
    .eq('event_id', eventId)
    .limit(50)
    .order('created_at', { ascending: true });

  if (error || !m) {
    setMedia([]);
    return;
  }

  const out = await Promise.all(
    m.map(async (row: any) => {

      const isLibrary = !!row.library_media_id;

      const lib = Array.isArray(row.library_media)
        ? row.library_media[0]
        : row.library_media;

      const realPath = isLibrary ? lib?.file_path : row.file_path;

      if (!realPath) return null;

      let signed = signedUrlCache.get(realPath);

if (!signed) {

  if (isLibrary) {
    const { data } = await supabase.storage
      .from('library-media')
      .createSignedUrl(realPath, 3600);

    signed = data?.signedUrl || '';
  } else {
    signed = await getSignedMediaUrl(realPath, 3600);
  }

  if (signed) signedUrlCache.set(realPath, signed);
}

      return {
        id: row.id,
        url: signed,
        type: row.file_type || 'file',
        created_at: row.created_at,
      };
    })
  );

  setMedia(out.filter(Boolean) as MediaItem[]);
}

  useEffect(() => {
  if (!open) return;

  const scrollEl = document.scrollingElement as HTMLElement; // usually <html>
  const prevHtmlOverflow = document.documentElement.style.overflow;
  const prevBodyOverflow = document.body.style.overflow;
  const prevScrollOverflow = scrollEl?.style.overflow;

  // lock whatever is actually scrolling
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  if (scrollEl) scrollEl.style.overflow = 'hidden';

  return () => {
    document.documentElement.style.overflow = prevHtmlOverflow;
    document.body.style.overflow = prevBodyOverflow;
    if (scrollEl) scrollEl.style.overflow = prevScrollOverflow || '';
  };
}, [open]);

  // load event title
  useEffect(() => {
    if (!open || !eventId) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('timeline_events')
          .select('title')
          .eq('id', eventId)
          .single();
        if (!error && data) {
          setTitle(data.title ?? eventTitle ?? 'Memory');
        }
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId]);



 // load media for this event
useEffect(() => {
  if (!open || !eventId) return;

  (async () => {
    setLoading(true);
    try {
      await loadMedia();
    } finally {
      setLoading(false);
    }
  })();
}, [open, eventId]);

  async function handlePickFromLibrary(item: LibraryPickerItem) {
  try {
    const { error } = await supabase
      .from('timeline_event_media')
      .insert({
  event_id: eventId,
  library_media_id: item.id,
  file_path: null,
  file_type:
    item.file_type === "image"
      ? "photo"
      : item.file_type === "video"
      ? "video"
      : item.file_type === "audio"
      ? "audio"
      : "file",
});

    if (error) throw error;

    // refresh media
    await loadMedia();

    toast.success('Added from your library.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to add from library.');
  }
}


async function uploadMedia(rawFile: File) {
  try {
    setUploadingMedia(true);
    const file = rawFile.type.startsWith('image/') ? await ensureDisplayableImage(rawFile) : rawFile;
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) throw new Error('Not authenticated');

    const fileId = crypto.randomUUID();
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${eventId}/media/${fileId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('timeline-media')
      .upload(path, file, { upsert: false });

    if (uploadError) throw uploadError;

    const mediaType =
      file.type.startsWith('image') ? 'photo' :
      file.type.startsWith('video') ? 'video' :
      file.type.startsWith('audio') ? 'audio' :
      'file';

    // 🔑 INSERT ONLY — DO NOT SELECT
    const { error: insertErr } = await supabase
      .from('timeline_event_media')
      .insert({
        event_id: eventId,
        file_path: path,
        file_type: mediaType,
      });

    if (insertErr) throw insertErr;

    // 🔑 RE-FETCH (same pattern as albums)
    await loadMedia();
    toast.success('Media added to memory.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to upload media.');
  } finally {
  setUploadingMedia(false);
}
}

async function deleteMedia(media: MediaItem) {
  try {

    const { data: row } = await supabase
      .from('timeline_event_media')
      .select('library_media_id, file_path')
      .eq('id', media.id)
      .single();

    const isLibrary = !!row?.library_media_id;

    // delete related comments
    await supabase
      .from('timeline_event_media_comments')
      .delete()
      .eq('event_id', eventId)
      .eq('media_id', media.id);

    // delete voice notes
    const { data: voices } = await supabase
      .from('timeline_event_media_voice_notes')
      .select('file_path')
      .eq('event_id', eventId)
      .eq('media_id', media.id);

    if (voices?.length) {
      await supabase.storage
        .from('timeline-media')
        .remove(voices.map(v => v.file_path));
    }

    await supabase
      .from('timeline_event_media_voice_notes')
      .delete()
      .eq('event_id', eventId)
      .eq('media_id', media.id);

    // delete storage ONLY if direct upload
    if (!isLibrary && row?.file_path) {
      await supabase.storage
        .from('timeline-media')
        .remove([row.file_path]);
    }

    // delete row
    await supabase
      .from('timeline_event_media')
      .delete()
      .eq('id', media.id);

    setMedia(prev => prev.filter(m => m.id !== media.id));
    toast.success('Removed from memory.');

  } catch (err) {
    console.error(err);
    toast.error('Failed to delete media.');
  }
}

useEffect(() => {
  if (!open || !eventId) return;

  supabase
    .from('timeline_event_media_comments')
    .select('id, comment, created_at, event_id, user_id, profile:"Profiles"!user_id(full_name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .then(({ data }) => {
      setComments(data ?? []);
    });
}, [open, eventId]);

useEffect(() => {
  if (!open || !eventId) return;

  (async () => {
    const { data } = await supabase
      .from('timeline_event_media_voice_notes')
      .select('id, file_path, created_at, event_id, user_id, profile:"Profiles"!user_id(full_name)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (!data) return;

    const signed = await Promise.all(
      data.map(async (v) => ({
        ...v,
        url: await getSignedMediaUrl(v.file_path, 3600),
      }))
    );

    setVoices(signed);
  })();
}, [open, eventId]);



  // Save title with visible confirmation
  async function saveTop() {
    setSaving(true);
    setSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('timeline_events')
        .update({ title: title?.trim() || null })
        .eq('id', eventId);
      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1400);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 1800);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMemory() {
  if (!eventId) return;

  setDeleting(true);

  try {

    const [mediaCheck, commentCheck, voiceCheck] = await Promise.all([
      supabase
        .from('timeline_event_media')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId),

      supabase
        .from('timeline_event_media_comments')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId),

      supabase
        .from('timeline_event_media_voice_notes')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId),
    ]);

    const mediaCount = mediaCheck.count ?? 0;
    const commentCount = commentCheck.count ?? 0;
    const voiceCount = voiceCheck.count ?? 0;

    if (mediaCount > 0 || commentCount > 0 || voiceCount > 0) {
      toast.error('Remove all content first.');
      return;
    }

    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    toast.success('Memory deleted.');
    window.dispatchEvent(new Event('timeline-media-updated'));
    setConfirmDeleteOpen(false);
    onOpenChange(false);

  } catch (err) {
    console.error(err);
    toast.error('Failed to delete memory.');
  } finally {
    setDeleting(false);
  }
}


async function addComment() {
  const text = newComment.trim();
  if (!text) return;

  setAddingComment(true);

  try {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('timeline_event_media_comments')
      .insert({
        event_id: eventId,
        user_id: user.id,
        comment: text,
      })
      .select('id, comment, created_at')
      .single();

    if (error) throw error;

    setComments((p) => [
      ...p,
      {
        ...data,
        event_id: eventId,
        user_id: user.id,
        profile: null,
      },
    ]);

    setNewComment('');
    toast.success('Your words have been preserved.');
  } catch (e) {
    console.error('COMMENT INSERT ERROR:', e);
    toast.error('Failed to save memory.');
  } finally {
    setAddingComment(false);
  }
}


async function deleteComment(commentId: string) {
  try {
    const { error } = await supabase
      .from('timeline_event_media_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    setComments((p) => p.filter((c) => c.id !== commentId));
    toast.success('Comment deleted.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete comment.');
  }
}



  // Upload a per-media voice note (store + show author)
async function uploadVoice(file: File) {
  if (!file) return;
  setAddingVoice(true);

  try {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) throw new Error('Not authenticated');

    const fileId = crypto.randomUUID();
    const storagePath = `${user.id}/${eventId}/voices/${fileId}.webm`;

    const { error: upErr } = await supabase.storage
      .from('timeline-media')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'audio/webm',
      });
    if (upErr) throw upErr;

    const { data, error } = await supabase
      .from('timeline_event_media_voice_notes')
      .insert({
        event_id: eventId,
        user_id: user.id,
        file_path: storagePath,
      })
      .select('id, file_path, created_at')
      .single();

    if (error) throw error;

    const signed = await getSignedMediaUrl(data.file_path, 3600);

    setVoices((p) => [
      ...p,
      {
        id: data.id,
        url: signed,
        created_at: data.created_at,
        event_id: eventId,
        user_id: user.id,
        profile: null,
      },
    ]);

    toast.success('Voice preserved.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to save voice.');
  } finally {
    setAddingVoice(false);
  }
}


  if (!open) return null;

  return (
  <div
  className="fixed inset-0 z-[1000] flex items-center justify-center"
  onWheel={(e) => e.stopPropagation()}
>
    {/* OVERLAY */}
    <div
      className="absolute inset-0 bg-black/40"
    />

    {/* POSITIONING WRAPPER (NO CLIPPING) */}
    <div
      className="
        relative
    mx-auto
    my-6
    w-[96vw] max-w-6xl
    rounded-4xl
    shadow-4xl
      "
      onClick={(e) => e.stopPropagation()}
    >
     {/* VISUAL CONTAINER */}
<div className="bg-white rounded-2xl shadow-2xl w-full h-[90vh] flex flex-col overflow-hidden">

{/* HEADER */}
<div className="px-12 pt-10 pb-6 border-b border-[#E6C26E]/40 bg-white">

<button
  onClick={() => {
    window.dispatchEvent(new Event("timeline-media-updated"));
    onOpenChange(false);
  }}
  className="
  absolute top-6 right-8
  flex items-center justify-center
  w-[36px] h-[36px]

  rounded-full
  border border-gray-200
  bg-white

  text-gray-500
  hover:bg-gray-50 hover:text-gray-800
  transition
  "
>
  ✕
</button>

  <div className="flex flex-col gap-6">

    {/* HERO TITLE */}
    <textarea
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Untitled memory"
      rows={1}
      className="
        w-full
        resize-none overflow-hidden
        bg-transparent
        outline-none

        font-semibold
        tracking-tight
        text-[#0f2040]

        text-[clamp(30px,3.5vw,44px)]
        leading-tight

        placeholder:text-[#0f2040]/30
      "
      style={{ height: "auto" }}
      onInput={(e) => {
        e.currentTarget.style.height = "auto";
        e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
      }}
    />


    {/* ACTION BAR */}
    <div className="flex justify-end">

      <div className="flex items-center gap-4">

        {/* UPLOAD */}
        <label
          className="
          inline-flex items-center gap-2
          px-5 h-[42px]
          rounded-full

          bg-emerald-50
          border border-emerald-200

          text-sm text-emerald-700
          hover:bg-emerald-100
          transition cursor-pointer
          "
        >
          + Upload

          <input
            type="file"
            hidden
            accept="image/*,video/*,audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              uploadMedia(file);
            }}
          />
        </label>


        {/* LIBRARY */}
        <button
          onClick={() => setLibraryPickerOpen(true)}
          className="
          inline-flex items-center gap-2
          px-5 h-[42px]
          rounded-full

          bg-amber-50
          border border-amber-200

          text-sm text-amber-800
          hover:bg-amber-100
          transition
          "
        >
          <BookOpen className="w-4 h-4" />
          My Library
        </button>


        {/* SAVE */}
        <button
          onClick={saveTop}
          disabled={saving}
          className={`
          inline-flex items-center gap-2
          px-5 h-[42px]
          rounded-full

          bg-blue-50
          border border-blue-200

          text-sm text-blue-700
          hover:bg-blue-100

          transition
          ${saving ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Save className="w-4 h-4" />

          {saving || saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
            ? "Saved"
            : "Save"}
        </button>


        {/* DELETE */}
<button
  onClick={() => {
    setConfirmDeleteOpen(true);
  }}
  className="
  inline-flex items-center justify-center
  px-3 h-[42px]

  rounded-full
  border border-red-200
  bg-red-50

  text-sm text-red-700
  hover:bg-red-100
  transition
  "
>
  <Trash2 className="w-4 h-4" />
</button>

      </div>

    </div>

  </div>

</div>
        {/* BODY */}
<div
  className="flex-1 overflow-y-auto"
  onWheel={(e) => e.stopPropagation()}
>
  <MemoryModalBody
    loading={loading}
    media={media}
    comments={comments}
    voices={voices}
    newComment={newComment}
    addingComment={addingComment}
    addingVoice={addingVoice}
    onChangeComment={(value) => setNewComment(value)}
    onAddComment={addComment}
    onUploadVoice={uploadVoice}
    onDeleteComment={deleteComment}
    onUploadMedia={uploadMedia}
    uploadingMedia={uploadingMedia}
    onDeleteMedia={deleteMedia}
  />
</div>
      </div>
      {confirmDeleteOpen && (
  <div className="fixed inset-0 z-[1100]">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setConfirmDeleteOpen(false)}
    />

    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Delete this memory?
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        This memory and all associated media, comments, and voice notes will be
        permanently removed. This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setConfirmDeleteOpen(false)}
          disabled={deleting}
          className="px-4 h-[38px] rounded-full border text-sm"
        >
          Cancel
        </button>

        <button
          onClick={deleteMemory}
          disabled={deleting}
          className="
            px-4 h-[38px]
            rounded-full
            bg-red-600
            text-white
            text-sm
            hover:bg-red-700
            disabled:opacity-50
          "
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    <LibraryPickerModal
  open={libraryPickerOpen}
  onClose={() => setLibraryPickerOpen(false)}
  onPick={(item) => handlePickFromLibrary(item)}
/>
  </div>
   );
}
