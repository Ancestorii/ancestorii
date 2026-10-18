'use client';

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ui, Btn, IconBtn, Spinner, Tag, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './CreateAcrylicDrawer.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/* ────────────────────────────────────────────
   Tiers
   ──────────────────────────────────────────── */

const ACRYLIC_TIERS = [
  {
    key: 'portrait',
    name: 'The Portrait',
    size: '16x24',
    sizeLabel: '16×24″',
    isSquare: false,
    price: {
      GBP: 99.99,
      USD: 139.99,
      EUR: 119.99,
    },
    blurb: 'Entry luxury. The perfect gallery piece for any room.',
  },
  {
    key: 'centrepiece',
    name: 'The Centrepiece',
    size: '24x24',
    sizeLabel: '24×24″',
    isSquare: true,
    price: {
      GBP: 149.99,
      USD: 199.99,
      EUR: 179.99,
    },
    blurb: 'A bold square statement. The signature Ancestorii piece.',
    recommended: true,
  },
  {
    key: 'masterpiece',
    name: 'The Masterpiece',
    size: '24x36',
    sizeLabel: '24×36″',
    isSquare: false,
    price: {
      GBP: 199.99,
      USD: 269.99,
      EUR: 239.99,
    },
    blurb: 'The aspirational hero. Gallery-grade at its finest.',
  },
] as const;

type TierKey = (typeof ACRYLIC_TIERS)[number]['key'];
type Orientation = 'landscape' | 'portrait' | 'square';

