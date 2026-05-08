'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

export default function Hero2Layout({
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
  const slot2 =
    assets.find((a) => a.slot_index === 2) || { slot_index: 2 };

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
      {/* Hero — 55% */}
      <div style={{ flex: '0 0 55%', minHeight: 0 }}>
        <Slot canvasId={canvasId} asset={slot0} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
      </div>
      {/* Two below */}
      <div style={{ flex: 1, display: 'flex', gap: 0, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Slot canvasId={canvasId} asset={slot1} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Slot canvasId={canvasId} asset={slot2} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
        </div>
      </div>
    </div>
  );
}