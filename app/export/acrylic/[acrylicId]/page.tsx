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

  // The print and its slots are independent reads, so they go out together.
  const [
    { data: acrylic, error: acrylicError },
    { data: assetRows, error: assetError },
  ] = await Promise.all([
    supabase
      .from('acrylic_prints')
      .select('id, title, tier_key, orientation, layout_type, acrylic_size, export_width_px, export_height_px')
      .eq('id', acrylicId)
      .maybeSingle(),
    supabase
      .from('acrylic_print_assets')
      .select(`
        id, asset_id, slot_index, caption, crop_data,
        library_media!acrylic_print_assets_asset_id_fkey ( file_path, rotation )
      `)
      .eq('acrylic_id', acrylicId)
      .order('slot_index', { ascending: true }),
  ]);

  if (acrylicError || !acrylic) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Export Error</h1>
        <p>{acrylicError?.message || 'Acrylic print not found.'}</p>
      </div>
    );
  }

  if (assetError) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Export Error</h1>
        <p>{assetError.message}</p>
      </div>
    );
  }

  // One signing call for every slot's photo instead of one per slot.
  const rows = (assetRows || []) as any[];
  const paths = rows
    .map((a) => a.library_media?.file_path as string | undefined)
    .filter((p): p is string => Boolean(p));
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const unique = Array.from(new Set(paths));
    const { data: signed } = await supabase.storage
      .from('library-media')
      .createSignedUrls(unique, 60 * 60 * 24);
    (signed ?? []).forEach((item, i) => {
      if (item.signedUrl) urlByPath.set(unique[i], item.signedUrl);
    });
  }

  const assets: AcrylicAsset[] = rows.map((a) => {
    const filePath = a.library_media?.file_path as string | undefined;
    return {
      id: a.id,
      asset_id: a.asset_id,
      slot_index: a.slot_index,
      caption: a.caption,
      crop_data: a.crop_data || {},
      url: filePath ? urlByPath.get(filePath) || '' : '',
      rotation: a.library_media?.rotation ?? 0,
    };
  });

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
