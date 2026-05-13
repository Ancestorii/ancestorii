'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';

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

  /* ── load on mount ── */
  useEffect(() => {
    if (!albumId) return;
    loadAll();
    loadUser();
  }, [albumId]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUser({ id: user.id });
  }

  async function loadAll() {
    try {
      setLoading(true);

      /* 1. album row */
      const { data: albumData, error: albumErr } = await supabase
        .from('albums')
        .select('*')
        .eq('id', albumId)
        .single();
      if (albumErr) throw albumErr;
      setAlbum(albumData);

      /* 2. media rows WITH library_media join */
      const { data: mediaDataRaw, error: mediaErr } = await supabase
        .from('album_media')
        .select(`
          id, album_id, user_id, file_path, file_type, created_at,
          library_media_id, caption, memory_date,
          library_media:library_media_id (
            id, file_path, file_type, created_at
          )
        `)
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });
      if (mediaErr) throw mediaErr;

      /* 3. split into album vs library rows for correct bucket signing */
      const rows = mediaDataRaw ?? [];
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

      const mediaWithSigned: Media[] = rows.map((m: any) => {
        const isLibrary = !!m.library_media_id;
        const lib = Array.isArray(m.library_media) ? m.library_media[0] : m.library_media;

        if (isLibrary) {
          const idx = libraryRows.findIndex((r: any) => r.id === m.id);
          const url = (librarySigned.data as any)?.[idx]?.signedUrl ?? null;
          return { ...m, library_media: lib, signed_url: url ? `${url}&cb=${Date.now()}` : null };
        }

        const idx = albumRows.findIndex((r: any) => r.id === m.id);
        const url = (albumSigned.data as any)?.[idx]?.signedUrl ?? null;
        return { ...m, library_media: lib, signed_url: url ? `${url}&cb=${Date.now()}` : null };
      });

      setMedia(mediaWithSigned);

      /* 4. tagged people (album-level) with signed avatars */
      const { data: tags } = await supabase
        .from('album_tags')
        .select('family_member_id, family_members(id, full_name, avatar_url)')
        .eq('album_id', albumId);

      const mapped = tags?.map((x: any) => x.family_members).filter(Boolean) || [];

      const withSignedAvatars = await Promise.all(
        mapped.map(async (p: any) => {
          if (!p.avatar_url) return { ...p, avatar_signed: null };
          const { data: signed } = await supabase.storage
            .from('user-media')
            .createSignedUrl(p.avatar_url, 60 * 60 * 24 * 7);
          return { ...p, avatar_signed: signed?.signedUrl || null };
        }),
      );
      setTaggedPeople(withSignedAvatars);
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

  /* ── delete: library-linked vs direct upload ── */
  function handleDelete(mediaItem: Media) {
    if (mediaItem.library_media_id) {
      (async () => {
        try {
          const { error } = await supabase
            .from('album_media')
            .delete()
            .eq('id', mediaItem.id);
          if (error) throw error;
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
        signed_url: signed?.signedUrl ? `${signed.signedUrl}&cb=${Date.now()}` : null,
      };
      setMedia((prev) => [rowWithSigned, ...prev]);
      toast.success('Added from your library.');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to add from library.');
    }
  }

  /* ── loading ── */
  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#f6f1e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: '#7c7469', fontFamily: "'Inter', sans-serif" }}>Loading album…</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div style={{ height: '100vh', background: '#f6f1e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={() => router.push('/dashboard/albums')}
          style={{ padding: '12px 20px', borderRadius: 999, background: '#111', color: 'white', fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
        >
          Back to albums
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .album-scroll { scrollbar-width: thin; scrollbar-color: #d4af37 transparent; }
        .album-scroll::-webkit-scrollbar { width: 6px; }
        .album-scroll::-webkit-scrollbar-track { background: transparent; }
        .album-scroll::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 999px; }
        .album-scroll::-webkit-scrollbar-thumb:hover { background: #b8922e; }
        .masonry-grid { column-count: 2; column-gap: 24px; column-fill: balance; }
        @media (min-width: 1600px) { .masonry-grid { column-count: 3; } }
        @media (max-width: 768px) { .masonry-grid { column-count: 1; } }
        .filter-btn { transition: all 0.2s ease; }
        .filter-btn:hover { background: #f1ece4; }
        @media (max-width: 1023px) { .desktop-panel { display: none !important; } }
        @media (min-width: 1024px) { .mobile-panel-backdrop { display: none !important; } .mobile-panel-sheet { display: none !important; } }
      `}</style>

      <div style={{ height: '100vh', overflow: 'hidden', background: '#f6f1e8', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="album-scroll" data-lenis-prevent style={{ flex: 1, overflowY: 'auto' }}>
            <AlbumHeader
              album={album}
              taggedPeople={taggedPeople}
              mediaCount={media.length}
              voiceNoteCount={Object.values(enrichment.voiceNotes).reduce((a, b) => a + b, 0) || 0}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onUpload={() => setUploadOpen(true)}
              onLibrary={() => setLibraryOpen(true)}
              onTag={() => setTaggerOpen(true)}
              onRemoveTag={() => {}}
            />
            <div style={{ padding: '24px 40px 56px' }}>
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

        {/* RIGHT COLUMN — desktop only */}
          <aside className="desktop-panel" style={{ width: 500, flexShrink: 0, height: '100vh', borderLeft: '1px solid #e5ddd0', background: '#ffffff' }}>
          <StoryPanel
            selectedMedia={selectedMedia} albumId={album.id} user={user} allMedia={media} taggedPeople={taggedPeople}
            onClose={() => setSelectedMedia(null)} onDelete={handleDelete} onLightbox={(m) => setLightboxMedia(m)}
            onCaptionSaved={(id, caption) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, caption } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, caption } : p)); }}
            onDateSaved={(id, memory_date) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, memory_date } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, memory_date } : p)); }}
            onCommentCountChanged={(id, delta) => { setEnrichment((p) => ({ ...p, comments: { ...p.comments, [id]: (p.comments[id] || 0) + delta } })); }}
            onVoiceNoteCountChanged={(id, delta) => { setEnrichment((p) => ({ ...p, voiceNotes: { ...p.voiceNotes, [id]: (p.voiceNotes[id] || 0) + delta } })); }}
          />
        </aside>
      </div>

      {/* Mobile story panel */}
      {selectedMedia && (
        <>
          <div className="mobile-panel-backdrop" onClick={() => setSelectedMedia(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} />
          <div className="mobile-panel-sheet" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, top: '8%', zIndex: 50, background: '#fcfbf8', borderRadius: '28px 28px 0 0', overflow: 'hidden', boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}>
            <StoryPanel
              selectedMedia={selectedMedia} albumId={album.id} user={user} allMedia={media} taggedPeople={taggedPeople}
              onClose={() => setSelectedMedia(null)} onDelete={handleDelete} onLightbox={(m) => setLightboxMedia(m)}
              onCaptionSaved={(id, caption) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, caption } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, caption } : p)); }}
              onDateSaved={(id, memory_date) => { setMedia((p) => p.map((m) => (m.id === id ? { ...m, memory_date } : m))); setSelectedMedia((p) => (p?.id === id ? { ...p, memory_date } : p)); }}
              onCommentCountChanged={() => {}} onVoiceNoteCountChanged={() => {}}
            />
          </div>
        </>
      )}

      {/* Overlays */}
      <Lightbox media={lightboxMedia} allMedia={filteredMedia} open={!!lightboxMedia} onClose={() => setLightboxMedia(null)} onNavigate={(m) => setLightboxMedia(m)} />
      <UploadMemoryDrawer albumId={album.id} open={uploadOpen} onClose={() => { setUploadOpen(false); loadAll(); }} onUploaded={() => {}} />
      <UniversalPeopleTagger parentType="album" parentId={album.id} open={taggerOpen} onClose={() => setTaggerOpen(false)} onSaved={() => loadAll()} />
      <LibraryPickerModal open={libraryOpen} onClose={() => setLibraryOpen(false)} onPick={async (item: LibraryPickerItem) => { setLibraryOpen(false); await handlePickFromLibrary(item); }} />
      <DeleteMemoryModal
        open={deleteOpen} mediaId={deleteTarget?.id || ''} filePath={deleteTarget?.file_path || ''}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onDeleted={() => { setMedia((p) => p.filter((item) => item.id !== deleteTarget?.id)); setSelectedMedia(null); setDeleteOpen(false); setDeleteTarget(null); }}
      />
    </>
  );
}