'use client';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Frame, Image as ImageIcon, Plus } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import LegacyCelebration from '@/components/LegacyCelebration';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import { usePlanLimits } from '@/lib/usePlanLimits';
import CreateCanvasDrawer from './_components/CreateCanvasDrawer';
import Image from 'next/image';
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  EmptyState,
  IconTile,
  PageHeader,
  btnClass,
  toneByKey,
  toneFor,
  useDialog,
} from '@/components/dashboard/ui/AppBits';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Memory Canvases are orange in the landing's feature index.
const ORANGE = toneByKey('orange');

// Dates on the card, the British way: "28 Mar 2026".
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

type Canvas = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  tier_key: string;
  tier_name: string;
  canvas_size: string;
  orientation: string;
  layout_type: string;
  filled_slots: number;
  preview_asset_id: string | null;
  preview_url: string | null;
};

/* ── Size labels for the cards ── */
const SIZE_LABELS: Record<string, string> = {
  '16x36': '16×36"',
  '20x32': '20×32"',
  '24x72': '24×72"',
};

export default function CanvasPage() {
  const supabase = getBrowserClient();

  const [canvases, setCanvases] = useState<Canvas[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const [celebrate, setCelebrate] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Escape cancels the delete question, Tab stays inside it.
  const confirmRef = useDialog<HTMLDivElement>(!!confirmDelete, () => setConfirmDelete(null));
  const confirmTitleId = useId();
  const confirmTextId = useId();

  const { loading: limitsLoading, canCreate } = usePlanLimits();

  const line1 = '“Put your memories where they belong: on the wall.”';
  const line2 =
    'Create stunning premium canvases from your most treasured moments.';

  /* ────────────────────────────────────────────
     Load canvases + first-slot preview images
  ──────────────────────────────────────────── */
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    (async () => {
      try {
        const { data: sess, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const user = sess?.session?.user;

        if (!user) {
          setError('You need to sign in.');
          setLoading(false);
          return;
        }

        /* 1: Fetch canvases from the helper view */
        const { data, error } = await supabase
          .from('memory_canvases_with_asset_count')
          .select(
            `
            id,
            title,
            description,
            created_at,
            tier_key,
            tier_name,
            canvas_size,
            orientation,
            layout_type,
            filled_slots
          `
          )
          .order('created_at', { ascending: false });

        if (error) throw error;

        const canvasIds = (data || []).map((c: any) => c.id);

        /* 2: Get the first asset (slot 0) for each canvas as preview */
        let previewMap = new Map<string, string>(); // canvas_id → asset_id

        if (canvasIds.length > 0) {
          const { data: previewRows, error: previewError } = await supabase
            .from('memory_canvas_assets')
            .select('canvas_id, asset_id')
            .in('canvas_id', canvasIds)
            .eq('slot_index', 0);

          if (previewError) throw previewError;

          for (const row of previewRows || []) {
            previewMap.set(row.canvas_id, row.asset_id);
          }
        }

        /* 3: Sign URLs for the preview assets */
        const assetIds = Array.from(new Set(Array.from(previewMap.values())));
        let urlMap = new Map<string, string>(); // asset_id → signed URL

        if (assetIds.length > 0) {
          const { data: mediaRows, error: mediaError } = await supabase
            .from('library_media')
            .select('id, file_path')
            .in('id', assetIds);

          if (mediaError) throw mediaError;

          const signedEntries = await Promise.all(
            (mediaRows || []).map(async (media: any) => {
              const { data: signed } = await supabase.storage
                .from('library-media')
                .createSignedUrl(media.file_path, 60 * 60 * 24 * 30);

              return [
                media.id,
                signed?.signedUrl
                  ? `${signed.signedUrl}&cb=${Date.now()}`
                  : '',
              ] as const;
            })
          );

          urlMap = new Map(signedEntries.filter(([, url]) => Boolean(url)));
        }

        /* 4: Assemble final canvas list */
        const canvasesWithPreviews: Canvas[] = (data || []).map((c: any) => {
          const previewAssetId = previewMap.get(c.id) || null;
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            created_at: c.created_at,
            tier_key: c.tier_key,
            tier_name: c.tier_name,
            canvas_size: c.canvas_size,
            orientation: c.orientation,
            layout_type: c.layout_type,
            filled_slots: c.filled_slots || 0,
            preview_asset_id: previewAssetId,
            preview_url: previewAssetId
              ? urlMap.get(previewAssetId) || null
              : null,
          };
        });

        setCanvases(canvasesWithPreviews);
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load memory canvases.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  /* ── Delete handler ── */
  const handleDeleteCanvas = async (id: string) => {
    try {
      // deleteWithOwnerCheck: a delete blocked by the creator-only policy removes 0 rows with
      // no error; the page used to say "deleted" and hide the card until the next reload.
      const deleted = await deleteWithOwnerCheck(supabase, 'memory_canvases', id, 'memory canvas');
      if (!deleted) return;

      setCanvases((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
      toast.success('Memory canvas deleted.');
    } catch {
      toast.error('Failed to delete memory canvas.');
    }
  };

  const canCreateCanvas =
    (canCreate as any)?.canvas ??
    (canCreate as any)?.memory_canvas ??
    (canCreate as any)?.memoryCanvases ??
    (canCreate as any)?.album ??
    true;

  // The create button (in the header and in the empty state).
  const openCreate = () => {
    if (limitsLoading) return;

    if (!canCreateCanvas) {
      toast.error('You’ve reached your plan limit.');
      return;
    }

    setDrawerMode('create');
    setSelectedCanvas(null);
    setDrawerOpen(true);
  };

  const createButton = (
    <Btn onClick={openCreate} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.6} />}>
      Create New Canvas
    </Btn>
  );

  const list = canvases ?? [];

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        {/* ── Header ── */}
        <PageHeader
          eyebrow="Memory Canvases"
          eyebrowDot="var(--c2)"
          title={
            <>
              My{' '}
              <Accent>
                <span className="md:hidden">Canvases</span>
                <span className="hidden md:inline">Memory Canvases</span>
              </Accent>
            </>
          }
          lead={`${line1} ${line2}`}
          actions={createButton}
        />

        <section className={ui.section} aria-label="Your memory canvases">
          {/* ── Loading / Error / Empty states ── */}
          {loading && <AppLoader label="Loading your canvases" />}

          {!loading && error && (
            <p className={ui.noticeError} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && list.length === 0 && (
            <EmptyState
              Icon={Frame}
              tone={ORANGE}
              title="No memory canvases yet"
              text="Create your first masterpiece."
            >
              {createButton}
            </EmptyState>
          )}

          {/* ── Canvas grid: columns follow the space beside the sidebar, 1 on phones,
                 2 on tablets, 3 on desktops ── */}
          {!loading && !error && list.length > 0 && (
            <div className="@container">
              <ul role="list" className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
                {list.map((c) => {
                  const titleId = `canvas-title-${c.id}`;
                  return (
                    <li key={c.id} className="min-w-0">
                      {/* A white card holding the preview in a solid colour frame (radius 22 inside
                          28, 6px apart, so the corners stay concentric). With its menu open it sits
                          over the cards after it. */}
                      <article
                        aria-labelledby={titleId}
                        className={cx(
                          ui.card,
                          'group flex h-full min-w-0 flex-col rounded-[28px] p-1.5 has-[[aria-expanded=true]]:z-10'
                        )}
                      >
                        <div className={ui.frame} style={{ '--frame': toneFor(c.id).bg } as CSSProperties}>
                          {/* ── Preview image / placeholder ── */}
                          <div className={cx(ui.frameInner, 'aspect-video', !c.preview_url && 'bg-white')}>
                            {c.preview_url ? (
                              <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                                <CanvasPreview src={c.preview_url} />
                              </div>
                            ) : (
                              // No photo yet: the orange tile and its two lines on white. A narrow card
                              // (three columns) gets a smaller tile, so the lines keep room around them.
                              <div className="@container absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                                <IconTile
                                  Icon={ImageIcon}
                                  tone={ORANGE}
                                  className="@max-[300px]:size-10 @max-[300px]:rounded-[13px]"
                                />
                                <p className="mt-3 text-[15px] font-extrabold leading-tight tracking-[-0.01em] @max-[300px]:mt-2">
                                  Design your canvas
                                </p>
                                <p className="mt-1 text-balance text-[13px] font-semibold leading-snug">
                                  Open the canvas to add your photos
                                </p>
                              </div>
                            )}
                          </div>

                          {/* ── Context menu ── */}
                          <div className="absolute right-3.5 top-3.5 z-[2]">
                            <ContextMenuDots
                              editLabel="Edit Canvas"
                              onEdit={() => {
                                setDrawerMode('edit');
                                setSelectedCanvas(c);
                                setDrawerOpen(true);
                              }}
                              onDelete={() =>
                                setConfirmDelete({
                                  id: c.id,
                                  title: c.title || 'Untitled Canvas',
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* ── Card body ── */}
                        <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-4">
                          <h2 id={titleId} className={cx(ui.h3, 'line-clamp-2 text-[20px]')}>
                            {c.title || 'Untitled Canvas'}
                          </h2>

                          <div className="mt-3.5 flex flex-wrap gap-2">
                            <span className={cx(ui.chip, ui.chipSm, 'max-w-full whitespace-normal [overflow-wrap:anywhere]')}>
                              {c.tier_name} &middot;{' '}
                              {SIZE_LABELS[c.canvas_size] || c.canvas_size}
                            </span>
                            <span className={cx(ui.chip, ui.chipSm)}>
                              {c.filled_slots} photo{c.filled_slots !== 1 ? 's' : ''}
                            </span>
                            <span className={cx(ui.chip, ui.chipSm, 'max-w-full whitespace-normal [overflow-wrap:anywhere]')}>
                              {c.orientation.charAt(0).toUpperCase() +
                                c.orientation.slice(1)}
                            </span>
                            <span className={cx(ui.chip, ui.chipSm)}>
                              Created {formatDate(c.created_at)}
                            </span>
                          </div>

                          <div className="mt-auto pt-[18px]">
                            <Link
                              href={`/dashboard/canvas/${c.id}`}
                              aria-describedby={titleId}
                              className={btnClass({ variant: 'soft', block: true })}
                            >
                              Open Canvas
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

      {/* ── Delete confirmation ── */}
      {confirmDelete && (
        <div className={cx(ui.scrim, ui.fadeIn, 'scrim-blur z-[9999] flex items-center justify-center p-4')}>
          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, ui.confirm, ui.popIn)}
          >
            <h2 id={confirmTitleId} className={ui.confirmTitle}>
              Delete &ldquo;{confirmDelete.title}&rdquo;?
            </h2>
            <p id={confirmTextId} className={ui.confirmText}>
              This action cannot be undone.
            </p>
            <div className={ui.confirmActions}>
              <Btn variant="soft" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  handleDeleteCanvas(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit drawer ── */}
      <CreateCanvasDrawer
        open={drawerOpen}
        mode={drawerMode}
        canvas={selectedCanvas as any}
        onClose={() => setDrawerOpen(false)}
        onCreated={(canvas) => {
          setDrawerOpen(false);

          const nextCanvas: Canvas = {
            id: canvas.id,
            title: canvas.title || 'Untitled Canvas',
            description: null,
            created_at: new Date().toISOString(),
            tier_key: canvas.tier_key ?? 'heirloom',
            tier_name: canvas.tier_name ?? 'The Heirloom',
            canvas_size: canvas.canvas_size ?? '20x32',
            orientation: canvas.orientation ?? 'landscape',
            layout_type: canvas.layout_type ?? 'solo',
            filled_slots: 0,
            preview_asset_id: null,
            preview_url: null,
          };

          setCanvases((prev) => [nextCanvas, ...(prev ?? [])]);

          setTimeout(() => setCelebrate(true), 200);
        }}
        onUpdated={(canvas) => {
          setCanvases((prev) =>
            prev
              ? prev.map((x) =>
                  x.id === canvas.id
                    ? {
                        ...x,
                        title: canvas.title || 'Untitled Canvas',
                        tier_key: (canvas.tier_key ?? x.tier_key) as string,
tier_name: (canvas.tier_name ?? x.tier_name) as string,
canvas_size: (canvas.canvas_size ?? x.canvas_size) as string,
orientation: (canvas.orientation ?? x.orientation) as string,
layout_type: (canvas.layout_type ?? x.layout_type) as string,
                      }
                    : x
                )
              : prev
          );
        }}
      />

      {/* ── Celebration animation ── */}
      <LegacyCelebration
        open={celebrate}
        onClose={() => setCelebrate(false)}
        emoji="🖼️"
        message="Your canvas awaits."
      />
    </div>
  );
}

/* ── Preview image component (mirrors BookCover) ── */
function CanvasPreview({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={src}
        alt=""
        fill
        sizes="300px"
        quality={75}
        unoptimized
        loading="lazy"
        className={`object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}
