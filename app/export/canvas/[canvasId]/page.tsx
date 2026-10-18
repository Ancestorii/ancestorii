import ExportRenderer from './ExportRenderer';
import type { CanvasAsset } from '@/types/memory-canvas';
import { createClient } from '@supabase/supabase-js';

// A memory_canvas_assets row with its library photo (the shape the select below returns).
type SlotRow = {
  id: string;
  asset_id: string | null;
  slot_index: number;
  caption: string | null;
  crop_data: Record<string, unknown> | null;
  library_media: { file_path: string; rotation: number | null } | null;
};

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
    .maybeSingle();

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

  // One signing call for every placed photo (it used to be one round trip per slot).
  // (The untyped client infers the relation as an array; the FK hint makes it one row.)
  const rows = (assetRows || []) as unknown as SlotRow[];
  const paths = rows.map((a) => a.library_media?.file_path).filter(Boolean) as string[];
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('library-media')
      .createSignedUrls(paths, 60 * 60 * 24);
    (signed ?? []).forEach((item, i) => {
      if (item.signedUrl) urlByPath.set(item.path ?? paths[i], item.signedUrl);
    });
  }

  const assets: CanvasAsset[] = rows.map((a) => ({
    id: a.id,
    asset_id: a.asset_id ?? undefined,
    slot_index: a.slot_index,
    caption: a.caption,
    crop_data: a.crop_data || {},
    url: (a.library_media && urlByPath.get(a.library_media.file_path)) || '',
    rotation: a.library_media?.rotation ?? 0,
  }));

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