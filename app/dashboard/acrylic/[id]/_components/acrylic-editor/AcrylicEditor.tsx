'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Sidebar from '../AcrylicSidebar';
import AcrylicHeader from './AcrylicHeader';
import AcrylicLeftPanel from './AcrylicLeftPanel';
import AcrylicStage from './AcrylicStage';
import AcrylicRightPanel from './AcrylicRightPanel';
import AcrylicPreviewOverlay from './AcrylicPreviewOverlay';
import type { AcrylicAsset, SelectedImage, LayoutType } from '@/types/acrylic-print';

// The print's own colours, nothing else: the paper behind the photos, the hairline round the
// print on the stage, and the text colour the print inherits. What sits on the stage is what
// Prodigi prints, so these stay as they are; the chrome around the print uses the app kit.
export const ACRYLIC_COLORS = {
  paper: '#FFFFFF',
  dark: '#1A1714',
  line: '#D9D3C7',
} as const;

type PanelTab = 'media' | 'layout';

const SLOT_COUNTS: Record<string, number> = {
  solo: 1,
  duo: 2,
  grid: 4,
};

export function getSlotCount(layoutType: string): number {
  return SLOT_COUNTS[layoutType] || 1;
}

function getAspectRatio(acrylicSize: string, orientation: string): number {
  const sizes: Record<string, [number, number]> = {
    '16x24': [24, 16],
    '24x24': [24, 24],
    '24x36': [36, 24],
  };
  const [w, h] = sizes[acrylicSize] || [24, 24];
  if (orientation === 'square') return 1;
  return orientation === 'portrait' ? h / w : w / h;
}

export default function AcrylicEditor({
  acrylicId,
  assets,
  layoutType,
  tierKey,
  orientation,
  acrylicSize,
  acrylicTitle,
  selectedImage,
  setSelectedImage,
  onSetLayout,
  onUpdateAsset,
}: {
  acrylicId: string;
  assets: AcrylicAsset[];
  layoutType: LayoutType;
  tierKey: string;
  orientation: string;
  acrylicSize: string;
  acrylicTitle: string;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  onSetLayout: (layout: LayoutType) => void;
  onUpdateAsset: (asset: AcrylicAsset) => void;
}) {
  const [tab, setTab] = useState<PanelTab>('media');
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [rootH, setRootH] = useState(760);
  const [aW, setAW] = useState(0);
  const [aH, setAH] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const aspectRatio = getAspectRatio(acrylicSize, orientation);
  const totalSlots = getSlotCount(layoutType);
  const filledSlots = assets.filter((a) => a.url || a.asset_id).length;
  const totalPhotos = filledSlots;
  const totalCaptions = assets.filter((a) => a.caption?.trim()).length;
  const progress = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

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

      setAW(w);
      setAH(h);
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

  .acrylic-editor-root {
    display: grid;
    min-height: 0;
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }
  .acrylic-editor-root > * { min-width: 0; min-height: 0; }

  @media (min-width: 768px) {
    .acrylic-editor-root { grid-template-columns: 240px minmax(0, 1fr) 220px; }
  }
  @media (min-width: 1280px) {
    .acrylic-editor-root { grid-template-columns: 320px minmax(0, 1fr) 260px; }
  }
  @media (min-width: 1536px) {
    .acrylic-editor-root { grid-template-columns: 360px minmax(0, 1fr) 280px; }
  }
`}</style>

          {/* The chrome takes the app's Jakarta and ink from the dashboard shell; the print on
              the stage and in the preview sets its own Inter (see AcrylicStage). */}
          <div
            ref={rootRef}
            className="acrylic-editor-root"
            style={{
              width: '100%',
              height: rootH,
              minHeight: 0,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <AcrylicHeader
              title={acrylicTitle}
              acrylicId={acrylicId}
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

            <AcrylicLeftPanel
              tab={tab}
              setTab={setTab}
              images={images}
              loading={loading}
              handleUpload={handleUpload}
              onRotateImage={handleRotateImage}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              layoutType={layoutType}
              onSetLayout={onSetLayout}
            />

            <AcrylicStage
              stageRef={stageRef}
              acrylicWidth={aW}
              acrylicHeight={aH}
              acrylicId={acrylicId}
              assets={assets}
              layoutType={layoutType}
              tierKey={tierKey}
              orientation={orientation}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              onUpdateAsset={onUpdateAsset}
              setTab={setTab}
            />

            <AcrylicRightPanel
              progress={progress}
              filledSlots={filledSlots}
              totalSlots={totalSlots}
              totalPhotos={totalPhotos}
              totalCaptions={totalCaptions}
              tierKey={tierKey}
              orientation={orientation}
              acrylicSize={acrylicSize}
              layoutType={layoutType}
            />

            <AcrylicPreviewOverlay
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              acrylicId={acrylicId}
              assets={assets}
              layoutType={layoutType}
              tierKey={tierKey}
              orientation={orientation}
              acrylicSize={acrylicSize}
            />
          </div>
        </>
      )}
    </Sidebar>
  );
}