import { getServerClient } from '@/lib/supabase/server';
import AcrylicBuilder from './_components/AcrylicBuilder';

export default async function AcrylicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await getServerClient();
  const { id: acrylicId } = await params;

  const { data: acrylic, error: acrylicError } = await supabase
    .from('acrylic_prints')
    .select('id, title, tier_key, orientation, layout_type, acrylic_size')
    .eq('id', acrylicId)
    .single();

  if (acrylicError) {
    console.error('Failed to load acrylic print:', acrylicError);
    throw new Error(acrylicError.message || 'Failed to load acrylic print');
  }

  const { data: assetRows, error: assetError } = await supabase
    .from('acrylic_print_assets')
    .select(`
      id,
      asset_id,
      slot_index,
      caption,
      crop_data,
      library_media!acrylic_print_assets_asset_id_fkey (
  file_path,
  rotation
)
    `)
    .eq('acrylic_id', acrylicId)
    .order('slot_index', { ascending: true });

  if (assetError) {
    console.error('Failed to load acrylic assets:', assetError);
    throw new Error(assetError.message || 'Failed to load acrylic assets');
  }

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('library-media')
      .createSignedUrl(path, 60 * 60 * 24 * 30);
    return data?.signedUrl || '';
  };

  const transformedAssets = await Promise.all(
    (assetRows || []).map(async (a: any) => {
      const filePath = a.library_media?.file_path;
      let url = '';
      if (filePath) {
        url = await getSignedUrl(filePath);
      }
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
    <AcrylicBuilder
      acrylicId={acrylicId}
      initialAssets={transformedAssets}
      acrylicTitle={acrylic?.title || 'Acrylic Print'}
      tierKey={acrylic?.tier_key || 'centrepiece'}
      orientation={acrylic?.orientation || 'square'}
      initialLayout={acrylic?.layout_type || 'solo'}
      acrylicSize={acrylic?.acrylic_size || '24x24'}
    />
  );
}