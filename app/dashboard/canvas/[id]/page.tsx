import { notFound } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';
import CanvasBuilder from './_components/Canvasbuilder';

// A memory_canvas_assets row with its library photo (the shape the select below returns).
type SlotRow = {
  id: string;
  asset_id: string | null;
  slot_index: number;
  caption: string | null;
  crop_data: Record<string, unknown> | null;
  library_media: { file_path: string; rotation: number | null } | null;
};

export default async function CanvasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await getServerClient();
  const [{ id: canvasId }, query] = await Promise.all([params, searchParams]);

  // Stripe sends the buyer back here with ?order_success=true (or ?order_canceled=true).
  const orderNotice =
    query.order_success === 'true' ? 'success' : query.order_canceled === 'true' ? 'canceled' : null;

  // The canvas and its slots are independent reads, so they go out together.
  const [{ data: canvas, error: canvasError }, { data: assetRows, error: assetError }] =
    await Promise.all([
      supabase
        .from('memory_canvases')
        .select('id, title, tier_key, orientation, layout_type, canvas_size')
        .eq('id', canvasId)
        .maybeSingle(),
      supabase
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
        .order('slot_index', { ascending: true }),
    ]);

  if (canvasError) {
    console.error('Failed to load canvas:', canvasError);
    throw new Error(canvasError.message || 'Failed to load canvas');
  }

  // No row: the canvas does not exist, or it belongs to another family (row security hides it).
  if (!canvas) notFound();

  if (assetError) {
    console.error('Failed to load canvas assets:', assetError);
    throw new Error(assetError.message || 'Failed to load canvas assets');
  }

  // One signing call for every placed photo (it used to be one round trip per slot).
  // (The untyped client infers the relation as an array; the FK hint makes it one row.)
  const rows = (assetRows || []) as unknown as SlotRow[];
  const paths = rows.map((a) => a.library_media?.file_path).filter(Boolean) as string[];
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('library-media')
      .createSignedUrls(paths, 60 * 60 * 24 * 30);
    (signed ?? []).forEach((item, i) => {
      if (item.signedUrl) urlByPath.set(item.path ?? paths[i], item.signedUrl);
    });
  }

  const transformedAssets = rows.map((a) => ({
    id: a.id,
    asset_id: a.asset_id ?? undefined,
    slot_index: a.slot_index,
    caption: a.caption,
    crop_data: a.crop_data || {},
    url: (a.library_media && urlByPath.get(a.library_media.file_path)) || '',
    rotation: a.library_media?.rotation ?? 0,
  }));

  return (
    <CanvasBuilder
      canvasId={canvasId}
      initialAssets={transformedAssets}
      canvasTitle={canvas.title || 'Memory Canvas'}
      tierKey={canvas.tier_key || 'heirloom'}
      orientation={canvas.orientation || 'landscape'}
      initialLayout={canvas.layout_type || 'solo'}
      canvasSize={canvas.canvas_size || '20x32'}
      orderNotice={orderNotice}
    />
  );
}
