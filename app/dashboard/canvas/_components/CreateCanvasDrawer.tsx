'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';

/* ────────────────────────────────────────────
   Tiers
   ──────────────────────────────────────────── */

const CANVAS_TIERS = [
  {
    key: 'moment',
    name: 'The Moment',
    size: '16x36',
    sizeLabel: '16×36″',
    price: { GBP: 99.99, USD: 139.99, EUR: 119.99 },
    blurb: 'A cinematic canvas. Perfect above beds, sofas, and hallways.',
  },
  {
    key: 'heirloom',
    name: 'The Heirloom',
    size: '20x32',
    sizeLabel: '20×32″',
    price: { GBP: 129.99, USD: 179.99, EUR: 154.99 },
    blurb: 'A statement piece with gallery energy. Feels like framed art.',
    recommended: true,
  },
  {
    key: 'heritage',
    name: 'The Heritage',
    size: '24x72',
    sizeLabel: '24×72″',
    price: { GBP: 169.99, USD: 229.99, EUR: 199.99 },
    blurb: 'Six feet of family story. The ultra-premium showstopper.',
  },
] as const;

type TierKey = (typeof CANVAS_TIERS)[number]['key'];
type Orientation = 'landscape' | 'portrait';

type MemoryCanvas = {
  id: string;
  title: string | null;
  tier_key: TierKey | null;
  tier_name: string | null;
  canvas_size: string | null;
  orientation: string | null;
  layout_type: string | null;
  price_gbp: number | null;
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */

export default function CreateCanvasDrawer({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode = 'create',
  canvas,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (canvas: MemoryCanvas) => void;
  onUpdated?: (canvas: MemoryCanvas) => void;
  mode?: 'create' | 'edit';
  canvas?: Partial<MemoryCanvas> | null;
}) {
  const supabase = getBrowserClient();

  const [title, setTitle] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierKey>('heirloom');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isSubmittingRef = useRef(false);

  useEffect(() => setMounted(true), []);

  /* ── Reset / hydrate on open ── */
  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && canvas) {
      setTitle(canvas.title || '');
      setSelectedTier(
        (canvas.tier_key as TierKey) || 'heirloom'
      );
      setOrientation(
        (canvas.orientation as Orientation) || 'landscape'
      );
      return;
    }

    setTitle('');
    setSelectedTier('heirloom');
    setOrientation('landscape');
  }, [open, mode, canvas]);

  const activeTier = useMemo(
    () =>
      CANVAS_TIERS.find((t) => t.key === selectedTier) ?? CANVAS_TIERS[1],
    [selectedTier]
  );

  const isEditMode = mode === 'edit';

  const SYMBOL = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  } as const;

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (isSubmittingRef.current || !title.trim()) return;

    isSubmittingRef.current = true;
    setUploading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = session?.user;
      if (!user) throw new Error('Not signed in');

      if (mode === 'edit' && canvas?.id) {
        const { data, error } = await supabase
          .from('memory_canvases')
          .update({
            title: title.trim(),
          })
          .eq('id', canvas.id)
          .eq('user_id', user.id)
          .select(
            `
              id,
              title,
              tier_key,
              tier_name,
              canvas_size,
              orientation,
              layout_type,
              price_gbp
            `
          )
          .single();

        if (error) throw error;

        onUpdated?.(data as MemoryCanvas);
        toast.success('Memory canvas updated!');
      } else {
        const { data: newCanvasId, error: createError } = await supabase.rpc(
          'create_memory_canvas',
          {
            p_user_id: user.id,
            p_title: title.trim(),
            p_tier_key: activeTier.key,
            p_orientation: orientation,
            p_layout_type: 'solo',
            p_description: null,
          }
        );

        if (createError) throw createError;
        if (!newCanvasId) throw new Error('Could not create memory canvas.');

        const { data: createdCanvas, error: fetchError } = await supabase
          .from('memory_canvases')
          .select(
            `
              id,
              title,
              tier_key,
              tier_name,
              canvas_size,
              orientation,
              layout_type,
              price_gbp
            `
          )
          .eq('id', newCanvasId)
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        onCreated?.(createdCanvas as MemoryCanvas);
        toast.success('Memory canvas created!');
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Something went wrong.');
    } finally {
      setUploading(false);
      isSubmittingRef.current = false;
    }
  };

  if (!mounted) return null;

  /* ────────────────────────────────────────────
     Render
     ──────────────────────────────────────────── */

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            background: 'rgba(10, 13, 20, 0.6)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={() => {
            if (!uploading) onClose();
          }}
        >
          {/* ── Loading bar ── */}
          {uploading && (
            <div className="fixed left-0 top-0 h-[3px] w-full overflow-hidden">
              <div
                className="h-full w-full"
                style={{
                  background:
                    'linear-gradient(90deg, #CDA349 0%, #F3D99B 50%, #CDA349 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s linear infinite',
                }}
              />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[1060px] overflow-hidden rounded-3xl grid grid-cols-1 lg:grid-cols-[1fr_320px] max-h-[90vh]"
            style={{
              background: '#FEFCF8',
              border: '1px solid rgba(205, 178, 100, 0.35)',
              boxShadow:
                '0 1px 0 0 rgba(255,255,255,0.6) inset, 0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(205,178,100,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═══════════ LEFT PANEL ═══════════ */}
            <div className="px-6 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-9 overflow-y-auto" data-lenis-prevent>
              {/* Header */}
              <div className="mb-6">
                <h2
                  className="text-[1.85rem] font-bold leading-tight text-[#14213D]"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  {mode === 'edit'
                    ? 'Edit Memory Canvas'
                    : 'Create Memory Canvas'}
                </h2>
                <p className="mt-2.5 text-sm text-[#5A6270]">
                  This will become a real, printed canvas on your wall.
                </p>
                <div
                  className="mt-4 h-[2px] w-12 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #C9A23C, #E2C56A)',
                  }}
                />
              </div>

              {/* Title */}
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F2837]">
                Canvas Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Family Canvas"
                className="h-12 w-full rounded-[14px] border bg-white px-4 text-[15px] text-[#1F2837] outline-none transition placeholder:text-[#9AA0AC] focus:ring-[3px]"
                style={{
                  borderColor: 'rgba(200, 185, 140, 0.45)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C9A23C';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(201, 162, 60, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(200, 185, 140, 0.45)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Currency & Orientation */}
              <div className="mt-5 flex flex-wrap gap-10">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F2837]">
                    Currency
                  </label>
                  <div className="flex items-center gap-2">
                    {(['GBP', 'USD', 'EUR'] as const).map((cur) => {
                      const active = currency === cur;
                      return (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => setCurrency(cur)}
                          className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition"
                          style={{
                            background: active
                              ? 'linear-gradient(135deg, #C9A23C, #E2C56A)'
                              : '#fff',
                            color: active ? '#14213D' : '#5A6270',
                            border: active
                              ? 'none'
                              : '1px solid rgba(200, 185, 140, 0.4)',
                            boxShadow: active
                              ? '0 4px 14px rgba(201,162,60,0.25)'
                              : 'none',
                          }}
                        >
                          {cur}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F2837]">
                    Orientation
                  </label>
                  <div className="flex items-center gap-2">
                    {(['landscape', 'portrait'] as const).map((ori) => {
                      const active = orientation === ori;
                      return (
                        <button
                          key={ori}
                          type="button"
                          onClick={() => {
                            if (isEditMode) return;
                            setOrientation(ori);
                          }}
                          disabled={isEditMode}
                          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold transition"
                          style={{
                            background: active
                              ? 'linear-gradient(135deg, #C9A23C, #E2C56A)'
                              : isEditMode
                              ? '#F3F3F3'
                              : '#fff',
                            color: active ? '#14213D' : '#5A6270',
                            border: active
                              ? 'none'
                              : '1px solid rgba(200, 185, 140, 0.4)',
                            boxShadow: active
                              ? '0 4px 14px rgba(201,162,60,0.25)'
                              : 'none',
                            opacity: isEditMode && !active ? 0.5 : 1,
                            cursor: isEditMode ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <span
                            className="inline-block rounded-[2px] border"
                            style={{
                              width: ori === 'landscape' ? 16 : 9,
                              height: ori === 'landscape' ? 9 : 16,
                              borderColor: active ? '#14213D' : '#B0B5BF',
                              background: active
                                ? 'rgba(20, 33, 61, 0.12)'
                                : 'rgba(0,0,0,0.04)',
                            }}
                          />
                          {ori.charAt(0).toUpperCase() + ori.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tiers */}
              <div className="mt-7">
                <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F2837]">
                  Choose Your Canvas
                </label>

                {isEditMode && (
                  <p className="mb-3 text-[12px] text-[#7A7A7A]">
                    Canvas tier cannot be changed after creation.
                  </p>
                )}

                <div className="space-y-2.5">
                  {CANVAS_TIERS.map((tier) => {
                    const active = selectedTier === tier.key;

                    return (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() => {
                          if (isEditMode) return;
                          setSelectedTier(tier.key);
                        }}
                        disabled={isEditMode}
                        className="flex w-full items-center gap-3.5 rounded-2xl border px-[18px] py-4 text-left transition-all duration-200"
                        style={{
                          borderColor: isEditMode
                            ? 'rgba(210, 210, 210, 0.7)'
                            : active
                            ? '#C9A23C'
                            : 'rgba(210, 195, 155, 0.4)',
                          background: isEditMode
                            ? '#F3F3F3'
                            : active
                            ? 'linear-gradient(180deg, #FFFBF0 0%, #FEFCF8 100%)'
                            : '#fff',
                          boxShadow: isEditMode
                            ? 'none'
                            : active
                            ? '0 8px 24px rgba(201, 162, 60, 0.14)'
                            : 'none',
                          opacity: isEditMode ? 0.7 : 1,
                          cursor: isEditMode ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {/* Radio */}
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                          style={{
                            borderColor: active ? '#C9A23C' : '#CBD2DC',
                            background: active ? '#C9A23C' : 'transparent',
                          }}
                        >
                          {active && (
                            <div className="h-[7px] w-[7px] rounded-full bg-white" />
                          )}
                        </div>

                        {/* Body */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold text-[#14213D]">
                              {tier.name}
                            </span>
                            {'recommended' in tier && tier.recommended && (
                              <span
                                className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8A6B1A]"
                                style={{
                                  background:
                                    'linear-gradient(135deg, #FFF4D6, #FDEAB8)',
                                }}
                              >
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[#5A6270]">
                            {tier.sizeLabel} · 38mm stretcher bar
                          </p>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-[#4A5060]">
                            {tier.blurb}
                          </p>
                        </div>

                        {/* Price */}
                        <span className="shrink-0 text-[15px] font-bold text-[#14213D]">
                          {SYMBOL[currency]}
                          {tier.price[currency].toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div
                className="mt-8 flex flex-col-reverse gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderTop: '1px solid rgba(210, 195, 155, 0.3)',
                }}
              >
                <button
                  onClick={onClose}
                  disabled={uploading}
                  className="h-11 w-full rounded-full border bg-white px-6 text-[13.5px] font-semibold text-[#1F2837] transition hover:bg-[#FBF8F0] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  style={{
                    borderColor: 'rgba(200, 185, 140, 0.5)',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || uploading}
                  className="h-11 w-full rounded-full border-0 px-7 text-[13.5px] font-semibold transition-all disabled:cursor-not-allowed sm:w-auto"
                  style={{
                    background:
                      !title.trim() || uploading
                        ? '#E3E3E3'
                        : 'linear-gradient(135deg, #C9A23C 0%, #DFBF5E 100%)',
                    color:
                      !title.trim() || uploading ? '#999' : '#14213D',
                    boxShadow:
                      !title.trim() || uploading
                        ? 'none'
                        : '0 6px 20px rgba(201, 162, 60, 0.25)',
                  }}
                >
                  {uploading
                    ? 'Saving…'
                    : mode === 'edit'
                    ? 'Save Changes'
                    : `Create ${activeTier.name}`}
                </button>
              </div>
            </div>

            {/* ═══════════ RIGHT PANEL ═══════════ */}
            <div
              className="flex flex-col justify-between border-t border-[rgba(210,195,155,0.3)] p-5 sm:p-6 lg:border-l lg:border-t-0 overflow-y-auto" data-lenis-prevent
              style={{
                background:
                  'linear-gradient(180deg, #FAF6ED 0%, #F6F1E4 100%)',
              }}
            >
              {/* Canvas preview shape */}
              <div>
                <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#4A5060]">
                  Canvas Preview
                </p>

                <div
                  className="flex items-center justify-center rounded-2xl border-[1.5px] border-dashed p-5"
                  style={{
                    borderColor: 'rgba(200, 178, 110, 0.55)',
                    background: 'rgba(255, 255, 255, 0.7)',
                    minHeight: 90,
                  }}
                >
                  {/* Proportional canvas shape */}
                  <div
                    className="rounded-[3px] border-2 transition-all duration-300"
                    style={{
                      borderColor: '#C9A23C',
                      background:
                        'linear-gradient(135deg, rgba(201,162,60,0.06), rgba(201,162,60,0.12))',
                      ...(orientation === 'landscape'
                        ? {
                            width:
                              activeTier.key === 'heritage'
                                ? 200
                                : activeTier.key === 'heirloom'
                                ? 160
                                : 180,
                            height:
                              activeTier.key === 'heritage'
                                ? 67
                                : activeTier.key === 'heirloom'
                                ? 100
                                : 80,
                          }
                        : {
                            width:
                              activeTier.key === 'heritage'
                                ? 67
                                : activeTier.key === 'heirloom'
                                ? 100
                                : 80,
                            height:
                              activeTier.key === 'heritage'
                                ? 200
                                : activeTier.key === 'heirloom'
                                ? 160
                                : 180,
                          }),
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <p className="text-[10px] font-semibold text-[#C9A23C] opacity-60">
                        {activeTier.sizeLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-center text-[11.5px] leading-relaxed text-[#5A6270]">
                  You&apos;ll choose your layout and add photos in the next
                  step.
                </p>
              </div>

              {/* Summary */}
              <div
                className="pt-6"
                style={{
                  borderTop: '1px solid rgba(200, 178, 110, 0.25)',
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7A6520]">
                  Your Selection
                </p>
                <p
                  className="mt-1 text-2xl font-bold text-[#14213D]"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {activeTier.name}
                </p>
                <p className="mt-1 text-[12.5px] text-[#5A6270]">
                  {activeTier.sizeLabel} ·{' '}
                  {orientation.charAt(0).toUpperCase() + orientation.slice(1)} ·
                  38mm
                </p>

                <div className="mt-5 flex items-end justify-between">
                  <p
                    className="text-[2rem] font-bold leading-none text-[#14213D]"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {SYMBOL[currency]}
                    {activeTier.price[currency].toFixed(2)}
                  </p>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7A6520]">
                      Tier
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#14213D]">
                      {activeTier.key === 'moment'
                        ? 'Cinematic'
                        : activeTier.key === 'heirloom'
                        ? 'Most Popular'
                        : 'Ultra-Premium'}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 pl-4 text-xs leading-relaxed text-[#7A6520] list-disc">
                  <li>38mm premium stretcher bar</li>
                  <li>400gsm gallery-grade canvas</li>
                  <li>Imagewrap finish</li>
                  <li className="font-semibold text-[#14213D]">
                    Free worldwide shipping
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}