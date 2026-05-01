'use client';

import { useState } from 'react';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';
import Image from 'next/image'; // ✅ ADDED

export default function TrioCoverLayout({
  assets,
  pageId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false, // ✅ ADDED
}: {
  assets: Asset[];
  pageId: string;
  onUpdateAsset: (asset: Asset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean; // ✅ ADDED
}) {
  const supabase = getBrowserClient();
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const sorted = [...assets].sort((a, b) => a.slot_index - b.slot_index);

  const main =
    sorted.find((a) => a.slot_index === 0) || { slot_index: 0 };
  const topRight =
    sorted.find((a) => a.slot_index === 1) || { slot_index: 1 };
  const bottomRight =
    sorted.find((a) => a.slot_index === 2) || { slot_index: 2 };

  const titleAsset =
    sorted.find((a) => a.slot_index === 99) || { slot_index: 99 };

  const handlePlaceImage = async (asset: Asset, slotIndex: number) => {
    if (!selectedImage?.file_path || loadingSlot !== null || isExport) return; // ✅ SAFE

    try {
      setLoadingSlot(slotIndex);

      const { data: signed, error } = await supabase.storage
        .from('library-media')
        .createSignedUrl(selectedImage.file_path, 60 * 60 * 24 * 30);

      if (error) throw error;

      onUpdateAsset({
        ...asset,
        slot_index: slotIndex,
        asset_id: selectedImage.id,
        url: signed?.signedUrl || '',
        rotation: selectedImage.rotation ?? 0,
      });

      clearSelectedImage();
    } catch (err) {
      console.error(`TRIO COVER IMAGE ERROR (slot ${slotIndex}):`, err);
    } finally {
      setLoadingSlot(null);
    }
  };

  const renderImageSlot = (
    asset: Asset,
    slotIndex: number,
    label: string
  ) => {
    const hasImage = !!asset.url;
    const isLoading = loadingSlot === slotIndex;

    return (
      <div
        onClick={!isExport && selectedImage ? () => handlePlaceImage(asset, slotIndex) : undefined}
        onMouseEnter={() => setHoveredSlot(slotIndex)}
        onMouseLeave={() => setHoveredSlot(null)}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 6,
          overflow: 'hidden',
          border: hasImage ? 'none' : '2px dashed #D1D5DB',
          cursor: !isExport && selectedImage ? 'pointer' : 'default',
          background: selectedImage && !hasImage ? '#FBF6EA' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hasImage
            ? '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
            : 'none',
        }}
      >
        {hasImage ? (
          <>
            {isExport ? (
              // 🔥 PDF MODE
              <img
                src={asset.url}
                alt={label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: `rotate(${asset.rotation ?? 0}deg)`,
                }}
              />
            ) : (
              // 🔥 UI MODE (smooth like library)
              <Image
                src={asset.url || ''}
                alt={label}
                fill
                sizes="100%"
                quality={90}
                className={`object-cover transition-opacity duration-300 ${
                  loadedMap[slotIndex] ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transform: `rotate(${asset.rotation ?? 0}deg)`,
                  transition: 'transform 0.25s ease',
                }}
                onLoadingComplete={() =>
                  setLoadedMap((prev) => ({ ...prev, [slotIndex]: true }))
                }
              />
            )}

            {!isExport && selectedImage && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#1A1714',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {isLoading ? 'Placing...' : 'Replace'}
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
              fontSize: 11,
              fontWeight: 500,
              color: selectedImage ? '#B8860B' : '#A39B8F',
              padding: 12,
            }}
          >
            {isLoading
              ? 'Placing...'
              : selectedImage
              ? 'Click to place'
              : 'Choose an image'}
          </div>
        )}

        {!isExport && hasImage && hoveredSlot === slotIndex && !selectedImage && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateAsset({
                ...asset,
                slot_index: slotIndex,
                asset_id: undefined,
                url: undefined,
                rotation: 0,
              });
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
    );
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '5% 6%',
        fontFamily: inter.style.fontFamily,
        background: '#FDFAF5',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: '0 2% 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {isExport ? (
          <div
            style={{
              width: '100%',
              fontFamily: inter.style.fontFamily,
              fontSize: 20,
              fontWeight: 800,
              color: '#0F1A2E',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'left',
              lineHeight: 1.25,
              wordBreak: 'break-word',
            }}
          >
            {titleAsset.subheading || ''}
          </div>
        ) : (
          <input
            value={titleAsset.subheading || ''}
            placeholder="Your Book Title"
            maxLength={40}
            onChange={(e) => {
              if (e.target.value.length > 40) return;
              onUpdateAsset({
                ...titleAsset,
                slot_index: 99,
                subheading: e.target.value,
              });
            }}
            style={{
              width: '100%',
              fontFamily: inter.style.fontFamily,
              fontSize: 20,
              fontWeight: 800,
              color: '#0F1A2E',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'left',
              lineHeight: 1.25,
              border: 'none',
              outline: 'none',
              background: 'transparent',
            }}
          />
        )}

        {isExport ? (
          <div
            style={{
              width: '100%',
              fontFamily: inter.style.fontFamily,
              fontSize: 10,
              fontWeight: 600,
              color: '#d4af37',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'left',
              wordBreak: 'break-word',
            }}
          >
            {titleAsset.comment || ''}
          </div>
        ) : (
          <input
            value={titleAsset.comment || ''}
            placeholder="A subtitle or date"
            maxLength={30}
            onChange={(e) => {
              if (e.target.value.length > 30) return;
              onUpdateAsset({
                ...titleAsset,
                slot_index: 99,
                comment: e.target.value,
              });
            }}
            style={{
              width: '100%',
              fontFamily: inter.style.fontFamily,
              fontSize: 10,
              fontWeight: 600,
              color: '#d4af37',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'left',
              border: 'none',
              outline: 'none',
              background: 'transparent',
            }}
          />
        )}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 8,
        }}
      >
        <div style={{ gridRow: '1 / 3', gridColumn: '1' }}>
          {renderImageSlot(main, 0, 'Main image')}
        </div>

        <div style={{ gridRow: '1', gridColumn: '2' }}>
          {renderImageSlot(topRight, 1, 'Top image')}
        </div>

        <div style={{ gridRow: '2', gridColumn: '2' }}>
          {renderImageSlot(bottomRight, 2, 'Bottom image')}
        </div>
      </div>
    </div>
  );
}