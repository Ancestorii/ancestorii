'use client';

import { useRef, useState, useEffect } from 'react';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';
import Image from 'next/image';

export default function Slot({
  canvasId,
  asset,
  onUpdate,
  selectedImage,
  clearSelectedImage,
  isExport = false,
}: {
  canvasId: string;
  asset: CanvasAsset;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  onUpdate: (updated: CanvasAsset) => void;
  isExport?: boolean;
}) {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [asset.url]);

  /* ── Upsert asset row ── */
  const upsertAssetRow = async (params: {
    libraryMediaId: string;
    signedUrl: string;
  }) => {
    const { libraryMediaId, signedUrl } = params;

    if (asset.id) {
      /* Update existing row */
      const { data: updatedRow, error: updateError } = await supabase
        .from('memory_canvas_assets')
        .update({ asset_id: libraryMediaId })
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
        caption: updatedRow.caption,
        crop_data: updatedRow.crop_data,
        url: signedUrl,
      });
      return;
    }

    /* Insert new row */
    const { data: insertedRow, error: insertError } = await supabase
      .from('memory_canvas_assets')
      .insert({
        canvas_id: canvasId,
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
      caption: insertedRow.caption,
      crop_data: insertedRow.crop_data,
      url: signedUrl,
    });
  };

  /* ── Place from library ── */
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
        /* ── Empty slot ── */
        <div
          onClick={selectedImage ? handleInsertFromLibrary : undefined}
          className="border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 hover:border-[#E6C26E]"
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
        /* ── Filled slot ── */
        <div
          className="w-full overflow-hidden relative"
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

          {/* Remove button on hover */}
          {!isExport && hovered && !selectedImage && (
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (!asset.id) return;
                try {
                  await supabase
                    .from('memory_canvas_assets')
                    .delete()
                    .eq('id', asset.id);
                  onUpdate({
                  ...asset,
                   id: undefined,
                   asset_id: undefined,
                   url: undefined,
                   crop_data: {},
                   });
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