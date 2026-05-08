'use client';

import { useEffect } from 'react';
import { inter } from '@/lib/fonts';
import { CANVAS_COLORS } from './Canvaseditor';
import CanvasRenderer from '../Canvasrenderer';
import type { CanvasAsset, LayoutType } from '@/types/memory-canvas';

function getAspectRatioStr(canvasSize: string, orientation: string): string {
  const sizes: Record<string, [number, number]> = {
    '16x36': [36, 16],
    '20x32': [32, 20],
    '24x72': [72, 24],
  };
  const [w, h] = sizes[canvasSize] || [32, 20];
  return orientation === 'portrait' ? `${h} / ${w}` : `${w} / ${h}`;
}

export default function CanvasPreviewOverlay({
  open,
  onClose,
  canvasId,
  assets,
  layoutType,
  tierKey,
  orientation,
  canvasSize,
}: {
  open: boolean;
  onClose: () => void;
  canvasId: string;
  assets: CanvasAsset[];
  layoutType: LayoutType;
  tierKey: string;
  orientation: string;
  canvasSize: string;
}) {
  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const noop = () => {};
  const aspectRatio = getAspectRatioStr(canvasSize, orientation);

  // Determine max size based on orientation
  const isWide =
    (canvasSize === '24x72' && orientation === 'landscape') ||
    (canvasSize === '16x36' && orientation === 'landscape');

  const maxWidth = isWide ? 'min(94vw, 1400px)' : 'min(80vw, 1000px)';

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

      {/* Hint */}
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
          ESC to close
        </span>
      </div>

      {/* Canvas container */}
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
        <div
          style={{
            width: maxWidth,
            aspectRatio,
            borderRadius: 6,
            overflow: 'hidden',
            background: CANVAS_COLORS.paper,
            boxShadow:
              '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
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

        {/* Label */}
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
            Canvas Preview
          </span>
          <span
            style={{
              fontFamily: inter.style.fontFamily,
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {layoutType.charAt(0).toUpperCase() +
              layoutType.slice(1).replace('_', ' ')}{' '}
            · {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}