'use client';

import Slot from '../Slot';
import type { Asset, SelectedImage } from '@/types/memory-book';

export default function GridLayout({
  assets,
  pageId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false, // ✅ ADDED
}: {
  assets: Asset[];
  pageId: string;
  onUpdateAsset: (asset: Asset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  isExport?: boolean; // ✅ ADDED
}) {
  const sorted = [...assets].sort((a, b) => a.slot_index - b.slot_index);

  const slots = [0, 1, 2, 3].map((i) => {
    return sorted.find((a) => a.slot_index === i) || { slot_index: i };
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 8,
        height: '100%',
        padding: '3% 5%',
      }}
    >
      {slots.map((slot, i) => (
        <div key={i} style={{ minHeight: 0, overflow: 'hidden', borderRadius: 6 }}>
          <Slot
            pageId={pageId}
            asset={slot}
            selectedImage={selectedImage}
            clearSelectedImage={clearSelectedImage}
            onUpdate={onUpdateAsset}
            isExport={isExport} // ✅ ADDED
          />
        </div>
      ))}
    </div>
  );
}