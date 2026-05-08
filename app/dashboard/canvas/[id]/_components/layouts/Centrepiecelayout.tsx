'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Centrepiece — dominant centre image flanked by 6 supporting.
 * Heritage landscape (24×72″).
 * 3 left | HERO | 3 right
 */
export default function CentrepieceLayout({
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

  const hero = slots[0];
  const leftCol = [slots[1], slots[2], slots[3]];
  const rightCol = [slots[4], slots[5], slots[6]];

  const renderColumn = (items: CanvasAsset[]) => (
    <div style={{ flex: '0 0 22%', display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
      {items.map((slot) => (
        <div key={slot.slot_index} style={{ flex: 1, minHeight: 0 }}>
          <Slot canvasId={canvasId} asset={slot} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 0, height: '100%', padding: 0 }}>
      {renderColumn(leftCol)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Slot canvasId={canvasId} asset={hero} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
      </div>
      {renderColumn(rightCol)}
    </div>
  );
}