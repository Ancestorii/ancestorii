'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Image from 'next/image';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, ImagePlus, Video, ArrowLeft, Folder, Check, ImageOff } from 'lucide-react';
import {
  ui,
  AppLoader,
  Btn,
  EmptyState,
  IconBtn,
  IconTile,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import s from './LibraryPickerModal.module.css';
import {
  fetchLibraryFolders,
  getCachedLibraryFolders,
  signLibraryPaths,
  type LibraryFolderSummary,
} from '@/lib/libraryData';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Library's colour on the landing's feature index.
const ORANGE = toneByKey('orange');

// Dates as the Library page writes them: British English, the month as a word (02/06/2026 reads
// either way round). A folder date is a calendar day with no time, so it is read in UTC: in the
// local zone it slipped back a day anywhere west of London.
function formatDay(value: string, month: 'long' | 'short' = 'long', calendarDay = false) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month,
    year: 'numeric',
    ...(calendarDay ? { timeZone: 'UTC' } : {}),
  });
}

export type LibraryPickerItem = {
  id: string;
  file_path: string;
  file_type: string; // image | video | audio | file | other
  created_at: string | null;
  file_size?: number | null;
};

type LibraryFolder = LibraryFolderSummary;

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

  // Data. The folder list (with its covers) is shared with the Library page and kept per tab, so
  // the picker opens on the last list at once and refreshes it behind; foldersLoading shows only
  // when there is no list yet. `loading` is a folder's own photos.
  const [loading, setLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [media, setMedia] = useState<LibraryPickerItem[]>([]);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});

  // Filter (only used inside a folder)
  const [activeType, setActiveType] = useState<'all' | 'image' | 'video' | 'audio' | 'file' | 'other'>('all');

  // Picks: persist across folder navigation, reset on modal close
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

  // Escape closes it (as the close button does), Tab stays inside, focus returns to the button.
  const titleId = useId();
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  // ── Data fetching ──────────────────────────────────────────
  // One query for the folders, their counts and their covers (it was the folders, then every
  // media row of every folder, then the signing). With a list from earlier in this tab it shows
  // that at once and refreshes behind, with no loader.
  const fetchFolders = async () => {
    // The local session, not a round trip to the auth server.
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) {
      setFolders([]);
      return;
    }

    const cached = getCachedLibraryFolders(uid, bucket);
    if (cached) setFolders(cached);
    else setFoldersLoading(true);

    try {
      setFolders(await fetchLibraryFolders(supabase, uid, bucket));
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error && err.message ? err.message : 'Failed to load library.');
      if (!cached) setFolders([]);
    } finally {
      setFoldersLoading(false);
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

      if (rows.length === 0) {
        setMedia([]);
        setSignedMap({});
        return;
      }

      // One signing request for whatever this tab has not signed yet (a URL is kept for days, so
      // the browser's cache holds the thumbnails between opens), and the rows land together with
      // their URLs (they showed "Preview unavailable" until each one's own request came back).
      const urls = await signLibraryPaths(supabase, bucket, rows.map((item) => item.file_path));

      const next: Record<string, string> = {};
      rows.forEach((item) => {
        const url = urls[item.file_path];
        if (url) next[item.id] = url;
      });
      setMedia(rows);
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
      className={cx(
        s.overlay,
        'fixed inset-0 z-[1200] flex items-end justify-center sm:items-center sm:p-6'
      )}
      data-open={open}
    >
      {/* Backdrop (scrim-blur blurs only with a mouse, see globals.css) */}
      <div className={cx(ui.scrim, 'scrim-blur')} onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-open={open}
        className={cx(ui.sheet, ui.sheetBottom, s.panel)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <h2 id={titleId} className={ui.sheetTitle}>
              {title}
            </h2>
            <p className={ui.sheetSub}>{subtitle}</p>
          </div>

          <IconBtn label="Close" onClick={onClose}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        {/* Inside a folder: back to the folders, and the type filter */}
        {view === 'media' && (
          <div className={s.toolbar}>
            <Btn
              variant="soft"
              size="sm"
              onClick={handleBackToFolders}
              icon={<ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" />}
            >
              Back to folders
            </Btn>

            <div className={ui.tabs} role="group" aria-label="Filter by type">
              <FilterPill
                active={activeType === 'all'}
                onClick={() => setActiveType('all')}
                label="All"
              />
              <FilterPill
                active={activeType === 'image'}
                onClick={() => setActiveType('image')}
                label="Images"
                icon={<ImagePlus size={16} strokeWidth={2.2} className={s.tabIcon} aria-hidden="true" />}
              />
              <FilterPill
                active={activeType === 'video'}
                onClick={() => setActiveType('video')}
                label="Videos"
                icon={<Video size={16} strokeWidth={2.2} className={s.tabIcon} aria-hidden="true" />}
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className={ui.sheetBody} aria-busy={loading || foldersLoading || undefined}>
          {(view === 'folders' ? foldersLoading && folders.length === 0 : loading) ? (
            <DelayedLoader />
          ) : view === 'folders' ? (
            folders.length === 0 ? (
              <EmptyState
                Icon={Folder}
                tone={ORANGE}
                title="No folders yet."
                text={
                  <>
                    Create a folder in <span className="font-extrabold">My Library</span> first.
                  </>
                }
                className="min-h-full justify-center shadow-none"
              />
            ) : (
              <div className={s.grid}>
                {folders.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => handleEnterFolder(f.id)}
                    className={s.folder}
                  >
                    {/* Cover */}
                    <span className={s.cover}>
                      {f.cover_url ? (
                        f.cover_file_type === 'video' ? (
                          <video
                            src={f.cover_url}
                            className={s.media}
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <PickerImage src={f.cover_url} alt="" />
                        )
                      ) : (
                        <span className={s.coverEmpty}>
                          <IconTile Icon={Folder} tone={ORANGE} />
                        </span>
                      )}

                      {/* Count chip */}
                      <span className={s.countChip}>
                        {f.media_count} {f.media_count === 1 ? 'item' : 'items'}
                      </span>
                    </span>

                    {/* Folder meta */}
                    <span className={s.folderName}>{f.name}</span>
                    <span className={s.folderDate}>
                      {f.folder_date
                        ? formatDay(f.folder_date, 'long', true)
                        : f.created_at
                        ? formatDay(f.created_at)
                        : 'No date'}
                    </span>
                  </button>
                ))}
              </div>
            )
          ) : filtered.length === 0 ? (
            <EmptyState
              Icon={ImageOff}
              tone={ORANGE}
              title="No media found."
              text="This folder is empty for the selected filter."
              className="min-h-full justify-center shadow-none"
            />
          ) : (
            <div className={s.grid}>
              {filtered.map((item) => {
                const url = signedMap[item.id];
                const selected = pickedIds.has(item.id);
                const disabled = !canPick(item);

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handlePick(item)}
                    disabled={disabled}
                    aria-pressed={selected}
                    className={s.tile}
                  >
                    {/* Preview */}
                    <span className={s.thumb}>
                      {!url ? (
                        <span className={s.noPreview}>Preview unavailable</span>
                      ) : item.file_type === 'video' ? (
                        <video
                          src={url}
                          className={s.media}
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <PickerImage src={url} alt="" />
                      )}

                      {/* Selected: the ink check */}
                      <span className={s.check} aria-hidden="true">
                        {selected && <Check size={16} strokeWidth={3} />}
                      </span>

                      {/* Type chip */}
                      <span className={s.typeChip}>{prettyType(item.file_type)}</span>
                    </span>

                    {/* Meta */}
                    <span className={s.meta}>
                      {item.created_at
                        ? `Added on ${formatDay(item.created_at, 'short')}`
                        : 'No date'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cx(ui.sheetFooter, s.footer)}>
          <p className={s.count} aria-live="polite">
            {pickedIds.size} selected
          </p>

          <div className={s.footerActions}>
            <Btn variant="soft" onClick={onClose}>
              Cancel
            </Btn>

            <Btn onClick={confirmPick} disabled={pickedIds.size === 0}>
              {pickedIds.size <= 1 ? 'Use Selected Media' : `Add ${pickedIds.size} Items`}
            </Btn>
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
    // focusInset: the tab strip scrolls sideways, which would clip a ring drawn outside the tab.
    <button type="button" onClick={onClick} aria-pressed={active} className={cx(ui.tab, ui.focusInset, s.tab)}>
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

// A loader that holds back for a moment: a folder that lands inside it goes straight on screen
// instead of three dots flashing first. The box keeps the body's height meanwhile.
function DelayedLoader() {
  const [due, setDue] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDue(true), 150);
    return () => clearTimeout(t);
  }, []);
  return due ? (
    <AppLoader label="Loading your library" className="min-h-full" />
  ) : (
    <div className="min-h-full" aria-hidden="true" />
  );
}

function PickerImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  // A span, not a div: it sits inside the folder and photo buttons (a button holds inline content).
  return (
    <span className="relative block w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 220px"
        quality={90}
        className={[
          'object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onLoadingComplete={() => setLoaded(true)}
      />
    </span>
  );
}
