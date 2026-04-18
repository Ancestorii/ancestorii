'use client';

import type { Asset, SelectedImage, LayoutType } from '@/types/memory-book';
import PortraitLayout from './layouts/PortraitLayout';
import DuoLayout from './layouts/DuoLayout';
import GridLayout from './layouts/GridLayout';
import FeatureLayout from './layouts/FeatureLayout';
import LandscapeLayout from './layouts/LandscapeLayout';

export default function PageRenderer({
  layout,
  assets,
  pageId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  onPickLayout,
  showSubheading = true,
  showComment = true,
  isExport = false,
}: {
  layout: LayoutType;
  assets: Asset[];
  pageId: string;
  onUpdateAsset: (asset: Asset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  onPickLayout: (pageId: string) => void;
  showSubheading?: boolean;
  showComment?: boolean;
  isExport?: boolean;
}) {
  const sortedAssets = [...assets].sort((a, b) => a.slot_index - b.slot_index);
  const hasLayout = !!layout;

  if (!hasLayout) {
    return (
      <button
        type="button"
        onClick={() => onPickLayout(pageId)}
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

  switch (layout) {
    case 'portrait_layout':
      return (
        <PortraitLayout
          assets={sortedAssets}
          pageId={pageId}
          onUpdateAsset={onUpdateAsset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          showSubheading={showSubheading}
          showComment={showComment}
          isExport={isExport}
        />
      );

    case 'landscape_layout':
      return (
        <LandscapeLayout
          assets={sortedAssets}
          pageId={pageId}
          onUpdateAsset={onUpdateAsset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          showSubheading={showSubheading}
          showComment={showComment}
          isExport={isExport}
        />
      );

    case 'duo_layout':
      return (
        <DuoLayout
          assets={sortedAssets}
          pageId={pageId}
          onUpdateAsset={onUpdateAsset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          showSubheading={showSubheading}
          showComment={showComment}
          isExport={isExport}
        />
      );

    case 'grid_layout':
      return (
        <GridLayout
          assets={sortedAssets}
          pageId={pageId}
          onUpdateAsset={onUpdateAsset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          isExport={isExport}
        />
      );

    case 'feature_layout':
      return (
        <FeatureLayout
          assets={sortedAssets}
          pageId={pageId}
          onUpdateAsset={onUpdateAsset}
          selectedImage={selectedImage}
          clearSelectedImage={clearSelectedImage}
          showSubheading={showSubheading}
          showComment={showComment}
          isExport={isExport}
        />
      );

    default:
      return (
        <div className="text-center text-sm text-gray-400">
          Unknown layout
        </div>
      );
  }
}