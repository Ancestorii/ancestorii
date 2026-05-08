'use client';

import Slot from '../Slot';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Journal — 2 slots.
 * Slot 0 = image (top 60%).
 * Slot 1 = unused as image; its caption field is the body text.
 * Slot 0's caption is the title.
 */
export default function JournalLayout({
  assets,
  canvasId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false,
}: {
  assets: CanvasAsset[];
  canvasId: string;
  onUpdateAsset: (asset: CanvasAsset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean;
}) {
  const slot0 =
    assets.find((a) => a.slot_index === 0) || { slot_index: 0 };
  const slot1 =
    assets.find((a) => a.slot_index === 1) || { slot_index: 1 };

  const handleCaptionSave = async (
  slot: CanvasAsset,
  caption: string
) => {
  onUpdateAsset({ ...slot, caption });
  const supabase = getBrowserClient();
  if (slot.id) {
    supabase
      .from('memory_canvas_assets')
      .update({ caption })
      .eq('id', slot.id)
      .then();
  } else {
    supabase
      .from('memory_canvas_assets')
      .upsert(
        { canvas_id: canvasId, slot_index: slot.slot_index, caption },
        { onConflict: 'canvas_id,slot_index' }
      )
      .select()
      .maybeSingle()
      .then(({ data }) => {
        if (data) onUpdateAsset({ ...slot, id: data.id, caption });
      });
  }
};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 0,
        gap: 0,
        fontFamily: inter.style.fontFamily,
      }}
    >
      {/* Image — 60% */}
      <div style={{ flex: '0 0 60%', minHeight: 0 }}>
        <Slot
          canvasId={canvasId}
          asset={slot0}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          onUpdate={onUpdateAsset}
          isExport={isExport}
        />
      </div>

      {/* Caption area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: 30,
            height: 2,
            background: '#d4af37',
            borderRadius: 2,
            marginBottom: 4,
          }}
        />

        {/* Title (slot 0 caption) */}
        {isExport ? (
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#d4af37',
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
            }}
          >
            {slot0.caption || ''}
          </div>
        ) : (
          <input
            value={slot0.caption || ''}
            placeholder="A title for this moment"
            maxLength={40}
            onChange={(e) => {
              if (e.target.value.length > 40) return;
              handleCaptionSave(slot0, e.target.value);
            }}
            style={{
              width: '100%',
              maxWidth: 280,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#d4af37',
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
            }}
          />
        )}

        {/* Body (slot 1 caption) */}
        {isExport ? (
          <div
            style={{
              fontSize: 11,
              fontWeight: 400,
              lineHeight: 1.5,
              color: '#1A1714',
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
              wordBreak: 'break-word',
              maxWidth: 280,
            }}
          >
            {slot1.caption || ''}
          </div>
        ) : (
          <textarea
            value={slot1.caption || ''}
            placeholder="Tell the story behind this moment…"
            maxLength={200}
            onChange={(e) => {
              if (e.target.value.length > 200) return;
              handleCaptionSave(
                { ...slot1, slot_index: 1 },
                e.target.value
              );
            }}
            rows={3}
            style={{
              width: '100%',
              maxWidth: 280,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              resize: 'none',
              fontSize: 11,
              fontWeight: 400,
              lineHeight: 1.5,
              color: '#1A1714',
              textAlign: 'center',
              fontFamily: inter.style.fontFamily,
            }}
          />
        )}

        <div
          style={{
            width: 30,
            height: 2,
            background: '#d4af37',
            borderRadius: 2,
            marginTop: 4,
          }}
        />
      </div>
    </div>
  );
}