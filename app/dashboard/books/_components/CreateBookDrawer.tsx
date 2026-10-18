'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ArrowRight, Check, ImagePlus, X } from 'lucide-react';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { ui, Btn, IconBtn, IconTile, Spinner, Tag, toneByKey, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './createBookDrawer.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');


/* ────────────────────────────────────────────
   Tiers
   ──────────────────────────────────────────── */

const BOOK_TIERS = [
  {
    key: 'chapter',
    name: 'A Chapter',
    contentPages: 22,
    totalPages: 24,
    price: {
      GBP: 44.99,
      USD: 59.99,
      EUR: 49.99,
    },
    blurb: 'A focused story. Quick to build, easy to finish.',
  },
  {
    key: 'story',
    name: 'A Story',
    contentPages: 34,
    totalPages: 36,
    price: {
      GBP: 54.99,
      USD: 74.99,
      EUR: 64.99,
    },
    blurb: 'The ideal balance of photos and written context.',
    recommended: true,
  },
  {
    key: 'legacy',
    name: 'A Legacy',
    contentPages: 46,
    totalPages: 48,
    price: {
      GBP: 64.99,
      USD: 84.99,
      EUR: 74.99,
    },
    blurb: 'More room for the moments and people that matter most.',
  },
] as const;


type TierKey = (typeof BOOK_TIERS)[number]['key'];

type MemoryBook = {
  id: string;
  title: string | null;
  tier_key: TierKey | null;
  tier_name: string | null;
  total_page_limit: number | null;
  content_page_limit: number | null;
  price_gbp: number | null;
  cover_asset_id: string | null;
  cover_image?: string | null;
  _signed_cover?: string | null;
};

