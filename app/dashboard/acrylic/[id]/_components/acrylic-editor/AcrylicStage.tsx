'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus } from 'lucide-react';
import { inter } from '@/lib/fonts';
import { ACRYLIC_COLORS } from './AcrylicEditor';
import AcrylicRenderer from '../AcrylicRenderer';
import type { AcrylicAsset, SelectedImage, LayoutType } from '@/types/acrylic-print';
import { IconBtn, Tag } from '@/components/dashboard/ui/AppBits';
import s from './acrylicEditor.module.css';

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
        background: 'var(--hover)',
      }}
    >
      {acrylicWidth > 0 && (
        <div style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
          <div className="scale-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            {/* The print: size, radius, paper, border and shadow are the product's own (what
                Prodigi prints is what sits here). Its text keeps the Inter and colour it always
                inherited from the editor, whose chrome is Jakarta now. */}
            <div
              style={{
                width: acrylicWidth,
                height: acrylicHeight,
                borderRadius: 5,
                overflow: 'hidden',
                background: ACRYLIC_COLORS.paper,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.07), 0 20px 50px rgba(0,0,0,0.05)',
                border: `1.5px solid ${ACRYLIC_COLORS.line}`,
                fontFamily: inter.style.fontFamily,
                color: ACRYLIC_COLORS.dark,
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

            <div className={s.stageLabel} style={{ width: acrylicWidth }}>
              <Tag dot="var(--c2)">
                {layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} Layout
              </Tag>
            </div>
          </div>
        </div>
      )}

      {/* Zoom / pan controls */}
      <div className={s.toolbar}>
        {zoom > 1 && (
          <div className={s.panPad} role="group" aria-label="Move the print">
            <span />
            <IconBtn label="Pan up" size="sm" ghost onClick={() => setPan((p) => ({ ...p, y: p.y + 30 }))}>
              <ChevronUp size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
            <span />
            <IconBtn label="Pan left" size="sm" ghost onClick={() => setPan((p) => ({ ...p, x: p.x + 30 }))}>
              <ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
            <span className={s.panDot} aria-hidden="true" />
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

        <div className={s.toolCard} role="group" aria-label="Zoom">
          <IconBtn label="Zoom out" size="sm" ghost onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            <Minus size={18} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
          <span className={s.toolSep} aria-hidden="true" />
          <button
            type="button"
            className={s.zoomReset}
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            aria-label={`Zoom ${Math.round(zoom * 100)}%, reset to 100%`}
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <span className={s.toolSep} aria-hidden="true" />
          <IconBtn label="Zoom in" size="sm" ghost onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>
      </div>
    </main>
  );
}
