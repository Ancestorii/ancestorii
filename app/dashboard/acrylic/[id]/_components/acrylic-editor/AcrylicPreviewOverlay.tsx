'use client';

import { useEffect } from 'react';
import { inter } from '@/lib/fonts';
import { ACRYLIC_COLORS } from './AcrylicEditor';
import AcrylicRenderer from '../AcrylicRenderer';
import type { AcrylicAsset, LayoutType } from '@/types/acrylic-print';

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
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

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
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(8, 6, 4, 0.92)', backdropFilter: 'blur(16px)', animation: 'previewFadeIn 0.3s ease both' }}
      onClick={onClose}
    >
      <style>{`
        @keyframes previewFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes previewSlideIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 20, right: 24, width: 40, height: 40, borderRadius: 99, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 18, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease', zIndex: 10 }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
      >×</button>

      <div style={{ position: 'absolute', top: 24, left: 28, zIndex: 10 }}>
        <span style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>ESC to close</span>
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, animation: 'previewSlideIn 0.35s ease both', animationDelay: '0.05s' }}>
        <div style={{ width: maxWidth, aspectRatio, borderRadius: 6, overflow: 'hidden', background: ACRYLIC_COLORS.paper, boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: inter.style.fontFamily, fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Acrylic Preview</span>
          <span style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
            {layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} · {orientation === 'square' ? 'Square' : orientation.charAt(0).toUpperCase() + orientation.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}