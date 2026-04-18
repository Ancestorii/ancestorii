'use client';

import { useEffect, useState, useCallback } from 'react';
import { inter } from '@/lib/fonts';
import { BOOK_CANVAS_COLORS, type CanvasSpread } from './BookCanvas';
import type { CoverLayoutType, BackCoverLayoutType } from './BookCanvasLeftPanel';
import type { Asset, Page } from '@/types/memory-book';
import PageRenderer from '../PageRenderer';
import ClassicCover from '../cover-layouts/ClassicCover';
import FullBleedCover from '../cover-layouts/FullBleedCover';
import TrioCover from '../cover-layouts/TrioCover';
import BlankBackCover from '../cover-layouts/BlankBackCover';
import DedicationBackCover from '../cover-layouts/DedicationBackCover';
import PhotoMessageBackCover from '../cover-layouts/PhotoMessageBackCover';
import Image from "next/image";

export default function BookPreviewOverlay({
  open,
  onClose,
  spreads,
  pages,
  coverLayout,
  backCoverLayout,
  bookTitle,
  coverAssets,
  backCoverAssets,
  spineBgColour,
  initialSpread = 0,
}: {
  open: boolean;
  onClose: () => void;
  spreads: CanvasSpread[];
  pages: Page[];
  coverLayout: CoverLayoutType;
  backCoverLayout: BackCoverLayoutType;
  bookTitle: string;
  coverAssets: Asset[];
  backCoverAssets: Asset[];
  spineBgColour: string;
  initialSpread?: number;
}) {
  const [spread, setSpread] = useState(initialSpread);
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (open) setSpread(initialSpread);
  }, [open, initialSpread]);

  const cur = spreads[spread];
  const canPrev = spread > 0;
  const canNext = spread < spreads.length - 1;

  const goNext = useCallback(() => {
    if (!canNext) return;
    setAnimDir('left');
    setSpread((s) => s + 1);
  }, [canNext]);

  const goPrev = useCallback(() => {
    if (!canPrev) return;
    setAnimDir('right');
    setSpread((s) => s - 1);
  }, [canPrev]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, goNext, goPrev, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open || !cur) return null;

  const isCover = cur.type === 'cover';
  const isBackCover = cur.type === 'back_cover';
  const isSingleCover = isCover || isBackCover;

  const leftPage = cur.type === 'spread' ? cur.l : undefined;
  const rightPage =
    cur.type === 'single'
      ? cur.r
      : cur.type === 'spread'
      ? cur.r
      : undefined;

  const getLabel = () => {
    if (cur.type === 'cover') return 'Cover';
    if (cur.type === 'back_cover') return 'Back Cover';
    if (cur.type === 'single') return `Page ${cur.r.page_number}`;
    if (cur.l && cur.r) return `Pages ${cur.l.page_number}–${cur.r.page_number}`;
    if (cur.l) return `Page ${cur.l.page_number}`;
    return '';
  };

  const noop = () => {};

  const renderCover = () => {
    const shared = {
      assets: coverAssets,
      pageId: 'cover',
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

  const renderBackCover = () => {
    switch (backCoverLayout) {
      case 'dedication_back':
        return <DedicationBackCover assets={backCoverAssets} onUpdateAsset={noop} isExport />;
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(8, 6, 4, 0.92)',
        backdropFilter: 'blur(16px)',
        animation: 'previewFadeIn 0.3s ease both',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes previewFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes previewSlideIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: 99,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          fontSize: 18,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
      >
        ×
      </button>

      {/* Keyboard hint */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.04em',
          }}
        >
          ← → to navigate · ESC to close
        </span>
      </div>

      {/* Book container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          animation: 'previewSlideIn 0.35s ease both',
          animationDelay: '0.05s',
        }}
      >
        {/* The book */}
        <div
          key={spread}
          style={{
            width: isSingleCover ? 'min(55vw, 600px)' : 'min(92vw, 1200px)',
            aspectRatio: isSingleCover ? '297 / 210' : `${29.7 * 2} / 21`,
            display: 'flex',
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            animation: 'previewSlideIn 0.25s ease both',
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {isCover ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                background: BOOK_CANVAS_COLORS.paper,
              }}
            >
              {renderCover()}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 14,
                  background: spineBgColour,
                  boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.12)',
                  zIndex: 2,
                }}
              />
            </div>
          ) : isBackCover ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                background: BOOK_CANVAS_COLORS.paper,
              }}
            >
              {renderBackCover()}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 14,
                  background: spineBgColour,
                  boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.12)',
                  zIndex: 2,
                }}
              />
            </div>
          ) : (
            <>
              {/* Left page */}
              <div
                style={{
                  flex: 1,
                  background: BOOK_CANVAS_COLORS.paper,
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', inset: '4.76% 3.37% 4.76% 3.37%' }}>
                  {leftPage ? (
                    <PageRenderer
                      layout={leftPage.layout_type}
                      assets={leftPage.assets}
                      pageId={leftPage.id}
                      onUpdateAsset={noop}
                      selectedImage={null}
                      clearSelectedImage={noop}
                      onPickLayout={noop}
                      showSubheading={leftPage.show_subheading}
                      showComment={leftPage.show_comment}
                      isExport
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Spine gutter */}
              <div
                style={{
                  width: 7,
                  flexShrink: 0,
                  background: spineBgColour,
                  boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.08), inset -1px 0 2px rgba(0,0,0,0.08)',
                }}
              />

              {/* Right page */}
              <div
                style={{
                  flex: 1,
                  background: BOOK_CANVAS_COLORS.paperAlt,
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', inset: '4.76% 3.37% 4.76% 3.37%' }}>
                  {rightPage ? (
                    <PageRenderer
                      layout={rightPage.layout_type}
                      assets={rightPage.assets}
                      pageId={rightPage.id}
                      onUpdateAsset={noop}
                      selectedImage={null}
                      clearSelectedImage={noop}
                      onPickLayout={noop}
                      showSubheading={rightPage.show_subheading}
                      showComment={rightPage.show_comment}
                      isExport
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            disabled={!canPrev}
            style={{
              width: 42,
              height: 42,
              borderRadius: 99,
              border: `1px solid ${canPrev ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              background: canPrev ? 'rgba(255,255,255,0.08)' : 'transparent',
              cursor: canPrev ? 'pointer' : 'default',
              opacity: canPrev ? 1 : 0.3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (canPrev) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = canPrev ? 'rgba(255,255,255,0.08)' : 'transparent';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minWidth: 140,
            }}
          >
            <span
              style={{
                fontFamily: inter.style.fontFamily,
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              {getLabel()}
            </span>
            <span
              style={{
                fontFamily: inter.style.fontFamily,
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {spread + 1} of {spreads.length}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            disabled={!canNext}
            style={{
              width: 42,
              height: 42,
              borderRadius: 99,
              border: `1px solid ${canNext ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              background: canNext ? 'rgba(255,255,255,0.08)' : 'transparent',
              cursor: canNext ? 'pointer' : 'default',
              opacity: canNext ? 1 : 0.3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (canNext) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = canNext ? 'rgba(255,255,255,0.08)' : 'transparent';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#f3f4f6',
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        quality={75}
        unoptimized
        loading="eager"
        className={`object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}