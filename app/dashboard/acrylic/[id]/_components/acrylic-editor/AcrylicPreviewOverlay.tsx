'use client';

import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { inter } from '@/lib/fonts';
import { ACRYLIC_COLORS } from './AcrylicEditor';
import AcrylicRenderer from '../AcrylicRenderer';
import type { AcrylicAsset, LayoutType } from '@/types/acrylic-print';
import { ui, IconBtn, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './acrylicEditor.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

function getAspectRatioStr(acrylicSize: string, orientation: string): string {
  const sizes: Record<string, [number, number]> = { '16x24': [24, 16], '24x24': [24, 24], '24x36': [36, 24] };
  const [w, h] = sizes[acrylicSize] || [24, 24];
  if (orientation === 'square') return '1 / 1';
  return orientation === 'portrait' ? `${h} / ${w}` : `${w} / ${h}`;
}

export default function AcrylicPreviewOverlay({
  open, onClose, acrylicId, assets, layoutType, tierKey, orientation, acrylicSize,
}: {
  open: boolean; onClose: () => void; acrylicId: string; assets: AcrylicAsset[];
  layoutType: LayoutType; tierKey: string; orientation: string; acrylicSize: string;
}) {
  // Escape closes, focus moves into the preview and back to the Preview button after.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  const noop = () => {};
  const aspectRatio = getAspectRatioStr(acrylicSize, orientation);
  const isSquare = orientation === 'square';
  const maxWidth = isSquare ? 'min(70vw, 700px)' : 'min(80vw, 1000px)';

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cx(ui.viewer, s.preview)}
      style={{ animation: 'previewFadeIn 0.3s ease both' }}
      onClick={onClose}
    >
      <style>{`
        @keyframes previewFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes previewSlideIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* The bar floats over the top of the screen, so the print stays centred in it. */}
      <div className={cx(ui.viewerBar, s.previewBar)}>
        <p className={s.previewHint} aria-hidden="true">
          <kbd className={s.kbd}>ESC</kbd> to close
        </p>
        <IconBtn label="Close" onPhoto onClick={onClose}>
          <X size={20} strokeWidth={2.4} aria-hidden="true" />
        </IconBtn>
      </div>

      <div
        className={s.previewColumn}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'previewSlideIn 0.35s ease both', animationDelay: '0.05s' }}
      >
        {/* The print, as it will be made: its box, paper, shadow, type and colour are the
            product's own. */}
        <div
          style={{
            width: maxWidth,
            aspectRatio,
            borderRadius: 6,
            overflow: 'hidden',
            background: ACRYLIC_COLORS.paper,
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: inter.style.fontFamily,
            color: ACRYLIC_COLORS.dark,
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

        <div className={s.previewCaption}>
          <h2 id={titleId} className={s.previewTitle}>Acrylic Preview</h2>
          <p className={s.previewMeta}>
            {layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} · {orientation === 'square' ? 'Square' : orientation.charAt(0).toUpperCase() + orientation.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
