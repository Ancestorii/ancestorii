'use client';

import Slot from '../Slot';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';

export default function PortraitLayout({
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
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <div style={{ flex: '0 0 55%', minHeight: 0, overflow: 'hidden' }}>
        <Slot
          pageId={pageId}
          asset={asset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          onUpdate={onUpdateAsset}
          isExport={isExport} // ✅ ADDED
        />
      </div>

      {(showSubheading || showComment) && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0,
            fontFamily: inter.style.fontFamily,
            minWidth: 0,
          }}
        >
          {showSubheading && (
            isExport ? (
              // ✅ PDF MODE
              <div
                style={{
                  width: '100%',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#d4af37',
                  marginBottom: 8,
                  fontFamily: inter.style.fontFamily,
                }}
              >
                {asset.subheading || ''}
              </div>
            ) : (
              // ✅ UI MODE (UNCHANGED)
              <input
                type="text"
                placeholder="Summer 1987"
                maxLength={18}
                value={asset.subheading || ''}
                onChange={(e) => {
                  if (!asset.id) return;
                  if (e.target.value.length > 18) return;
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
                  marginBottom: 8,
                  fontFamily: inter.style.fontFamily,
                  overflow: 'hidden',
                }}
              />
            )
          )}

          {showComment && (
            isExport ? (
              // ✅ PDF MODE
              <div
                style={{
                  width: '100%',
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: '#1A1714',
                  fontFamily: inter.style.fontFamily,
                  whiteSpace: 'pre-line', // ✅ preserves line breaks
                  wordBreak: 'break-word',
                }}
              >
                {asset.comment || ''}
              </div>
            ) : (
              // ✅ UI MODE (UNCHANGED)
              <textarea
                placeholder={"When was this taken?\nWho's in this photo?\nWhat do you remember about this day?"}
                maxLength={320}
                value={asset.comment || ''}
                onChange={(e) => {
                  if (!asset.id) return;
                  if (e.target.value.length > 320) return;
                  const supabase = getBrowserClient();
                  supabase
                    .from('memory_book_page_assets')
                    .update({ comment: e.target.value })
                    .eq('id', asset.id)
                    .then();
                  onUpdateAsset({ ...asset, comment: e.target.value });
                }}
                rows={10}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  resize: 'none',
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: '#1A1714',
                  padding: 0,
                  fontFamily: inter.style.fontFamily,
                  overflow: 'hidden',
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}