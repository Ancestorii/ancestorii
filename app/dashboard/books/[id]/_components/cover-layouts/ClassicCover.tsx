'use client';

import { useState, useEffect } from 'react';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';
import Image from "next/image";


export default function ClassicCoverLayout({
  assets,
  pageId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false, // ✅ add
}: {
  assets: Asset[];
  pageId: string;
  onUpdateAsset: (asset: Asset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean;
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

  const handlePlaceCoverImage = async () => {
    if (!selectedImage?.file_path || loading) return;

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
      console.error('COVER IMAGE ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  setLoaded(false);
}, [image.url]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5% 10%',
        fontFamily: inter.style.fontFamily,
        position: 'relative',
        background: '#FDFAF5',
      }}
    >
      <div
        style={{
          width: 40,
          height: 3,
          background: '#d4af37',
          borderRadius: 2,
          marginBottom: 14,
          flexShrink: 0,
        }}
      />

      {isExport ? (
  <div
    style={{
      fontFamily: inter.style.fontFamily,
      fontSize: 24,
      fontWeight: 800,
      color: '#0F1A2E',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textAlign: 'center',
      lineHeight: 1.3,
      width: '100%',
      marginBottom: 4,
      flexShrink: 0,
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
      fontFamily: inter.style.fontFamily,
      fontSize: 24,
      fontWeight: 800,
      color: '#0F1A2E',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textAlign: 'center',
      lineHeight: 1.3,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      width: '100%',
      marginBottom: 4,
      flexShrink: 0,
    }}
  />
)}

      {isExport ? (
  <div
    style={{
      fontFamily: inter.style.fontFamily,
      fontSize: 10,
      fontWeight: 600,
      color: '#d4af37',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      textAlign: 'center',
      width: '100%',
      marginBottom: 16,
      flexShrink: 0,
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
      fontFamily: inter.style.fontFamily,
      fontSize: 10,
      fontWeight: 600,
      color: '#d4af37',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      textAlign: 'center',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      width: '100%',
      marginBottom: 16,
      flexShrink: 0,
    }}
  />
)}

      <div
        onClick={selectedImage ? handlePlaceCoverImage : undefined}
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          borderRadius: 6,
          overflow: 'hidden',
          cursor: selectedImage ? 'pointer' : 'default',
        background: selectedImage ? '#FBF6EA' : 'transparent',
        border: image.url ? 'none' : '2px dashed #D1D5DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: image.url
          ? '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
          : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {image.url ? (
        <>
            {isExport ? (
  // 🔥 PDF MODE
  <img
    src={image.url}
    alt="Cover"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      transform: `rotate(${image.rotation ?? 0}deg)`,
    }}
  />
) : (
  // 🔥 UI MODE
  <Image
  src={image.url}
  alt="Cover"
  fill
  sizes="100%"
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
)}

            {selectedImage && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(251, 246, 234, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: inter.style.fontFamily,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#8B6B14',
                }}
              >
                {loading ? 'Placing...' : 'Click to replace'}
              </div>
            )}

            {!isExport && hovered && !selectedImage && (
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
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
              fontSize: 12,
              fontWeight: 500,
              color: selectedImage ? '#B8860B' : '#A39B8F',
            }}
          >
            {loading
              ? 'Placing...'
              : selectedImage
              ? 'Click to place cover image'
              : 'Choose a cover image'}
          </div>
        )}
      </div>

      <div
        style={{
          width: 40,
          height: 3,
          background: '#d4af37',
          borderRadius: 2,
          marginTop: 14,
          flexShrink: 0,
        }}
      />
    </div>
  );
}