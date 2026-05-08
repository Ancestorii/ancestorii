'use client';

import type { CanvasAsset, SelectedImage, LayoutType } from '@/types/memory-canvas';

import SoloLayout from './layouts/Sololayout';
import DuoLayout from './layouts/Duolayout';
import TriptychLayout from './layouts/Triptychlayout';
import HighlightLayout from './layouts/Highlightlayout';
import FilmstripLayout from './layouts/Filmstriplayout';
import StoryboardLayout from './layouts/Storyboardlayout';
import StackLayout from './layouts/Stacklayout';
import Hero2Layout from './layouts/Hero2layout';
import CascadeLayout from './layouts/Cascadelayout';
import JournalLayout from './layouts/Journallayout';
import GridLayout from './layouts/Gridlayout';
import FeatureLayout from './layouts/Featurelayout';
import MosaicLayout from './layouts/Mosaiclayout';
import TimelineLayout from './layouts/Timelinelayout';
import GalleryLayout from './layouts/Gallarylayout';
import CentrepieceLayout from './layouts/Centrepiecelayout';
import TowerLayout from './layouts/Towerlayout';
import GenerationsLayout from './layouts/Generationslayout';

export default function CanvasRenderer({
  layout,
  assets,
  canvasId,
  onUpdateAsset,
  selectedImage,
  clearSelectedImage,
  onPickLayout,
  tierKey,
  orientation,
  isExport = false,
}: {
  layout: LayoutType;
  assets: CanvasAsset[];
  canvasId: string;
  onUpdateAsset: (asset: CanvasAsset) => void;
  selectedImage: SelectedImage | null;
  clearSelectedImage: () => void;
  onPickLayout: () => void;
  tierKey: string;
  orientation: string;
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
    canvasId,
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

    case 'triptych':
      return <TriptychLayout {...shared} />;

    case 'highlight':
      return <HighlightLayout {...shared} />;

    case 'filmstrip':
      return <FilmstripLayout {...shared} />;

    case 'storyboard':
      return <StoryboardLayout {...shared} />;

    case 'stack':
      return <StackLayout {...shared} />;

    case 'hero_2':
      return <Hero2Layout {...shared} />;

    case 'cascade':
      return (
        <CascadeLayout
          {...shared}
          slotCount={tierKey === 'heritage' ? 6 : 4}
        />
      );

    case 'journal':
      return <JournalLayout {...shared} />;

    case 'grid':
      return (
        <GridLayout
          {...shared}
          columns={orientation === 'portrait' ? 2 : 3}
        />
      );

    case 'feature':
      return <FeatureLayout {...shared} />;

    case 'mosaic':
      return (
        <MosaicLayout
          {...shared}
          slotCount={tierKey === 'heritage' ? 10 : 5}
        />
      );

    case 'timeline':
      return <TimelineLayout {...shared} />;

    case 'gallery':
      return <GalleryLayout {...shared} />;

    case 'centrepiece':
      return <CentrepieceLayout {...shared} />;

    case 'tower':
      return <TowerLayout {...shared} />;

    case 'generations':
      return <GenerationsLayout {...shared} />;

    default:
      return (
        <div className="text-center text-sm text-gray-400">
          Unknown layout
        </div>
      );
  }
}