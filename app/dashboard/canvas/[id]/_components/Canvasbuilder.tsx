'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
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
  orderNotice = null,
}: {
  canvasId: string;
  initialAssets: CanvasAsset[];
  canvasTitle: string;
  tierKey: string;
  orientation: string;
  initialLayout: LayoutType;
  canvasSize: string;
  orderNotice?: 'success' | 'canceled' | null;
}) {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [assets, setAssets] = useState<CanvasAsset[]>(initialAssets || []);
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  // Back from Stripe: say what happened, then drop the query from the address bar so a reload
  // does not repeat it.
  useEffect(() => {
    if (!orderNotice) return;
    if (orderNotice === 'success') {
      toast.success('Thank you! Your canvas order is confirmed. We will email you when it ships.');
    } else {
      toast.info('Checkout cancelled. Your canvas is saved, order it whenever you are ready.');
    }
    router.replace(`/dashboard/canvas/${canvasId}`);
  }, [orderNotice, canvasId, router]);

  const handleSetLayout = async (layout: LayoutType) => {
    // Choosing the layout that is already active used to wipe every placed photo.
    if (layout === layoutType || loading) return;

    try {
      setLoading(true);

      // Clear all assets when switching layout. The rows go first: only the canvas's creator may
      // delete them (row security removes 0 rows silently for anyone else), and the layout must
      // not change while photos stay behind in slots it does not have.
      const { data: removed, error: clearError } = await supabase
        .from('memory_canvas_assets')
        .delete()
        .eq('canvas_id', canvasId)
        .select('id');

      if (clearError) throw clearError;
      if (assets.length > 0 && (removed?.length ?? 0) === 0) {
        toast.error('Only the person who created this canvas can change its layout once photos are placed.');
        return;
      }

      const { data, error } = await supabase
        .from('memory_canvases')
        .update({ layout_type: layout })
        .eq('id', canvasId)
        .select('id, layout_type')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to update canvas layout');

      setAssets([]);
      setLayoutType(data.layout_type as LayoutType);
    } catch (err) {
      console.error('LAYOUT CHANGE FAILED:', err);
      toast.error('Could not change the layout. Please try again.');
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
          it fits and scrolls when it doesn't (a phone on its side). Under the floating phone
          navigation (z 200), with room for it at the bottom, as on the Timeline page. */}
      <div className="fixed inset-0 z-[190] flex flex-col overflow-y-auto bg-white px-4 pt-8 pb-[calc(112px+env(safe-area-inset-bottom,0px))] lg:hidden">
        <EmptyState
          Icon={Monitor}
          tone={toneByKey('orange')}
          title="Bigger screen needed"
          text="The canvas editor needs a wider screen: a laptop, a desktop, or a tablet turned sideways. Open Ancestorii on one to design your memory canvas."
          className="m-auto w-full max-w-[440px]"
        >
          <Link href="/dashboard/canvas" className={btnClass({ variant: 'primary' })}>
            <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>Back to Canvases</span>
          </Link>
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
