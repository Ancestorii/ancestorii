'use client';

import { useState } from 'react';
import { ArrowLeft, Monitor } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import AcrylicEditor from './acrylic-editor/AcrylicEditor';
import type { AcrylicAsset, SelectedImage, LayoutType } from '@/types/acrylic-print';
import { Btn, EmptyState, toneByKey } from '@/components/dashboard/ui/AppBits';

export default function AcrylicBuilder({
  acrylicId,
  initialAssets,
  acrylicTitle,
  tierKey,
  orientation,
  initialLayout,
  acrylicSize,
}: {
  acrylicId: string;
  initialAssets: AcrylicAsset[];
  acrylicTitle: string;
  tierKey: string;
  orientation: string;
  initialLayout: LayoutType;
  acrylicSize: string;
}) {
  const supabase = getBrowserClient();

  const [assets, setAssets] = useState<AcrylicAsset[]>(initialAssets || []);
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const handleSetLayout = async (layout: LayoutType) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('acrylic_prints')
        .update({ layout_type: layout })
        .eq('id', acrylicId)
        .select('id, layout_type')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update acrylic layout');

      // Clear all assets when switching layout
      await supabase
        .from('acrylic_print_assets')
        .delete()
        .eq('acrylic_id', acrylicId);

      setAssets([]);
      setLayoutType(data.layout_type as LayoutType);
    } catch (err) {
      console.error('LAYOUT CHANGE FAILED:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAsset = (updatedAsset: AcrylicAsset) => {
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
      {/* Phones and small tablets: the editor needs a bigger screen. A kit card on white, with
          the way back to the list, under the floating phone navigation (z 200) and with room for
          it at the bottom, as on the Timeline page. */}
      <div className="fixed inset-0 z-[190] flex flex-col items-center overflow-y-auto bg-white px-4 pt-8 pb-[calc(112px+env(safe-area-inset-bottom,0px))] lg:hidden">
        <EmptyState
          Icon={Monitor}
          tone={toneByKey('orange')}
          title="Bigger screen needed"
          text="The acrylic editor needs a wider screen: a laptop, a desktop, or a tablet turned sideways. Open Ancestorii on one to design your acrylic print."
          className="my-auto w-full max-w-[440px]"
        >
          <Btn href="/dashboard/acrylic" icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}>
            Back to Acrylics
          </Btn>
        </EmptyState>
      </div>

      <div className="hidden lg:block" style={{ height: '100%' }}>
        <AcrylicEditor
          acrylicId={acrylicId}
          assets={assets}
          layoutType={layoutType}
          tierKey={tierKey}
          orientation={orientation}
          acrylicSize={acrylicSize}
          acrylicTitle={acrylicTitle}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onSetLayout={handleSetLayout}
          onUpdateAsset={handleUpdateAsset}
        />
      </div>
    </div>
  );
}