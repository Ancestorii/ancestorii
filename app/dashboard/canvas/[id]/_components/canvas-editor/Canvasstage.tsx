'use client';

import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus } from 'lucide-react';
import { inter } from '@/lib/fonts';
import { IconBtn, Tag } from '@/components/dashboard/ui/AppBits';
import { CANVAS_COLORS } from './Canvaseditor';
import CanvasRenderer from '../Canvasrenderer';
import type { CanvasAsset, SelectedImage, LayoutType } from '@/types/memory-canvas';
import s from './canvasEditor.module.css';

export default function CanvasStage({
  stageRef,
  canvasWidth,
  canvasHeight,
  canvasId,
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
  canvasWidth: number;
  canvasHeight: number;
  canvasId: string;
  assets: CanvasAsset[];
  layoutType: LayoutType;
  tierKey: string;
  orientation: string;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  onUpdateAsset: (asset: CanvasAsset) => void;
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
        // What the canvas inherits, as before (it used to come from the editor's root).
        fontFamily: inter.style.fontFamily,
        color: CANVAS_COLORS.dark,
      }}
    >
      {canvasWidth > 0 && (
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
            {/* ── The Canvas ── */}
            <div
              style={{
                width: canvasWidth,
                height: canvasHeight,
                borderRadius: 5,
                overflow: 'hidden',
                background: CANVAS_COLORS.paper,
                boxShadow:
                  '0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.07), 0 20px 50px rgba(0,0,0,0.05)',
                border: `1.5px solid ${CANVAS_COLORS.line}`,
              }}
            >
              <CanvasRenderer
                layout={layoutType}
                assets={assets}
                canvasId={canvasId}
                onUpdateAsset={onUpdateAsset}
                selectedImage={selectedImage}
                clearSelectedImage={() => setSelectedImage(null)}
                onPickLayout={() => setTab('layout')}
                tierKey={tierKey}
                orientation={orientation}
              />
            </div>

            {/* ── Label below canvas (its row keeps the canvas where it was) ── */}
            <div className={s.stageCaption} style={{ width: canvasWidth }}>
              <Tag dot="var(--c2)">
                {layoutType.charAt(0).toUpperCase() +
                  layoutType.slice(1).replace('_', ' ')}{' '}
                Layout
              </Tag>
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom / pan controls ── */}
      <div className={s.zoomDock}>
        {zoom > 1 && (
          <div className={s.panPad} role="group" aria-label="Move the canvas">
            <span />
            <PanBtn label="Pan up" Icon={ChevronUp} onClick={() => setPan((p) => ({ ...p, y: p.y + 30 }))} />
            <span />
            <PanBtn label="Pan left" Icon={ChevronLeft} onClick={() => setPan((p) => ({ ...p, x: p.x + 30 }))} />
            <span className={s.panDot} aria-hidden="true" />
            <PanBtn label="Pan right" Icon={ChevronRight} onClick={() => setPan((p) => ({ ...p, x: p.x - 30 }))} />
            <span />
            <PanBtn label="Pan down" Icon={ChevronDown} onClick={() => setPan((p) => ({ ...p, y: p.y - 30 }))} />
            <span />
          </div>
        )}

        <div className={s.zoomBar} role="group" aria-label="Zoom">
          <IconBtn label="Zoom out" ghost size="sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            <Minus size={16} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>

          <span className={s.zoomRule} aria-hidden="true" />

          <button
            type="button"
            className={s.zoomValue}
            title="Reset zoom"
            aria-label={`Zoom ${Math.round(zoom * 100)}%, reset to 100%`}
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          >
            {Math.round(zoom * 100)}%
          </button>

          <span className={s.zoomRule} aria-hidden="true" />

          <IconBtn label="Zoom in" ghost size="sm" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>
      </div>
    </main>
  );
}

function PanBtn({ label, Icon, onClick }: { label: string; Icon: LucideIcon; onClick: () => void }) {
  return (
    <IconBtn label={label} ghost size="sm" onClick={onClick}>
      <Icon size={16} strokeWidth={2.4} aria-hidden="true" />
    </IconBtn>
  );
}