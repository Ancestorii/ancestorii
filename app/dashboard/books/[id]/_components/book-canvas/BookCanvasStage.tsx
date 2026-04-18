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
  className="fade-up d2"
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.3,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-5%',
          width: '50%',
          height: '70%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${BOOK_CANVAS_COLORS.accentSoft}44 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      

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
        border: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
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
        borderRight: `1px solid ${BOOK_CANVAS_COLORS.lineLight}`,
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
        borderLeft: `1px solid ${BOOK_CANVAS_COLORS.lineLight}`,
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

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: inter.style.fontFamily,
              }}
            >
              <span
                style={{
                  fontFamily: inter.style.fontFamily,
                  fontSize: 13,
                  fontWeight: 700,
                  color: BOOK_CANVAS_COLORS.dark,
                }}
              >
                {currentSpreadLabel}
              </span>
              <span
  style={{
    fontFamily: inter.style.fontFamily,
    fontSize: 11,
    fontWeight: 500,
    color: BOOK_CANVAS_COLORS.muted,
  }}
>
  of {pages.length}
</span>
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
      <div
  style={{
    position: 'absolute',
    bottom: 16,
    right: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  }}
>
  {zoom > 1 && (
    <div
      style={{
        background: BOOK_CANVAS_COLORS.panel,
        borderRadius: 12,
        border: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: 4,
        display: 'grid',
        gridTemplateColumns: '28px 28px 28px',
        gridTemplateRows: '28px 28px 28px',
        gap: 2,
        placeItems: 'center',
      }}
    >
      <div />
      <button onClick={() => setPan((p) => ({ ...p, y: p.y + 30 }))} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <svg width="12" height="12" fill="none" stroke={BOOK_CANVAS_COLORS.mid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
      </button>
      <div />

      <button onClick={() => setPan((p) => ({ ...p, x: p.x + 30 }))} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <svg width="12" height="12" fill="none" stroke={BOOK_CANVAS_COLORS.mid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div style={{ width: 6, height: 6, borderRadius: 99, background: BOOK_CANVAS_COLORS.lineLight }} />
      <button onClick={() => setPan((p) => ({ ...p, x: p.x - 30 }))} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <svg width="12" height="12" fill="none" stroke={BOOK_CANVAS_COLORS.mid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
      </button>

      <div />
      <button onClick={() => setPan((p) => ({ ...p, y: p.y - 30 }))} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <svg width="12" height="12" fill="none" stroke={BOOK_CANVAS_COLORS.mid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div />
    </div>
  )}

  <div
    style={{
      background: BOOK_CANVAS_COLORS.panel,
      borderRadius: 12,
      border: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <button
      onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <svg width="14" height="14" fill="none" stroke={BOOK_CANVAS_COLORS.dark} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
    </button>

    <div
      style={{
        width: 1,
        height: 16,
        background: BOOK_CANVAS_COLORS.lineLight,
        flexShrink: 0,
      }}
    />

    <button
      onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
      style={{
        height: 32, borderRadius: 8,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '0 10px',
        fontSize: 11, fontWeight: 600,
        color: BOOK_CANVAS_COLORS.mid,
        fontFamily: inter.style.fontFamily,
        transition: 'background 0.15s ease',
        minWidth: 48,
        textAlign: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >{Math.round(zoom * 100)}%</button>

    <div
      style={{
        width: 1,
        height: 16,
        background: BOOK_CANVAS_COLORS.lineLight,
        flexShrink: 0,
      }}
    />

    <button
      onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <svg width="14" height="14" fill="none" stroke={BOOK_CANVAS_COLORS.dark} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    </button>
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
        border: `1.5px dashed ${BOOK_CANVAS_COLORS.lineDark}`,
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
          color: BOOK_CANVAS_COLORS.mid,
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
        color: BOOK_CANVAS_COLORS.muted,
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
  return (
    <button
      className="nav-arrow"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: disabled ? 'transparent' : BOOK_CANVAS_COLORS.canvas,
        border: `1.5px solid ${
          disabled
            ? BOOK_CANVAS_COLORS.lineLight
            : BOOK_CANVAS_COLORS.line
        }`,
        borderRadius: 10,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <svg
        width="16"
        height="16"
        fill="none"
        stroke={BOOK_CANVAS_COLORS.dark}
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        {dir === 'left' ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 6l6 6-6 6" />
        )}
      </svg>
    </button>
  );
}