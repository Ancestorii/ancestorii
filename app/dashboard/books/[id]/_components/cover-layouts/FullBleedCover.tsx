'use client';

import { useState } from 'react';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';
import Image from 'next/image';

export default function FullBleedCoverLayout({
  assets,
  pageId,
  showTitle = true,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false, // ✅ ADDED
}: {
  assets: Asset[];
  pageId: string;
  showTitle?: boolean;
  onUpdateAsset: (asset: Asset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean; // ✅ ADDED
}) {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const sorted = [...assets].sort((a, b) => a.slot_index - b.slot_index);

  const image =
    sorted.find((a) => a.slot_index === 0) || { slot_index: 0 };

  const titleAsset =
    sorted.find((a) => a.slot_index === 99) || { slot_index: 99 };

  const handlePlaceCoverImage = async () => {
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
      });

      clearSelectedImage();
    } catch (err) {
      console.error('BLEED COVER IMAGE ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: inter.style.fontFamily,
        background: '#FDFAF5',
        padding: '5% 6% 0',
      }}
    >
      <div
        onClick={!isExport && selectedImage ? handlePlaceCoverImage : undefined} // ✅ SAFE
        style={{
          flex: '0 0 75%',
          minHeight: 0,
          overflow: 'hidden',
          borderRadius: 6,
          cursor: !isExport && selectedImage ? 'pointer' : 'default',
          background: selectedImage && !image.url ? '#FBF6EA' : 'transparent',
          border: image.url ? 'none' : '2px dashed #D1D5DB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: image.url
            ? '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
            : 'none',
        }}
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
                  objectPosition: 'center',
                  display: 'block',
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
  onLoadingComplete={() => setLoaded(true)}
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
                    padding: '10px 20px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#1A1714',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {loading ? 'Placing...' : 'Click to replace'}
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
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

      {showTitle && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 2%',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 30,
              height: 3,
              background: '#d4af37',
              borderRadius: 2,
              marginBottom: 2,
            }}
          />

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
      )}
    </div>
  );
}