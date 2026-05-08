'use client';

import Slot from '../Slot';
import type { AcrylicAsset, SelectedImage } from '@/types/acrylic-print';

export default function GridLayout({
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
  const slots = [0, 1, 2, 3].map(
    (i) => assets.find((a) => a.slot_index === i) || { slot_index: i }
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        height: '100%',
        padding: 0,
      }}
    >
      {slots.map((slot) => (
        <div key={slot.slot_index} style={{ minHeight: 0, minWidth: 0 }}>
          <Slot
            acrylicId={acrylicId}
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