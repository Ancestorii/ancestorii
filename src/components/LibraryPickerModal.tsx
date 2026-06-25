'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, ImagePlus, Video, Loader2, ArrowLeft, Folder } from 'lucide-react';

export type LibraryPickerItem = {
  id: string;
  file_path: string;
  file_type: string; // image | video | audio | file | other
  created_at: string | null;
  file_size?: number | null;
};

type LibraryFolder = {
  id: string;
  name: string;
  description: string | null;
  folder_date: string | null;
  created_at: string | null;
  media_count: number;
  cover_url: string | null;
  cover_file_type: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (item: LibraryPickerItem) => void;
  title?: string;
  subtitle?: string;
  bucket?: string; // default: 'library-media'
  /** If you want to restrict what can be picked */
  accept?: Array<'image' | 'video' | 'audio' | 'file' | 'other'>;
};

export default function LibraryPickerModal({
  open,
  onClose,
  onPick,
  title = 'Pick From My Library',
  subtitle = 'Choose memories you already uploaded.',
  bucket = 'library-media',
  accept,
}: Props) {
  const supabase = getBrowserClient();

  // View state
  const [view, setView] = useState<'folders' | 'media'>('folders');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Data
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [media, setMedia] = useState<LibraryPickerItem[]>([]);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});

  // Filter (only used inside a folder)
  const [activeType, setActiveType] = useState<'all' | 'image' | 'video' | 'audio' | 'file' | 'other'>('all');

  // Picks — persist across folder navigation, reset on modal close
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());
  const [pickedItems, setPickedItems] = useState<Record<string, LibraryPickerItem>>({});

  const [mounted, setMounted] = useState(false);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset + fetch on open
  useEffect(() => {
    if (!open) return;
    setView('folders');
    setActiveFolderId(null);
    setActiveType('all');
    setPickedIds(new Set());
    setPickedItems({});
    setMedia([]);
    setSignedMap({});
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Mount lifecycle for close animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  // ── Data fetching ──────────────────────────────────────────
  const fetchFolders = async () => {
    setLoading(true);
    try {
      // Folders (RLS scopes to current user's family)
      const { data: foldersData, error: foldersErr } = await supabase
        .from('library_folders')
        .select('id, name, description, folder_date, created_at')
        .order('created_at', { ascending: false });

      if (foldersErr) throw foldersErr;

      const folderRows = foldersData || [];

      if (folderRows.length === 0) {
        setFolders([]);
        return;
      }

      // All media for those folders — one query, sorted desc.
      // We use it for both: per-folder counts AND the cover (first row per folder).
      const folderIds = folderRows.map((f) => f.id);
      const { data: mediaData, error: mediaErr } = await supabase
        .from('library_media')
        .select('id, folder_id, file_path, file_type, created_at')
        .in('folder_id', folderIds)
        .order('created_at', { ascending: false });

      if (mediaErr) throw mediaErr;

      const countByFolder: Record<string, number> = {};
      const coverByFolder: Record<string, { file_path: string; file_type: string }> = {};
      (mediaData || []).forEach((m: any) => {
        if (!m.folder_id) return;
        countByFolder[m.folder_id] = (countByFolder[m.folder_id] || 0) + 1;
        if (!coverByFolder[m.folder_id]) {
          coverByFolder[m.folder_id] = {
            file_path: m.file_path,
            file_type: m.file_type,
          };
        }
      });

      // Sign cover URLs in parallel
      const signedCovers = await Promise.all(
        folderRows.map(async (f) => {
          const cover = coverByFolder[f.id];
          if (!cover) {
            return { id: f.id, url: null as string | null, file_type: null as string | null };
          }
          const { data: urlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(cover.file_path, 60 * 60 * 24 * 7);
          return {
            id: f.id,
            url: urlData?.signedUrl
              ? `${urlData.signedUrl}&cb=${Date.now()}`
              : null,
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
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to load library.');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaInFolder = async (folderId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('library_media')
        .select('id, file_path, file_type, created_at, file_size')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as LibraryPickerItem[];
      setMedia(rows);

      if (rows.length === 0) {
        setSignedMap({});
        return;
      }

      const signedResults = await Promise.all(
        rows.map(async (item) => {
          const { data: urlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(item.file_path, 60 * 60 * 24 * 7);

          return {
            id: item.id,
            url: urlData?.signedUrl
              ? `${urlData.signedUrl}&cb=${Date.now()}`
              : null,
          };
        })
      );

      const next: Record<string, string> = {};
      signedResults.forEach((r) => {
        if (r.url) next[r.id] = r.url;
      });
      setSignedMap(next);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to load folder.');
      setMedia([]);
      setSignedMap({});
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation ─────────────────────────────────────────────
  const handleEnterFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    setView('media');
    setActiveType('all');
    fetchMediaInFolder(folderId);
  };

  const handleBackToFolders = () => {
    setView('folders');
    setActiveFolderId(null);
    setMedia([]);
    setSignedMap({});
    setActiveType('all');
  };

  // ── Filtering / picking ────────────────────────────────────
  const normalizedAccept = useMemo(() => {
    if (!accept || accept.length === 0) return null;
    return new Set(accept);
  }, [accept]);

  const filtered = useMemo(() => {
    return media.filter((m) => {
      if (normalizedAccept) {
        const ok = normalizedAccept.has((m.file_type as any) || 'other');
        if (!ok) return false;
      }
      if (activeType !== 'all' && m.file_type !== activeType) return false;
      return true;
    });
  }, [media, activeType, normalizedAccept]);

  const canPick = (m: LibraryPickerItem) => {
    if (!normalizedAccept) return true;
    return normalizedAccept.has((m.file_type as any) || 'other');
  };

  const handlePick = (m: LibraryPickerItem) => {
    if (!canPick(m)) return;
    setPickedIds((prev) => {
      const next = new Set(prev);
      if (next.has(m.id)) next.delete(m.id);
      else next.add(m.id);
      return next;
    });
    setPickedItems((prev) => {
      if (prev[m.id]) {
        const { [m.id]: _omit, ...rest } = prev;
        return rest;
      }
      return { ...prev, [m.id]: m };
    });
  };

  const confirmPick = () => {
    if (pickedIds.size === 0) return;
    const items = Object.values(pickedItems).filter((it) => pickedIds.has(it.id));
    items.forEach((item) => onPick(item));
    onClose();
  };

  if (!mounted && !open) return null;

  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-center justify-center transition-opacity duration-200 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-200 flex flex-col max-h-[80vh] ${
          open ? 'scale-100 translate-y-0' : 'scale-[0.98] translate-y-2'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white via-[#fefaf3] to-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2 min-w-0">
              {view === 'media' && (
                <button
                  onClick={handleBackToFolders}
                  className="shrink-0 rounded-full p-2 hover:bg-gray-100 transition mt-0.5"
                  aria-label="Back to folders"
                >
                  <ArrowLeft className="w-5 h-5 text-[#1F2837]" />
                </button>
              )}
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2837]">
                  {title}
                </h2>
                <p className="text-sm sm:text-base text-[#5B6473] mt-2">
                  {subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-2 hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#1F2837]" />
            </button>
          </div>

          {/* Type filter — only inside a folder */}
          {view === 'media' && (
            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <FilterPill
                  active={activeType === 'all'}
                  onClick={() => setActiveType('all')}
                  label="All"
                />
                <FilterPill
                  active={activeType === 'image'}
                  onClick={() => setActiveType('image')}
                  label="Images"
                  icon={<ImagePlus className="w-4 h-4" />}
                />
                <FilterPill
                  active={activeType === 'video'}
                  onClick={() => setActiveType('video')}
                  label="Videos"
                  icon={<Video className="w-4 h-4" />}
                />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#5B6473]">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading your library…
            </div>
          ) : view === 'folders' ? (
            folders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#1F2837] font-semibold">
                  No folders yet.
                </p>
                <p className="text-sm text-[#5B6473] mt-2">
                  Create a folder in <span className="font-medium">My Library</span> first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {folders.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => handleEnterFolder(f.id)}
                    className={[
                      'text-left rounded-3xl border overflow-hidden bg-white',
                      'transition-all duration-200',
                      'border-[#B7932F]/40 hover:shadow-lg hover:border-[#B7932F]/70',
                      'cursor-pointer',
                    ].join(' ')}
                  >
                    {/* Cover */}
                    <div className="relative aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">
                      {f.cover_url ? (
                        f.cover_file_type === 'video' ? (
                          <video
                            src={f.cover_url}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <PickerImage src={f.cover_url} alt="" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Folder className="w-8 h-8 opacity-50" />
                        </div>
                      )}

                      {/* Count badge (same style as type badge in media view) */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/55 text-white">
                        {f.media_count} {f.media_count === 1 ? 'item' : 'items'}
                      </div>
                    </div>

                    {/* Folder meta */}
                    <div className="p-4">
                      <p className="text-sm font-semibold text-[#1F2837] truncate">
                        {f.name}
                      </p>
                      <p className="text-xs text-[#7A8596] mt-1">
                        {f.folder_date
                          ? new Date(f.folder_date).toLocaleDateString()
                          : f.created_at
                          ? new Date(f.created_at).toLocaleDateString()
                          : '—'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#1F2837] font-semibold">
                No media found.
              </p>
              <p className="text-sm text-[#5B6473] mt-2">
                This folder is empty for the selected filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => {
                const url = signedMap[item.id];
                const ready = !!url;
                const selected = pickedIds.has(item.id);
                const disabled = !canPick(item);

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handlePick(item)}
                    disabled={disabled}
                    className={[
                      'text-left rounded-3xl border overflow-hidden bg-white',
                      'transition-all duration-200',
                      'transition-opacity duration-300',
                      ready ? 'opacity-100' : 'opacity-0',
                      selected
                        ? 'border-[#C8A557] shadow-[0_0_0_3px_rgba(230,194,110,0.35)]'
                        : 'border-[#B7932F]/40 hover:shadow-lg hover:border-[#B7932F]/70',
                      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    {/* Preview */}
                    <div className="relative aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">
                      {!url ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                          Preview unavailable
                        </div>
                      ) : item.file_type === 'video' ? (
                        <video
                          src={url}
                          className="absolute inset-0 w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <PickerImage src={url} alt="" />
                      )}

                      {/* Selected badge */}
                      {selected && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#C8A557] text-[#1F2837] shadow">
                          Selected
                        </div>
                      )}

                      {/* Type badge */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/55 text-white">
                        {prettyType(item.file_type)}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="p-4">
                      <p className="text-xs text-[#7A8596]">
                        {item.created_at
                          ? `Added on ${new Date(item.created_at).toLocaleDateString()}`
                          : '—'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-5 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={confirmPick}
              disabled={pickedIds.size === 0}
              className="px-6 py-2 rounded-full text-sm font-semibold
                         bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
                         text-[#1F2837] shadow
                         hover:shadow-lg hover:scale-[1.01]
                         disabled:opacity-60 disabled:hover:shadow disabled:hover:scale-100
                         transition"
            >
              {pickedIds.size <= 1 ? 'Use Selected Media' : `Add ${pickedIds.size} Items`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition',
        active
          ? 'bg-[#1F2837] text-white shadow'
          : 'bg-gray-100 text-[#1F2837] hover:bg-gray-200',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

function prettyType(t: string) {
  const x = (t || '').toLowerCase();
  if (x === 'image' || x === 'photo') return 'Image';
  if (x === 'video') return 'Video';
  if (x === 'audio') return 'Audio';
  if (x === 'file') return 'File';
  if (x === 'other') return 'Other';
  return x ? x[0].toUpperCase() + x.slice(1) : 'Media';
}

function PickerImage({ src, alt }: { src: string; alt: string }) {
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
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        quality={90}
        className={[
          'object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}