'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Monitor } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
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

  // Back from Stripe Checkout (create-acrylic-checkout's success_url and cancel_url): say what
  // happened, then drop the flags from the address so a refresh does not repeat the message.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('order_success') === 'true';
    const cancelled = params.get('order_canceled') === 'true';
    if (!success && !cancelled) return;
    if (success) {
      toast.success('Thank you! Your order is confirmed and your acrylic print is going into production.');
    } else {
      toast.info('Checkout cancelled. Your acrylic print is saved, so you can order it whenever you like.');
    }
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, []);

  const handleSetLayout = async (layout: LayoutType) => {
    // The same layout again is not a change (it used to wipe every photo on the print).
    if (layout === layoutType || loading) return;

    try {
      setLoading(true);

      // Clearing the slots comes first, and is checked: only the print's creator may delete
      // them, and row security refuses anyone else quietly (0 rows, no error), so a family
      // member's switch stops here instead of changing the layout and leaving the photos
      // behind for the next load.
      if (assets.some((a) => a.id)) {
        const { data: removed, error: removeError } = await supabase
          .from('acrylic_print_assets')
          .delete()
          .eq('acrylic_id', acrylicId)
          .select('id');

        if (removeError) throw removeError;
        if (!removed || removed.length === 0) {
          toast.error('Only the person who created this acrylic print can change its layout.');
          return;
        }
        setAssets([]);
      }

      const { data, error } = await supabase
        .from('acrylic_prints')
        .update({ layout_type: layout })
        .eq('id', acrylicId)
        .select('id, layout_type')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to update acrylic layout');

      setAssets([]);
      setLayoutType(data.layout_type as LayoutType);
    } catch (err) {
      console.error('LAYOUT CHANGE FAILED:', err);
      toast.error('Could not change the layout. Please try again.');
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