type RpcCreateBookArgs = {
  p_user_id: string;
  p_title: string;
  p_tier_key: TierKey;
  p_book_size: string;
  p_cover_asset_id?: string | null;
  p_description?: string | null;
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */

export default function CreateBookDrawer({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode = 'create',
  book,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (book: MemoryBook) => void;
  onUpdated?: (book: MemoryBook) => void;
  mode?: 'create' | 'edit';
  book?: Partial<MemoryBook> | null;
}) {
  const supabase = getBrowserClient();

  const [title, setTitle] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierKey>('story');
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const dropRef = useRef<HTMLLabelElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  const headingId = useId();
  const subId = useId();
  const titleFieldId = useId();
  const currencyLabelId = useId();
  const tierLabelId = useId();
  const tierHintId = useId();

  // A click outside, the close button and Escape all close it, but never while saving. Tab
  // stays inside, and focus goes back to the button that opened it.
  const requestClose = () => {
    if (!uploading) onClose();
  };
  const panelRef = useDialog<HTMLDivElement>(open, requestClose);

  const getTierFromBook = useCallback((value?: Partial<MemoryBook> | null): TierKey => {
    if (!value) return 'story';

    if (
      value.tier_key === 'chapter' ||
      value.tier_key === 'story' ||
      value.tier_key === 'legacy'
    ) {
      return value.tier_key;
    }

    if (value.total_page_limit === 24 || value.content_page_limit === 22) {
      return 'chapter';
    }

    if (value.total_page_limit === 48 || value.content_page_limit === 46) {
      return 'legacy';
    }

    return 'story';
  }, []);

  /* ── Reset / hydrate on open ──
     Decided during render, keyed by what is being opened (not in an effect after the first
     paint, which showed the previous book's fields for a frame). Nothing resets while the
     dialog fades out. */
  const resetKey = open ? `${mode}:${book?.id ?? 'new'}` : null;
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  if (resetKey !== appliedKey) {
    setAppliedKey(resetKey);
    if (resetKey) {
      if (mode === 'edit' && book) {
        setTitle(book.title || '');
        setSelectedTier(getTierFromBook(book));
        setPreviewUrl(book._signed_cover || book.cover_image || null);
        setCoverFile(null);
      } else {
        setTitle('');
        setSelectedTier('story');
        setCoverFile(null);
        setPreviewUrl(null);
      }
    }
  }

  /* ── Preview URL from file ── */
  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  /* ── File handler with validation ── */
  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setCoverFile(file);
  }, []);

  /* ── Drag & drop ── */
  useEffect(() => {
    const area = dropRef.current;
    if (!area) return;

    const over = (e: DragEvent) => {
      e.preventDefault();
      area.style.borderColor = 'var(--ink)';
      area.style.background = 'var(--hover)';
    };

    const leave = (e: DragEvent) => {
      e.preventDefault();
      area.style.borderColor = '';
      area.style.background = '';
    };

    const drop = (e: DragEvent) => {
      e.preventDefault();
      area.style.borderColor = '';
      area.style.background = '';
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileSelect(file);
    };

    area.addEventListener('dragover', over);
    area.addEventListener('dragleave', leave);
    area.addEventListener('drop', drop);

    return () => {
      area.removeEventListener('dragover', over);
      area.removeEventListener('dragleave', leave);
      area.removeEventListener('drop', drop);
    };
  }, [handleFileSelect]);

  const activeTier = useMemo(
    () => BOOK_TIERS.find((t) => t.key === selectedTier) ?? BOOK_TIERS[1],
    [selectedTier],
  );
  const isEditMode = mode === 'edit';

  const SYMBOL = {
  GBP: '£',
  USD: '$',
  EUR: '€',
} as const;

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to read image dimensions'));
      };
      img.src = url;
    });
  };

  const uploadCoverIfNeeded = useCallback(
    async (
      userId: string,
      existingCoverAssetId: string | null,
    ): Promise<{ coverAssetId: string | null; signedUrl: string | null }> => {
      let coverAssetId = existingCoverAssetId;
      let signedUrl: string | null = null;

      if (!coverFile) {
        return { coverAssetId, signedUrl };
      }

      const safeFile = await ensureDisplayableImage(coverFile);

      const path = `${userId}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}_${safeFile.name}`.replace(/\s+/g, '_');

      const { error: uploadError } = await supabase.storage
        .from('library-media')
        .upload(path, safeFile, { upsert: true });

      if (uploadError) throw uploadError;

      const dimensions = await getImageDimensions(safeFile);

      const { data: media, error: mediaError } = await supabase
        .from('library_media')
        .insert({
          user_id: userId,
          file_path: path,
          file_type: 'image',
          width: dimensions.width,
          height: dimensions.height,
          file_size_bytes: safeFile.size,
        })
        .select('id')
        .single();

      if (mediaError) {
        await supabase.storage.from('library-media').remove([path]);
        throw mediaError;
      }

      coverAssetId = media.id;

      const { data: signed, error: signedError } = await supabase.storage
        .from('library-media')
        .createSignedUrl(path, 60 * 60 * 24 * 30);

      if (signedError) throw signedError;

      signedUrl = signed?.signedUrl || null;

      return { coverAssetId, signedUrl };
    },
    [coverFile, supabase],
  );

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

      const { coverAssetId, signedUrl } = await uploadCoverIfNeeded(
        user.id,
        book?.cover_asset_id ?? null,
      );

      if (mode === 'edit' && book?.id) {
        const { data, error } = await supabase
          .from('memory_books')
          .update({
          title: title.trim(),
          cover_asset_id: coverAssetId,
          })
          .eq('id', book.id)
          .select(
            `
              id,
              title,
              tier_key,
              tier_name,
              total_page_limit,
              content_page_limit,
              price_gbp,
              cover_asset_id
            `,
          )
          .maybeSingle();

        if (error) throw error;
        // Row security refuses an update with no error and no row.
        if (!data) throw new Error('This memory book could not be updated.');

        onUpdated?.({
          ...(data as MemoryBook),
          _signed_cover: signedUrl ?? previewUrl ?? book?._signed_cover ?? book?.cover_image ?? null,
        });

        toast.success('Memory book updated!');
      } else {
        const rpcArgs: RpcCreateBookArgs = {
          p_user_id: user.id,
          p_title: title.trim(),
          p_tier_key: activeTier.key,
          p_book_size: 'a4_landscape',
          p_cover_asset_id: coverAssetId,
          p_description: null,
        };

        const { data: newBookId, error: createError } = await supabase.rpc(
          'create_memory_book_with_pages',
          rpcArgs,
        );

        if (createError) throw createError;
        if (!newBookId) throw new Error('Could not create memory book.');

        const { data: createdBook, error: fetchError } = await supabase
          .from('memory_books')
          .select(
            `
              id,
              title,
              tier_key,
              tier_name,
              total_page_limit,
              content_page_limit,
              price_gbp,
              cover_asset_id
            `,
          )
          .eq('id', newBookId)
          .single();

        if (fetchError) throw fetchError;

        onCreated?.({
          ...(createdBook as MemoryBook),
          _signed_cover: signedUrl ?? previewUrl ?? null,
        });

        toast.success('Memory book created!');
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
                <Tag dot="var(--c2)">Memory Book</Tag>
                <div className="min-w-0">
                  <h2 id={headingId} className={ui.sheetTitle}>
                    {mode === 'edit' ? 'Edit Memory Book' : 'Create Memory Book'}
                  </h2>
                  <p id={subId} className={ui.sheetSub}>
                    This will become a real, printed memory.
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
                  Book Title
                </label>
                <input
                  id={titleFieldId}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Family Story"
                  className={ui.input}
                />
              </div>

              {/* Currency */}
              <div className={s.pickers}>
                <div className="min-w-0">
                  <p id={currencyLabelId} className={ui.label}>
                    Currency
                  </p>
                  <div
                    className={cx(ui.tabs, ui.tabsBlock)}
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
              </div>

              {/* Tiers */}
              <div className={s.block}>
                <p id={tierLabelId} className={ui.label}>
                  Choose Your Book
                </p>

                {isEditMode && (
                  <p id={tierHintId} className={cx(ui.hint, s.lockedHint)}>
                    Book tier cannot be changed after creation.
                  </p>
                )}

                <div
                  className={s.tiers}
                  role="group"
                  aria-labelledby={tierLabelId}
                  aria-describedby={isEditMode ? tierHintId : undefined}
                >
                  {BOOK_TIERS.map((tier) => {
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
                              {SYMBOL[currency]}{tier.price[currency].toFixed(2)}
                            </span>
                          </span>

                          <span className={s.tierChips}>
                            <span className={cx(ui.chip, ui.chipSm)}>
                              {tier.contentPages} memory pages
                            </span>
                          </span>

                          <span className={s.tierBlurb}>{tier.blurb}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover image notice + summary */}
              <div className={cx(ui.card, s.block, s.summary)}>
                <div className="min-w-0">
                  <Tag dot="var(--c2)">Cover Image</Tag>

                  <div className={s.coverStage}>
                    <IconTile Icon={ImagePlus} tone={toneByKey('orange')} />
                    <p className={s.coverTitle}>Design your cover inside the book</p>
                    <p className={s.coverText}>
                      You&apos;ll choose photos, layouts, and titles in the next step. Your cover becomes your dashboard thumbnail automatically.
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="min-w-0">
                  <Tag dot="var(--c2)">Your Selection</Tag>
                  <p className={s.selName}>{activeTier.name}</p>
                  <p className={s.selMeta}>
                    {activeTier.contentPages} memory pages to fill · A4 Hardcover
                  </p>

                  <div className={s.priceRow}>
                    <p className={s.selPrice}>
                      {SYMBOL[currency]}{activeTier.price[currency].toFixed(2)}
                    </p>

                    <p className={s.tierLabel}>
                      <span className={s.tierLabelKey}>Tier</span>
                      <span className={s.tierLabelValue}>
                        {activeTier.key === 'chapter'
                          ? 'Entry'
                          : activeTier.key === 'story'
                          ? 'Most Popular'
                          : 'Premium'}
                      </span>
                    </p>
                  </div>

                  <ul className={s.features}>
                    <li>Printed hardcover with matte finish</li>
                    <li>200gsm premium gloss pages</li>
                    <li className={s.featureStrong}>Standard or Express shipping at checkout</li>
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
