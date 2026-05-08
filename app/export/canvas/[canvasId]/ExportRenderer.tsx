'use client';

import { useEffect, useRef, useState } from 'react';
import CanvasRenderer from '../../../dashboard/canvas/[id]/_components/Canvasrenderer';
import type { CanvasAsset, LayoutType } from '@/types/memory-canvas';

const noop = () => {};

export default function ExportRenderer({
  canvasId,
  assets,
  layoutType,
  tierKey,
  orientation,
  exportWidth,
  exportHeight,
}: {
  canvasId: string;
  assets: CanvasAsset[];
  layoutType: LayoutType;
  tierKey: string;
  orientation: string;
  exportWidth: number;
  exportHeight: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const checkImages = () => {
      const imgs = root.querySelectorAll('img');
      const allLoaded = Array.from(imgs).every(
        (img) => img.complete && img.naturalHeight > 0
      );
      if (allLoaded) {
        setReady(true);
      } else {
        setTimeout(checkImages, 200);
      }
    };

    setTimeout(checkImages, 500);
  }, []);

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-Regular.ttf') format('truetype');
          font-weight: 400; font-style: normal;
        }
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-Medium.ttf') format('truetype');
          font-weight: 500; font-style: normal;
        }
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-SemiBold.ttf') format('truetype');
          font-weight: 600; font-style: normal;
        }
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-Bold.ttf') format('truetype');
          font-weight: 700; font-style: normal;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: #FDFAF5;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
        }
      `}</style>

      <div
        ref={rootRef}
        data-export-ready={ready ? 'true' : 'false'}
        data-export-width={exportWidth}
        data-export-height={exportHeight}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#FDFAF5',
        }}
      >
        <CanvasRenderer
          layout={layoutType}
          assets={assets}
          canvasId={canvasId}
          onUpdateAsset={noop}
          selectedImage={null}
          clearSelectedImage={noop}
          onPickLayout={noop}
          tierKey={tierKey}
          orientation={orientation}
          isExport
        />
      </div>
    </>
  );
}