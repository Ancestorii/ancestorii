import ExportRenderer from './ExportRenderer';
import type { AcrylicAsset } from '@/types/acrylic-print';
import { createClient } from '@supabase/supabase-js';

export default async function AcrylicExportPage({
  params,
}: {
  params: Promise<{ acrylicId: string }>;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { acrylicId } = await params;

  const { data: acrylic, error: acrylicError } = await supabase
    .from('acrylic_prints')
    .select('id, title, tier_key, orientation, layout_type, acrylic_size, export_width_px, export_height_px')
    .eq('id', acrylicId)
    .single();

  if (acrylicError || !acrylic) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Export Error</h1>
        <p>{acrylicError?.message || 'Acrylic print not found.'}</p>
      </div>
    );
  }

  const { data: assetRows, error: assetError } = await supabase
    .from('acrylic_print_assets')
    .select(`
      id, asset_id, slot_index, caption, crop_data,
      library_media!acrylic_print_assets_asset_id_fkey ( file_path, rotation )
    `)
    .eq('acrylic_id', acrylicId)
    .order('slot_index', { ascending: true });

  if (assetError) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Export Error</h1>
        <p>{assetError.message}</p>
      </div>
    );
  }

  const getSignedUrl = async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('library-media')
      .createSignedUrl(path, 60 * 60 * 24);
    return data?.signedUrl || '';
  };

  const assets: AcrylicAsset[] = await Promise.all(
    (assetRows || []).map(async (a: any) => {
      const filePath = a.library_media?.file_path;
      let url = '';
      if (filePath) url = await getSignedUrl(filePath);
      return {
  id: a.id,
  asset_id: a.asset_id,
  slot_index: a.slot_index,
  caption: a.caption,
  crop_data: a.crop_data || {},
  url,
  rotation: a.library_media?.rotation ?? 0,
};
    })
  );

  return (
    <ExportRenderer
      acrylicId={acrylic.id}
      assets={assets}
      layoutType={acrylic.layout_type}
      tierKey={acrylic.tier_key}
      orientation={acrylic.orientation}
      exportWidth={acrylic.export_width_px}
      exportHeight={acrylic.export_height_px}
    />
  );
}