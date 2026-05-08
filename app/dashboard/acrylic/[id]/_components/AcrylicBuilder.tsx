'use client';

import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import AcrylicEditor from './acrylic-editor/AcrylicEditor';
import type { AcrylicAsset, SelectedImage, LayoutType } from '@/types/acrylic-print';

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
      <div
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#FDFAF5',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <svg width="48" height="48" fill="none" stroke="#d4af37" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 24 }}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1714', marginBottom: 8 }}>
          Bigger screen needed
        </h2>
        <p style={{ fontSize: 14, color: '#6B6358', lineHeight: 1.6, maxWidth: 320 }}>
          The acrylic editor works best on a laptop, desktop, or tablet. Open
          Ancestorii on a bigger screen to design your acrylic print.
        </p>
        <a
          href="/dashboard/acrylic"
          style={{
            marginTop: 24,
            padding: '10px 24px',
            borderRadius: 10,
            background: '#1A1714',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Back to Acrylics
        </a>
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