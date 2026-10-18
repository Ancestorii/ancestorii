'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Images } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { ui, AppLoader, Btn, EmptyState, toneByKey, useDialog } from '@/components/dashboard/ui/AppBits';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';

import AlbumHeader from '../_components/AlbumHeader';
import MediaGrid from '../_components/MediaGrid';
import StoryPanel from '../_components/StoryPanel';
import Lightbox from '../_components/Lightbox';
import UploadMemoryDrawer from '../_components/UploadMemoryDrawer';
import DeleteMemoryModal from '../_components/DeleteMemoryModal';
import UniversalPeopleTagger from '@/components/UniversalPeopleTagger';
import LibraryPickerModal, {
  LibraryPickerItem,
} from '@/components/LibraryPickerModal';
import AlbumAI from '../_components/AlbumAI';
import s from '../_components/albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/* ───────────────────── types ───────────────────── */

type Album = {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
};

type Media = {
  id: string;
  album_id: string;
  user_id?: string | null;
  file_path: string | null;
  file_type: string | null;
  library_media_id?: string | null;
  library_media?: {
    id: string;
    file_path: string;
    file_type: string;
    created_at: string | null;
  } | null;
  created_at: string;
  signed_url?: string | null;
  caption?: string | null;
  memory_date?: string | null;
};

type TaggedPerson = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  avatar_signed?: string | null;
};

type Enrichment = {
  comments: Record<string, number>;
  voiceNotes: Record<string, number>;
};

type MediaFilter = 'all' | 'photo' | 'video';

function mediaCategory(m: Media): MediaFilter {
  const t = (m.file_type ?? m.library_media?.file_type ?? '').toLowerCase();
  if (t.includes('video')) return 'video';
  return 'photo';
}

