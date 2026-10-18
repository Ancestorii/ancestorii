'use client';

import { inter } from '@/lib/fonts';
import PageRenderer from '../PageRenderer';
import { BOOK_CANVAS_COLORS, type CanvasSpread } from './BookCanvas';
import type { CoverLayoutType, BackCoverLayoutType } from './BookCanvasLeftPanel';
import type { Asset, Page, SelectedImage, LayoutType } from '@/types/memory-book';

// ── NEW: import cover layouts ──
import ClassicCover from '../cover-layouts/ClassicCover';
import FullBleedCover from '../cover-layouts/FullBleedCover';
import TrioCover from '../cover-layouts/TrioCover';
import { useState, useEffect } from 'react';
import BlankBackCover from '../cover-layouts/BlankBackCover';
import DedicationBackCover from '../cover-layouts/DedicationBackCover';
import PhotoMessageBackCover from '../cover-layouts/PhotoMessageBackCover';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus } from 'lucide-react';
import { IconBtn, ui } from '@/components/dashboard/ui/AppBits';
import chrome from './bookChrome.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// The book's own colours and type on the stage: its edges, the blank-page placeholder and the
// text it inherits. They draw the product (what gets printed), so they keep their original
// values whatever the editor's chrome palette (BOOK_CANVAS_COLORS) becomes.
const PRODUCT = {
  ink: '#1A1714',
  mid: '#6B6358',
  muted: '#A39B8F',
  line: '#D9D3C7',
  lineLight: '#EAE5DB',
  lineDark: '#B5AFA3',
} as const;

