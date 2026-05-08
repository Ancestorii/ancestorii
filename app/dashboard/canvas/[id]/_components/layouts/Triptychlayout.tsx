'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

export default function TriptychLayout({
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
  const slots = [0, 1, 2].map(
    (i) => assets.find((a) => a.slot_index === i) || { slot_index: i }
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
      {slots.map((slot) => (
        <div key={slot.slot_index} style={{ flex: 1, minWidth: 0 }}>
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