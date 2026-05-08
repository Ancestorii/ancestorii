'use client';

import Slot from '../Slot';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset, SelectedImage } from '@/types/memory-book';
import { safeToast as toast } from '@/lib/safeToast';

export default function DuoLayout({
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

  const slot0 =
    sorted.find((a) => a.slot_index === 0) || { slot_index: 0 };

  const slot1 =
    sorted.find((a) => a.slot_index === 1) || { slot_index: 1 };

  const renderSlotWithText = (asset: Asset) => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        fontFamily: inter.style.fontFamily,
      }}
    >
      <div style={{ flex: '0 0 75%', minHeight: 0, overflow: 'hidden', borderRadius: 6 }}>
        <Slot
          pageId={pageId}
          asset={asset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          onUpdate={onUpdateAsset}
          isExport={isExport} // ✅ ADDED
        />
      </div>

      {showSubheading && (
        isExport ? (
          // ✅ PDF MODE
          <div
            style={{
              width: '100%',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#d4af37',
              marginTop: 8,
              marginBottom: 6,
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
            }}
          >
            {asset.subheading || ''}
          </div>
        ) : (
          // ✅ UI MODE (UNCHANGED)
          <textarea
            ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
            placeholder="A moment to remember"
            onFocus={(e) => { if (!asset.id) { e.target.blur(); toast.info ('Place a photo to start writing'); } }}
            value={asset.subheading || ''}
            onChange={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
              if (!asset.id) return;
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
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#d4af37',
              padding: 0,
              marginTop: 8,
              marginBottom: 6,
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
              overflow: 'hidden',
              flexShrink: 0,
              resize: 'none',
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
              fontSize: 10,
              fontWeight: 400,
              lineHeight: 1.4,
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
            placeholder="What do you remember?"
            onFocus={(e) => { if (!asset.id) { e.target.blur(); toast.info ('Place a photo to start writing'); } }}
            maxLength={180}
            value={asset.comment || ''}
            onChange={(e) => {
              if (!asset.id) return;
              if (e.target.value.length > 180) return;
              const supabase = getBrowserClient();
              supabase
                .from('memory_book_page_assets')
                .update({ comment: e.target.value })
                .eq('id', asset.id)
                .then();
              onUpdateAsset({ ...asset, comment: e.target.value });
            }}
            rows={4}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              resize: 'none',
              fontSize: 10,
              fontWeight: 400,
              lineHeight: 1.4,
              color: '#1A1714',
              padding: 0,
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          />
        )
      )}
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        height: '100%',
        padding: '3% 5%',
      }}
    >
      {renderSlotWithText(slot0)}
      {renderSlotWithText(slot1)}
    </div>
  );
}