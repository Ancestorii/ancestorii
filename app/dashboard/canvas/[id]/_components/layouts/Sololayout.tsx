'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

export default function SoloLayout({
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

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Slot
        canvasId={canvasId}
        asset={slot0}
        selectedImage={selectedImage}
        clearSelectedImage={clearSelectedImage}
        onUpdate={onUpdateAsset}
        isExport={isExport}
      />
    </div>
  );
}