'use client';

import { useRef, useState, useEffect } from 'react'; // ✅ ADDED useEffect
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';
import Image from "next/image";

export default function Slot({
  pageId,
  asset,
  onUpdate,
  showSubheading = true,
  showComment = true,
  selectedImage,
  clearSelectedImage,
  isExport = false,
}: {
  pageId: string;
  asset: Asset;
  showSubheading?: boolean;
  showComment?: boolean;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  onUpdate: (updated: Asset) => void;
  isExport?: boolean;
}) {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // ✅ FIX: reset loading state when image changes
  useEffect(() => {
    setLoaded(false);
  }, [asset.url]);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
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

  const upsertAssetRow = async (params: {
    libraryMediaId: string;
    signedUrl: string;
  }) => {
    const { libraryMediaId, signedUrl } = params;

    if (asset.id) {
      const { data: updatedRow, error: updateError } = await supabase
        .from('memory_book_page_assets')
        .update({
          asset_id: libraryMediaId,
        })
        .eq('id', asset.id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updatedRow) throw new Error('Update succeeded but no row returned');

      onUpdate({
        ...asset,
        id: updatedRow.id,
        asset_id: updatedRow.asset_id,
        slot_index: updatedRow.slot_index,
        subheading: updatedRow.subheading,
        comment: updatedRow.comment,
        url: signedUrl,
      });

      return;
    }

    const { data: insertedRow, error: insertError } = await supabase
      .from('memory_book_page_assets')
      .insert({
        page_id: pageId,
        asset_id: libraryMediaId,
        slot_index: asset.slot_index,
      })
      .select()
      .maybeSingle();

    if (insertError) throw insertError;
    if (!insertedRow) throw new Error('Insert succeeded but no row returned');

    onUpdate({
      ...asset,
      id: insertedRow.id,
      asset_id: insertedRow.asset_id,
      slot_index: insertedRow.slot_index,
      subheading: insertedRow.subheading,
      comment: insertedRow.comment,
      url: signedUrl,
    });
  };

  const handleInsertFromLibrary = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);

      const { data: signed } = await supabase.storage
        .from('library-media')
        .createSignedUrl(selectedImage.file_path, 60 * 60 * 24 * 30);

      await upsertAssetRow({
        libraryMediaId: selectedImage.id,
        signedUrl: signed?.signedUrl ?? '',
      });

      clearSelectedImage();
    } catch (err) {
      console.error('INSERT ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{ fontFamily: inter.style.fontFamily, height: '100%' }}
    >
      {!asset.url ? (
        <div
          onClick={selectedImage ? handleInsertFromLibrary : undefined}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500 hover:border-[#E6C26E]"
          style={{
            cursor: selectedImage ? 'pointer' : 'default',
            borderColor: selectedImage ? '#B8860B' : '#D1D5DB',
            background: selectedImage ? '#FBF6EA' : 'transparent',
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              fontWeight: 500,
              color: selectedImage ? '#B8860B' : '#6B7280',
            }}
          >
            {loading
              ? 'Placing image...'
              : selectedImage
              ? 'Click to place image'
              : 'Choose an image from the media tab'}
          </p>
        </div>
      ) : (
  <div
    className="w-full rounded-xl overflow-hidden relative"
    style={{ flex: '1 1 0', minHeight: 0 }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    onClick={selectedImage ? handleInsertFromLibrary : undefined}
    role={selectedImage ? 'button' : undefined}
  >
    {isExport ? (
      <img
        src={asset.url}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    ) : (
      <Image
        src={asset.url}
        alt=""
        fill
        sizes="100%"
        quality={90}
        unoptimized
        className={`object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadingComplete={() => setLoaded(true)}
      />
    )}

    {/* 🔥 ADD THIS HERE */}
    {!isExport && hovered && !selectedImage && (
      <button
        type="button"
        onClick={async (e) => {
          e.stopPropagation();
          if (!asset.id) return;
          try {
            await supabase
              .from('memory_book_page_assets')
              .update({ asset_id: null })
              .eq('id', asset.id);
            onUpdate({ ...asset, asset_id: undefined, url: undefined });
          } catch (err) {
            console.error('Failed to clear slot:', err);
          }
        }}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 26,
          height: 26,
          borderRadius: 99,
          background: 'rgba(0,0,0,0.6)',
          border: 'none',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        ×
      </button>
    )}
    </div>
      )}
    </div>
  );
}