'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { inter } from '@/lib/fonts';
import Sidebar from '../AcrylicSidebar';
import AcrylicHeader from './AcrylicHeader';
import AcrylicLeftPanel from './AcrylicLeftPanel';
import AcrylicStage from './AcrylicStage';
import AcrylicRightPanel from './AcrylicRightPanel';
import AcrylicPreviewOverlay from './AcrylicPreviewOverlay';
import type { AcrylicAsset, SelectedImage, LayoutType } from '@/types/acrylic-print';

export const ACRYLIC_COLORS = {
  canvas: '#F7F5F0',
  panel: '#FFFFFF',
  paper: '#FFFFFF',
  paperAlt: '#FDFCF9',
  dark: '#1A1714',
  darkSoft: '#2E2A24',
  mid: '#6B6358',
  muted: '#A39B8F',
  accent: '#B8860B',
  accentSoft: '#F0E2BF',
  accentBg: '#FBF6EA',
  line: '#D9D3C7',
  lineLight: '#EAE5DB',
  lineDark: '#B5AFA3',
  stage: '#EDEBE5',
  hover: '#F2EFE8',
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
  ::-webkit-scrollbar-thumb { background: ${ACRYLIC_COLORS.lineDark}; border-radius: 99px; }
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

  .thumb-btn { transition: all 0.15s ease; position: relative; }
  .thumb-btn::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 10px;
    border: 2px solid transparent;
    transition: border-color 0.15s ease;
    pointer-events: none;
  }
  .thumb-btn:hover::after { border-color: ${ACRYLIC_COLORS.accent}66; }
  .thumb-btn.active::after { border-color: #D4A017; border-width: 4px; }

  .tool-btn { transition: all 0.15s ease; cursor: pointer; }
  .tool-btn:hover { background: ${ACRYLIC_COLORS.hover} !important; }

  .tab-item { transition: all 0.12s ease; cursor: pointer; }
  .tab-item:hover { background: ${ACRYLIC_COLORS.hover}; }

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

          <div
            ref={rootRef}
            className="acrylic-editor-root"
            style={{
              width: '100%',
              height: rootH,
              minHeight: 0,
              overflow: 'hidden',
              background: ACRYLIC_COLORS.canvas,
              fontFamily: inter.style.fontFamily,
              color: ACRYLIC_COLORS.dark,
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