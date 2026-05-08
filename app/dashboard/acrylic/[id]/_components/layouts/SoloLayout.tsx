'use client';

import Slot from '../Slot';
import type { AcrylicAsset, SelectedImage } from '@/types/acrylic-print';

export default function SoloLayout({
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

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Slot
        acrylicId={acrylicId}
        asset={slot0}
        selectedImage={selectedImage}
        clearSelectedImage={clearSelectedImage}
        onUpdate={onUpdateAsset}
        isExport={isExport}
      />
    </div>
  );
}