'use client';

import { useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, TriangleAlert, X } from 'lucide-react';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ui, Btn, IconBtn, Spinner, Tag, useDialog, jsMotion } from '@/components/dashboard/ui/AppBits';
import s from './CreateCanvasDrawer.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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

  const isSubmittingRef = useRef(false);

  const headingId = useId();
  const subId = useId();
  const titleFieldId = useId();
  const currencyLabelId = useId();
  const orientationLabelId = useId();
  const tierLabelId = useId();
  const tierHintId = useId();

  /* ── Reset / hydrate on open ── */
  // The fields follow the canvas as the drawer opens. Set during render (not in an effect after
  // it), so the first frame never shows the previous canvas's title or tier.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? `${mode}:${canvas?.id ?? 'new'}` : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      if (mode === 'edit' && canvas) {
        setTitle(canvas.title || '');
        setSelectedTier((canvas.tier_key as TierKey) || 'heirloom');
        setOrientation((canvas.orientation as Orientation) || 'landscape');
      } else {
        setTitle('');
        setSelectedTier('heirloom');
        setOrientation('landscape');
      }
    }
  }

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
          .maybeSingle();

        if (error) throw error;
        // Row security blocks an update silently (no row comes back) rather than erroring.
        if (!data) throw new Error('This canvas could not be updated.');

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
          .maybeSingle();

        if (fetchError) throw fetchError;

        // The canvas exists even if it cannot be read back yet; the list gets what we know.
        onCreated?.(
          (createdCanvas as MemoryCanvas | null) ?? {
            id: newCanvasId as string,
            title: title.trim(),
            tier_key: activeTier.key,
            tier_name: activeTier.name,
            canvas_size: activeTier.size,
            orientation,
            layout_type: 'solo',
            price_gbp: activeTier.price.GBP,
          }
        );
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

  // Closing waits while it saves (the backdrop and Cancel already did). Escape closes it,
  // Tab stays inside, and focus goes back to the button that opened it.
  const requestClose = () => {
    if (!uploading) onClose();
  };
  const panelRef = useDialog<HTMLDivElement>(open, requestClose);

  /* ────────────────────────────────────────────
     Render
     ──────────────────────────────────────────── */

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...jsMotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          // A bottom sheet on phones, a centred dialog from 640px. scrim-blur (globals.css) blurs
          // only with a mouse. Above the floating phone nav (z-[200]).
          className={cx(ui.scrim, s.scrim, 'scrim-blur z-[9999] flex items-end justify-center sm:items-center sm:p-6')}
          onClick={requestClose}
        >
          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
            {...jsMotion}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-describedby={subId}
            aria-busy={uploading || undefined}
            initial={{ opacity: 0, transform: 'translateY(30px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(30px) scale(0.97)' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cx(ui.sheet, ui.sheetBottom, s.panel)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className={ui.sheetHeader}>
              <div className="flex min-w-0 flex-col items-start gap-2.5">
                <Tag dot="var(--c2)">Memory Canvas</Tag>
                <div className="min-w-0">
                  <h2 id={headingId} className={ui.sheetTitle}>
                    {mode === 'edit'
                      ? 'Edit Memory Canvas'
                      : 'Create Memory Canvas'}
                  </h2>
                  <p id={subId} className={ui.sheetSub}>
                    This will become a real, printed canvas on your wall.
                  </p>
                </div>
              </div>
              <IconBtn label="Close" onClick={requestClose} disabled={uploading}>
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            {/* ── Body ── */}
            <div className={cx(ui.sheetBody, s.body)} data-lenis-prevent>
              {/* Title */}
              <div className={ui.field}>
                <label htmlFor={titleFieldId} className={ui.label}>
                  Canvas Title
                </label>
                <input
                  id={titleFieldId}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Family Canvas"
                  className={ui.input}
                />
              </div>

              {/* Currency & Orientation */}
              <div className={s.pickers}>
                <div className="min-w-0">
                  <p id={currencyLabelId} className={ui.label}>
                    Currency
                  </p>
                  <div
                    className={cx(ui.tabs, ui.tabsBlock, s.tabs)}
                    role="group"
                    aria-labelledby={currencyLabelId}
                  >
                    {(['GBP', 'USD', 'EUR'] as const).map((cur) => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setCurrency(cur)}
                        aria-pressed={currency === cur}
                        className={ui.tab}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <p id={orientationLabelId} className={ui.label}>
                    Orientation
                  </p>
                  <div
                    className={cx(ui.tabs, ui.tabsBlock, s.tabs)}
                    role="group"
                    aria-labelledby={orientationLabelId}
                  >
                    {(['landscape', 'portrait'] as const).map((ori) => (
                      <button
                        key={ori}
                        type="button"
                        onClick={() => {
                          if (isEditMode) return;
                          setOrientation(ori);
                        }}
                        disabled={isEditMode}
                        aria-pressed={orientation === ori}
                        className={ui.tab}
                      >
                        <span className={s.oriGlyph} data-ori={ori} aria-hidden="true" />
                        {ori.charAt(0).toUpperCase() + ori.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tiers */}
              <div className={s.block}>
                <p id={tierLabelId} className={ui.label}>
                  Choose Your Canvas
                </p>

                {isEditMode && (
                  <p id={tierHintId} className={cx(ui.hint, s.lockedHint)}>
                    Canvas tier cannot be changed after creation.
                  </p>
                )}

                <div
                  className={s.tiers}
                  role="group"
                  aria-labelledby={tierLabelId}
                  aria-describedby={isEditMode ? tierHintId : undefined}
                >
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
                        aria-pressed={active}
                        className={cx(ui.option, s.tier)}
                      >
                        {/* Check */}
                        <span className={s.check} aria-hidden="true">
                          <Check size={15} strokeWidth={3} />
                        </span>

                        {/* Body */}
                        <span className={s.tierBody}>
                          <span className={s.tierHead}>
                            <span className={s.tierTitle}>
                              <span className={s.tierName}>{tier.name}</span>
                              {'recommended' in tier && tier.recommended && (
                                <span
                                  className={cx(ui.chip, ui.chipSm, ui.chipColor)}
                                  style={{ '--chip': 'var(--c2)' } as CSSProperties}
                                >
                                  Recommended
                                </span>
                              )}
                            </span>

                            {/* Price */}
                            <span className={s.tierPrice}>
                              {SYMBOL[currency]}
                              {tier.price[currency].toFixed(2)}
                            </span>
                          </span>

                          <span className={s.tierChips}>
                            <span className={cx(ui.chip, ui.chipSm)}>{tier.sizeLabel}</span>
                            <span className={cx(ui.chip, ui.chipSm)}>38mm stretcher bar</span>
                          </span>

                          <span className={s.tierBlurb}>{tier.blurb}</span>

                          {tier.key === 'heritage' && active && (
                            <span className={cx(ui.noticeWarn, s.tierNotice)}>
                              <TriangleAlert
                                size={16}
                                strokeWidth={2.4}
                                className={s.noticeIcon}
                                aria-hidden="true"
                              />
                              <span>
                                UK shipping only. Please do not order The Heritage if you are based outside the United Kingdom. International shipping is not available for this size.
                              </span>
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview + summary */}
              <div className={cx(ui.card, s.block, s.summary)}>
                <div className="min-w-0">
                  <Tag dot="var(--c2)">Canvas Preview</Tag>

                  <div className={s.stage}>
                    {/* Proportional canvas shape */}
                    <div
                      className={s.shape}
                      style={
                        orientation === 'landscape'
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
                            }
                      }
                    >
                      {activeTier.sizeLabel}
                    </div>
                  </div>

                  <p className={s.stageNote}>
                    You&apos;ll choose your layout and add photos in the next
                    step.
                  </p>
                </div>

                {/* Summary */}
                <div className="min-w-0">
                  <Tag dot="var(--c2)">Your Selection</Tag>
                  <p className={s.selName}>{activeTier.name}</p>
                  <p className={s.selMeta}>
                    {activeTier.sizeLabel} ·{' '}
                    {orientation.charAt(0).toUpperCase() + orientation.slice(1)} ·
                    38mm
                  </p>

                  <div className={s.priceRow}>
                    <p className={s.selPrice}>
                      {SYMBOL[currency]}
                      {activeTier.price[currency].toFixed(2)}
                    </p>

                    <p className={s.tierLabel}>
                      <span className={s.tierLabelKey}>Tier</span>
                      <span className={s.tierLabelValue}>
                        {activeTier.key === 'moment'
                          ? 'Cinematic'
                          : activeTier.key === 'heirloom'
                          ? 'Most Popular'
                          : 'Ultra-Premium'}
                      </span>
                    </p>
                  </div>

                  <ul className={s.features}>
                    <li>38mm premium stretcher bar</li>
                    <li>400gsm gallery-grade canvas</li>
                    <li>Imagewrap finish</li>
                    <li className={s.featureStrong}>
                      {activeTier.key === 'heritage' ? 'UK shipping at checkout' : 'Worldwide shipping at checkout'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Actions: on phones the main action sits on top ── */}
            <div className={cx(ui.sheetFooter, 'max-[599px]:flex-col-reverse')}>
              <Btn variant="soft" onClick={onClose} disabled={uploading}>
                Cancel
              </Btn>

              <Btn
                onClick={handleSubmit}
                disabled={!title.trim() || uploading}
                tile={
                  uploading ? (
                    <Spinner size={16} />
                  ) : (
                    <ArrowRight size={18} strokeWidth={2.6} />
                  )
                }
              >
                {uploading
                  ? 'Saving…'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : `Create ${activeTier.name}`}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
