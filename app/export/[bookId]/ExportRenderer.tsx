'use client';

import { useEffect, useRef, useState } from 'react';
import type { Asset, Page, CoverLayoutType, BackCoverLayoutType } from '@/types/memory-book';

// ── Layout components ──
import PageRenderer from '../../dashboard/books/[id]/_components/PageRenderer';

import ClassicCover from '../../dashboard/books/[id]/_components/cover-layouts/ClassicCover';
import FullBleedCover from '../../dashboard/books/[id]/_components/cover-layouts/FullBleedCover';
import TrioCover from '../../dashboard/books/[id]/_components/cover-layouts/TrioCover';

import BlankBackCover from '../../dashboard/books/[id]/_components/cover-layouts/BlankBackCover';
import DedicationBackCover from '../../dashboard/books/[id]/_components/cover-layouts/DedicationBackCover';
import PhotoMessageBackCover from '../../dashboard/books/[id]/_components/cover-layouts/PhotoMessageBackCover';

// ── Constants ──k
const PAGE_W = '297mm';
const PAGE_H = '210mm';

const noop = () => {};

export default function ExportRenderer({
  bookTitle,
  pages,
  coverLayout,
  backCoverLayout,
  coverAssets,
  backCoverAssets,
  spineText,
  spineBgColour,
  spineTextColour,
}: {
  bookTitle: string;
  pages: Page[];
  coverLayout: CoverLayoutType;
  backCoverLayout: BackCoverLayoutType;
  coverAssets: Asset[];
  backCoverAssets: Asset[];
  spineText: string;
  spineBgColour: string;
  spineTextColour: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);

  // ── Wait for all images to load, then signal ready ──
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

    // Give images a moment to start loading
    setTimeout(checkImages, 500);
  }, []);

  // ── Cover renderer ──
  const renderCover = () => {
    const shared = {
      assets: coverAssets,
      pageId: 'cover-export',
      bookTitle,
      onUpdateAsset: noop,
      selectedImage: null,
      clearSelectedImage: noop,
      isExport: true,
    };

    switch (coverLayout) {
      case 'full_bleed_cover':
        return <FullBleedCover {...shared} showTitle />;
      case 'trio_cover':
        return <TrioCover {...shared} />;
      case 'classic_cover':
      default:
        return <ClassicCover {...shared} />;
    }
  };

  // ── Back cover renderer ──
  const renderBackCover = () => {
    switch (backCoverLayout) {
      case 'dedication_back':
        return (
          <DedicationBackCover
            assets={backCoverAssets}
            onUpdateAsset={noop}
            isExport
          />
        );
      case 'photo_message_back':
        return (
          <PhotoMessageBackCover
            assets={backCoverAssets}
            onUpdateAsset={noop}
            selectedImage={null}
            clearSelectedImage={noop}
            isExport
          />
        );
      case 'blank_back':
      default:
        return <BlankBackCover isExport />;
    }
  };

  return (
    <>
      {/* ── Print & export styles ── */}
      <style>{`
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-Regular.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-Medium.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-SemiBold.ttf') format('truetype');
          font-weight: 600;
          font-style: normal;
        }
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/Inter-Bold.ttf') format('truetype');
          font-weight: 700;
          font-style: normal;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          @page {
            size: 297mm 210mm;
            margin: 0;
          }
        }

        .export-page {
          width: ${PAGE_W};
          height: ${PAGE_H};
          position: relative;
          overflow: hidden;
          background: #FDFAF5;
          page-break-after: always;
          break-after: page;
        }

        .export-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        .export-page-inner {
          position: absolute;
          inset: 0;
        }

        .export-content-inner {
          position: absolute;
          inset: 4.76% 3.37% 4.76% 3.37%;
        }
      `}</style>

      <div
        ref={rootRef}
        data-export-ready={ready ? 'true' : 'false'}
        style={{ background: '#fff' }}
      >
        {/* ═══════════════════════════════════
            PAGE 1: FRONT COVER
            ═══════════════════════════════════ */}
        <div className="export-page">
          <div className="export-page-inner">
            {renderCover()}
          </div>
        </div>

        {/* ═══════════════════════════════════
            CONTENT PAGES
            ═══════════════════════════════════ */}
        {sorted.map((page) => (
          <div key={page.id} className="export-page">
            <div className="export-page-inner">
              <div className="export-content-inner">
                <PageRenderer
                  layout={page.layout_type}
                  assets={page.assets}
                  pageId={page.id}
                  onUpdateAsset={noop}
                  selectedImage={null}
                  clearSelectedImage={noop}
                  onPickLayout={noop}
                  showSubheading={page.show_subheading}
                  showComment={page.show_comment}
                  isExport
                />
              </div>
            </div>
          </div>
        ))}

        {/* ═══════════════════════════════════
            LAST PAGE: BACK COVER
            ═══════════════════════════════════ */}
        <div className="export-page">
          <div className="export-page-inner">
            {renderBackCover()}
          </div>
        </div>
      </div>
    </>
  );
}