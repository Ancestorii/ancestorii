'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getSignedMediaUrl } from '@app/dashboard/timeline/_actions/uploadMedia';
import MemoryModalBody from './MemoryModalBody';
import { safeToast as toast } from '@/lib/safeToast';
import { Trash2 } from 'lucide-react';


type DbMedia = {
  id: string;
  file_path: string | null;
  file_type: 'photo' | 'video' | 'audio' | 'file';
  created_at: string | null;
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
  media_id: string;
  user_id: string;
  profile?: { full_name: string | null }[] | null;
};

type VoiceItem = {
  id: string;
  url: string;
  created_at: string;
  media_id: string;
  user_id: string;
  profile?: { full_name: string | null }[] | null;
};

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
  const [commentsByMedia, setCommentsByMedia] = useState<Record<string, CommentItem[]>>({});
  const [voicesByMedia, setVoicesByMedia] = useState<Record<string, VoiceItem[]>>({});

  // new per-media comment inputs
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [addingComment, setAddingComment] = useState<Record<string, boolean>>({});

  // new per-media voice uploads
  const [addingVoice, setAddingVoice] = useState<Record<string, boolean>>({});

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);


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
        const { data: m, error } = await supabase
          .from('timeline_event_media')
          .select('id, file_path, file_type, created_at')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true });

        if (error || !m) {
          setMedia([]);
          return;
        }

        const out: MediaItem[] = [];
        for (const row of m as DbMedia[]) {
          try {
           if (!row.file_path) throw new Error('No media path');
            const path = row.file_path;
            const signed = await getSignedMediaUrl(supabase, path, 3600);

            out.push({
              id: row.id,
              url: signed,
              type: (row.file_type as any) || 'file',
              created_at: row.created_at,
            });
          } catch {
            out.push({
              id: row.id,
              url: '',
              type: (row.file_type as any) || 'file',
              created_at: row.created_at,
            });
          }
        }
        setMedia(out);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId]);

async function fetchCommentsFor(mediaId: string) {
  const { data, error } = await supabase
    .from('timeline_event_media_comments')
    .select('id, comment, created_at, media_id, user_id, profile:profiles!user_id ( full_name )')
    .eq('media_id', mediaId)
    .order('created_at', { ascending: true });

  if (error) {
    console.debug('No comments for media', mediaId);
    setCommentsByMedia((p) => ({ ...p, [mediaId]: [] }));
    return;
  }

   setCommentsByMedia((p) => ({
    ...p,
    [mediaId]: (data ?? []) as CommentItem[],
 }));
}


async function fetchVoicesFor(mediaId: string) {
  const { data, error } = await supabase
    .from('timeline_event_media_voice_notes')
    .select('id, file_path, created_at, media_id,  user_id,  profile:profiles!user_id ( full_name )')
    .eq('media_id', mediaId)
    .order('created_at', { ascending: true });

  if (error) {
    console.debug('No voice notes for media', mediaId);
    setVoicesByMedia((p) => ({ ...p, [mediaId]: [] }));
    return;
  }

  const list: VoiceItem[] = [];
  for (const row of data ?? []) {
    try {
      if (!row.file_path) continue;
      const path = row.file_path;

      const signed = await getSignedMediaUrl(supabase, path, 3600);

      list.push({
         id: row.id,
          url: signed,
         created_at: row.created_at,
         media_id: row.media_id,
         user_id: row.user_id,
         profile: row.profile ?? null,
});

    } catch {
      // never block UI
    }
  }

  setVoicesByMedia((p) => ({ ...p, [mediaId]: list }));
}

