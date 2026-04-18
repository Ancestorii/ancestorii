'use client';

import Slot from '../Slot';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';

export default function LandscapeLayout({
  assets,
  pageId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  showSubheading = true,
  showComment = true,
  isExport = false, // ✅ ADDED
}: {
  assets: Asset[];
  pageId: string;
  onUpdateAsset: (asset: Asset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  showSubheading?: boolean;
  showComment?: boolean;
  isExport?: boolean; // ✅ ADDED
}) {
  const sorted = [...assets].sort((a, b) => a.slot_index - b.slot_index);

  const asset =
    sorted.find((a) => a.slot_index === 0) || { slot_index: 0 };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: inter.style.fontFamily,
        padding: '4% 10%',
      }}
    >
      {showSubheading && (
        <div style={{ flexShrink: 0, marginBottom: 12, textAlign: 'center' }}>
          {isExport ? (
            // ✅ PDF MODE
            <div
              style={{
                width: '100%',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#d4af37',
                textAlign: 'center',
                fontFamily: inter.style.fontFamily,
              }}
            >
              {asset.subheading || ''}
            </div>
          ) : (
            // ✅ UI MODE (UNCHANGED)
            <input
              type="text"
              placeholder="Our First Holiday"
              maxLength={25}
              value={asset.subheading || ''}
              onChange={(e) => {
                if (!asset.id) return;
                if (e.target.value.length > 25) return;
                const supabase = getBrowserClient();
                supabase
                  .from('memory_book_page_assets')
                  .update({ subheading: e.target.value })
                  .eq('id', asset.id)
                  .then();
                onUpdateAsset({ ...asset, subheading: e.target.value });
              }}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#d4af37',
                padding: 0,
                textAlign: 'center',
                fontFamily: inter.style.fontFamily,
                overflow: 'hidden',
              }}
            />
          )}
        </div>
      )}

      <div style={{ flex: '0 0 75%', minHeight: 0, overflow: 'hidden', width: '100%', borderRadius: 8 }}>
        <Slot
          pageId={pageId}
          asset={asset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          onUpdate={onUpdateAsset}
          isExport={isExport} // ✅ ADDED
        />
      </div>

      {showComment && (
        <div style={{ flexShrink: 0, marginTop: 12, textAlign: 'center' }}>
          {isExport ? (
            // ✅ PDF MODE
            <div
              style={{
                width: '100%',
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 1.5,
                color: '#1A1714',
                textAlign: 'center',
                fontFamily: inter.style.fontFamily,
                wordBreak: 'break-word',
              }}
            >
              {asset.comment || ''}
            </div>
          ) : (
            // ✅ UI MODE (UNCHANGED)
            <textarea
              placeholder={"Where was this? What made this moment special?"}
              maxLength={210}
              value={asset.comment || ''}
              onChange={(e) => {
                if (!asset.id) return;
                if (e.target.value.length > 210) return;
                const supabase = getBrowserClient();
                supabase
                  .from('memory_book_page_assets')
                  .update({ comment: e.target.value })
                  .eq('id', asset.id)
                  .then();
                onUpdateAsset({ ...asset, comment: e.target.value });
              }}
              rows={3}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                resize: 'none',
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 1.5,
                color: '#1A1714',
                padding: 0,
                textAlign: 'center',
                fontFamily: inter.style.fontFamily,
                overflow: 'hidden',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}