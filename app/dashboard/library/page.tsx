'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import UploadLibraryDrawer from './_components/UploadLibraryDrawer';
import {
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  File as FileIcon,
  Folder,
  CalendarDays,
  ImagePlus,
  Images,
  Play,
  Plus,
  X,
} from 'lucide-react';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import DeleteLibraryMediaModal from './_components/DeleteLibraryMediaModal';
import CreateFolderModal from './_components/CreateFolderModal';
import DeleteFolderModal from './_components/DeleteFolderModal';
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  EmptyState,
  IconBtn,
  IconTile,
  PageHeader,
  SectionHead,
  Spinner,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import {
  LIBRARY_BUCKET,
  fetchLibraryFolders,
  getCachedLibraryFolders,
  setCachedLibraryFolders,
  signLibraryPaths,
  type LibraryFolderSummary,
} from '@/lib/libraryData';
import s from './_components/library.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Library is orange in the landing's feature index.
const ORANGE = toneByKey('orange');

// A folder's photos arrive a page at a time (the biggest folder holds 160 and more), the next
// page as the end of the grid comes into view.
const PAGE_SIZE = 60;

// Dates in British English with the month as a word (02/06/2026 reads either way round).
// A folder date is a calendar day with no time, so it is read in UTC: in the local zone it
// slipped back a day anywhere west of London.
function formatDay(value: string, month: 'long' | 'short' = 'long', calendarDay = false) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month,
    year: 'numeric',
    ...(calendarDay ? { timeZone: 'UTC' } : {}),
  });
}

type LibraryFolder = LibraryFolderSummary;

type LibraryMedia = {
  id: string;
  user_id: string;
  file_path: string;
  file_type: string;
  created_at: string;
  folder_id: string;
};

