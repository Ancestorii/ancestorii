'use client';

import Slot from '../Slot';
import type { CanvasAsset, SelectedImage } from '@/types/memory-canvas';

/**
 * Mosaic — irregular asymmetric grid.
 * 5 slots (heirloom): 2 large left + 3 stacked right.
 * 10 slots (heritage): 2 rows of 5 with varying widths.
 */
export default function MosaicLayout({
  assets,
  canvasId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  isExport = false,
  slotCount = 5,
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

  const slotProps = (s: CanvasAsset) => ({
    canvasId,
    asset: s,
    selectedImage,
    clearSelectedImage,
    onUpdate: onUpdateAsset,
    isExport,
  });

  /* ── 5-slot (heirloom) ── */
  if (slotCount <= 5) {
    return (
      <div style={{ display: 'flex', gap: 0, height: '100%', padding: 0 }}>
        {/* Left — 2 stacked, 55% width */}
        <div style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
          <div style={{ flex: '0 0 60%', minHeight: 0 }}>
            <Slot {...slotProps(slots[0])} />
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Slot {...slotProps(slots[1])} />
          </div>
        </div>
        {/* Right — 3 stacked */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
          {[slots[2], slots[3], slots[4]].map((s) => (
            <div key={s.slot_index} style={{ flex: 1, minHeight: 0 }}>
              <Slot {...slotProps(s)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── 10-slot (heritage) ── */
  const topRow = slots.slice(0, 5);
  const bottomRow = slots.slice(5, 10);
  const topFlex = ['0 0 30%', '0 0 20%', '0 0 25%', '1', '0 0 15%'];
  const botFlex = ['0 0 15%', '0 0 25%', '0 0 20%', '1', '0 0 20%'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%', padding: 0 }}>
      <div style={{ flex: 1, display: 'flex', gap: 0, minHeight: 0 }}>
        {topRow.map((s, i) => (
          <div key={s.slot_index} style={{ flex: topFlex[i], minWidth: 0 }}>
            <Slot {...slotProps(s)} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 0, minHeight: 0 }}>
        {bottomRow.map((s, i) => (
          <div key={s.slot_index} style={{ flex: botFlex[i], minWidth: 0 }}>
            <Slot {...slotProps(s)} />
          </div>
        ))}
      </div>
    </div>
  );
}