'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { X, ImagePlus, Video, Loader2 } from 'lucide-react';

export type LibraryPickerItem = {
  id: string;
  file_path: string;
  file_type: string; // image | video | audio | file | other (we won’t assume)
  created_at: string | null;
  file_size?: number | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (item: LibraryPickerItem) => void;
  title?: string;
  subtitle?: string;
  bucket?: string; // default: 'library-media'
  /** If you want to restrict what can be picked */
  accept?: Array<'image' | 'video' | 'audio' | 'file' | 'other'>;
};

export default function LibraryPickerModal({
  open,
  onClose,
  onPick,
  title = 'Pick From My Library',
  subtitle = 'Choose memories you already uploaded.',
  bucket = 'library-media',
  accept,
}: Props) {
  const supabase = getBrowserClient();

  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<LibraryPickerItem[]>([]);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});
  const [activeType, setActiveType] = useState<
    'all' | 'image' | 'video' | 'audio' | 'file' | 'other'
  >('all');

  const [pickedId, setPickedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Fetch on open
  useEffect(() => {
  if (!open) return;
  setPickedId(null);
  setActiveType('all');
  fetchLibrary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('library_media')
        .select('id, file_path, file_type, created_at, file_size')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as LibraryPickerItem[];
      setMedia(rows);

      if (rows.length === 0) {
        setSignedMap({});
        return;
      }

      // Sign URLs (7 days)
      const signedResults = await Promise.all(
        rows.map(async (item) => {
          const { data: urlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(item.file_path, 60 * 60 * 24 * 7);

          return {
            id: item.id,
            url: urlData?.signedUrl
              ? `${urlData.signedUrl}&cb=${Date.now()}`
              : null,
          };
        })
      );

      const next: Record<string, string> = {};
      signedResults.forEach((r) => {
        if (r.url) next[r.id] = r.url;
      });
      setSignedMap(next);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to load library.');
      setMedia([]);
      setSignedMap({});
    } finally {
      setLoading(false);
    }
  };

  const normalizedAccept = useMemo(() => {
    if (!accept || accept.length === 0) return null;
    return new Set(accept);
  }, [accept]);

  const filtered = useMemo(() => {

    return media.filter((m) => {
      // accept filter
      if (normalizedAccept) {
        const ok = normalizedAccept.has((m.file_type as any) || 'other');
        if (!ok) return false;
      }

      // type filter buttons
      if (activeType !== 'all' && m.file_type !== activeType) return false;

     return true;
    });
  }, [media, activeType, normalizedAccept]);

  const canPick = (m: LibraryPickerItem) => {
    if (!normalizedAccept) return true;
    return normalizedAccept.has((m.file_type as any) || 'other');
  };

  const handlePick = (m: LibraryPickerItem) => {
    if (!canPick(m)) return;
    setPickedId(m.id);
  };

  const confirmPick = () => {
    if (!pickedId) return;
    const item = media.find((m) => m.id === pickedId);
    if (!item) return;
    onPick(item);
    onClose();
  };

  useEffect(() => {
  if (open) {
    setMounted(true);
    return;
  }
  // animate out then unmount
  const t = setTimeout(() => setMounted(false), 200);
  return () => clearTimeout(t);
}, [open]);

if (!mounted && !open) return null;

  return (
   <div
  className={`fixed inset-0 z-[95] flex items-center justify-center transition-opacity duration-200 ${
    open ? 'opacity-100' : 'opacity-0'
  }`}
>
      {/* Backdrop */}
      <div
  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
  onClick={onClose}
/>

      {/* Modal */}
      <div
  className={`relative w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-200 ${
    open ? 'scale-100 translate-y-0' : 'scale-[0.98] translate-y-2'
  }`}
  onClick={(e) => e.stopPropagation()}
>
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white via-[#fefaf3] to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2837]">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-[#5B6473] mt-2">
                {subtitle}
              </p>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-2 hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#1F2837]" />
            </button>
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">

            {/* Type filter */}
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <FilterPill
                active={activeType === 'all'}
                onClick={() => setActiveType('all')}
                label="All"
              />
              <FilterPill
                active={activeType === 'image'}
                onClick={() => setActiveType('image')}
                label="Images"
                icon={<ImagePlus className="w-4 h-4" />}
              />
              <FilterPill
                active={activeType === 'video'}
                onClick={() => setActiveType('video')}
                label="Videos"
                icon={<Video className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#5B6473]">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading your library…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#1F2837] font-semibold">
                No media found.
              </p>
              <p className="text-sm text-[#5B6473] mt-2">
                Upload something into <span className="font-medium">My Library</span> first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => {
                const url = signedMap[item.id];
                const ready = !!url;
                const selected = pickedId === item.id;
                const disabled = !canPick(item);

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handlePick(item)}
                    disabled={disabled}
                    className={[
                      'text-left rounded-3xl border overflow-hidden bg-white',
                      'transition-all duration-200',
                      'transition-opacity duration-300',
                      ready ? 'opacity-100' : 'opacity-0',
                      selected
                        ? 'border-[#C8A557] shadow-[0_0_0_3px_rgba(230,194,110,0.35)]'
                        : 'border-[#B7932F]/40 hover:shadow-lg hover:border-[#B7932F]/70',
                      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    {/* Preview */}
                    <div className="relative aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">
                      {!url ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                          Preview unavailable
                        </div>
                      ) : item.file_type === 'video' ? (
                        <video
                          src={url}
                          className="absolute inset-0 w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <PickerImage src={url} alt="" />
                      )}

                      {/* Selected badge */}
                      {selected && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#C8A557] text-[#1F2837] shadow">
                          Selected
                        </div>
                      )}

                      {/* Type badge */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/55 text-white">
                        {prettyType(item.file_type)}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="p-4">
                      <p className="text-xs text-[#7A8596]">
                        {item.created_at
                          ? `Added on ${new Date(item.created_at).toLocaleDateString()}`
                          : '—'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-5 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={confirmPick}
              disabled={!pickedId}
              className="px-6 py-2 rounded-full text-sm font-semibold
                         bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
                         text-[#1F2837] shadow
                         hover:shadow-lg hover:scale-[1.01]
                         disabled:opacity-60 disabled:hover:shadow disabled:hover:scale-100
                         transition"
            >
              Use Selected Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition',
        active
          ? 'bg-[#1F2837] text-white shadow'
          : 'bg-gray-100 text-[#1F2837] hover:bg-gray-200',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

function prettyType(t: string) {
  const x = (t || '').toLowerCase();
  if (x === 'image' || x === 'photo') return 'Image';
  if (x === 'video') return 'Video';
  if (x === 'audio') return 'Audio';
  if (x === 'file') return 'File';
  if (x === 'other') return 'Other';
  return x ? x[0].toUpperCase() + x.slice(1) : 'Media';
}

function PickerImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        quality={90}
        className={[
          'object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}