async function uploadMedia(file: File) {
  try {
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
    const { data: m, error: fetchErr } = await supabase
      .from('timeline_event_media')
      .select('id, file_path, file_type, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (fetchErr || !m) throw fetchErr;

    const out: MediaItem[] = [];
    for (const row of m as DbMedia[]) {
      if (!row.file_path) throw new Error('No media path');
      const path = row.file_path;


        const signed = await getSignedMediaUrl(supabase, path, 3600);

      out.push({
        id: row.id,
        url: signed,
        type: (row.file_type as any) || 'file',
        created_at: row.created_at,
      });
    }

    setMedia(out);
    toast.success('Media added to memory.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to upload media.');
  }
}

  // load per-media comments/voices when media changes
  useEffect(() => {
    if (!open) return;
    (async () => {
      for (const m of media) {
        await Promise.all([fetchCommentsFor(m.id), fetchVoicesFor(m.id)]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, media.map((m) => m.id).join(',')]);

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
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    toast.success('Memory deleted.');
    setConfirmDeleteOpen(false);
    onOpenChange(false);
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete memory.');
  } finally {
    setDeleting(false);
  }
}


async function addComment(mediaId: string) {
  const text = newComment[mediaId]?.trim();
  if (!text) return;

  setAddingComment((p) => ({ ...p, [mediaId]: true }));

  try {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('timeline_event_media_comments')
      .insert({
        media_id: mediaId,
        user_id: user.id,
        comment: text,
      })
      .select('id, comment, created_at')
      .single();

    if (error) throw error;

    // ✅ update UI immediately
    setCommentsByMedia((p) => ({
  ...p,
  [mediaId]: [
    ...(p[mediaId] ?? []),
   {
  id: data.id,
   comment: data.comment,
  created_at: data.created_at,
  media_id: mediaId,
  user_id: user.id,
  profile: null, // resolved on next fetch
},
  ],
}));



    setNewComment((p) => ({ ...p, [mediaId]: '' }));
    toast.success('Your words have been preserved.');

  } catch (e) {
    console.error(e);
    toast.error('Failed to save memory.');
  } finally {
    setAddingComment((p) => ({ ...p, [mediaId]: false }));
  }
}

async function deleteComment(commentId: string, mediaId: string) {
  try {
    // 1️⃣ Try dedicated per-media comments table
    let res = await supabase
      .from('timeline_event_media_comments')
      .delete()
      .eq('id', commentId);


    if (res.error) throw res.error;

    // 3️⃣ Remove comment from local state (UI)
    setCommentsByMedia((prev) => ({
      ...prev,
      [mediaId]: prev[mediaId].filter((c) => c.id !== commentId),
    }));

    toast.success('Comment deleted.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete comment.');
  }
}


  // Upload a per-media voice note (store + show author)
  async function uploadVoice(mediaId: string, file: File) {
    if (!file) return;
    setAddingVoice((p) => ({ ...p, [mediaId]: true }));
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

      // insert (prefer media-linked), return author name
      let ins = await supabase
        .from('timeline_event_media_voice_notes')
        .insert({ media_id: mediaId, user_id: user.id, file_path: storagePath, })
        .select('id, file_path, created_at, media_id, user_id')
        .single();

      if (ins.error) {
        ins = await supabase
          .from('timeline_event_media_voice_notes')
          .insert({ media_id: mediaId, user_id: user.id, file_path: storagePath, })
          .select('id, file_path, created_at, media_id, user_id')
          .single();
      }

      if (!ins.error && ins.data) {
        const signed = await getSignedMediaUrl(supabase, (ins.data as any).file_path, 3600);
        setVoicesByMedia((p) => ({
          ...p,
          [mediaId]: [
            ...(p[mediaId] || []),
            {
           id: ins.data.id,
          url: signed,
          created_at: ins.data.created_at,
          media_id: ins.data.media_id,
          user_id: user.id,
           profile: null,
           },
          ],
        }));
        toast.success('Voice preserved.');
      }
      } catch (err) {
    console.error(err);
    toast.error('Failed to save voice.');
  } finally {
    setAddingVoice((p) => ({ ...p, [mediaId]: false }));
  }
}

  if (!open) return null;

  return (
  <div className="fixed inset-0 z-[1000]">
    {/* OVERLAY */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => onOpenChange(false)}
    />

    {/* POSITIONING WRAPPER (NO CLIPPING) */}
    <div
      className="
        absolute left-1/2 top-1/2
        w-[96vw] max-w-6xl
        -translate-x-1/2 -translate-y-1/2
        rounded-4xl
        shadow-4xl
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* VISUAL CONTAINER (ROUNDED + CLIPPED) */}
      <div className="bg-white rounded-2xl overflow-hidden">

        {/* HEADER — ANCESTORII STYLE */}
        <div className="px-8 py-6 border-b border-[#E6C26E]/50 bg-white">
          <div className="flex items-start justify-between gap-6">

            {/* LEFT — TITLE + SUBTEXT */}
            <div className="flex-1 max-w-[70%]">
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={1}
                className="
                  w-full
                  resize-none
                  overflow-visible
                  text-5xl
                  leading-[1.6]
                  font-bold
                  tracking-tight
                  text-[#0f2040]
                  bg-transparent
                  outline-none
                  placeholder:text-[#D4AF37]/40
                "
              />

              <p className="text-sm text-gray-600 max-w-xl">
                This memory holds every image, word, and voice exactly as it was —
                preserved as part of your story.
              </p>
            </div>

            {/* RIGHT — ACTIONS */}
<div className="flex flex-col items-end gap-2 pt-2">

  {/* TOP ROW — SAVE + CLOSE */}
  <div className="flex items-center gap-3">
    {/* SAVE */}
    <button
      onClick={saveTop}
      disabled={saving}
      className={`
        inline-flex items-center justify-center
        px-6 h-[42px]
        rounded-full
        text-sm font-semibold
        transition
        ${
          saving
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] hover:shadow-lg hover:scale-[1.02]'
        }
      `}
    >
      {saving || saveStatus === 'saving'
        ? 'Sealing…'
        : saveStatus === 'saved'
        ? 'Saved ✓'
        : 'Save memory'}
    </button>

    {/* CLOSE */}
    <button
      onClick={() => onOpenChange(false)}
      className="
        inline-flex items-center justify-center
        px-12 h-[42px]
        rounded-full
        text-sm font-semibold
        text-gray-700
        border border-gray-200
        bg-white
        hover:bg-gray-50
        hover:text-gray-900
        transition
      "
    >
      Close
    </button>
  </div>

  {/* DELETE — LOWER, NEAR DIVIDER */}
<button
  onClick={() => setConfirmDeleteOpen(true)}
  className="
    inline-flex items-center justify-center
    w-[32px] h-[32px]
    rounded-full
    border border-gray-200
    text-gray-400
    hover:text-red-600
    hover:border-red-300
    hover:bg-red-50
    transition
    mt-8
  "
>
  <Trash2 size={18} />
</button>


</div>


          </div>
        </div>

        {/* BODY */}
        <MemoryModalBody
          loading={loading}
          media={media}
          commentsByMedia={commentsByMedia}
          voicesByMedia={voicesByMedia}
          newComment={newComment}
          addingComment={addingComment}
          addingVoice={addingVoice}
          onChangeComment={(mediaId, value) =>
            setNewComment((p) => ({ ...p, [mediaId]: value }))
          }
          onAddComment={addComment}
          onUploadVoice={uploadVoice}
          onDeleteComment={deleteComment}
          onUploadMedia={uploadMedia}
        />

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
  </div>
);
}
