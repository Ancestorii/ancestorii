'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Images, Plus } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import CreateAlbumDrawer from './_components/CreateAlbumDrawer';
import { safeToast as toast } from '@/lib/safeToast';
import LegacyCelebration from "@/components/LegacyCelebration";
import { ContextMenuDots } from "@/components/ContextMenuDots";
import { usePlanLimits } from '@/lib/usePlanLimits';
import Image from "next/image";
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  EmptyState,
  PageHeader,
  btnClass,
  tone,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import s from './_components/albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Album = {
  id: string;
  title: string;
  description: string | null;
  visibility: string;
  created_at: string;
  cover_image: string | null;
};

export default function AlbumsPage() {
  const supabase = getBrowserClient();
  const [albums, setAlbums] = useState<Album[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const [celebrate, setCelebrate] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { loading: limitsLoading, canCreate, limits, counts } = usePlanLimits();

  // Escape cancels the delete question, Tab stays inside it.
  const confirmRef = useDialog<HTMLDivElement>(!!confirmDelete, () => setConfirmDelete(null));
  const confirmTitleId = useId();
  const confirmTextId = useId();

  // The header's lead (same words as Timeline/Capsules)
  const line1 = 'Keep the moments you love together, in one place.';
  const line2 = 'Create albums to group photos, videos, and voice notes.';

  // The plan-limit message (the create button also shows it as a toast).
  const limitMessage = `You’ve reached your current plan limit for albums (${counts?.albums} / ${limits?.max_albums}). Upgrade your plan to create more.`;

  // Signed URL helper
  const getSignedCoverUrl = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    try {
      const match = url.match(/album-media\/(.+)$/);
      const path = match ? match[1] : url;
      const { data: signed } = await supabase.storage
        .from('album-media')
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      return signed?.signedUrl ? `${signed.signedUrl}&cb=${Date.now()}` : url;
    } catch {
      return url;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load albums
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const user = sess?.session?.user;
        if (!user) {
          setError('You need to sign in to view your albums.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('albums')
          .select('id, title, description, visibility, created_at, cover_image')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const signedAlbums = await Promise.all(
          (data || []).map(async (a: Album) => ({
            ...a,
            cover_image: await getSignedCoverUrl(a.cover_image),
          }))
        );

        setAlbums(signedAlbums);
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load albums.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleDeleteAlbum = async (id: string) => {
    try {
      const deleted = await deleteWithOwnerCheck(supabase, 'albums', id, 'album');
      if (!deleted) return;
      setAlbums((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
      toast.success('Album deleted.');
    } catch {
      toast.error('Failed to delete album.');
    }
  };

  // The create button (in the header and in the empty state).
  const openCreate = () => {
    if (limitsLoading) return;
    if (!canCreate.album) {
      toast.error(limitMessage);
      return;
    }
    setDrawerMode('create');
    setSelectedAlbum(null);
    setDrawerOpen(true);
  };

  const createButton = (
    <Btn onClick={openCreate} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.6} />}>
      Create New Album
    </Btn>
  );

  const list = albums ?? [];

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <PageHeader
          eyebrow="Albums"
          eyebrowDot="var(--c2)"
          title={
            <>
              My <Accent>Albums</Accent>
            </>
          }
          lead={`${line1} ${line2}`}
          actions={createButton}
        />

        {!limitsLoading && !canCreate.album && (
          <p className={cx(ui.noticeWarn, 'mt-8')} role="status">
            {limitMessage}
          </p>
        )}

        <section className={ui.section} aria-label="Your albums">
          {loading && <AppLoader label="Loading your albums" />}

          {!loading && error && (
            <p className={ui.noticeError} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && list.length === 0 && (
            <EmptyState
              Icon={Images}
              tone={toneByKey('orange')}
              title="No albums yet"
              text="Start organising your memories."
            >
              {createButton}
            </EmptyState>
          )}

          {/* Columns follow the space beside the sidebar: 1 on phones, 2 on tablets, 3 on desktops */}
          {!loading && !error && list.length > 0 && (
            <div className="@container">
              <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-10 @xl:grid-cols-2 @4xl:grid-cols-3">
                {list.map((a, i) => (
                  <li key={a.id} className={s.album}>
                    <div
                      className={cx(ui.frame, s.albumFrame)}
                      style={{ '--frame': tone(i).bg } as CSSProperties}
                    >
                      <div className={cx(ui.frameInner, s.albumCover)}>
                        {a.cover_image ? (
                          <AlbumCover src={a.cover_image} alt={a.title || 'Album cover'} />
                        ) : (
                          <div className={s.noCover}>
                            <Images size={34} strokeWidth={2} aria-hidden="true" />
                            No cover image
                          </div>
                        )}
                      </div>

                      <div className={s.albumMenu}>
                        <ContextMenuDots
                          editLabel="Edit Album"
                          onEdit={() => {
                            setDrawerMode('edit');
                            setSelectedAlbum(a);
                            setDrawerOpen(true);
                          }}
                          onDelete={() =>
                            setConfirmDelete({ id: a.id, title: a.title || 'Untitled Album' })
                          }
                        />
                      </div>
                    </div>

                    <div className={s.albumBody}>
                      <h2 className={s.albumTitle}>{a.title || 'Untitled Album'}</h2>
                      <p className={s.albumText}>
                        {a.description || 'A collection of your memories.'}
                      </p>
                      <div className={s.albumMeta}>
                        <span className={cx(ui.chip, ui.chipSm)}>
                          Created{' '}
                          {new Date(a.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className={s.albumOpen}>
                        <Link
                          href={`/dashboard/albums/${a.id}`}
                          className={btnClass({ variant: 'soft', block: true })}
                        >
                          View Album
                          <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* delete confirmation */}
      {confirmDelete && (
        <div className={cx(ui.scrim, s.fadeIn, 'scrim-blur z-[9999] flex items-center justify-center p-4')}>
          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, s.confirm, s.popIn, s.dialog)}
          >
            <h2 id={confirmTitleId} className={s.confirmTitle}>
              Delete “{confirmDelete.title}”?
            </h2>
            <p id={confirmTextId} className={s.confirmText}>
              This action cannot be undone. All media inside this album will be lost.
            </p>
            <div className={s.confirmActions}>
              <Btn variant="soft" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  handleDeleteAlbum(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* drawer */}
      <CreateAlbumDrawer
        open={drawerOpen}
        mode={drawerMode}
        album={selectedAlbum}
        onClose={() => setDrawerOpen(false)}
        onCreated={async (album) => {
          const signed = await getSignedCoverUrl(album.cover_image);

          setDrawerOpen(false);

          // 🔑 Tell dashboard layout a story now exists
          window.dispatchEvent(new Event('dashboard-data-changed'));

          setTimeout(() => {
            setAlbums((prev) => [{ ...album, cover_image: signed }, ...(prev ?? [])]);
          }, 120);

          // 🎉 Celebration stays as-is
          setTimeout(() => {
            setCelebrate(true);
          }, 220);
        }}
        onUpdated={async (album) => {
          const signed = await getSignedCoverUrl(album.cover_image);
          setAlbums((prev) =>
            prev
              ? prev.map((x) => (x.id === album.id ? { ...x, ...album, cover_image: signed } : x))
              : prev
          );
        }}
      />

      <LegacyCelebration
        open={celebrate}
        onClose={() => setCelebrate(false)}
        emoji="🎉"
        message="A new chapter of memories begins."
      />
    </div>
  );
}

function AlbumCover({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 400px"
      quality={75}
      priority={false}
      loading="lazy"
      placeholder="empty"
      className={cx(s.coverImg, loaded ? 'opacity-100' : 'opacity-0')}
      onLoadingComplete={() => setLoaded(true)}
    />
  );
}
