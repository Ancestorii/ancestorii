'use client';

import Slot from '../Slot';
import type { AcrylicAsset, SelectedImage } from '@/types/acrylic-print';

export default function DuoLayout({
  assets,
  acrylicId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false,
}: {
  assets: AcrylicAsset[];
  acrylicId: string;
  onUpdateAsset: (asset: AcrylicAsset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean;
}) {
  const slot0 =
    assets.find((a) => a.slot_index === 0) || { slot_index: 0 };
  const slot1 =
    assets.find((a) => a.slot_index === 1) || { slot_index: 1 };

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        height: '100%',
        padding: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Slot
          acrylicId={acrylicId}
          asset={slot0}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          onUpdate={onUpdateAsset}
          isExport={isExport}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Slot
          acrylicId={acrylicId}
          asset={slot1}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          onUpdate={onUpdateAsset}
          isExport={isExport}
        />
      </div>
    </div>
  );
}