'use client';

import Slot from '../Slot';
import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Generations — three portrait frames stacked vertically.
 * Heritage portrait (24×72″).
 * Each slot includes a caption for the name / generation.
 */
export default function GenerationsLayout({
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
  const slots = Array.from({ length: 3 }, (_, i) =>
    assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

  const handleCaptionSave = (slot: CanvasAsset, caption: string) => {
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
        gap: 0,
        height: '100%',
        padding: 0,
        fontFamily: inter.style.fontFamily,
      }}
    >
      {slots.map((slot) => (
        <div
          key={slot.slot_index}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {/* Image */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <Slot
              canvasId={canvasId}
              asset={slot}
              selectedImage={selectedImage}
              clearSelectedImage={clearSelectedImage}
              onUpdate={onUpdateAsset}
              isExport={isExport}
            />
          </div>

          {/* Caption */}
          {isExport ? (
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#d4af37',
                textAlign: 'center',
                fontFamily: inter.style.fontFamily,
              }}
            >
              {slot.caption || ''}
            </div>
          ) : (
            <input
              value={slot.caption || ''}
              placeholder="Name or generation"
              maxLength={30}
              onChange={(e) => {
                if (e.target.value.length > 30) return;
                handleCaptionSave(slot, e.target.value);
              }}
              style={{
                marginTop: 6,
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#d4af37',
                textAlign: 'center',
                fontFamily: inter.style.fontFamily,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}