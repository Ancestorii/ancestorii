'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Tower — 5 images stacked vertically.
 * Heritage portrait (24×72″ flipped = very tall).
 * Alternating heights: hero(2) · small(1) · medium(1.5) · small(1) · hero(2).
 */
export default function TowerLayout({
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
  const slots = Array.from({ length: 5 }, (_, i) =>
    assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

  const weights = [2, 1, 1.5, 1, 2];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        height: '100%',
        padding: 0,
      }}
    >
      {slots.map((slot, i) => (
        <div key={slot.slot_index} style={{ flex: weights[i], minHeight: 0 }}>
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