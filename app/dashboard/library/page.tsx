'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { getBrowserClient } from '@/lib/supabase/browser';
import UploadLibraryDrawer from './_components/UploadLibraryDrawer';
import { Trash2, ArrowLeft, Folder, CalendarDays, ImagePlus, Images, Play, Plus, X } from 'lucide-react';
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
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import s from './_components/library.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Library is orange in the landing's feature index.
const ORANGE = toneByKey('orange');

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

type LibraryFolder = {
  id: string;
  name: string;
  description: string | null;
  folder_date: string | null;
  created_at: string;
  media_count: number;
  cover_url: string | null;
  cover_file_type: string | null;
};

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

  // Data
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [media, setMedia] = useState<LibraryMedia[]>([]);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});
  const [mediaLoading, setMediaLoading] = useState(false);

  // Modals
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'edit'>('create');
  const [editFolderTarget, setEditFolderTarget] = useState<LibraryFolder | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<LibraryFolder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteMediaTarget, setDeleteMediaTarget] = useState<{ id: string; filePath: string } | null>(null);
  const [viewer, setViewer] = useState<{ url: string; type: string } | null>(null);

  useEffect(() => {
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opening a folder (or going back) swaps the page in place, not the route, so the scroll
  // position carried over: a folder low in a long list opened part-way down its photos, with
  // its title out of view. Start each view at the top, as a page change does.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  async function fetchFolders() {
    setFoldersLoading(true);

    const { data: foldersData, error: foldersErr } = await supabase
      .from('library_folders')
      .select('id, name, description, folder_date, created_at')
      .order('created_at', { ascending: false });

    if (foldersErr) {
      setFolders([]);
      setFoldersLoading(false);
      return;
    }

    const folderRows = foldersData || [];

    if (folderRows.length === 0) {
      setFolders([]);
      setFoldersLoading(false);
      return;
    }

    const folderIds = folderRows.map((f) => f.id);
    const { data: mediaData } = await supabase
      .from('library_media')
      .select('folder_id, file_path, file_type, created_at')
      .in('folder_id', folderIds)
      .order('created_at', { ascending: false });

    const countByFolder: Record<string, number> = {};
    const coverByFolder: Record<string, { file_path: string; file_type: string }> = {};
    (mediaData || []).forEach((m: any) => {
      if (!m.folder_id) return;
      countByFolder[m.folder_id] = (countByFolder[m.folder_id] || 0) + 1;
      if (!coverByFolder[m.folder_id]) {
        coverByFolder[m.folder_id] = { file_path: m.file_path, file_type: m.file_type };
      }
    });

    const signedCovers = await Promise.all(
      folderRows.map(async (f) => {
        const cover = coverByFolder[f.id];
        if (!cover) return { id: f.id, url: null as string | null, file_type: null as string | null };
        const { data: urlData } = await supabase.storage
          .from('library-media')
          .createSignedUrl(cover.file_path, 60 * 60 * 24 * 7);
        return {
          id: f.id,
          url: urlData?.signedUrl || null,
          file_type: cover.file_type,
        };
      })
    );

    const coverMap: Record<string, { url: string | null; file_type: string | null }> = {};
    signedCovers.forEach((c) => {
      coverMap[c.id] = { url: c.url, file_type: c.file_type ?? null };
    });

    const merged: LibraryFolder[] = folderRows.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      folder_date: f.folder_date,
      created_at: f.created_at,
      media_count: countByFolder[f.id] || 0,
      cover_url: coverMap[f.id]?.url ?? null,
      cover_file_type: coverMap[f.id]?.file_type ?? null,
    }));

    setFolders(merged);
    setFoldersLoading(false);
  }

  async function fetchMediaForFolder(folderId: string) {
    setMediaLoading(true);

    const { data, error } = await supabase
      .from('library_media')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    if (error) {
      setMediaLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setMedia([]);
      setSignedMap({});
      setMediaLoading(false);
      return;
    }

    const signedResults = await Promise.all(
      data.map(async (item) => {
        const { data: urlData } = await supabase.storage
          .from('library-media')
          .createSignedUrl(item.file_path, 60 * 60 * 24 * 7);
        return { id: item.id, url: urlData?.signedUrl || null };
      })
    );

    const signed: Record<string, string> = {};
    signedResults.forEach((r) => {
      if (r.url) signed[r.id] = r.url;
    });

    setMedia(data);
    setSignedMap(signed);
    setMediaLoading(false);
  }

  const handleEnterFolder = (folder: LibraryFolder) => {
    setSelectedFolder(folder);
    setView('folder-detail');
    fetchMediaForFolder(folder.id);
  };

  const handleBackToFolders = () => {
    setView('folders');
    setSelectedFolder(null);
    setMedia([]);
    setSignedMap({});
    fetchFolders();
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

  // The full-screen viewer: Escape closes it, focus goes back to the tile that opened it.
  const viewerRef = useDialog<HTMLDivElement>(!!viewer, () => setViewer(null));
  // The item on show, for its caption (the viewer keeps only the URL and the type).
  const viewerItem = viewer ? media.find((m) => signedMap[m.id] === viewer.url) : undefined;
  // Until the folder's own rows arrive, its count from the folder list (not "0 items").
  const itemCount = mediaLoading && selectedFolder ? selectedFolder.media_count : media.length;

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
              {foldersLoading ? (
                <AppLoader label="Loading your library" className="min-h-[40vh]" />
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
              {mediaLoading ? (
                <AppLoader label="Loading folder" className="min-h-[40vh]" />
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
                      const dateId = `library-media-${item.id}-date`;

                      return (
                        <li key={item.id} className="min-w-0">
                          <div className={s.tile}>
                            {/* The tile opens the viewer; a video plays there, with its controls */}
                            <button
                              type="button"
                              onClick={() => setViewer({ url, type: item.file_type })}
                              aria-label={isVideo ? 'Play video' : 'Open photo'}
                              aria-describedby={dateId}
                              aria-haspopup="dialog"
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
                              ) : (
                                <LibraryImage src={url} alt="" />
                              )}

                              {isVideo && (
                                <span className={cx(ui.chip, ui.chipInk, ui.chipSm, s.playChip)} aria-hidden="true">
                                  <Play size={11} strokeWidth={0} fill="currentColor" />
                                  Video
                                </span>
                              )}
                            </button>

                            <IconBtn
                              label={isVideo ? 'Delete this video' : 'Delete this photo'}
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
        onCreated={() => {
          fetchFolders();
        }}
        onUpdated={(updated) => {
          setFolders((prev) =>
            prev.map((f) =>
              f.id === updated.id
                ? { ...f, name: updated.name, description: updated.description, folder_date: updated.folder_date }
                : f
            )
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
          if (selectedFolder?.id === deleteFolderTarget?.id) {
            setView('folders');
            setSelectedFolder(null);
            setMedia([]);
            setSignedMap({});
          }
          fetchFolders();
        }}
      />

      {selectedFolder && (
        <UploadLibraryDrawer
          open={drawerOpen}
          folderId={selectedFolder.id}
          onClose={() => setDrawerOpen(false)}
          onUploaded={(newMedia) => {
            setMedia((prev) => [newMedia as LibraryMedia, ...prev]);
            supabase.storage
              .from('library-media')
              .createSignedUrl(newMedia.file_path, 60 * 60 * 24 * 7)
              .then(({ data }) => {
                if (data?.signedUrl) {
                  setSignedMap((prev) => ({ ...prev, [newMedia.id]: data.signedUrl }));
                }
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
          setMedia((prev) => prev.filter((m) => m.id !== deleteMediaTarget?.id));
        }}
      />

      {/* ─── VIEWER: a click anywhere but on a video closes it, as before ─── */}
      {viewer && (
        <div
          ref={viewerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="library-viewer-title"
          className={s.viewer}
          onClick={() => setViewer(null)}
        >
          <h2 id="library-viewer-title" className={ui.srOnly}>
            {viewer.type === 'video' ? 'Video' : 'Photo'}
          </h2>

          <div className={s.viewerBar}>
            {viewerItem && (
              <span className={ui.chip}>Added on {formatDay(viewerItem.created_at)}</span>
            )}
            <IconBtn
              label="Close"
              onPhoto
              onClick={(e) => {
                e.stopPropagation();
                setViewer(null);
              }}
              className={s.viewerClose}
            >
              <X size={20} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
          </div>

          <div className={s.viewerStage}>
            {viewer.type === 'video' ? (
              // A click or tap on the video is for the video (pause, show its controls), so it
              // stops here instead of reaching the backdrop's close.
              <video
                src={viewer.url}
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
                className={s.viewerMedia}
              />
            ) : (
              // Full size at its own shape, so a plain img (next/image needs a sized box).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewer.url} alt="" className={s.viewerMedia} />
            )}
          </div>
        </div>
      )}
    </div>
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