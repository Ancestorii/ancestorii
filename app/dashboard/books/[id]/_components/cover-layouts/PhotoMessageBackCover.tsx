'use client';

import { useState } from 'react';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';
import Image from 'next/image'; // ✅ ADDED

export default function PhotoMessageBackCover({
  assets,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false, // ✅ ADDED
}: {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean; // ✅ ADDED
}) {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const sorted = [...assets].sort((a, b) => a.slot_index - b.slot_index);

  const image =
    sorted.find((a) => a.slot_index === 0) || { slot_index: 0 };

  const titleAsset =
    sorted.find((a) => a.slot_index === 99) || { slot_index: 99 };

  const handlePlaceImage = async () => {
    if (!selectedImage?.file_path || loading || isExport) return; // ✅ SAFE

    try {
      setLoading(true);

      const { data: signed, error } = await supabase.storage
        .from('library-media')
        .createSignedUrl(selectedImage.file_path, 60 * 60 * 24 * 30);

      if (error) throw error;

      onUpdateAsset({
        ...image,
        slot_index: 0,
        asset_id: selectedImage.id,
        url: signed?.signedUrl || '',
        rotation: selectedImage.rotation ?? 0,
      });

      clearSelectedImage();
    } catch (err) {
      console.error('BACK COVER IMAGE ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#FDFAF5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8% 18%',
        fontFamily: inter.style.fontFamily,
        textAlign: 'center',
        gap: 12,
        position: 'relative',
      }}
    >
      <div
        onClick={!isExport && selectedImage ? handlePlaceImage : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 120,
          aspectRatio: '1 / 1',
          borderRadius: 10,
          overflow: 'hidden',
          flexShrink: 0,
          cursor: !isExport && selectedImage ? 'pointer' : 'default',
          border: image.url ? 'none' : '2px dashed #D1D5DB',
          background: selectedImage && !image.url ? '#FBF6EA' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: image.url
            ? '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
            : 'none',
          position: 'relative',
        }}
      >
        {image.url ? (
          isExport ? (
            // 🔥 PDF MODE
            <img
              src={image.url}
              alt="Back cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transform: `rotate(${image.rotation ?? 0}deg)`,
              }}
            />
          ) : (
            // 🔥 UI MODE (smooth)
            <Image
              src={image.url!}
              alt="Back cover"
              fill
              sizes="120px"
              quality={90}
              className={`object-cover transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `rotate(${image.rotation ?? 0}deg)`,
                transition: 'transform 0.25s ease',
              }}
              onLoadingComplete={() => setLoaded(true)}
            />
          )
        ) : (
          <div
            style={{
              fontSize: 9,
              fontWeight: 500,
              color: selectedImage ? '#B8860B' : '#A39B8F',
            }}
          >
            {loading ? 'Placing...' : selectedImage ? 'Click to place' : 'Add photo'}
          </div>
        )}

        {!isExport && hovered && image.url && !selectedImage && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateAsset({
                ...image,
                slot_index: 0,
                asset_id: undefined,
                url: undefined,
                rotation: 0,
              });
            }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              borderRadius: 99,
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              color: '#fff',
              fontSize: 12,
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

      <div
        style={{
          width: 30,
          height: 3,
          background: '#d4af37',
          borderRadius: 2,
        }}
      />

      {isExport ? (
        <div
          style={{
            width: '100%',
            fontFamily: inter.style.fontFamily,
            fontSize: 16,
            fontWeight: 800,
            color: '#0F1A2E',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {titleAsset.subheading || ''}
        </div>
      ) : (
        <input
          value={titleAsset.subheading || ''}
          placeholder="With love, always"
          maxLength={30}
          onChange={(e) => {
            if (e.target.value.length > 30) return;
            onUpdateAsset({
              ...titleAsset,
              slot_index: 99,
              subheading: e.target.value,
            });
          }}
          style={{
            width: '100%',
            fontFamily: inter.style.fontFamily,
            fontSize: 16,
            fontWeight: 800,
            color: '#0F1A2E',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.3,
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
            fontSize: 11,
            fontWeight: 400,
            color: '#1A1714',
            lineHeight: 1.5,
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          {titleAsset.comment || ''}
        </div>
      ) : (
        <textarea
          value={titleAsset.comment || ''}
          placeholder="A short personal message"
          maxLength={150}
          onChange={(e) => {
            if (e.target.value.length > 150) return;
            onUpdateAsset({
              ...titleAsset,
              slot_index: 99,
              comment: e.target.value,
            });
          }}
          rows={3}
          style={{
            width: '100%',
            fontFamily: inter.style.fontFamily,
            fontSize: 11,
            fontWeight: 400,
            color: '#1A1714',
            lineHeight: 1.5,
            textAlign: 'center',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            overflow: 'hidden',
          }}
        />
      )}

      <span
        style={{
          fontSize: 7,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#d4af37',
          opacity: 0.5,
          position: 'absolute',
          bottom: '8%',
        }}
      >
        Made with Ancestorii
      </span>
    </div>
  );
}