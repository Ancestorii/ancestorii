'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Grid — 6 equal images.
 * Pass columns=3 for landscape (3×2), columns=2 for portrait (2×3).
 */
export default function GridLayout({
  assets,
  canvasId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false,
  columns = 3,
}: {
  assets: CanvasAsset[];
  canvasId: string;
  onUpdateAsset: (asset: CanvasAsset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean;
  columns?: number;
}) {
  const slots = Array.from({ length: 6 }, (_, i) =>
    assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 0,
        height: '100%',
        padding: 0,
      }}
    >
      {slots.map((slot) => (
        <div key={slot.slot_index} style={{ minHeight: 0, minWidth: 0 }}>
          <Slot
            canvasId={canvasId}
            asset={slot}
            selectedImage={selectedImage}
            clearSelectedImage={clearSelectedImage}
            onUpdate={onUpdateAsset}
            isExport={isExport}
          />
        </div>
      ))}
    </div>
  );
}