export default function LibraryPage() {
  const supabase = getBrowserClient();

  // View state
  const [view, setView] = useState<'folders' | 'folder-detail'>('folders');
  const [selectedFolder, setSelectedFolder] = useState<LibraryFolder | null>(null);

  // Data. null until the first list is in (the last list shown in this tab comes back at once,
  // and is refreshed behind), so a return visit never starts from a loader.
  const [folders, setFolders] = useState<LibraryFolder[] | null>(null);
  const [media, setMedia] = useState<LibraryMedia[] | null>(null);
  const [mediaTotal, setMediaTotal] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});
  const uidRef = useRef<string | null>(null);
  // The folder whose photos are wanted: a page that lands after the user has left it is dropped.
  const activeFolderRef = useRef<string | null>(null);

  // Modals
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'edit'>('create');
  const [editFolderTarget, setEditFolderTarget] = useState<LibraryFolder | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<LibraryFolder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteMediaTarget, setDeleteMediaTarget] = useState<{ id: string; filePath: string } | null>(null);
  // The viewer shows one item by id, so it follows the list (a deleted item closes it).
  const [viewer, setViewer] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The list on screen is the list the next visit starts from.
  useEffect(() => {
    if (folders && uidRef.current) setCachedLibraryFolders(uidRef.current, folders);
  }, [folders]);

  // Opening a folder (or going back) swaps the page in place, not the route, so the scroll
  // position carried over: a folder low in a long list opened part-way down its photos, with
  // its title out of view. Start each view at the top, as a page change does.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  // The signed-in user's id from the local session (no round trip to the auth server).
  async function getUid() {
    if (uidRef.current) return uidRef.current;
    const { data } = await supabase.auth.getSession();
    uidRef.current = data.session?.user?.id ?? null;
    return uidRef.current;
  }

  // One query for the folders, their counts and their covers, then one signing request for the
  // covers not cached yet. With a list already on screen it refreshes behind, with no loader.
  async function loadFolders() {
    const uid = await getUid();
    if (!uid) {
      setFolders([]);
      return;
    }

    const cached = getCachedLibraryFolders(uid);
    if (cached) setFolders((prev) => prev ?? cached);

    try {
      const fresh = await fetchLibraryFolders(supabase, uid);
      setFolders(fresh);
    } catch (err) {
      console.error(err);
      if (!cached) setFolders((prev) => prev ?? []);
      toast.error(err instanceof Error && err.message ? err.message : 'Failed to load your library.');
    }
  }

  // One page of a folder's items (newest first) and their URLs, signed in one request.
  async function loadMedia(folderId: string, offset: number) {
    if (offset > 0) setLoadingMore(true);

    const { data, error, count } = await supabase
      .from('library_media')
      .select('id, user_id, file_path, file_type, created_at, folder_id', { count: 'exact' })
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (activeFolderRef.current !== folderId) return;

    if (error) {
      console.error(error);
      setLoadingMore(false);
      if (offset === 0) setMedia([]);
      toast.error(error.message || 'Failed to load this folder.');
      return;
    }

    const rows = (data ?? []) as LibraryMedia[];
    const urls =
      rows.length > 0
        ? await signLibraryPaths(supabase, LIBRARY_BUCKET, rows.map((r) => r.file_path))
        : {};

    if (activeFolderRef.current !== folderId) return;

    setSignedMap((prev) => {
      const next = offset === 0 ? {} : { ...prev };
      rows.forEach((r) => {
        const url = urls[r.file_path];
        if (url) next[r.id] = url;
      });
      return next;
    });
    setMedia((prev) => (offset === 0 || !prev ? rows : [...prev, ...rows]));
    setMediaTotal(count ?? null);
    setLoadingMore(false);
  }

  const handleEnterFolder = (folder: LibraryFolder) => {
    activeFolderRef.current = folder.id;
    setSelectedFolder(folder);
    setView('folder-detail');
    setMedia(null);
    setMediaTotal(null);
    setSignedMap({});
    setLoadingMore(false);
    loadMedia(folder.id, 0);
  };

  const handleBackToFolders = () => {
    activeFolderRef.current = null;
    setView('folders');
    setSelectedFolder(null);
    setMedia(null);
    setMediaTotal(null);
    setSignedMap({});
    // Counts and covers may have moved while the folder was open: refreshed behind the list.
    loadFolders();
  };

  const openCreateFolder = () => {
    setFolderModalMode('create');
    setEditFolderTarget(null);
    setFolderModalOpen(true);
  };

  const openEditFolder = (folder: LibraryFolder) => {
    setFolderModalMode('edit');
    setEditFolderTarget(folder);
    setFolderModalOpen(true);
  };

  // One more or one fewer item in a folder's card (its cover follows on the next refresh).
  const bumpFolderCount = (folderId: string, by: number) => {
    setFolders((prev) =>
      prev
        ? prev.map((f) =>
            f.id === folderId ? { ...f, media_count: Math.max(0, f.media_count + by) } : f
          )
        : prev
    );
  };

  // The next page comes in as its button scrolls into view (the button still works on its own).
  const hasMore = !!media && mediaTotal != null && media.length < mediaTotal;
  const moreRef = useRef<HTMLDivElement>(null);
  const loadMore = () => {
    if (!selectedFolder || !media || loadingMore || !hasMore) return;
    loadMedia(selectedFolder.id, media.length);
  };
  useEffect(() => {
    const el = moreRef.current;
    if (!el || !hasMore || loadingMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, media?.length, selectedFolder?.id]);

  // The full-screen viewer: Escape closes it, focus goes back to the tile that opened it.
  const viewerItem = viewer && media ? (media.find((m) => m.id === viewer) ?? null) : null;
  const viewerUrl = viewerItem ? signedMap[viewerItem.id] : undefined;
  const viewerOpen = !!viewerItem && !!viewerUrl;
  const viewerRef = useDialog<HTMLDivElement>(viewerOpen, () => setViewer(null));

  // The page behind it stays put while it is open.
  useEffect(() => {
    if (!viewerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [viewerOpen]);

  // Left and right (arrow keys, or the two buttons) move through the folder's loaded items.
  const neighbour = useCallback(
    (dir: 1 | -1): string | null => {
      if (!media || !viewer) return null;
      const i = media.findIndex((m) => m.id === viewer);
      if (i < 0) return null;
      for (let j = i + dir; j >= 0 && j < media.length; j += dir) {
        const m = media[j];
        if ((m.file_type === 'image' || m.file_type === 'video') && signedMap[m.id]) return m.id;
      }
      return null;
    },
    [media, viewer, signedMap]
  );
  const prevId = viewerOpen ? neighbour(-1) : null;
  const nextId = viewerOpen ? neighbour(1) : null;

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      // A focused video keeps its own arrow keys (they seek).
      if (e.target instanceof HTMLElement && e.target.tagName === 'VIDEO') return;
      const id = neighbour(e.key === 'ArrowRight' ? 1 : -1);
      if (!id) return;
      e.preventDefault();
      setViewer(id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [viewerOpen, neighbour]);

  // Until the folder's own rows arrive, its count from the folder list (not "0 items").
  const itemCount = mediaTotal ?? selectedFolder?.media_count ?? 0;

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>

        {view === 'folders' ? (
          // ─────────── FOLDERS VIEW ───────────
          <>
            <PageHeader
              eyebrow="Library"
              eyebrowDot="var(--c2)"
              title={
                <>
                  My <Accent>Library</Accent>
                </>
              }
              lead={
                <>
                  Upload your photos and videos here once. When you&apos;re adding memories to
                  timelines, albums, or capsules, look for the &ldquo;My Library&rdquo; button to
                  pull from this collection.
                </>
              }
              actions={
                <Btn
                  onClick={openCreateFolder}
                  aria-haspopup="dialog"
                  tile={<Plus size={18} strokeWidth={2.4} />}
                >
                  Create Folder
                </Btn>
              }
            />

            <section className={ui.section}>
              {folders === null ? (
                <DelayedLoader label="Loading your library" />
              ) : folders.length === 0 ? (
                <EmptyState
                  Icon={Folder}
                  tone={ORANGE}
                  title="Your library is empty"
                  text="Create your first folder."
                >
                  <Btn
                    onClick={openCreateFolder}
                    aria-haspopup="dialog"
                    tile={<Plus size={18} strokeWidth={2.4} />}
                  >
                    Create Folder
                  </Btn>
                </EmptyState>
              ) : (
                <>
                  <SectionHead
                    title="Folders"
                    action={
                      <span className={ui.chip}>
                        {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
                      </span>
                    }
                  />

                  {/* Columns follow the space beside the sidebar: 1 on phones, 2 on tablets, 3 to 4 on desktops */}
                  <div className="@container">
                    <ul
                      role="list"
                      className="grid grid-cols-1 gap-4 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4"
                    >
                      {folders.map((folder) => {
                        const nameId = `library-folder-${folder.id}-name`;
                        const infoId = `library-folder-${folder.id}-info`;
                        return (
                          <li key={folder.id} className="min-w-0">
                            <div className={s.folderCard}>
                              <button
                                type="button"
                                onClick={() => handleEnterFolder(folder)}
                                aria-labelledby={nameId}
                                aria-describedby={infoId}
                                className={s.folderOpen}
                              >
                                <span className={s.cover}>
                                  {folder.cover_url ? (
                                    folder.cover_file_type === 'video' ? (
                                      <video
                                        src={folder.cover_url}
                                        className="absolute inset-0 h-full w-full object-cover"
                                        muted
                                        playsInline
                                        preload="metadata"
                                      />
                                    ) : (
                                      <FolderCoverImage src={folder.cover_url} alt="" />
                                    )
                                  ) : (
                                    <span className={s.coverEmpty} aria-hidden="true">
                                      <span className={s.coverEmptyDisc}>
                                        <Images size={26} strokeWidth={2.2} />
                                      </span>
                                    </span>
                                  )}

                                  <span
                                    className={cx(ui.photoChip, s.countChip)}
                                    style={{ '--frame': 'var(--c2)' } as CSSProperties}
                                  >
                                    {folder.media_count} {folder.media_count === 1 ? 'item' : 'items'}
                                  </span>
                                </span>

                                <span className={s.folderInfo}>
                                  <IconTile Icon={Folder} tone={ORANGE} size="sm" />
                                  <span className="min-w-0">
                                    <span id={nameId} className={s.folderName}>
                                      {folder.name}
                                    </span>
                                    <span id={infoId} className={s.folderDate}>
                                      {folder.folder_date
                                        ? formatDay(folder.folder_date, 'long', true)
                                        : `Created ${formatDay(folder.created_at)}`}
                                      <span className={ui.srOnly}>
                                        , {folder.media_count} {folder.media_count === 1 ? 'item' : 'items'}
                                      </span>
                                    </span>
                                  </span>
                                </span>
                              </button>

                              {/* 3-dot context menu */}
                              <div className={s.folderMenu}>
                                <ContextMenuDots
                                  editLabel="Edit Folder"
                                  deleteLabel="Delete Folder"
                                  onEdit={() => openEditFolder(folder)}
                                  onDelete={() => setDeleteFolderTarget(folder)}
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </section>
          </>
        ) : (
          // ─────────── FOLDER DETAIL VIEW ───────────
          <>
            <div className="mb-6 sm:mb-8">
              {/* The small soft size every "Back to" button in the app has. */}
              <Btn
                variant="soft"
                size="sm"
                onClick={handleBackToFolders}
                icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
              >
                Back to Library
              </Btn>
            </div>

            <PageHeader
              size="md"
              eyebrow="Library"
              eyebrowDot="var(--c2)"
              title={selectedFolder?.name}
              meta={
                selectedFolder && (
                  <>
                    <span className={ui.chip}>
                      <CalendarDays size={15} strokeWidth={2.4} aria-hidden="true" />
                      {selectedFolder.folder_date
                        ? formatDay(selectedFolder.folder_date, 'long', true)
                        : `Created ${formatDay(selectedFolder.created_at)}`}
                    </span>
                    <span className={ui.chip}>
                      <Images size={15} strokeWidth={2.4} aria-hidden="true" />
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </>
                )
              }
              lead={
                selectedFolder?.description ? (
                  // Typed by hand: a long link or word wraps instead of running off the edge.
                  <span className="block [overflow-wrap:anywhere]">{selectedFolder.description}</span>
                ) : undefined
              }
              actions={
                <Btn
                  onClick={() => setDrawerOpen(true)}
                  aria-haspopup="dialog"
                  tile={<Plus size={18} strokeWidth={2.4} />}
                >
                  Add Media
                </Btn>
              }
            />

            <section className={ui.section} aria-label="Photos and videos">
              {media === null ? (
                <DelayedLoader label="Loading folder" />
              ) : media.length === 0 ? (
                <EmptyState
                  Icon={ImagePlus}
                  tone={ORANGE}
                  title="This folder is empty"
                  text="Add your first memory."
                >
                  <Btn
                    onClick={() => setDrawerOpen(true)}
                    aria-haspopup="dialog"
                    tile={<Plus size={18} strokeWidth={2.4} />}
                  >
                    Add Media
                  </Btn>
                </EmptyState>
              ) : (
                // Columns follow the space beside the sidebar: 2 on phones up to 6 on wide screens
                <div className="@container">
                  <ul
                    role="list"
                    className="grid grid-cols-2 gap-3 sm:gap-4 @lg:grid-cols-3 @2xl:grid-cols-4 @4xl:grid-cols-5 @6xl:grid-cols-6"
                  >
                    {media.map((item) => {
                      const url = signedMap[item.id];
                      if (!url) return null;

                      const isVideo = item.file_type === 'video';
                      const isImage = item.file_type === 'image';
                      const dateId = `library-media-${item.id}-date`;

                      return (
                        <li key={item.id} className="min-w-0">
                          <div className={s.tile}>
                            {/* The tile opens the viewer; a video plays there, with its controls.
                                A file that is neither (a photo the browser could not convert)
                                has nothing to show, so its tile does not open. */}
                            <button
                              type="button"
                              onClick={() => setViewer(item.id)}
                              disabled={!isVideo && !isImage}
                              aria-label={isVideo ? 'Play video' : isImage ? 'Open photo' : 'File (no preview)'}
                              aria-describedby={dateId}
                              aria-haspopup={isVideo || isImage ? 'dialog' : undefined}
                              className={s.tileOpen}
                            >
                              {isVideo ? (
                                <video
                                  key={url || item.file_path}
                                  src={url}
                                  className={s.tileVideo}
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                              ) : isImage ? (
                                <LibraryImage src={url} alt="" />
                              ) : (
                                <span className={s.tileFile} aria-hidden="true">
                                  <FileIcon size={28} strokeWidth={2} />
                                </span>
                              )}

                              {isVideo && (
                                <span className={cx(ui.chip, ui.chipInk, ui.chipSm, s.playChip)} aria-hidden="true">
                                  <Play size={11} strokeWidth={0} fill="currentColor" />
                                  Video
                                </span>
                              )}
                            </button>

                            <IconBtn
                              label={isVideo ? 'Delete this video' : isImage ? 'Delete this photo' : 'Delete this file'}
                              size="sm"
                              onPhoto
                              aria-describedby={dateId}
                              aria-haspopup="dialog"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteMediaTarget({ id: item.id, filePath: item.file_path });
                              }}
                              className={s.tileDelete}
                            >
                              <Trash2 size={16} strokeWidth={2.4} aria-hidden="true" />
                            </IconBtn>
                          </div>

                          <p id={dateId} className={s.tileDate}>
                            Added on {formatDay(item.created_at, 'short')}
                          </p>
                        </li>
                      );
                    })}
                  </ul>

                  {hasMore && (
                    <div ref={moreRef} className={s.more}>
                      <Btn
                        variant="soft"
                        size="sm"
                        onClick={loadMore}
                        disabled={loadingMore}
                        icon={loadingMore ? <Spinner /> : undefined}
                      >
                        {loadingMore ? 'Loading more…' : `Show more (${(mediaTotal ?? 0) - media.length} left)`}
                      </Btn>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ─── MODALS ─── */}

      <CreateFolderModal
        open={folderModalOpen}
        mode={folderModalMode}
        folder={editFolderTarget}
        onClose={() => setFolderModalOpen(false)}
        onCreated={(created) => {
          // Straight into the list (a new folder is newest, so it goes first): no refetch, no loader.
          setFolders((prev) => [
            {
              id: created.id,
              name: created.name,
              description: created.description,
              folder_date: created.folder_date,
              created_at: created.created_at,
              media_count: 0,
              cover_url: null,
              cover_file_type: null,
            },
            ...(prev ?? []),
          ]);
        }}
        onUpdated={(updated) => {
          setFolders((prev) =>
            prev
              ? prev.map((f) =>
                  f.id === updated.id
                    ? { ...f, name: updated.name, description: updated.description, folder_date: updated.folder_date }
                    : f
                )
              : prev
          );
          if (selectedFolder?.id === updated.id) {
            setSelectedFolder({
              ...selectedFolder,
              name: updated.name,
              description: updated.description,
              folder_date: updated.folder_date,
            });
          }
        }}
      />

      <DeleteFolderModal
        open={!!deleteFolderTarget}
        folderId={deleteFolderTarget?.id || ''}
        folderName={deleteFolderTarget?.name || ''}
        mediaCount={deleteFolderTarget?.media_count || 0}
        onClose={() => setDeleteFolderTarget(null)}
        onDeleted={() => {
          const id = deleteFolderTarget?.id;
          if (selectedFolder?.id === id) {
            activeFolderRef.current = null;
            setView('folders');
            setSelectedFolder(null);
            setMedia(null);
            setMediaTotal(null);
            setSignedMap({});
          }
          setFolders((prev) => (prev ? prev.filter((f) => f.id !== id) : prev));
        }}
      />

      {selectedFolder && (
        <UploadLibraryDrawer
          open={drawerOpen}
          folderId={selectedFolder.id}
          onClose={() => setDrawerOpen(false)}
          onUploaded={(newMedia) => {
            setMedia((prev) => [newMedia as LibraryMedia, ...(prev ?? [])]);
            setMediaTotal((t) => (t ?? 0) + 1);
            bumpFolderCount(selectedFolder.id, 1);
            signLibraryPaths(supabase, LIBRARY_BUCKET, [newMedia.file_path]).then((urls) => {
              const url = urls[newMedia.file_path];
              if (url) setSignedMap((prev) => ({ ...prev, [newMedia.id]: url }));
            });
          }}
        />
      )}

      <DeleteLibraryMediaModal
        open={!!deleteMediaTarget}
        mediaId={deleteMediaTarget?.id || ''}
        filePath={deleteMediaTarget?.filePath || ''}
        onClose={() => setDeleteMediaTarget(null)}
        onDeleted={() => {
          const id = deleteMediaTarget?.id;
          setMedia((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
          setMediaTotal((t) => (t == null ? t : Math.max(0, t - 1)));
          if (selectedFolder) bumpFolderCount(selectedFolder.id, -1);
        }}
      />

      {/* ─── VIEWER: a click anywhere but on a video closes it, as before ─── */}
      {viewerOpen && viewerItem && viewerUrl && (
        <div
          ref={viewerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="library-viewer-title"
          className={s.viewer}
          onClick={() => setViewer(null)}
        >
          <h2 id="library-viewer-title" className={ui.srOnly}>
            {viewerItem.file_type === 'video' ? 'Video' : 'Photo'}
          </h2>

          <div className={s.viewerBar}>
            <span className={ui.chip}>Added on {formatDay(viewerItem.created_at)}</span>
            <span className={s.viewerNav}>
              {(prevId || nextId) && (
                <>
                  <IconBtn
                    label="Previous"
                    onPhoto
                    disabled={!prevId}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (prevId) setViewer(prevId);
                    }}
                  >
                    <ChevronLeft size={20} strokeWidth={2.4} aria-hidden="true" />
                  </IconBtn>
                  <IconBtn
                    label="Next"
                    onPhoto
                    disabled={!nextId}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (nextId) setViewer(nextId);
                    }}
                  >
                    <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
                  </IconBtn>
                </>
              )}
              <IconBtn
                label="Close"
                onPhoto
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer(null);
                }}
              >
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </span>
          </div>

          <div className={s.viewerStage}>
            {viewerItem.file_type === 'video' ? (
              // A click or tap on the video is for the video (pause, show its controls), so it
              // stops here instead of reaching the backdrop's close. Keyed by the item, so moving
              // to the next video starts it afresh.
              <video
                key={viewerItem.id}
                src={viewerUrl}
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
                className={s.viewerMedia}
              />
            ) : (
              // Full size at its own shape, so a plain img (next/image needs a sized box).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewerUrl} alt="" className={s.viewerMedia} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// A loader that holds back for a moment: a list that lands inside it (the cached folder list, a
// small folder) goes straight on screen instead of three dots flashing first. The box keeps the
// section's height meanwhile, so nothing jumps either way.
function DelayedLoader({ label }: { label: string }) {
  const [due, setDue] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDue(true), 150);
    return () => clearTimeout(t);
  }, []);
  return due ? (
    <AppLoader label={label} className="min-h-[40vh]" />
  ) : (
    <div className="min-h-[40vh]" aria-hidden="true" />
  );
}

// Inside a tile button, so a span (a button holds only inline content).
function LibraryImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <span className="relative block h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 34vw, 20vw"
        quality={90}
        className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </span>
  );
}

// Inside the folder card's button, so a span too.
function FolderCoverImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <span className="relative block h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 479px) 100vw, (max-width: 1279px) 50vw, 30vw"
        quality={90}
        className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </span>
  );
}