export default function BookCanvasStage({
  setTab,
  stageRef,
  bookWidth,
  bookHeight,
  spread,
  setSpread,
  spreads,
  pages,
  currentSpread,
  currentSpreadLabel,
  selectedImage,
  setSelectedImage,
  onOpenLayoutModal,
  onUpdateAsset,
  // ── NEW props ──
  coverLayout,
  backCoverLayout,
  bookTitle,
  coverAssets,
  backCoverAssets,
  onUpdateCoverAsset,
  onUpdateBackCoverAsset,
  spineBgColour,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  setTab: (tab: 'pages' | 'media' | 'text' | 'layout') => void;
  bookWidth: number;
  bookHeight: number;
  spread: number;
  setSpread: React.Dispatch<React.SetStateAction<number>>;
  spreads: CanvasSpread[];
  pages: Page[];
  currentSpread: CanvasSpread;
  currentSpreadLabel: string;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  onOpenLayoutModal: (pageId: string, layout: LayoutType) => void;
  onUpdateAsset: (pageId: string, asset: Asset) => void;
  // ── NEW props ──
  coverLayout: CoverLayoutType;
  backCoverLayout: BackCoverLayoutType;
  bookTitle: string;
  coverAssets: Asset[];
  backCoverAssets: Asset[];
  onUpdateCoverAsset: (asset: Asset) => void;
  onUpdateBackCoverAsset: (asset: Asset) => void;
  spineBgColour: string;
}) {
    const leftPage =
    currentSpread.type === 'spread' ? currentSpread.l : undefined;

  const rightPage =
    currentSpread.type === 'single'
      ? currentSpread.r
      : currentSpread.type === 'spread'
      ? currentSpread.r
      : undefined;

  const isCover = currentSpread.type === 'cover';
  const isBackCover = currentSpread.type === 'back_cover';
  const isSingle = currentSpread.type === 'single';

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const renderBackCoverLayout = (
    layout: BackCoverLayoutType,
    assets: Asset[],
    onUpdate: (asset: Asset) => void,
  ) => {
    switch (layout) {
      case 'dedication_back':
        return <DedicationBackCover assets={assets} onUpdateAsset={onUpdate} />;
      case 'photo_message_back':
        return (
          <PhotoMessageBackCover
            assets={assets}
            onUpdateAsset={onUpdate}
            selectedImage={selectedImage}
            clearSelectedImage={() => setSelectedImage(null)}
          />
        );
      case 'blank_back':
      default:
        return <BlankBackCover />;
    }
  };

useEffect(() => {
  if (zoom <= 1) setPan({ x: 0, y: 0 });
}, [zoom]);
  // ── NEW: pick the right cover layout component ──
  const renderCoverLayout = (
    layout: CoverLayoutType,
    pageId: string,
    assets: Asset[],
    onUpdate: (asset: Asset) => void,
  ) => {
    const shared = {
      assets,
      pageId,
      bookTitle,
      onUpdateAsset: onUpdate,
      selectedImage,
      clearSelectedImage: () => setSelectedImage(null),
    };

    switch (layout) {
      case 'full_bleed_cover':
        return <FullBleedCover {...shared} showTitle />;
      case 'trio_cover':
        return <TrioCover {...shared} />;
      case 'classic_cover':
      default:
        return <ClassicCover {...shared} />;
    }
  };
  
  return (
    <main
  ref={stageRef}
  className="fade-up d2 book-stage"
  style={{
    gridRow: '2',
    gridColumn: '2',
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: BOOK_CANVAS_COLORS.stage,
  }}
>
      {bookWidth > 0 && (
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
          }}
        >
          <div
            className="scale-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              // What the book inherits stays as it was (it is drawn as it will be printed).
              fontFamily: inter.style.fontFamily,
              color: PRODUCT.ink,
            }}
          >
          {isCover || isBackCover ? (
  <div
    style={{
      width: bookWidth * 0.5,
      height: bookHeight,
      position: 'relative',
      borderRadius: 8,
      overflow: 'hidden',
      background: BOOK_CANVAS_COLORS.paper,
      boxShadow:
        '0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.07), 0 20px 50px rgba(0,0,0,0.05)',
    }}
  >
    {/* ── CHANGED: render actual cover layout instead of static CoverFace ── */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        border: `1.5px solid ${PRODUCT.line}`,
        borderRadius: 8,
        background: BOOK_CANVAS_COLORS.paper,
        overflow: 'hidden',
      }}
    >
      {isCover
      ? renderCoverLayout(coverLayout, 'cover', coverAssets, onUpdateCoverAsset)
      : renderBackCoverLayout(backCoverLayout, backCoverAssets, onUpdateBackCoverAsset)
    }
    </div>

    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 14,
        background: spineBgColour,
        boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.08)',
        zIndex: 2,
      }}
    />
  </div>
) : (
  <div
    style={{
      width: bookWidth,
      height: bookHeight,
      display: 'flex',
      borderRadius: 5,
      overflow: 'hidden',
      boxShadow:
        '0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.07), 0 20px 50px rgba(0,0,0,0.05)',
    }}
  >
    <div
      style={{
        flex: 1,
        background: BOOK_CANVAS_COLORS.paper,
        position: 'relative',
        borderRight: `1px solid ${PRODUCT.lineLight}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '4.76% 3.37% 4.76% 3.37%',
        }}
      >
        {leftPage ? (
         <PageRenderer
  layout={leftPage.layout_type}
  assets={leftPage.assets}
  pageId={leftPage.id}
  onUpdateAsset={(asset) => onUpdateAsset(leftPage.id, asset)}
  selectedImage={selectedImage}
  clearSelectedImage={() => setSelectedImage(null)}
  onPickLayout={() => setTab('layout')}
  showSubheading={leftPage?.show_subheading ?? true}
  showComment={leftPage?.show_comment ?? true}
/>
        ) : (
          <StaticBlank
          label="Blank page"
          fontFamily={inter.style.fontFamily}
          />
        )}
      </div>
    </div>

    <div
      style={{
        width: 7,
        flexShrink: 0,
        background: spineBgColour,
        boxShadow:
          'inset 1px 0 2px rgba(0,0,0,0.05), inset -1px 0 2px rgba(0,0,0,0.05)',
      }}
    />

    <div
      style={{
        flex: 1,
        background: BOOK_CANVAS_COLORS.paperAlt,
        position: 'relative',
        borderLeft: `1px solid ${PRODUCT.lineLight}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '4.76% 3.37% 4.76% 3.37%',
        }}
      >
        {rightPage ? (
          <PageRenderer
  layout={rightPage.layout_type}
  assets={rightPage.assets}
  pageId={rightPage.id}
  onUpdateAsset={(asset) => onUpdateAsset(rightPage.id, asset)}
  selectedImage={selectedImage}
  clearSelectedImage={() => setSelectedImage(null)}
  onPickLayout={() => setTab('layout')}
  showSubheading={rightPage?.show_subheading ?? true}
  showComment={rightPage?.show_comment ?? true}
/>
        ) : (
          <StaticBlank
            label="Blank page"
            fontFamily={inter.style.fontFamily}
          />
        )}
      </div>
    </div>
  </div>
)}

          <div
          className={chrome.stageNav}
          style={{
          width: isCover || isBackCover ? bookWidth * 0.5 : bookWidth,
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
         }}
        >
            <NavBtn
              dir="left"
              disabled={spread === 0}
              onClick={() => setSpread((s) => s - 1)}
            />

            <div className={cx(ui.chip, chrome.stageChip)}>
              <span className={chrome.stageChipLabel}>{currentSpreadLabel}</span>
              <span className={chrome.stageChipOf}>of {pages.length}</span>
            </div>

            <NavBtn
              dir="right"
              disabled={spread >= spreads.length - 1}
              onClick={() => setSpread((s) => s + 1)}
            />
          </div>
        </div>
        </div>
      )}
      {/* Zoom and pan: bottom left, clear of the writing assistant's card (bottom right). */}
      <div className={chrome.toolbar}>
        {zoom > 1 && (
          <div className={chrome.panPad} role="group" aria-label="Move the page">
            <span />
            <IconBtn label="Pan up" size="sm" ghost onClick={() => setPan((p) => ({ ...p, y: p.y + 30 }))}>
              <ChevronUp size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
            <span />

            <IconBtn label="Pan left" size="sm" ghost onClick={() => setPan((p) => ({ ...p, x: p.x + 30 }))}>
              <ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
            <span className={chrome.panDot} aria-hidden="true" />
            <IconBtn label="Pan right" size="sm" ghost onClick={() => setPan((p) => ({ ...p, x: p.x - 30 }))}>
              <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>

            <span />
            <IconBtn label="Pan down" size="sm" ghost onClick={() => setPan((p) => ({ ...p, y: p.y - 30 }))}>
              <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
            <span />
          </div>
        )}

        <div className={chrome.toolCard} role="group" aria-label="Zoom">
          <IconBtn label="Zoom out" size="sm" ghost onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            <Minus size={18} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>

          <span className={chrome.toolSep} aria-hidden="true" />

          <button
            type="button"
            className={chrome.zoomReset}
            aria-label={`Reset zoom (${Math.round(zoom * 100)}%)`}
            title="Reset zoom"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          >
            {Math.round(zoom * 100)}%
          </button>

          <span className={chrome.toolSep} aria-hidden="true" />

          <IconBtn label="Zoom in" size="sm" ghost onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>
      </div>
    </main>
  );
}

function StaticBlank({
  label,
  fontFamily,
}: {
  label: string;
  fontFamily: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1.5px dashed ${PRODUCT.lineDark}`,
        borderRadius: 6,
        background: 'none',
        fontFamily,
      }}
    >
      <span
        style={{
          fontFamily: inter.style.fontFamily,
          fontSize: 15,
          fontWeight: 600,
          color: PRODUCT.mid,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function PgNum({
  side,
  children,
  fontFamily,
}: {
  side: 'left' | 'right';
  children: React.ReactNode;
  fontFamily: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        [side === 'left' ? 'left' : 'right']: 18,
        fontFamily,
        fontSize: 12,
        fontWeight: 400,
        color: PRODUCT.muted,
      }}
    >
      {children}
    </div>
  );
}

function NavBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight;
  return (
    <IconBtn
      label={dir === 'left' ? 'Previous spread' : 'Next spread'}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size={20} strokeWidth={2.4} aria-hidden="true" />
    </IconBtn>
  );
}