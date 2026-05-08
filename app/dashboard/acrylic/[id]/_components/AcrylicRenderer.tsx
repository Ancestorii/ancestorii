'use client';

import type { AcrylicAsset, SelectedImage, LayoutType } from '@/types/acrylic-print';

import SoloLayout from './layouts/SoloLayout';
import DuoLayout from './layouts/DuoLayout';
import GridLayout from './layouts/GridLayout';

export default function AcrylicRenderer({
  layout,
  assets,
  acrylicId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  onPickLayout,
  isExport = false,
}: {
  layout: LayoutType;
  assets: AcrylicAsset[];
  acrylicId: string;
  onUpdateAsset: (asset: AcrylicAsset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  onPickLayout: () => void;
  isExport?: boolean;
}) {
  const sortedAssets = [...assets].sort((a, b) => a.slot_index - b.slot_index);

  if (!layout) {
    return (
      <button
        type="button"
        onClick={onPickLayout}
        className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 text-center transition hover:border-[#E6C26E]"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          color: '#6B6358',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          background: 'transparent',
        }}
      >
        Pick a layout
      </button>
    );
  }

  const shared = {
    assets: sortedAssets,
    acrylicId,
    onUpdateAsset,
    selectedImage,
    clearSelectedImage,
    isExport,
  };

  switch (layout) {
    case 'solo':
      return <SoloLayout {...shared} />;

    case 'duo':
      return <DuoLayout {...shared} />;

    case 'grid':
      return <GridLayout {...shared} />;

    default:
      return (
        <div className="text-center text-sm text-gray-400">
          Unknown layout
        </div>
      );
  }
}