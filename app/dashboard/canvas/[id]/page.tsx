import { getServerClient } from '@/lib/supabase/server';
import CanvasBuilder from './_components/Canvasbuilder';

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await getServerClient();
  const { id: canvasId } = await params;

  const { data: canvas, error: canvasError } = await supabase
    .from('memory_canvases')
    .select('id, title, tier_key, orientation, layout_type, canvas_size')
    .eq('id', canvasId)
    .single();

  if (canvasError) {
    console.error('Failed to load canvas:', canvasError);
    throw new Error(canvasError.message || 'Failed to load canvas');
  }

  const { data: assetRows, error: assetError } = await supabase
    .from('memory_canvas_assets')
    .select(`
      id,
      asset_id,
      slot_index,
      caption,
      crop_data,
      library_media!memory_canvas_assets_asset_id_fkey (
      file_path,
      rotation
      )
    `)
    .eq('canvas_id', canvasId)
    .order('slot_index', { ascending: true });

  if (assetError) {
    console.error('Failed to load canvas assets:', assetError);
    throw new Error(assetError.message || 'Failed to load canvas assets');
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
    <CanvasBuilder
      canvasId={canvasId}
      initialAssets={transformedAssets}
      canvasTitle={canvas?.title || 'Memory Canvas'}
      tierKey={canvas?.tier_key || 'heirloom'}
      orientation={canvas?.orientation || 'landscape'}
      initialLayout={canvas?.layout_type || 'solo'}
      canvasSize={canvas?.canvas_size || '20x32'}
    />
  );
}