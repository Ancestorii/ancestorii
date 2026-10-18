'use client';


import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import { ArrowRight, Calendar, Plus } from 'lucide-react';
import { safeToast as toast } from '@/lib/safeToast';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import CreateTimelineDrawer from './_components/CreateTimelineDrawer';
import LegacyCelebration from '@/components/LegacyCelebration';
import { usePlanLimits } from '@/lib/usePlanLimits';
import Image from "next/image";
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  EmptyState,
  IconTile,
  PageHeader,
  btnClass,
  tone,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import s from './_components/timelineList.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Timelines are aqua in the landing's feature index.
const AQUA = toneByKey('aqua');


type Timeline = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at?: string;
  cover_path: string | null;
  cover_signed?: string | null;
};


export default function TimelinePage() {
  const supabase = getBrowserClient();
  const [timelines, setTimelines] = useState<Timeline[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string; cover_path: string | null } | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const { loading: limitsLoading, canCreate, limits, counts } = usePlanLimits();

  // Escape cancels the delete question, Tab stays inside it.
  const confirmRef = useDialog<HTMLDivElement>(!!confirmDelete, () => setConfirmDelete(null));
  const confirmTitleId = useId();
  const confirmTextId = useId();

  // The header's lead
  const line1 = '“Every life is made of moments worth remembering.”';
  const line2 = 'Create a timeline to tell your story in the order it happened.';

  // The plan-limit message (the create button also shows it as a toast).
  const limitMessage = `You’ve reached your current plan limit for timelines (${counts?.timelines} / ${limits?.max_timelines}). Upgrade your plan to create more.`;


  // Signed cover URLs, all in one call. No cache buster: a new cover gets a new path, so the
  // browser can keep these cached (the buster re-downloaded every cover on every visit).
  const signCoverUrls = async (paths: string[]): Promise<Map<string, string>> => {
    const map = new Map<string, string>();
    if (!paths.length) return map;
    const { data, error } = await supabase.storage
      .from('timeline-media')
      .createSignedUrls(paths, 60 * 60 * 24 * 7);
    if (error || !data) return map;
    data.forEach((row, i) => {
      if (row?.signedUrl) map.set(row.path ?? paths[i], row.signedUrl);
    });
    return map;
  };

  const getSignedCoverUrl = async (path: string | null): Promise<string | null> => {
    if (!path) return null;
    const map = await signCoverUrls([path]);
    return map.get(path) ?? null;
  };

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session?.user) {
          setError('You need to sign in to view your timelines.');
          setLoading(false);
          return;
        }
         const { data, error } = await supabase
         .from('timelines')
         .select('id, title, description, created_at, cover_path')
         .order('created_at', { ascending: false });

         if (error) throw error;

         const rows = data ?? [];
         const covers = await signCoverUrls(
           rows.map((t) => t.cover_path).filter((p): p is string => !!p)
         );
         setTimelines(
           rows.map((t) => ({
             ...t,
             cover_signed: t.cover_path ? covers.get(t.cover_path) ?? null : null,
           }))
         );



      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load timelines.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleDeleteTimeline = async (id: string, coverPath: string | null) => {
  try {
    // The confirm promises the timeline is only deleted when it is empty, but the database
    // cascades its memories away (and leaves their photos in storage): check first.
    const { count, error: countErr } = await supabase
      .from('timeline_events')
      .select('id', { count: 'exact', head: true })
      .eq('timeline_id', id);
    if (countErr) throw countErr;
    if ((count ?? 0) > 0) {
      toast.error('Remove all memories from this timeline before deleting it.');
      return;
    }

    const deleted = await deleteWithOwnerCheck(supabase, 'timelines', id, 'timeline');
    if (!deleted) return;

    setTimelines((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    // The sidebar's count
    window.dispatchEvent(new Event('dashboard-data-changed'));

    toast.success('Timeline deleted.');

    // The cover file belongs to this row: remove it with it (best effort).
    if (coverPath) {
      void supabase.storage.from('timeline-media').remove([coverPath]);
    }

  } catch (err: any) {

    // Supabase FK restriction usually triggers here
    if (err?.code === '23503') {
      toast.error('Remove all memories from this timeline before deleting it.');
      return;
    }

    toast.error('Unable to delete timeline.');

  }
};

  // The create button (in the header and in the empty state).
  const openCreate = () => {
  if (limitsLoading) return;
  if (!canCreate.timeline) {
    toast.error(limitMessage);
    return;
  }
  setDrawerMode('create');
  setSelectedTimeline(null);
  setDrawerOpen(true);
};

  const createButton = (
    <Btn onClick={openCreate} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.6} />}>
      Create New Timeline
    </Btn>
  );

  const list = timelines ?? [];

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <PageHeader
          eyebrow="Timelines"
          eyebrowDot="var(--c3)"
          title={
            <>
              My <Accent>Timelines</Accent>
            </>
          }
          lead={`${line1} ${line2}`}
          actions={createButton}
        />

        {!limitsLoading && !canCreate.timeline && (
          <p className={cx(ui.noticeWarn, 'mt-8')} role="status">
            {limitMessage}
          </p>
        )}

        <section className={ui.section} aria-label="Your timelines">
          {/* states */}
          {loading && <AppLoader label="Loading your timelines" />}

          {!loading && error && (
            <p className={ui.noticeError} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && list.length === 0 && (
            <EmptyState
              Icon={Calendar}
              tone={AQUA}
              title="No timelines yet"
              text="Start creating your legacy."
            >
              {createButton}
            </EmptyState>
          )}

          {/* cards: columns follow the space beside the sidebar, 1 on phones, 2 on tablets, 3 on desktops */}
          {!loading && !error && list.length > 0 && (
            <div className="@container">
              <ul role="list" className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
                {list.map((t, i) => {
                  const titleId = `timeline-title-${t.id}`;
                  return (
                    <li key={t.id} className="min-w-0">
                      <article className={cx(ui.card, s.card)} aria-labelledby={titleId}>
                        <div
                          className={ui.frame}
                          style={{ '--frame': tone(i).bg } as CSSProperties}
                        >
                          <div className={cx(ui.frameInner, s.cover, !t.cover_signed && s.coverEmpty)}>
                            {t.cover_signed ? (
                              <TimelineCover src={t.cover_signed} alt={t.title || 'Timeline cover'} />
                            ) : (
                              <div className={s.noCover}>
                                <IconTile Icon={Calendar} tone={AQUA} size="lg" />
                                No cover image
                              </div>
                            )}
                          </div>

                          <div className={s.menu}>
                            <ContextMenuDots
                              editLabel="Edit Timeline"
                              onEdit={() => {
                                setDrawerMode('edit');
                                setSelectedTimeline(t);
                                setDrawerOpen(true);
                              }}
                              onDelete={() =>
                                setConfirmDelete({
                                  id: t.id,
                                  title: t.title || 'Untitled Timeline',
                                  cover_path: t.cover_path,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className={s.body}>
                          <h2 id={titleId} className={s.title}>
                            {t.title || 'Untitled Timeline'}
                          </h2>
                          <p className={s.text}>{t.description || 'Your personal life timeline'}</p>
                          <div className={s.meta}>
                            <span className={cx(ui.chip, ui.chipSm)}>
                              Created{' '}
                              {new Date(t.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className={s.open}>
                            <Link
                              href={`/dashboard/timeline/${t.id}`}
                              aria-describedby={titleId}
                              className={btnClass({ variant: 'soft', block: true })}
                            >
                              View Timeline
                              <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Drawer */}
      <CreateTimelineDrawer
        open={drawerOpen}
        mode={drawerMode}
        timeline={selectedTimeline}
        limitReached={!limitsLoading && !canCreate.timeline}
        limitMessage={limitMessage}
        onClose={() => setDrawerOpen(false)}
        onCreated={async (tl: Timeline) => {
  const signed = await getSignedCoverUrl(tl.cover_path);

  // 🔑 Tell dashboard layout that a story now exists
  window.dispatchEvent(new Event('dashboard-data-changed'));

  setTimelines((prev) => {
    const safe = prev ?? [];
    const newItem: Timeline = {
      id: tl.id,
      title: tl.title,
      description: tl.description ?? null,
      created_at: tl.created_at ?? new Date().toISOString(),
      cover_path: tl.cover_path ?? null,
      cover_signed: signed,
    };
    return [newItem, ...safe];
  });

  // 🎉 Timeline celebration
  setTimeout(() => {
    setCelebrate(true);
  }, 220);
}}


        onUpdated={async (tl: Timeline) => {
          const signed = await getSignedCoverUrl(tl.cover_path);
          setTimelines((prev) =>
          prev
           ? prev.map((x) =>
            x.id === tl.id
            ? {
              ...x,
              title: tl.title,
              description: tl.description ?? null,
              cover_path: tl.cover_path ?? null,
              cover_signed: signed,
            }
          : x
      )
    : prev
);

        }}
      />

      {/* delete confirmation */}
      {confirmDelete && (
        <div className={cx(ui.scrim, s.fadeIn, 'scrim-blur z-[9999] flex items-center justify-center p-4')}>
          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, s.confirm, s.popIn)}
          >
            <h2 id={confirmTitleId} className={s.confirmTitle}>
              Delete “{confirmDelete.title}”?
            </h2>
            <p id={confirmTextId} className={s.confirmText}>
              This action cannot be undone. This timeline can only be deleted if it is empty.
              Make sure you have removed all memories inside it first.
            </p>
            <div className={s.confirmActions}>
              <Btn variant="soft" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  handleDeleteTimeline(confirmDelete.id, confirmDelete.cover_path);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Btn>
            </div>
          </div>
        </div>
      )}
<LegacyCelebration
  open={celebrate}
  onClose={() => setCelebrate(false)}
  emoji="✨"
  message="A new timeline begins."
/>

    </div>
  );
}
function TimelineCover({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Image
      key={src} // forces remount when signed url changes
      src={src}
      alt={alt}
      width={1600}
      height={900}
      quality={90}
      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 480px"
      className={cx(s.coverImg, loaded ? 'opacity-100' : 'opacity-0')}
      onLoad={() => setLoaded(true)}
    />
  );
}
