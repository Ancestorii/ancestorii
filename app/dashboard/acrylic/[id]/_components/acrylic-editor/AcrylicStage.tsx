'use client';

import { useState, useEffect } from 'react';
import { inter } from '@/lib/fonts';
import { ACRYLIC_COLORS } from './AcrylicEditor';
import AcrylicRenderer from '../AcrylicRenderer';
import type { AcrylicAsset, SelectedImage, LayoutType } from '@/types/acrylic-print';

export default function AcrylicStage({
  stageRef,
  acrylicWidth,
  acrylicHeight,
  acrylicId,
  assets,
  layoutType,
  tierKey,
  orientation,
  selectedImage,
  setSelectedImage,
  onUpdateAsset,
  setTab,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  acrylicWidth: number;
  acrylicHeight: number;
  acrylicId: string;
  assets: AcrylicAsset[];
  layoutType: LayoutType;
  tierKey: string;
  orientation: string;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  onUpdateAsset: (asset: AcrylicAsset) => void;
  setTab: (tab: 'media' | 'layout') => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (zoom <= 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

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
        background: ACRYLIC_COLORS.stage,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")` }} />
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '50%', height: '70%', borderRadius: '50%', background: `radial-gradient(ellipse, ${ACRYLIC_COLORS.accentSoft}44 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {acrylicWidth > 0 && (
        <div style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
          <div className="scale-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                width: acrylicWidth,
                height: acrylicHeight,
                borderRadius: 5,
                overflow: 'hidden',
                background: ACRYLIC_COLORS.paper,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.07), 0 20px 50px rgba(0,0,0,0.05)',
                border: `1.5px solid ${ACRYLIC_COLORS.line}`,
              }}
            >
              <AcrylicRenderer
                layout={layoutType}
                assets={assets}
                acrylicId={acrylicId}
                onUpdateAsset={onUpdateAsset}
                selectedImage={selectedImage}
                clearSelectedImage={() => setSelectedImage(null)}
                onPickLayout={() => setTab('layout')}
              />
            </div>

            <div style={{ width: acrylicWidth, marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: inter.style.fontFamily, fontSize: 13, fontWeight: 700, color: ACRYLIC_COLORS.dark }}>
                {layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} Layout
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Zoom / pan controls */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 10 }}>
        {zoom > 1 && (
          <div style={{ background: ACRYLIC_COLORS.panel, borderRadius: 12, border: `1.5px solid ${ACRYLIC_COLORS.line}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 4, display: 'grid', gridTemplateColumns: '28px 28px 28px', gridTemplateRows: '28px 28px 28px', gap: 2, placeItems: 'center' }}>
            <div />
            <PanBtn onClick={() => setPan((p) => ({ ...p, y: p.y + 30 }))} d="M18 15l-6-6-6 6" />
            <div />
            <PanBtn onClick={() => setPan((p) => ({ ...p, x: p.x + 30 }))} d="M15 18l-6-6 6-6" />
            <div style={{ width: 6, height: 6, borderRadius: 99, background: ACRYLIC_COLORS.lineLight }} />
            <PanBtn onClick={() => setPan((p) => ({ ...p, x: p.x - 30 }))} d="M9 6l6 6-6 6" />
            <div />
            <PanBtn onClick={() => setPan((p) => ({ ...p, y: p.y - 30 }))} d="M6 9l6 6 6-6" />
            <div />
          </div>
        )}

        <div style={{ background: ACRYLIC_COLORS.panel, borderRadius: 12, border: `1.5px solid ${ACRYLIC_COLORS.line}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ZoomBtn onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            <svg width="14" height="14" fill="none" stroke={ACRYLIC_COLORS.dark} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
          </ZoomBtn>
          <div style={{ width: 1, height: 16, background: ACRYLIC_COLORS.lineLight, flexShrink: 0 }} />
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            style={{ height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 10px', fontSize: 11, fontWeight: 600, color: ACRYLIC_COLORS.mid, fontFamily: inter.style.fontFamily, transition: 'background 0.15s ease', minWidth: 48, textAlign: 'center' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ACRYLIC_COLORS.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >{Math.round(zoom * 100)}%</button>
          <div style={{ width: 1, height: 16, background: ACRYLIC_COLORS.lineLight, flexShrink: 0 }} />
          <ZoomBtn onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <svg width="14" height="14" fill="none" stroke={ACRYLIC_COLORS.dark} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          </ZoomBtn>
        </div>
      </div>
    </main>
  );
}

function PanBtn({ onClick, d }: { onClick: () => void; d: string }) {
  return (
    <button onClick={onClick} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = ACRYLIC_COLORS.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <svg width="12" height="12" fill="none" stroke={ACRYLIC_COLORS.mid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={d} /></svg>
    </button>
  );
}

function ZoomBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = ACRYLIC_COLORS.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}