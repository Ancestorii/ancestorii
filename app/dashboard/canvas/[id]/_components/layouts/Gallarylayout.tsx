'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Gallery — 7 images in museum-style rows.
 * Heritage landscape (24×72″).
 * Top row: 3 wider images (55% height).
 * Bottom row: 4 narrower images.
 */
export default function GalleryLayout({
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
  const slots = Array.from({ length: 7 }, (_, i) =>
    assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

  const topRow = slots.slice(0, 3);
  const bottomRow = slots.slice(3, 7);

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
      {/* Top row — 3 wider (55% height) */}
      <div style={{ flex: '0 0 55%', display: 'flex', gap: 0, minHeight: 0 }}>
        {topRow.map((slot) => (
          <div key={slot.slot_index} style={{ flex: 1, minWidth: 0 }}>
            <Slot canvasId={canvasId} asset={slot} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
          </div>
        ))}
      </div>
      {/* Bottom row — 4 narrower */}
      <div style={{ flex: 1, display: 'flex', gap: 0, minHeight: 0 }}>
        {bottomRow.map((slot) => (
          <div key={slot.slot_index} style={{ flex: 1, minWidth: 0 }}>
            <Slot canvasId={canvasId} asset={slot} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
          </div>
        ))}
      </div>
    </div>
  );
}