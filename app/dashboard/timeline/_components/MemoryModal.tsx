'use client';

import { useEffect, useId, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import MemoryModalBody from './MemoryModalBody';
import { safeToast as toast } from '@/lib/safeToast';
import { Trash2 } from 'lucide-react';
import { Save, BookOpen, Check, Upload, X } from 'lucide-react';
import LibraryPickerModal, { LibraryPickerItem } from '@/components/LibraryPickerModal';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, Spinner, btnClass, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './memoryModal.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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

  // Close, as the close button always did: tell the timeline to refresh its cards, then close.
  const close = () => {
    window.dispatchEvent(new Event("timeline-media-updated"));
    onOpenChange(false);
  };

  // Escape closes the top dialog only (the confirm over the modal, or the modal), Tab stays
  // inside it, and focus goes back to where it was.
  const titleId = useId();
  const confirmTitleId = useId();
  const confirmTextId = useId();
  const panelRef = useDialog<HTMLDivElement>(open, close);
  const confirmRef = useDialog<HTMLDivElement>(confirmDeleteOpen, () => {
    if (!deleting) setConfirmDeleteOpen(false);
  });

  // Signed URLs for many files in one call per bucket.
  async function signPaths(bucket: 'timeline-media' | 'library-media', paths: string[]) {
    const map = new Map<string, string>();
    const unique = [...new Set(paths)];
    if (!unique.length) return map;
    const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, 3600);
    data?.forEach((row, i) => {
      if (row?.signedUrl) map.set(row.path ?? unique[i], row.signedUrl);
    });
    return map;
  }

  async function fetchMedia(): Promise<MediaItem[]> {
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

  if (error || !m) return [];

  const rows = (m as unknown as DbMedia[]).map((row) => {
    const isLibrary = !!row.library_media_id;
    const lib = Array.isArray(row.library_media) ? row.library_media[0] : row.library_media;
    const realPath: string | null = (isLibrary ? lib?.file_path : row.file_path) ?? null;
    return { row, isLibrary, realPath };
  });

  // One signing call per bucket (it used to be one per file, one after another).
  const [tlUrls, libUrls] = await Promise.all([
    signPaths(
      'timeline-media',
      rows.filter((r) => !r.isLibrary && r.realPath).map((r) => r.realPath as string)
    ),
    signPaths(
      'library-media',
      rows.filter((r) => r.isLibrary && r.realPath).map((r) => r.realPath as string)
    ),
  ]);

  return rows
    .filter((r) => !!r.realPath)
    .map(({ row, isLibrary, realPath }) => ({
      id: row.id,
      url: (isLibrary ? libUrls : tlUrls).get(realPath as string) ?? '',
      type: row.file_type || 'file',
      created_at: row.created_at,
    }));
}

  async function loadMedia() {
    setMedia(await fetchMedia());
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

  // Everything the memory shows, loaded together when it opens: the photos, the words and the
  // voice notes go out as one round, then their signed URLs as one more (each used to be its
  // own effect, signing one file at a time). The modal keeps its state between memories, so the
  // previous memory's title, words and voices are cleared first: they used to show under the
  // new memory's photos until their own queries came back. The title comes from the timeline
  // (the page reloads it after a save), not a query of its own.
  useEffect(() => {
    if (!open || !eventId) return;
    let cancelled = false;

    setTitle(eventTitle || '');
    setComments([]);
    setVoices([]);
    setNewComment('');
    setLoading(true);

    (async () => {
      try {
        const [mediaItems, commentRes, voiceRes] = await Promise.all([
          fetchMedia(),
          supabase
            .from('timeline_event_media_comments')
            .select('id, comment, created_at, event_id, user_id, profile:"Profiles"!user_id(full_name)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true }),
          supabase
            .from('timeline_event_media_voice_notes')
            .select('id, file_path, created_at, event_id, user_id, profile:"Profiles"!user_id(full_name)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true }),
        ]);

        type VoiceRow = Omit<VoiceItem, 'url'> & { file_path: string };
        const voiceRows = (voiceRes.data ?? []) as unknown as VoiceRow[];
        const voiceUrls = await signPaths(
          'timeline-media',
          voiceRows.map((v) => v.file_path).filter(Boolean)
        );

        if (cancelled) return;
        setMedia(mediaItems);
        setComments((commentRes.data ?? []) as CommentItem[]);
        setVoices(
          voiceRows.map((v) => ({
            id: v.id,
            url: voiceUrls.get(v.file_path) ?? '',
            created_at: v.created_at,
            event_id: v.event_id,
            user_id: v.user_id,
            profile: v.profile ?? null,
          }))
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const file =
  rawFile.type.startsWith('image/') || rawFile.name.toLowerCase().match(/\.(heic|heif)$/)
    ? await ensureDisplayableImage(rawFile)
    : rawFile;
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

    // 🔑 INSERT ONLY: DO NOT SELECT
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

    // The voice notes on this file (their rows go with it, by cascade): remember their files.
    const { data: voices } = await supabase
      .from('timeline_event_media_voice_notes')
      .select('file_path')
      .eq('event_id', eventId)
      .eq('media_id', media.id);

    // The row first, and only if a row really went: RLS lets only the timeline's creator
    // delete, silently (the file used to be removed first, then the row delete did nothing
    // and the tile vanished anyway).
    const deleted = await deleteWithOwnerCheck(supabase, 'timeline_event_media', media.id, 'timeline');
    if (!deleted) return;

    // delete related comments
    await supabase
      .from('timeline_event_media_comments')
      .delete()
      .eq('event_id', eventId)
      .eq('media_id', media.id);

    if (voices?.length) {
      await supabase.storage
        .from('timeline-media')
        .remove(voices.map(v => v.file_path));
    }

    // delete storage ONLY if direct upload
    if (!isLibrary && row?.file_path) {
      await supabase.storage
        .from('timeline-media')
        .remove([row.file_path]);
    }

    setMedia(prev => prev.filter(m => m.id !== media.id));
    toast.success('Removed from memory.');

  } catch (err) {
    console.error(err);
    toast.error('Failed to delete media.');
  }
}

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

    // Cascade delete all content before removing the event
    if (mediaCount > 0) {
      const { data: allMedia } = await supabase
        .from('timeline_event_media')
        .select('id, file_path, library_media_id')
        .eq('event_id', eventId);

      if (allMedia?.length) {
        const directPaths = allMedia
          .filter((m) => !m.library_media_id && m.file_path)
          .map((m) => m.file_path!);

        if (directPaths.length) {
          await supabase.storage.from('timeline-media').remove(directPaths);
        }

        await supabase
          .from('timeline_event_media')
          .delete()
          .eq('event_id', eventId);
      }
    }

    if (commentCount > 0) {
      await supabase
        .from('timeline_event_media_comments')
        .delete()
        .eq('event_id', eventId);
    }

    if (voiceCount > 0) {
      const { data: allVoices } = await supabase
        .from('timeline_event_media_voice_notes')
        .select('file_path')
        .eq('event_id', eventId);

      if (allVoices?.length) {
        await supabase.storage
          .from('timeline-media')
          .remove(allVoices.map((v) => v.file_path));
      }

      await supabase
        .from('timeline_event_media_voice_notes')
        .delete()
        .eq('event_id', eventId);
    }

    // Only if a row really went: RLS lets only the timeline's creator delete, silently (the
    // toast used to say "deleted" while the memory stayed).
    const deleted = await deleteWithOwnerCheck(supabase, 'timeline_events', eventId, 'timeline');
    if (!deleted) return;

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
    const deleted = await deleteWithOwnerCheck(supabase, 'timeline_event_media_comments', commentId, 'timeline');
    if (!deleted) return;

    setComments((p) => p.filter((c) => c.id !== commentId));
    toast.success('Comment deleted.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete comment.');
  }
}

async function deleteVoice(voiceId: string) {
  try {
    const { data: row } = await supabase
      .from('timeline_event_media_voice_notes')
      .select('file_path')
      .eq('id', voiceId)
      .single();

    // The row first, and only if a row really went (RLS lets only the timeline's creator
    // delete, silently); then its file.
    const deleted = await deleteWithOwnerCheck(supabase, 'timeline_event_media_voice_notes', voiceId, 'timeline');
    if (!deleted) return;

    if (row?.file_path) {
      await supabase.storage.from('timeline-media').remove([row.file_path]);
    }

    setVoices((p) => p.filter((v) => v.id !== voiceId));
    toast.success('Voice note deleted.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete voice note.');
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

    const { data: signedRow } = await supabase.storage
      .from('timeline-media')
      .createSignedUrl(data.file_path, 3600);
    const signed = signedRow?.signedUrl ?? '';

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
      className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-6"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* OVERLAY (scrim-blur blurs only with a mouse, see globals.css) */}
      <div className={cx(ui.scrim, s.fade, 'scrim-blur')} aria-hidden="true" />

      {/* PANEL: a centred dialog on tablets and desktops, a full-height bottom sheet on phones */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(ui.sheet, ui.sheetBottom, s.panel)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The dialog's name: the memory's title as it reads now */}
        <h2 id={titleId} className={ui.srOnly}>
          {title.trim() || 'Untitled memory'}
        </h2>

        {/* HEADER */}
        <div className={s.head}>
          <div className={s.headTop}>
            {/* HERO TITLE: the field itself, growing with its text (see .titleGrow) */}
            <div className={s.titleGrow} data-value={title}>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled memory"
                rows={1}
                aria-label="Memory title"
              />
            </div>

            <IconBtn label="Close" onClick={close}>
              <X size={20} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
          </div>

          {/* ACTION BAR: add media on the left; save the title and delete on the right */}
          <div className={s.actions}>
            <div className={s.actionGroup}>
              {/* UPLOAD (the file field is hidden from sight, not from the keyboard) */}
              {/* While a file uploads the button shows a spinner; the photos and words stay put
                  (the whole body used to be swapped for a loader and back) */}
              <label
                className={btnClass({ variant: 'soft', size: 'sm', className: s.fileBtn })}
                aria-busy={uploadingMedia || undefined}
              >
                {uploadingMedia ? (
                  <Spinner size={16} />
                ) : (
                  <Upload size={17} strokeWidth={2.3} aria-hidden="true" />
                )}
                <span>Upload</span>
                <input
                  type="file"
                  className={ui.srOnly}
                  accept="image/*,video/*,audio/*"
                  disabled={uploadingMedia}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadMedia(file);
                  }}
                />
              </label>

              {/* LIBRARY */}
              <Btn
                variant="soft"
                size="sm"
                onClick={() => setLibraryPickerOpen(true)}
                aria-haspopup="dialog"
                icon={<BookOpen size={17} strokeWidth={2.2} aria-hidden="true" />}
              >
                My Library
              </Btn>
            </div>

            <div className={s.actionGroup}>
              {/* SAVE */}
              <Btn
                variant={saveStatus === 'saved' ? 'primary' : 'soft'}
                size="sm"
                onClick={saveTop}
                disabled={saving}
                icon={
                  saving || saveStatus === 'saving' ? (
                    <Spinner size={16} />
                  ) : saveStatus === 'saved' ? (
                    <Check size={17} strokeWidth={2.6} aria-hidden="true" />
                  ) : (
                    <Save size={17} strokeWidth={2.2} aria-hidden="true" />
                  )
                }
                className={s.saveBtn}
              >
                {saving || saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                  ? "Saved"
                  : "Save"}
              </Btn>

              {/* DELETE */}
              <IconBtn
                label="Delete this memory"
                onClick={() => {
                  setConfirmDeleteOpen(true);
                }}
                aria-haspopup="dialog"
                className={s.danger}
              >
                <Trash2 size={18} strokeWidth={2.2} aria-hidden="true" />
              </IconBtn>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className={s.body} onWheel={(e) => e.stopPropagation()}>
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
            onDeleteVoice={deleteVoice}
            onUploadMedia={uploadMedia}
            onDeleteMedia={deleteMedia}
          />
        </div>
      </div>

      {/* DELETE THIS MEMORY? (above the modal) */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div
            className={cx(ui.scrim, s.fade, 'scrim-blur')}
            onClick={() => setConfirmDeleteOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, s.confirm, s.pop)}
          >
            <h2 id={confirmTitleId} className={s.confirmTitle}>
              Delete this memory?
            </h2>

            <p id={confirmTextId} className={s.confirmText}>
              This memory and all associated media, comments, and voice notes will be
              permanently removed. This action cannot be undone.
            </p>

            <div className={s.confirmActions}>
              <Btn
                variant="soft"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Btn>

              <Btn
                variant="danger"
                onClick={deleteMemory}
                disabled={deleting}
                icon={deleting ? <Spinner size={16} /> : null}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      <LibraryPickerModal
        open={libraryPickerOpen}
        onClose={() => setLibraryPickerOpen(false)}
        onPick={(item) => handlePickFromLibrary(item)}
      />
    </div>
  );
}
