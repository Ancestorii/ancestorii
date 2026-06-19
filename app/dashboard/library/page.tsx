'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getBrowserClient } from '@/lib/supabase/browser';
import UploadLibraryDrawer from './_components/UploadLibraryDrawer';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, Folder } from 'lucide-react';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import DeleteLibraryMediaModal from './_components/DeleteLibraryMediaModal';
import CreateFolderModal from './_components/CreateFolderModal';
import DeleteFolderModal from './_components/DeleteFolderModal';

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

  return (
    <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
      <div className="relative z-10 pl-8 pr-6 sm:pl-14 sm:pr-12 md:pl-16 md:pr-16 lg:pl-20 lg:pr-32 pt-20 pb-16 max-w-[1700px] mx-auto">

        {view === 'folders' ? (
          // ─────────── FOLDERS VIEW ───────────
          <>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
              <div className="text-center md:text-left flex-1">
                <h1 className="text-[clamp(2.25rem,4vw,3rem)] font-bold text-[#222B3A] mb-4 relative inline-block">
                  <span className="relative">
                    My
                    <motion.span
                      className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: 70 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    />
                  </span>{' '}
                  <span className="text-[#C8A557]">Library</span>
                </h1>

                <p className="text-[#000000] text-lg mt-2">
                  Upload your photos and videos here once. When you&apos;re adding memories to timelines, albums, or capsules, look for the &quot;My Library&quot; button to pull from this collection.
                </p>
              </div>

              <div className="flex justify-center md:justify-end flex-1">
                <button
                  onClick={openCreateFolder}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] relative overflow-hidden"
                >
                  <span className="relative z-10">+ Create Folder</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
                </button>
              </div>
            </div>

            {foldersLoading ? (
              <p className="text-[#778199] italic text-center">Loading your library...</p>
            ) : folders.length === 0 ? (
              <div className="text-center text-[#0f2040] italic mt-12">
                Your library is empty. Create your first folder ✨
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleEnterFolder(folder)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEnterFolder(folder);
                    }}
                    className="relative text-left rounded-3xl border border-[#B7932F]/60 shadow-md md:hover:shadow-2xl md:transform md:hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-white/95 cursor-pointer"
                  >
                    <div className="aspect-[16/9] relative bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">
                      {folder.cover_url ? (
                        folder.cover_file_type === 'video' ? (
                          <video
                            src={folder.cover_url}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <FolderCoverImage src={folder.cover_url} alt="" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Folder className="w-10 h-10 opacity-50" />
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/55 text-white">
                        {folder.media_count} {folder.media_count === 1 ? 'item' : 'items'}
                      </div>
                    </div>

                    {/* 3-dot context menu */}
                    <div
                      className="absolute top-3 right-3 z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ContextMenuDots
                        editLabel="Edit Folder"
                        deleteLabel="Delete Folder"
                        onEdit={() => openEditFolder(folder)}
                        onDelete={() => setDeleteFolderTarget(folder)}
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-sm font-semibold text-[#1F2837] truncate">{folder.name}</p>
                      <p className="text-xs text-[#7A8596] mt-1">
                        {folder.folder_date
                          ? new Date(folder.folder_date).toLocaleDateString()
                          : `Created ${new Date(folder.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // ─────────── FOLDER DETAIL VIEW ───────────
          <>
            <button
              onClick={handleBackToFolders}
              className="flex items-center gap-2 text-sm text-[#5B6473] hover:text-[#1F2837] mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </button>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
              <div className="text-center md:text-left flex-1 min-w-0">
                <h1 className="text-[clamp(2.25rem,4vw,3rem)] font-bold text-[#222B3A] mb-4 relative inline-block">
                  <span className="relative">
                    {selectedFolder?.name}
                    <motion.span
                      className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: 70 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    />
                  </span>
                </h1>
                {selectedFolder?.description && (
                  <p className="text-[#000000] text-lg mt-2">
                    {selectedFolder.description}
                  </p>
                )}
                <p className="text-sm text-[#7A8596] mt-2">
                  {selectedFolder?.folder_date
                    ? new Date(selectedFolder.folder_date).toLocaleDateString()
                    : selectedFolder
                    ? `Created ${new Date(selectedFolder.created_at).toLocaleDateString()}`
                    : ''}
                  {' · '}
                  {media.length} {media.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="flex justify-center md:justify-end flex-1 items-center">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] relative overflow-hidden"
                >
                  <span className="relative z-10">+ Add Media</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
                </button>
              </div>
            </div>

            {mediaLoading ? (
              <p className="text-[#778199] italic text-center">Loading folder...</p>
            ) : media.length === 0 ? (
              <div className="text-center text-[#0f2040] italic mt-12">
                This folder is empty. Add your first memory ✨
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {media.map((item) => {
                  const url = signedMap[item.id];
                  if (!url) return null;

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-[#B7932F]/60 shadow-md md:hover:shadow-2xl md:transform md:hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-white/95"
                    >
                      <div
                        onClick={() => setViewer({ url, type: item.file_type })}
                        className="aspect-[16/9] relative bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden cursor-zoom-in"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteMediaTarget({ id: item.id, filePath: item.file_path });
                          }}
                          className="absolute top-3 right-3 z-50 w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>

                        {item.file_type === 'video' ? (
                          <div className="relative w-full h-full">
                            <video
                              key={url || item.file_path}
                              src={url}
                              className="absolute inset-0 w-full h-full object-cover"
                              controls
                              playsInline
                              preload="metadata"
                            />
                          </div>
                        ) : (
                          <LibraryImage src={url} alt="" />
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-xs text-[#7A8596]">
                          Added on {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

      {viewer && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center"
          onClick={() => setViewer(null)}
        >
          <div className="max-w-[95vw] max-h-[95vh]">
            {viewer.type === 'video' ? (
              <video
                src={viewer.url}
                controls
                autoPlay
                className="max-w-full max-h-[95vh] rounded-lg"
              />
            ) : (
              <img
                src={viewer.url}
                className="max-w-full max-h-[95vh] rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

function LibraryImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
        quality={90}
        className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}

function FolderCoverImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
        quality={90}
        className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}