/* ───────────────────── page ───────────────────── */

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getBrowserClient();
  const albumId = params?.id;

  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<Album | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<Media | null>(null);
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [taggerOpen, setTaggerOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [taggedPeople, setTaggedPeople] = useState<TaggedPerson[]>([]);
  const [enrichment, setEnrichment] = useState<Enrichment>({
    comments: {},
    voiceNotes: {},
  });

  // Below 1024px the story opens as a bottom sheet (a dialog); from 1024px it's the side panel.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // The phone sheet: Escape closes it, Tab stays inside, focus returns to the memory.
  const sheetRef = useDialog<HTMLDivElement>(narrow && !!selectedMedia, () => setSelectedMedia(null));

  /* ── load on mount ── */
  useEffect(() => {
    if (!albumId) return;
    loadAll();
    loadUser();
  }, [albumId]);

  /* ── phones/tablets: the page scrolls as a document there, so hold it still behind the
        story sheet, the upload drawer and the people tagger (they don't lock it themselves) ── */
  useEffect(() => {
    if (!(selectedMedia || uploadOpen || taggerOpen)) return;
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedMedia, uploadOpen, taggerOpen]);

  async function loadUser() {
    // The id comes from the local session (getUser() was a round trip to the auth server).
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess?.session?.user?.id;
    if (uid) setUser({ id: uid });
  }

  /* who is in the album, their photos signed in one request (the tagger's onSaved reloads just
     this, not the whole page) */
  async function loadTags() {
    try {
      const { data: tags } = await supabase
        .from('album_tags')
        .select('family_member_id, family_members(id, full_name, avatar_url)')
        .eq('album_id', albumId);

      const mapped: TaggedPerson[] = tags?.map((x: any) => x.family_members).filter(Boolean) || [];
      const toSign = mapped.filter((p) => p.avatar_url && !p.avatar_url.startsWith('http'));
      const byPath = new Map<string, string>();
      if (toSign.length > 0) {
        const { data: signed } = await supabase.storage
          .from('user-media')
          .createSignedUrls(toSign.map((p) => p.avatar_url as string), 60 * 60 * 24 * 7);
        toSign.forEach((p, i) => {
          const url = signed?.[i]?.signedUrl;
          if (url) byPath.set(p.avatar_url as string, url);
        });
      }
      setTaggedPeople(
        mapped.map((p) => ({
          ...p,
          avatar_signed: !p.avatar_url
            ? null
            : p.avatar_url.startsWith('http')
            ? p.avatar_url
            : byPath.get(p.avatar_url) ?? null,
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAll() {
    try {
      setLoading(true);

      /* 1. the album row, its media (with the library join) and its people go out together
            (they ran one after another, and every avatar was then signed on its own) */
      const [albumRes, mediaRes] = await Promise.all([
        supabase.from('albums').select('*').eq('id', albumId).maybeSingle(),
        supabase
          .from('album_media')
          .select(`
          id, album_id, user_id, file_path, file_type, created_at,
          library_media_id, caption, memory_date,
          library_media:library_media_id (
            id, file_path, file_type, created_at
          )
        `)
          .eq('album_id', albumId)
          .order('created_at', { ascending: false }),
        loadTags(),
      ]);
      if (albumRes.error) throw albumRes.error;
      // No row (deleted, or another family's): the "Album not found" state below, quietly.
      if (!albumRes.data) return;
      setAlbum(albumRes.data);
      if (mediaRes.error) throw mediaRes.error;

      /* 2. split into album vs library rows for correct bucket signing */
      const rows = mediaRes.data ?? [];
      const albumRows = rows.filter((m: any) => !m.library_media_id);
      const libraryRows = rows.filter((m: any) => !!m.library_media_id);

      const albumPaths = albumRows
        .map((m: any) => {
          if (!m.file_path) return null;
          return m.file_path.includes('album-media/')
            ? m.file_path.split('album-media/')[1]
            : m.file_path;
        })
        .filter(Boolean) as string[];

      const libraryPaths = libraryRows
        .map((m: any) => {
          const lib = Array.isArray(m.library_media) ? m.library_media[0] : m.library_media;
          return lib?.file_path ?? null;
        })
        .filter(Boolean) as string[];

      const [albumSigned, librarySigned] = await Promise.all([
        albumPaths.length
          ? supabase.storage.from('album-media').createSignedUrls(albumPaths, 60 * 60 * 24 * 7)
          : { data: [] },
        libraryPaths.length
          ? supabase.storage.from('library-media').createSignedUrls(libraryPaths, 60 * 60 * 24 * 7)
          : { data: [] },
      ]);

      /* the signed URLs are used as they are: a cache buster (cb=) on each one made the browser
         download every photo again on every visit */
      const mediaWithSigned: Media[] = rows.map((m: any) => {
        const isLibrary = !!m.library_media_id;
        const lib = Array.isArray(m.library_media) ? m.library_media[0] : m.library_media;

        if (isLibrary) {
          const idx = libraryRows.findIndex((r: any) => r.id === m.id);
          const url = (librarySigned.data as any)?.[idx]?.signedUrl ?? null;
          return { ...m, library_media: lib, signed_url: url };
        }

        const idx = albumRows.findIndex((r: any) => r.id === m.id);
        const url = (albumSigned.data as any)?.[idx]?.signedUrl ?? null;
        return { ...m, library_media: lib, signed_url: url };
      });

      setMedia(mediaWithSigned);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load album');
    } finally {
      setLoading(false);
    }
  }

  /* ── filtering ── */
  const filteredMedia = useMemo(() => {
    if (activeFilter === 'all') return media;
    return media.filter((m) => mediaCategory(m) === activeFilter);
  }, [media, activeFilter]);

  /* ── the header's photo and video counts (the same split as the filters) ── */
  const photoCount = useMemo(() => media.filter((m) => mediaCategory(m) === 'photo').length, [media]);
  const videoCount = media.length - photoCount;

  /* ── delete: library-linked vs direct upload ── */
  function handleDelete(mediaItem: Media) {
    if (mediaItem.library_media_id) {
      (async () => {
        try {
          // RLS lets only the album's creator remove rows, and a blocked delete returns 0 rows
          // silently, so check before saying it went.
          const removed = await deleteWithOwnerCheck(supabase, 'album_media', mediaItem.id, 'album');
          if (!removed) return;
          setMedia((prev) => prev.filter((x) => x.id !== mediaItem.id));
          if (selectedMedia?.id === mediaItem.id) setSelectedMedia(null);
          toast.success('Removed from album.');
        } catch (err) {
          console.error(err);
          toast.error('Failed to remove from album.');
        }
      })();
      return;
    }
    setDeleteTarget(mediaItem);
    setDeleteOpen(true);
  }

  /* ── library picker: insert album_media row with library_media_id ── */
  async function handlePickFromLibrary(item: LibraryPickerItem) {
    try {
      const { data: sess } = await supabase.auth.getSession();
      const u = sess?.session?.user;
      if (!u) throw new Error('Not authenticated.');

      const { data, error } = await supabase
        .from('album_media')
        .insert({
          album_id: albumId,
          user_id: u.id,
          library_media_id: item.id,
          file_path: null,
          file_type: item.file_type,
        })
        .select(`
          id, album_id, user_id, file_path, file_type, created_at,
          library_media_id, caption, memory_date,
          library_media:library_media_id (id, file_path, file_type, created_at)
        `)
        .single();
      if (error) throw error;

      const lib = Array.isArray((data as any)?.library_media)
        ? (data as any).library_media[0]
        : (data as any).library_media;
      const realPath = lib?.file_path;
      if (!realPath) throw new Error('Missing library file path.');

      const { data: signed } = await supabase.storage
        .from('library-media')
        .createSignedUrl(realPath, 60 * 60 * 24 * 7);

      const rowWithSigned: Media = {
        ...(data as any),
        library_media: lib,
        signed_url: signed?.signedUrl ?? null,
      };
      setMedia((prev) => [rowWithSigned, ...prev]);
      toast.success('Added from your library.');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to add from library.');
    }
  }

  /* ── loading (the first load only: a reload after an upload or a tag keeps the page in place
        instead of swapping it for the loader, which lost the scroll and the focus) ── */
  if (loading && !album) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <AppLoader label="Loading album" />
      </div>
    );
  }

  /* ── not found: the empty card the capsule and loved one pages show (a lone button on a blank
        page read as broken) ── */
  if (!album) {
    return (
      <div className={ui.page}>
        <div className={ui.wrapNarrow}>
          <EmptyState Icon={Images} tone={toneByKey('orange')} title="Album not found">
            <Btn
              variant="soft"
              onClick={() => router.push('/dashboard/albums')}
              icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
            >
              Back to Albums
            </Btn>
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlbumAI
        albumTitle={album.title}
        albumDescription={album.description}
        mediaCount={media.length}
        taggedPeopleNames={taggedPeople.map((p) => p.full_name)}
      />

      <div className={s.shell}>
        {/* LEFT COLUMN: the album; it scrolls on its own beside the panel from 1024px */}
        <div className={cx(s.main, s.scroll)}>
          <div className={s.mainInner}>
            <AlbumHeader
              album={album}
              taggedPeople={taggedPeople}
              mediaCount={media.length}
              photoCount={photoCount}
              videoCount={videoCount}
              voiceNoteCount={Object.values(enrichment.voiceNotes).reduce((a, b) => a + b, 0) || 0}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onUpload={() => setUploadOpen(true)}
              onLibrary={() => setLibraryOpen(true)}
              onTag={() => setTaggerOpen(true)}
              onRemoveTag={() => {}}
            />
            <div className={s.gridWrap}>
              <MediaGrid
                media={filteredMedia}
                selectedMedia={selectedMedia}
                enrichment={enrichment}
                onSelect={(m) => setSelectedMedia(m)}
                onLightbox={(m) => setLightboxMedia(m)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: desktop only. One StoryPanel at a time: with both the panel and the phone
            sheet mounted, every selection fetched its comments and voice notes twice. */}
        <aside className={s.panel} aria-label="Memory details">
          {!narrow && (
            <StoryPanel
              selectedMedia={selectedMedia} albumId={album.id} user={user} allMedia={media} taggedPeople={taggedPeople}
              onClose={() => setSelectedMedia(null)} onDelete={handleDelete} onLightbox={(m) => setLightboxMedia(m)}
              onCaptionSaved={(id, caption) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, caption } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, caption } : p)); }}
              onDateSaved={(id, memory_date) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, memory_date } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, memory_date } : p)); }}
              onCommentCountChanged={(id, delta) => { setEnrichment((p) => ({ ...p, comments: { ...p.comments, [id]: (p.comments[id] || 0) + delta } })); }}
              onVoiceNoteCountChanged={(id, delta) => { setEnrichment((p) => ({ ...p, voiceNotes: { ...p.voiceNotes, [id]: (p.voiceNotes[id] || 0) + delta } })); }}
            />
          )}
        </aside>
      </div>

      {/* Mobile story panel: a bottom sheet over the page (hidden from 1024px, where the aside shows it) */}
      {narrow && selectedMedia && (
        <div className={s.sheetLayer}>
          <div className={s.sheetScrim} onClick={() => setSelectedMedia(null)} aria-hidden="true" />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Memory details"
            className={cx(ui.sheet, ui.sheetBottom, s.storySheet, s.dialog)}
          >
            <div className={ui.sheetHandle} aria-hidden="true" />
            <div className={s.storySheetBody}>
              <StoryPanel
                selectedMedia={selectedMedia} albumId={album.id} user={user} allMedia={media} taggedPeople={taggedPeople}
                onClose={() => setSelectedMedia(null)} onDelete={handleDelete} onLightbox={(m) => setLightboxMedia(m)}
                onCaptionSaved={(id, caption) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, caption } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, caption } : p)); }}
                onDateSaved={(id, memory_date) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, memory_date } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, memory_date } : p)); }}
                onCommentCountChanged={(id, delta) => { setEnrichment((p) => ({ ...p, comments: { ...p.comments, [id]: (p.comments[id] || 0) + delta } })); }}
                onVoiceNoteCountChanged={(id, delta) => { setEnrichment((p) => ({ ...p, voiceNotes: { ...p.voiceNotes, [id]: (p.voiceNotes[id] || 0) + delta } })); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      <Lightbox media={lightboxMedia} allMedia={filteredMedia} open={!!lightboxMedia} onClose={() => setLightboxMedia(null)} onNavigate={(m) => setLightboxMedia(m)} />
      {/* New memories join the grid as each one lands (the page used to reload and re-sign every
          photo on close, which faded the whole grid out and in); the tagger reloads only the people */}
      <UploadMemoryDrawer albumId={album.id} open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={(row) => setMedia((p) => [row, ...p])} />
      <UniversalPeopleTagger parentType="album" parentId={album.id} open={taggerOpen} onClose={() => setTaggerOpen(false)} onSaved={() => loadTags()} />
      <LibraryPickerModal open={libraryOpen} onClose={() => setLibraryOpen(false)} onPick={async (item: LibraryPickerItem) => { setLibraryOpen(false); await handlePickFromLibrary(item); }} />
      <DeleteMemoryModal
        open={deleteOpen} mediaId={deleteTarget?.id || ''} filePath={deleteTarget?.file_path || ''}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onDeleted={() => { setMedia((p) => p.filter((item) => item.id !== deleteTarget?.id)); setSelectedMedia(null); setDeleteOpen(false); setDeleteTarget(null); }}
      />
    </>
  );
}
