'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ImagePlus } from 'lucide-react';
import { ensureDisplayableImage } from '@/lib/convertImage';


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
  const [mounted, setMounted] = useState(false);

  const dropRef = useRef<HTMLLabelElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => setMounted(true), []);

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

  /* ── Reset / hydrate on open ── */
  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && book) {
      setTitle(book.title || '');
      setSelectedTier(getTierFromBook(book));
      setPreviewUrl(book._signed_cover || book.cover_image || null);
      setCoverFile(null);
      return;
    }

    setTitle('');
    setSelectedTier('story');
    setCoverFile(null);
    setPreviewUrl(null);
  }, [open, mode, book, getTierFromBook]);

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
      area.style.borderColor = '#C9A23C';
      area.style.background = 'rgba(255,255,255,0.9)';
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
          .eq('user_id', user.id)
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
          .single();

        if (error) throw error;

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
          .eq('user_id', user.id)
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
            className="relative w-full max-w-[1060px] overflow-hidden rounded-3xl grid grid-cols-1 lg:grid-cols-[1fr_320px] max-h-[90vh] overflow-y-auto lg:overflow-y-visible"
            style={{
              background: '#FEFCF8',
              border: '1px solid rgba(205, 178, 100, 0.35)',
              boxShadow:
                '0 1px 0 0 rgba(255,255,255,0.6) inset, 0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(205,178,100,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═══════════ LEFT PANEL ═══════════ */}
            <div className="px-6 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-11">
              {/* Header */}
              <div className="mb-6">
                <h2
                  className="text-[1.85rem] font-bold leading-tight text-[#14213D]"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  {mode === 'edit' ? 'Edit Memory Book' : 'Create Memory Book'}
                </h2>
                <p className="mt-2.5 text-sm text-[#5A6270]">
                  This will become a real, printed memory.
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
                Book Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Family Story"
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

              <div className="mt-5">
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

              {/* Tiers */}
              <div className="mt-7">
                <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F2837]">
                Choose Your Book
                </label>

               {isEditMode && (
               <p className="mb-3 text-[12px] text-[#7A7A7A]">
                Book tier cannot be changed after creation.
               </p>
                )}

                <div className="space-y-2.5">
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
                            {tier.contentPages} memory pages
                          </p>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-[#4A5060]">
                            {tier.blurb}
                          </p>
                        </div>

                        {/* Price */}
                        <span className="shrink-0 text-[15px] font-bold text-[#14213D]">
                        {SYMBOL[currency]}{tier.price[currency].toFixed(2)}
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
              className="flex flex-col justify-between border-t border-[rgba(210,195,155,0.3)] p-6 sm:p-7 lg:border-l lg:border-t-0"
              style={{
                background:
                  'linear-gradient(180deg, #FAF6ED 0%, #F6F1E4 100%)',
              }}
            >
              {/* Thumbnail */}
              <div>
                <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#4A5060]">
                  Thumbnail · optional
                </p>

                <label
                  ref={dropRef}
                  className="relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-[1.5px] border-dashed transition-all"
                  style={{
                    borderColor: 'rgba(200, 178, 110, 0.55)',
                    background: 'rgba(255,255,255,0.7)',
                    aspectRatio: '4/3',
                  }}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Thumbnail preview"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-3 pb-2 pt-5">
                        <span className="text-[11px] font-medium text-white">
                          Click to replace
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFF4D8]">
                        <ImagePlus className="h-[18px] w-[18px] text-[#B4881F]" />
                      </div>
                      <span className="text-[12.5px] font-medium text-[#5A6270]">
                        Click or drop image
                      </span>
                    </>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </label>
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
                  {activeTier.contentPages} memory pages to fill · A4 Hardcover
                </p>

                <div className="mt-5 flex items-end justify-between">
                  <p
                  className="text-[2rem] font-bold leading-none text-[#14213D]"
                  style={{ letterSpacing: '-0.02em' }}
                   >
                  {SYMBOL[currency]}{activeTier.price[currency].toFixed(2)}
                  </p>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7A6520]">
                      Tier
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#14213D]">
                      {activeTier.key === 'chapter'
                        ? 'Entry'
                        : activeTier.key === 'story'
                        ? 'Most Popular'
                        : 'Premium'}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 pl-4 text-xs leading-relaxed text-[#7A6520] list-disc">
  <li>Printed hardcover with matte finish</li>
  <li>200gsm premium gloss pages</li>
  <li className="font-semibold text-[#14213D]">Free worldwide shipping</li>
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