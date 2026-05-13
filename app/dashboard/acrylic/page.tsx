'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { motion } from 'framer-motion';
import LegacyCelebration from '@/components/LegacyCelebration';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import { usePlanLimits } from '@/lib/usePlanLimits';
import CreateAcrylicDrawer from './_components/CreateAcrylicDrawer';
import Image from 'next/image';

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

  const { loading: limitsLoading, canCreate } = usePlanLimits();

  const line1 = '"Crystal-clear memories that last a lifetime."';
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
          .eq('user_id', user.id)
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
      const { error } = await supabase
        .from('acrylic_prints')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

  return (
    <>
      <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
        <div className="relative z-10 pl-8 pr-6 sm:pl-14 sm:pr-12 lg:pl-20 lg:pr-32 pt-20 pb-16 max-w-[1700px] mx-auto">
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
                  <span className="md:hidden">Acrylics</span>
                  <span className="hidden md:inline">Acrylic Prints</span>
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

                  if (!canCreatePrint) {
                    toast.error('You\u2019ve reached your plan limit.');
                    return;
                  }

                  setDrawerMode('create');
                  setSelectedPrint(null);
                  setDrawerOpen(true);
                }}
              >
                <span className="relative z-10">+ Create New Acrylic</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
              </button>
            </div>
          </div>

          {loading && (
            <p className="text-center italic">Loading your acrylic prints...</p>
          )}
          {!loading && error && (
            <p className="text-center text-red-500">{error}</p>
          )}
          {!loading && !error && (prints ?? []).length === 0 && (
            <div className="text-center italic mt-12">
              No acrylic prints yet. Create your first gallery piece.
            </div>
          )}

          {!loading && !error && (prints ?? []).length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,280px))] gap-8">
              {(prints ?? []).map((p) => (
                <div
                  key={p.id}
                  className="relative rounded-3xl border border-[#B7932F]/60 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/95 flex flex-col"
                >
                  <div className="aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden group">
                    {p.preview_url ? (
                      <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105 bg-[#E6C26E]/10">
                        <AcrylicPreview src={p.preview_url} />
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
                          Design your acrylic
                        </p>
                        <p className="text-[11px] leading-relaxed text-[#5A6270]">
                          Open to add your photo
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 z-20">
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

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-[#222B3A] mb-2 line-clamp-1">
                      {p.title || 'Untitled Acrylic'}
                    </h3>

                    <p className="text-sm text-[#5B6473] mb-1">
                      {p.tier_name} &middot;{' '}
                      {SIZE_LABELS[p.acrylic_size] || p.acrylic_size}
                    </p>

                    <p className="text-sm text-[#5B6473] mb-3">
                      {p.filled_slots} photo{p.filled_slots !== 1 ? 's' : ''}{' '}
                      &middot;{' '}
                      {p.orientation === 'square'
                        ? 'Square'
                        : p.orientation.charAt(0).toUpperCase() +
                          p.orientation.slice(1)}
                    </p>

                    <p className="text-xs text-[#7A8596] mb-4">
                      Created{' '}
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>

                    <Link
                      href={`/dashboard/acrylic/${p.id}`}
                      className="mt-auto block text-center font-semibold px-4 py-3 rounded-full text-[#1F2837] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]"
                    >
                      Open Acrylic &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                    handleDeletePrint(confirmDelete.id);
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </button>
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

function AcrylicPreview({ src }: { src: string }) {
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