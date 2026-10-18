'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Sidebar from '../Canvassidebar';
import CanvasHeader from './Canvasheader';
import CanvasLeftPanel from './Canvasleftpanel';
import CanvasStage from './Canvasstage';
import CanvasRightPanel from './Canvasrightpanel';
import CanvasPreviewOverlay from './Canvaspreviewoverlay';
import type { CanvasAsset, SelectedImage, LayoutType } from '@/types/memory-canvas';

/**
 * The colours that draw the canvas itself on the stage and in the preview (its paper, its
 * 1.5px edge, and the text colour it inherits). The canvas is what gets printed, so these stay
 * as they are; the editor's chrome uses the app kit.
 */
export const CANVAS_COLORS = {
  paper: '#FFFFFF',
  line: '#D9D3C7',
  dark: '#1A1714',
} as const;

type PanelTab = 'media' | 'layout';

/** Slot count lookup: tier-aware for cascade and mosaic */
export function getSlotCount(layoutType: string, tierKey: string): number {
  if (layoutType === 'cascade') return tierKey === 'heritage' ? 6 : 4;
  if (layoutType === 'mosaic') return tierKey === 'heritage' ? 10 : 5;
  const base: Record<string, number> = {
    solo: 1, duo: 2, triptych: 3, highlight: 3, filmstrip: 5,
    storyboard: 3, stack: 3, hero_2: 3, journal: 2, grid: 6,
    feature: 4, timeline: 6, gallery: 7, centrepiece: 7, tower: 5,
    generations: 3,
  };
  return base[layoutType] || 1;
}

/** Aspect ratio from canvas_size + orientation */
function getAspectRatio(canvasSize: string, orientation: string): number {
  const sizes: Record<string, [number, number]> = {
    '16x36': [36, 16],
    '20x32': [32, 20],
    '24x72': [72, 24],
  };
  const [w, h] = sizes[canvasSize] || [32, 20];
  return orientation === 'portrait' ? h / w : w / h;
}

export default function CanvasEditor({
  canvasId,
  assets,
  layoutType,
  tierKey,
  orientation,
  canvasSize,
  canvasTitle,
  selectedImage,
  setSelectedImage,
  onSetLayout,
  onUpdateAsset,
}: {
  canvasId: string;
  assets: CanvasAsset[];
  layoutType: LayoutType;
  tierKey: string;
  orientation: string;
  canvasSize: string;
  canvasTitle: string;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  onSetLayout: (layout: LayoutType) => void;
  onUpdateAsset: (asset: CanvasAsset) => void;
}) {
  const [tab, setTab] = useState<PanelTab>('media');
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [rootH, setRootH] = useState(760);
  const [cW, setCW] = useState(0);
  const [cH, setCH] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const aspectRatio = getAspectRatio(canvasSize, orientation);
  const totalSlots = getSlotCount(layoutType, tierKey);
  const filledSlots = assets.filter((a) => a.url || a.asset_id).length;
  const totalPhotos = filledSlots;
  const totalCaptions = assets.filter((a) => a.caption?.trim()).length;
  const progress = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  /* ── Measure root height ── */
  useLayoutEffect(() => {
    const measure = () => {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setRootH(window.innerHeight - top);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* ── Measure canvas display size ── */
  useLayoutEffect(() => {
    const calc = () => {
      const s = stageRef.current;
      if (!s) return;

      const sw = s.clientWidth;
      const sh = s.clientHeight;
      const maxW = sw * 0.86;
      const maxH = sh * 0.74;

      let w = maxW;
      let h = maxW / aspectRatio;

      if (h > maxH) {
        h = maxH;
        w = maxH * aspectRatio;
      }

      setCW(w);
      setCH(h);
    };

    calc();

    const ro = new ResizeObserver(calc);
    if (stageRef.current) ro.observe(stageRef.current);

    return () => ro.disconnect();
  }, [rootH, aspectRatio]);

  return (
    <Sidebar onSelectImage={setSelectedImage}>
      {({ images, loading, handleUpload, handleRotateImage }) => (
        <>
          <style>{`
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: rgba(10, 10, 15, 0.18); border-radius: 99px; }
  ::-webkit-scrollbar-track { background: transparent; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }

  .fade-up { animation: fadeUp 0.4s ease both; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.1s; }
  .d3 { animation-delay: 0.15s; }
  .scale-in { animation: scaleIn 0.45s ease both; animation-delay: 0.12s; }

  .canvas-editor-root {
    display: grid;
    min-height: 0;
  }

  .canvas-editor-root > * {
    min-width: 0;
    min-height: 0;
  }

  .canvas-editor-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  @media (min-width: 768px) {
    .canvas-editor-root {
      grid-template-columns: 240px minmax(0, 1fr) 220px;
      grid-template-rows: auto minmax(0, 1fr);
    }
  }

  @media (min-width: 1280px) {
    .canvas-editor-root {
      grid-template-columns: 320px minmax(0, 1fr) 260px;
    }
  }

  @media (min-width: 1536px) {
    .canvas-editor-root {
      grid-template-columns: 360px minmax(0, 1fr) 280px;
    }
  }
`}</style>

          <div
            ref={rootRef}
            className="canvas-editor-root"
            style={{
              width: '100%',
              height: rootH,
              minHeight: 0,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <CanvasHeader
              title={canvasTitle}
              canvasId={canvasId}
              tierKey={tierKey}
              onPreview={() => setPreviewOpen(true)}
              onSave={async () => {
                setSaveState('saving');
                await new Promise((r) => setTimeout(r, 500));
                setSaveState('saved');
                setTimeout(() => setSaveState('idle'), 1500);
              }}
              saveState={saveState}
            />

            <CanvasLeftPanel
              tab={tab}
              setTab={setTab}
              images={images}
              loading={loading}
              handleUpload={handleUpload}
              onRotateImage={handleRotateImage}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              layoutType={layoutType}
              tierKey={tierKey}
              orientation={orientation}
              onSetLayout={onSetLayout}
            />

            <CanvasStage
              stageRef={stageRef}
              canvasWidth={cW}
              canvasHeight={cH}
              canvasId={canvasId}
              assets={assets}
              layoutType={layoutType}
              tierKey={tierKey}
              orientation={orientation}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              onUpdateAsset={onUpdateAsset}
              setTab={setTab}
            />

            <CanvasRightPanel
              progress={progress}
              filledSlots={filledSlots}
              totalSlots={totalSlots}
              totalPhotos={totalPhotos}
              totalCaptions={totalCaptions}
              tierKey={tierKey}
              orientation={orientation}
              canvasSize={canvasSize}
              layoutType={layoutType}
            />

            <CanvasPreviewOverlay
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              canvasId={canvasId}
              assets={assets}
              layoutType={layoutType}
              tierKey={tierKey}
              orientation={orientation}
              canvasSize={canvasSize}
            />
          </div>
        </>
      )}
    </Sidebar>
  );
}