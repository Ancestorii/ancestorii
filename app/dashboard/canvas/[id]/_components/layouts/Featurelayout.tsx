'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

export default function FeatureLayout({
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
  const supporting = [1, 2, 3].map(
    (i) => assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

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
      {/* Hero — 58% */}
      <div style={{ flex: '0 0 58%', minHeight: 0 }}>
        <Slot canvasId={canvasId} asset={slot0} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
      </div>
      {/* Three supporting */}
      <div style={{ flex: 1, display: 'flex', gap: 0, minHeight: 0 }}>
        {supporting.map((slot) => (
          <div key={slot.slot_index} style={{ flex: 1, minWidth: 0 }}>
            <Slot canvasId={canvasId} asset={slot} selectedImage={selectedImage} clearSelectedImage={clearSelectedImage} onUpdate={onUpdateAsset} isExport={isExport} />
          </div>
        ))}
      </div>
    </div>
  );
}