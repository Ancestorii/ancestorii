'use client';

import { useState } from 'react';
import { ArrowLeft, Monitor } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { CanvasAsset, SelectedImage, LayoutType } from '@/types/memory-canvas';
import { EmptyState, btnClass, toneByKey } from '@/components/dashboard/ui/AppBits';
import CanvasEditor from './canvas-editor/Canvaseditor';

export default function CanvasBuilder({
  canvasId,
  initialAssets,
  canvasTitle,
  tierKey,
  orientation,
  initialLayout,
  canvasSize,
}: {
  canvasId: string;
  initialAssets: CanvasAsset[];
  canvasTitle: string;
  tierKey: string;
  orientation: string;
  initialLayout: LayoutType;
  canvasSize: string;
}) {
  const supabase = getBrowserClient();

  const [assets, setAssets] = useState<CanvasAsset[]>(initialAssets || []);
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const handleSetLayout = async (layout: LayoutType) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('memory_canvases')
        .update({ layout_type: layout })
        .eq('id', canvasId)
        .select('id, layout_type')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update canvas layout');

      // Clear all assets when switching layout
      await supabase
        .from('memory_canvas_assets')
        .delete()
        .eq('canvas_id', canvasId);

      setAssets([]);
      setLayoutType(data.layout_type as LayoutType);
    } catch (err) {
      console.error('LAYOUT CHANGE FAILED:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAsset = (updatedAsset: CanvasAsset) => {
    setAssets((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.slot_index === updatedAsset.slot_index
      );

      const next = [...prev];

      if (existingIndex >= 0) {
        next[existingIndex] = updatedAsset;
      } else {
        next.push(updatedAsset);
      }

      return next.sort((a, b) => a.slot_index - b.slot_index);
    });
  };

  return (
    <div style={{ height: '100%' }}>
      {/* Phones and small tablets: the editor needs a laptop-sized screen. The card centres when
          it fits and scrolls when it doesn't (a phone on its side). */}
      <div className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto bg-white px-4 py-8 lg:hidden">
        <EmptyState
          Icon={Monitor}
          tone={toneByKey('orange')}
          title="Bigger screen needed"
          text="The canvas editor works best on a laptop, desktop, or tablet. Open Ancestorii on a bigger screen to design your memory canvas."
          className="m-auto w-full max-w-[440px]"
        >
          <a href="/dashboard/canvas" className={btnClass({ variant: 'primary' })}>
            <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>Back to Canvases</span>
          </a>
        </EmptyState>
      </div>

      <div className="hidden lg:block" style={{ height: '100%' }}>
        <CanvasEditor
          canvasId={canvasId}
          assets={assets}
          layoutType={layoutType}
          tierKey={tierKey}
          orientation={orientation}
          canvasSize={canvasSize}
          canvasTitle={canvasTitle}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onSetLayout={handleSetLayout}
          onUpdateAsset={handleUpdateAsset}
        />
      </div>
    </div>
  );
}