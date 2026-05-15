'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { motion } from 'framer-motion';
import LegacyCelebration from '@/components/LegacyCelebration';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import { usePlanLimits } from '@/lib/usePlanLimits';
import CreateCanvasDrawer from './_components/CreateCanvasDrawer';
import Image from 'next/image';

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

  const { loading: limitsLoading, canCreate } = usePlanLimits();

  const line1 = '"Put your memories where they belong — on the wall."';
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

        /* 1 — Fetch canvases from the helper view */
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

        /* 2 — Get the first asset (slot 0) for each canvas as preview */
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

        /* 3 — Sign URLs for the preview assets */
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

        /* 4 — Assemble final canvas list */
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
      const { error } = await supabase
        .from('memory_canvases')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

  return (
    <>
      <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
        <div className="relative z-10 pl-8 pr-6 sm:pl-14 sm:pr-12 lg:pl-20 lg:pr-32 pt-20 pb-16 max-w-[1700px] mx-auto">
          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-start gap-6 mb-14">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-[#222B3A] mb-4 relative inline-block whitespace-nowrap">
                <span className="relative">
                  My
                  <motion.span
                    className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: 70 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.8,
                      ease: 'easeOut',
                    }}
                  />
                </span>{' '}
                <span className="text-[#C8A557]">
                  <span className="md:hidden">Canvases</span>
                  <span className="hidden md:inline">Memory Canvases</span>
                </span>
              </h1>

              <p className="text-[#000000] mt-3 text-lg italic">{line1}</p>
              <p className="text-[#000000] text-sm mt-2">{line2}</p>
            </div>

            <div className="flex justify-center md:justify-end flex-1">
              <button
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] relative overflow-hidden"
                onClick={() => {
                  if (limitsLoading) return;

                  if (!canCreateCanvas) {
                    toast.error('You\u2019ve reached your plan limit.');
                    return;
                  }

                  setDrawerMode('create');
                  setSelectedCanvas(null);
                  setDrawerOpen(true);
                }}
              >
                <span className="relative z-10">+ Create New Canvas</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
              </button>
            </div>
          </div>

          {/* ── Loading / Error / Empty states ── */}
          {loading && (
            <p className="text-center italic">Loading your canvases...</p>
          )}
          {!loading && error && (
            <p className="text-center text-red-500">{error}</p>
          )}
          {!loading && !error && (canvases ?? []).length === 0 && (
            <div className="text-center italic mt-12">
              No memory canvases yet. Create your first masterpiece.
            </div>
          )}

          {/* ── Canvas grid ── */}
          {!loading && !error && (canvases ?? []).length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,280px))] gap-8">
              {(canvases ?? []).map((c) => (
                <div
                  key={c.id}
                  className="relative rounded-3xl border border-[#B7932F]/60 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/95 flex flex-col"
                >
                  {/* ── Preview image / placeholder ── */}
                  <div className="aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden group">
                    {c.preview_url ? (
                      <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105 bg-[#E6C26E]/10">
                        <CanvasPreview src={c.preview_url} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center bg-gradient-to-b from-[#FBF8F0] to-[#F5EFD9]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFF4D8]">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#B4881F"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                        <p className="text-[12px] font-semibold text-[#14213D]">
                          Design your canvas
                        </p>
                        <p className="text-[11px] leading-relaxed text-[#5A6270]">
                          Open the canvas to add your photos
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Context menu ── */}
                  <div className="absolute top-3 right-3 z-20">
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

                  {/* ── Card body ── */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-[#222B3A] mb-2 line-clamp-1">
                      {c.title || 'Untitled Canvas'}
                    </h3>

                    <p className="text-sm text-[#5B6473] mb-1">
                      {c.tier_name} &middot;{' '}
                      {SIZE_LABELS[c.canvas_size] || c.canvas_size}
                    </p>

                    <p className="text-sm text-[#5B6473] mb-3">
                      {c.filled_slots} photo{c.filled_slots !== 1 ? 's' : ''}{' '}
                      &middot;{' '}
                      {c.orientation.charAt(0).toUpperCase() +
                        c.orientation.slice(1)}
                    </p>

                    <p className="text-xs text-[#7A8596] mb-4">
                      Created{' '}
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>

                    <Link
                      href={`/dashboard/canvas/${c.id}`}
                      className="mt-auto block text-center font-semibold px-4 py-3 rounded-full text-[#1F2837] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]"
                    >
                      Open Canvas &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Delete confirmation modal ── */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center">
              <h3 className="text-lg font-semibold text-[#1F2837] mb-3">
                Delete &ldquo;{confirmDelete.title}&rdquo;?
              </h3>
              <p className="text-sm text-[#5B6473] mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837]"
                  onClick={() => {
                    handleDeleteCanvas(confirmDelete.id);
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </button>
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
    </>
  );
}

/* ── Preview image component (mirrors BookCover) ── */
function CanvasPreview({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full bg-[#E6C26E]/10 overflow-hidden">
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