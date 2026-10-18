'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { inter } from '@/lib/fonts';
import { IconBtn, useDialog } from '@/components/dashboard/ui/AppBits';
import { CANVAS_COLORS } from './Canvaseditor';
import CanvasRenderer from '../Canvasrenderer';
import type { CanvasAsset, LayoutType } from '@/types/memory-canvas';
import s from './canvasEditor.module.css';

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
  // Focus moves into the preview and stays there (Tab), and returns to Preview when it closes.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

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
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="canvas-preview-title"
      className={`${s.preview} scrim-blur`}
      style={{ animation: 'previewFadeIn 0.3s ease both' }}
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
      <IconBtn label="Close" onPhoto onClick={onClose} className={s.previewClose}>
        <X size={20} strokeWidth={2.4} aria-hidden="true" />
      </IconBtn>

      {/* Hint */}
      <p className={s.previewHint}>
        <kbd className={s.kbd}>ESC</kbd> to close
      </p>

      {/* Canvas container (the canvas inherits Inter and #1A1714 here, as before) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          animation: 'previewSlideIn 0.35s ease both',
          animationDelay: '0.05s',
          fontFamily: inter.style.fontFamily,
          color: CANVAS_COLORS.dark,
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

        {/* Label (its 41.5px block keeps the canvas where it was) */}
        <div className={s.previewCaption}>
          <span id="canvas-preview-title" className={s.previewTitle}>
            Canvas Preview
          </span>
          <span className={s.previewSub}>
            {layoutType.charAt(0).toUpperCase() +
              layoutType.slice(1).replace('_', ' ')}{' '}
            · {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}