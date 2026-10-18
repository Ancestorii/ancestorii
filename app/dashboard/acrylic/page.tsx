'use client';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Gem, Image as ImageIcon, Plus } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import LegacyCelebration from '@/components/LegacyCelebration';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import { usePlanLimits } from '@/lib/usePlanLimits';
import CreateAcrylicDrawer from './_components/CreateAcrylicDrawer';
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

// Acrylic Prints are orange in the landing's feature index.
const ORANGE = toneByKey('orange');

// Dates on the card, the British way: "28 Mar 2026".
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

type AcrylicPrint = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  tier_key: string;
  tier_name: string;
  acrylic_size: string;
  orientation: string;
  layout_type: string;
  filled_slots: number;
  preview_asset_id: string | null;
  preview_url: string | null;
};

const SIZE_LABELS: Record<string, string> = {
  '16x24': '16×24″',
  '24x24': '24×24″',
  '24x36': '24×36″',
};

export default function AcrylicPage() {
  const supabase = getBrowserClient();

  const [prints, setPrints] = useState<AcrylicPrint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const [celebrate, setCelebrate] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedPrint, setSelectedPrint] = useState<AcrylicPrint | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Escape cancels the delete question, Tab stays inside it.
  const confirmRef = useDialog<HTMLDivElement>(!!confirmDelete, () => setConfirmDelete(null));
  const confirmTitleId = useId();
  const confirmTextId = useId();

  const { loading: limitsLoading, canCreate } = usePlanLimits();

  const line1 = '“Crystal-clear memories that last a lifetime.”';
  const line2 =
    'Create gallery-grade acrylic prints from your most treasured photos.';

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

        const { data, error } = await supabase
          .from('acrylic_prints_with_asset_count')
          .select(
            `
            id,
            title,
            description,
            created_at,
            tier_key,
            tier_name,
            acrylic_size,
            orientation,
            layout_type,
            filled_slots
          `
          )
          .order('created_at', { ascending: false });

        if (error) throw error;

        const printIds = (data || []).map((p: any) => p.id);

        let previewMap = new Map<string, string>();

        if (printIds.length > 0) {
          const { data: previewRows, error: previewError } = await supabase
            .from('acrylic_print_assets')
            .select('acrylic_id, asset_id')
            .in('acrylic_id', printIds)
            .eq('slot_index', 0);

          if (previewError) throw previewError;

          for (const row of previewRows || []) {
            previewMap.set(row.acrylic_id, row.asset_id);
          }
        }

        const assetIds = Array.from(new Set(Array.from(previewMap.values())));
        let urlMap = new Map<string, string>();

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

        const printsWithPreviews: AcrylicPrint[] = (data || []).map(
          (p: any) => {
            const previewAssetId = previewMap.get(p.id) || null;
            return {
              id: p.id,
              title: p.title,
              description: p.description,
              created_at: p.created_at,
              tier_key: p.tier_key,
              tier_name: p.tier_name,
              acrylic_size: p.acrylic_size,
              orientation: p.orientation,
              layout_type: p.layout_type,
              filled_slots: p.filled_slots || 0,
              preview_asset_id: previewAssetId,
              preview_url: previewAssetId
                ? urlMap.get(previewAssetId) || null
                : null,
            };
          }
        );

        setPrints(printsWithPreviews);
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load acrylic prints.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleDeletePrint = async (id: string) => {
    try {
      // deleteWithOwnerCheck: a delete blocked by the creator-only policy removes 0 rows with
      // no error; the page used to say "deleted" and hide the card until the next reload.
      const deleted = await deleteWithOwnerCheck(supabase, 'acrylic_prints', id, 'acrylic print');
      if (!deleted) return;

      setPrints((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
      toast.success('Acrylic print deleted.');
    } catch {
      toast.error('Failed to delete acrylic print.');
    }
  };

  const canCreatePrint =
    (canCreate as any)?.acrylic ??
    (canCreate as any)?.acrylic_print ??
    (canCreate as any)?.album ??
    true;

  // The create button (in the header and in the empty state).
  const openCreate = () => {
    if (limitsLoading) return;

    if (!canCreatePrint) {
      toast.error('You’ve reached your plan limit.');
      return;
    }

    setDrawerMode('create');
    setSelectedPrint(null);
    setDrawerOpen(true);
  };

  const createButton = (
    <Btn onClick={openCreate} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.6} />}>
      Create New Acrylic
    </Btn>
  );

  const list = prints ?? [];

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <PageHeader
          eyebrow="Acrylic Prints"
          eyebrowDot="var(--c2)"
          title={
            <>
              My{' '}
              <Accent>
                <span className="md:hidden">Acrylics</span>
                <span className="hidden md:inline">Acrylic Prints</span>
              </Accent>
            </>
          }
          lead={`${line1} ${line2}`}
          actions={createButton}
        />

        <section className={ui.section} aria-label="Your acrylic prints">
          {loading && <AppLoader label="Loading your acrylic prints" />}

          {!loading && error && (
            <p className={ui.noticeError} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && list.length === 0 && (
            <EmptyState
              Icon={Gem}
              tone={ORANGE}
              title="No acrylic prints yet"
              text="Create your first gallery piece."
            >
              {createButton}
            </EmptyState>
          )}

          {/* Columns follow the space beside the sidebar: 1 on phones, 2 on tablets, 3 on desktops */}
          {!loading && !error && list.length > 0 && (
            <div className="@container">
              <ul role="list" className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
                {list.map((p) => {
                  const titleId = `acrylic-title-${p.id}`;
                  return (
                    <li key={p.id} className="min-w-0">
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
                        <div className={ui.frame} style={{ '--frame': toneFor(p.id).bg } as CSSProperties}>
                          <div className={cx(ui.frameInner, 'aspect-video', !p.preview_url && 'bg-white')}>
                            {p.preview_url ? (
                              <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                                <AcrylicPreview src={p.preview_url} />
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
                                  Design your acrylic
                                </p>
                                <p className="mt-1 text-balance text-[13px] font-semibold leading-snug">
                                  Open to add your photo
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="absolute right-3.5 top-3.5 z-[2]">
                            <ContextMenuDots
                              editLabel="Edit Acrylic"
                              onEdit={() => {
                                setDrawerMode('edit');
                                setSelectedPrint(p);
                                setDrawerOpen(true);
                              }}
                              onDelete={() =>
                                setConfirmDelete({
                                  id: p.id,
                                  title: p.title || 'Untitled Acrylic',
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-4">
                          <h2 id={titleId} className={cx(ui.h3, 'line-clamp-2 text-[20px]')}>
                            {p.title || 'Untitled Acrylic'}
                          </h2>

                          <div className="mt-3.5 flex flex-wrap gap-2">
                            <span className={cx(ui.chip, ui.chipSm, 'max-w-full whitespace-normal [overflow-wrap:anywhere]')}>
                              {p.tier_name} &middot;{' '}
                              {SIZE_LABELS[p.acrylic_size] || p.acrylic_size}
                            </span>
                            <span className={cx(ui.chip, ui.chipSm)}>
                              {p.filled_slots} photo{p.filled_slots !== 1 ? 's' : ''}
                            </span>
                            <span className={cx(ui.chip, ui.chipSm, 'max-w-full whitespace-normal [overflow-wrap:anywhere]')}>
                              {p.orientation === 'square'
                                ? 'Square'
                                : p.orientation.charAt(0).toUpperCase() +
                                  p.orientation.slice(1)}
                            </span>
                            <span className={cx(ui.chip, ui.chipSm)}>
                              Created {formatDate(p.created_at)}
                            </span>
                          </div>

                          <div className="mt-auto pt-[18px]">
                            <Link
                              href={`/dashboard/acrylic/${p.id}`}
                              aria-describedby={titleId}
                              className={btnClass({ variant: 'soft', block: true })}
                            >
                              Open Acrylic
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

      {/* delete confirmation */}
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
                  handleDeletePrint(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Btn>
            </div>
          </div>
        </div>
      )}

      <CreateAcrylicDrawer
        open={drawerOpen}
        mode={drawerMode}
        acrylic={selectedPrint as any}
        onClose={() => setDrawerOpen(false)}
        onCreated={(acrylic: any) => {
          setDrawerOpen(false);

          const nextPrint: AcrylicPrint = {
            id: acrylic.id,
            title: acrylic.title || 'Untitled Acrylic',
            description: null,
            created_at: new Date().toISOString(),
            tier_key: acrylic.tier_key ?? 'centrepiece',
            tier_name: acrylic.tier_name ?? 'The Centrepiece',
            acrylic_size: acrylic.acrylic_size ?? '24x24',
            orientation: acrylic.orientation ?? 'square',
            layout_type: acrylic.layout_type ?? 'solo',
            filled_slots: 0,
            preview_asset_id: null,
            preview_url: null,
          };

          setPrints((prev) => [nextPrint, ...(prev ?? [])]);
          setTimeout(() => setCelebrate(true), 200);
        }}
        onUpdated={(acrylic: any) => {
          setPrints((prev) =>
            prev
              ? prev.map((x) =>
                  x.id === acrylic.id
                    ? {
                        ...x,
                        title: acrylic.title || 'Untitled Acrylic',
                        tier_key: (acrylic.tier_key ?? x.tier_key) as string,
                        tier_name: (acrylic.tier_name ?? x.tier_name) as string,
                        acrylic_size: (acrylic.acrylic_size ?? x.acrylic_size) as string,
                        orientation: (acrylic.orientation ?? x.orientation) as string,
                        layout_type: (acrylic.layout_type ?? x.layout_type) as string,
                      }
                    : x
                )
              : prev
          );
        }}
      />

      <LegacyCelebration
        open={celebrate}
        onClose={() => setCelebrate(false)}
        emoji="💎"
        message="Your gallery piece awaits."
      />
    </div>
  );
}

function AcrylicPreview({ src }: { src: string }) {
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
