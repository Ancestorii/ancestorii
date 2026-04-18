'use client';

import Slot from '../Slot';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';

export default function FeatureLayout({
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

  const hero =
    sorted.find((a) => a.slot_index === 0) || { slot_index: 0 };

  const supporting =
    sorted.find((a) => a.slot_index === 1) || { slot_index: 1 };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '3% 5%',
        gap: 10,
        fontFamily: inter.style.fontFamily,
      }}
    >
      <div style={{ flex: '0 0 55%', minHeight: 0, overflow: 'hidden', borderRadius: 6 }}>
        <Slot
          pageId={pageId}
          asset={hero}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          onUpdate={onUpdateAsset}
          isExport={isExport} // ✅ ADDED
        />
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
        <div style={{ flex: '0 0 40%', minHeight: 0, overflow: 'hidden', borderRadius: 6 }}>
          <Slot
            pageId={pageId}
            asset={supporting}
            selectedImage={selectedImage}
            clearSelectedImage={clearSelectedImage}
            onUpdate={onUpdateAsset}
            isExport={isExport} // ✅ ADDED
          />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          {showSubheading && (
            isExport ? (
              // ✅ PDF MODE
              <div
                style={{
                  width: '100%',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#d4af37',
                  marginBottom: 6,
                  fontFamily: inter.style.fontFamily,
                }}
              >
                {hero.subheading || ''}
              </div>
            ) : (
              // ✅ UI MODE (UNCHANGED)
              <input
                type="text"
                placeholder="The story behind this"
                maxLength={30}
                value={hero.subheading || ''}
                onChange={(e) => {
                  if (!hero.id) return;
                  if (e.target.value.length > 30) return;
                  const supabase = getBrowserClient();
                  supabase
                    .from('memory_book_page_assets')
                    .update({ subheading: e.target.value })
                    .eq('id', hero.id)
                    .then();
                  onUpdateAsset({ ...hero, subheading: e.target.value });
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#d4af37',
                  padding: 0,
                  marginBottom: 6,
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
                  lineHeight: 1.5,
                  color: '#1A1714',
                  fontFamily: inter.style.fontFamily,
                  wordBreak: 'break-word',
                }}
              >
                {hero.comment || ''}
              </div>
            ) : (
              // ✅ UI MODE (UNCHANGED)
              <textarea
                placeholder={"Tell the story behind this moment..."}
                maxLength={200}
                value={hero.comment || ''}
                onChange={(e) => {
                  if (!hero.id) return;
                  if (e.target.value.length > 200) return;
                  const supabase = getBrowserClient();
                  supabase
                    .from('memory_book_page_assets')
                    .update({ comment: e.target.value })
                    .eq('id', hero.id)
                    .then();
                  onUpdateAsset({ ...hero, comment: e.target.value });
                }}
                rows={4}
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
                  fontFamily: inter.style.fontFamily,
                  overflow: 'hidden',
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}