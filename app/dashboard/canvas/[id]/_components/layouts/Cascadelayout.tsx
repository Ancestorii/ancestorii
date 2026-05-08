'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Cascade — alternating offset columns.
 * 4 slots (moment portrait) or 6 slots (heritage portrait).
 * Pass slotCount from the layout config.
 */
export default function CascadeLayout({
  assets,
  canvasId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false,
  slotCount = 4,
}: {
  assets: CanvasAsset[];
  canvasId: string;
  onUpdateAsset: (asset: CanvasAsset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean;
  slotCount?: number;
}) {
  const slots = Array.from({ length: slotCount }, (_, i) =>
    assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

  const leftSlots = slots.filter((_, i) => i % 2 === 0);
  const rightSlots = slots.filter((_, i) => i % 2 === 1);

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        height: '100%',
        padding: 0,
      }}
    >
      {/* Left column — offset down */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          paddingTop: '6%',
          minWidth: 0,
        }}
      >
        {leftSlots.map((slot) => (
          <div key={slot.slot_index} style={{ flex: 1, minHeight: 0 }}>
            <Slot canvasId={canvasId} asset={slot} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
          </div>
        ))}
      </div>
      {/* Right column — offset up */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          paddingBottom: '6%',
          minWidth: 0,
        }}
      >
        {rightSlots.map((slot) => (
          <div key={slot.slot_index} style={{ flex: 1, minHeight: 0 }}>
            <Slot canvasId={canvasId} asset={slot} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
          </div>
        ))}
      </div>
    </div>
  );
}