'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Timeline — 6 images in a chronological strip.
 * Heritage landscape (24×72″ = extremely wide).
 * Alternating vertical offset for rhythm.
 */
export default function TimelineLayout({
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
  const slots = Array.from({ length: 6 }, (_, i) =>
    assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        height: '100%',
        padding: 0,
      }}
    >
      {slots.map((slot, i) => (
        <div
          key={slot.slot_index}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            paddingTop: i % 2 === 0 ? '0%' : '8%',
            paddingBottom: i % 2 === 0 ? '8%' : '0%',
          }}
        >
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
        </div>
      ))}
    </div>
  );
}