type MemoryAcrylic = {
  id: string;
  title: string | null;
  tier_key: TierKey | null;
  tier_name: string | null;
  acrylic_size: string | null;
  orientation: string | null;
  layout_type: string | null;
  price_gbp: number | null;
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */

export default function CreateAcrylicDrawer({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode = 'create',
  acrylic,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (acrylic: MemoryAcrylic) => void;
  onUpdated?: (acrylic: MemoryAcrylic) => void;
  mode?: 'create' | 'edit';
  acrylic?: Partial<MemoryAcrylic> | null;
}) {
  const supabase = getBrowserClient();

  const [title, setTitle] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierKey>('centrepiece');
  const [orientation, setOrientation] = useState<Orientation>('square');
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isSubmittingRef = useRef(false);

  const headingId = useId();
  const subId = useId();
  const titleFieldId = useId();
  const currencyLabelId = useId();
  const orientationLabelId = useId();
  const tierLabelId = useId();
  const tierHintId = useId();

  useEffect(() => setMounted(true), []);

  /* ── Auto-set orientation when tier changes ── */
  const activeTier = useMemo(
    () =>
      ACRYLIC_TIERS.find((t) => t.key === selectedTier) ?? ACRYLIC_TIERS[1],
    [selectedTier]
  );

  useEffect(() => {
    if (activeTier.isSquare) {
      setOrientation('square');
    } else if (orientation === 'square') {
      setOrientation('landscape');
    }
  }, [activeTier, orientation]);

  /* ── Reset / hydrate on open ── */
  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && acrylic) {
      setTitle(acrylic.title || '');
      setSelectedTier((acrylic.tier_key as TierKey) || 'centrepiece');
      setOrientation((acrylic.orientation as Orientation) || 'square');
      return;
    }

    setTitle('');
    setSelectedTier('centrepiece');
    setOrientation('square');
  }, [open, mode, acrylic]);

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

      if (mode === 'edit' && acrylic?.id) {
        const { data, error } = await supabase
          .from('acrylic_prints')
          .update({ title: title.trim() })
          .eq('id', acrylic.id)
          .select(
            `id, title, tier_key, tier_name, acrylic_size, orientation, layout_type, price_gbp`
          )
          .single();

        if (error) throw error;

        onUpdated?.(data as MemoryAcrylic);
        toast.success('Acrylic print updated!');
      } else {
        const { data: newId, error: createError } = await supabase.rpc(
          'create_acrylic_print',
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
        if (!newId) throw new Error('Could not create acrylic print.');

        const { data: created, error: fetchError } = await supabase
          .from('acrylic_prints')
          .select(
            `id, title, tier_key, tier_name, acrylic_size, orientation, layout_type, price_gbp`
          )
          .eq('id', newId)
          .single();

        if (fetchError) throw fetchError;

        onCreated?.(created as MemoryAcrylic);
        toast.success('Acrylic print created!');
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

  if (!mounted) return null;

  const showOrientationToggle = !activeTier.isSquare;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
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
                <Tag dot="var(--c2)">Acrylic Print</Tag>
                <div className="min-w-0">
                  <h2 id={headingId} className={ui.sheetTitle}>
                    {mode === 'edit'
                      ? 'Edit Acrylic Print'
                      : 'Create Acrylic Print'}
                  </h2>
                  <p id={subId} className={ui.sheetSub}>
                    This will become a real, gallery-grade acrylic print.
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
                  Print Title
                </label>
                <input
                  id={titleFieldId}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Family Portrait"
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

                {showOrientationToggle && (
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
                )}
              </div>

              {/* Tiers */}
              <div className={s.block}>
                <p id={tierLabelId} className={ui.label}>
                  Choose Your Acrylic
                </p>

                {isEditMode && (
                  <p id={tierHintId} className={cx(ui.hint, s.lockedHint)}>
                    Acrylic tier cannot be changed after creation.
                  </p>
                )}

                <div
                  className={s.tiers}
                  role="group"
                  aria-labelledby={tierLabelId}
                  aria-describedby={isEditMode ? tierHintId : undefined}
                >
                  {ACRYLIC_TIERS.map((tier) => {
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
                            <span className={cx(ui.chip, ui.chipSm)}>
                              {tier.isSquare ? 'Square' : 'Acrylic panel'}
                            </span>
                          </span>

                          <span className={s.tierBlurb}>{tier.blurb}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview + summary */}
              <div className={cx(ui.card, s.block, s.summary)}>
                <div className="min-w-0">
                  <Tag dot="var(--c2)">Acrylic Preview</Tag>

                  <div className={s.stage}>
                    {/* Proportional acrylic shape */}
                    <div
                      className={s.shape}
                      style={
                        activeTier.isSquare
                          ? { width: 140, height: 140 }
                          : orientation === 'landscape'
                          ? {
                              width:
                                activeTier.key === 'masterpiece' ? 180 : 150,
                              height:
                                activeTier.key === 'masterpiece' ? 120 : 100,
                            }
                          : {
                              width:
                                activeTier.key === 'masterpiece' ? 120 : 100,
                              height:
                                activeTier.key === 'masterpiece' ? 180 : 150,
                            }
                      }
                    >
                      {activeTier.sizeLabel}
                    </div>
                  </div>

                  <p className={s.stageNote}>
                    You&apos;ll add your photo and crop it in the next step.
                  </p>
                </div>

                {/* Summary */}
                <div className="min-w-0">
                  <Tag dot="var(--c2)">Your Selection</Tag>
                  <p className={s.selName}>{activeTier.name}</p>
                  <p className={s.selMeta}>
                    {activeTier.sizeLabel} ·{' '}
                    {activeTier.isSquare
                      ? 'Square'
                      : orientation.charAt(0).toUpperCase() +
                        orientation.slice(1)}{' '}
                    · Acrylic
                  </p>

                  <div className={s.priceRow}>
                    <p className={s.selPrice}>
                      {SYMBOL[currency]}
                      {activeTier.price[currency].toFixed(2)}
                    </p>

                    <p className={s.tierLabel}>
                      <span className={s.tierLabelKey}>Tier</span>
                      <span className={s.tierLabelValue}>
                        {activeTier.key === 'portrait'
                          ? 'Entry Luxury'
                          : activeTier.key === 'centrepiece'
                          ? 'Most Popular'
                          : 'Aspirational'}
                      </span>
                    </p>
                  </div>

                  <ul className={s.features}>
                    <li>Crystal-clear acrylic panel</li>
                    <li>Vibrant colour depth</li>
                    <li>Float-mount included</li>
                    <li className={s.featureStrong}>
                      Standard or Express shipping at checkout
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
