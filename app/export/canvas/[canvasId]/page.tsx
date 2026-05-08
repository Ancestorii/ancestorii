import ExportRenderer from './ExportRenderer';
import type { CanvasAsset } from '@/types/memory-canvas';
import { createClient } from '@supabase/supabase-js';

export default async function CanvasExportPage({
  params,
}: {
  params: Promise<{ canvasId: string }>;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { canvasId } = await params;

  const { data: canvas, error: canvasError } = await supabase
    .from('memory_canvases')
    .select('id, title, tier_key, orientation, layout_type, canvas_size, export_width_px, export_height_px')
    .eq('id', canvasId)
    .single();

  if (canvasError || !canvas) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Export Error</h1>
        <p>{canvasError?.message || 'Canvas not found.'}</p>
      </div>
    );
  }

  const { data: assetRows, error: assetError } = await supabase
    .from('memory_canvas_assets')
    .select(`
      id, asset_id, slot_index, caption, crop_data,
      library_media!memory_canvas_assets_asset_id_fkey ( file_path, rotation )
    `)
    .eq('canvas_id', canvasId)
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

  const assets: CanvasAsset[] = await Promise.all(
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
      canvasId={canvas.id}
      assets={assets}
      layoutType={canvas.layout_type}
      tierKey={canvas.tier_key}
      orientation={canvas.orientation}
      exportWidth={canvas.export_width_px}
      exportHeight={canvas.export_height_px}
    />
  );
}