'use client';

import { useEffect, useRef, useState } from 'react';
import AcrylicRenderer from '../../../dashboard/acrylic/[id]/_components/AcrylicRenderer';
import type { AcrylicAsset, LayoutType } from '@/types/acrylic-print';

const noop = () => {};

export default function ExportRenderer({
  acrylicId,
  assets,
  layoutType,
  tierKey,
  orientation,
  exportWidth,
  exportHeight,
}: {
  acrylicId: string;
  assets: AcrylicAsset[];
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
        <AcrylicRenderer
          layout={layoutType}
          assets={assets}
          acrylicId={acrylicId}
          onUpdateAsset={noop}
          selectedImage={null}
          clearSelectedImage={noop}
          onPickLayout={noop}
          isExport
        />
      </div>
    </>
  );
}