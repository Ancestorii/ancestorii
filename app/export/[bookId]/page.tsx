import ExportRenderer from './ExportRenderer';
import type { Asset } from '@/types/memory-book';
import { createClient } from '@supabase/supabase-js';

export default async function ExportPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
  const { bookId } = await params;

  // ── 1. Fetch book metadata ──
  const { data: book, error: bookError } = await supabase
    .from('memory_books')
    .select(
      `
      id,
      title,
      cover_design,
      back_cover_design,
      spine_text,
      spine_bg_colour,
      spine_text_colour
    `
    )
    .eq('id', bookId)
    .single();

  if (bookError || !book) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Export Error</h1>
        <p>{bookError?.message || 'Book not found.'}</p>
      </div>
    );
  }

  // ── 2. Fetch pages with assets ──
  const { data: pages, error: pagesError } = await supabase
    .from('memory_book_pages')
    .select(
      `
      id,
      page_number,
      layout_type,
      show_subheading,
      show_comment,
      memory_book_page_assets (
        id,
        asset_id,
        slot_index,
        subheading,
        comment,
        library_media!memory_book_page_assets_asset_id_fkey (
          file_path
        )
      )
    `
    )
    .eq('book_id', bookId)
    .order('page_number', { ascending: true });

  if (pagesError) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Export Error</h1>
        <p>{pagesError.message}</p>
      </div>
    );
  }

  // ── 3. Helper: generate fresh 1-hour signed URL ──
  const getSignedUrl = async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('library-media')
      .createSignedUrl(path, 60 * 60 * 24); 
    return data?.signedUrl || '';
  };

  // ── 4. Transform pages with signed URLs ──
  const transformedPages = await Promise.all(
    (pages || []).map(async (p: any) => {
      const assets = await Promise.all(
        (p.memory_book_page_assets || []).map(async (a: any) => {
          const filePath = a.library_media?.file_path;
          let url = '';
          if (filePath) {
            url = await getSignedUrl(filePath);
          }
          return {
            id: a.id,
            asset_id: a.asset_id,
            slot_index: a.slot_index,
            subheading: a.subheading,
            comment: a.comment,
            url,
          };
        })
      );

      return {
        id: p.id,
        page_number: p.page_number,
        layout_type: p.layout_type,
        show_subheading: p.show_subheading,
        show_comment: p.show_comment,
        assets,
      };
    })
  );

  // ── 5. Hydrate cover assets with signed URLs ──
  const hydrateAssets = async (rawAssets: Asset[]): Promise<Asset[]> => {
    const assetIds = rawAssets
      .map((a) => a.asset_id)
      .filter((id): id is string => !!id);

    if (!assetIds.length) return rawAssets;

    const { data: mediaRows } = await supabase
      .from('library_media')
      .select('id, file_path')
      .in('id', assetIds);

    const filePathById = new Map(
      (mediaRows || []).map((row: any) => [row.id, row.file_path])
    );

    return Promise.all(
      rawAssets.map(async (asset) => {
        if (!asset.asset_id) return asset;
        const filePath = filePathById.get(asset.asset_id);
        if (!filePath) return asset;
        const url = await getSignedUrl(filePath);
        return { ...asset, url };
      })
    );
  };

  const coverDesign =
    book.cover_design && typeof book.cover_design === 'object'
      ? (book.cover_design as any)
      : {};

  const backCoverDesign =
    book.back_cover_design && typeof book.back_cover_design === 'object'
      ? (book.back_cover_design as any)
      : {};

  const coverLayout = ['classic_cover', 'full_bleed_cover', 'trio_cover'].includes(
    coverDesign.layout
  )
    ? coverDesign.layout
    : 'classic_cover';

  const backCoverLayout = ['blank_back', 'dedication_back', 'photo_message_back'].includes(
    backCoverDesign.layout
  )
    ? backCoverDesign.layout
    : 'blank_back';

  const coverAssets = await hydrateAssets(
    Array.isArray(coverDesign.assets) ? coverDesign.assets : []
  );

  const backCoverAssets = await hydrateAssets(
    Array.isArray(backCoverDesign.assets) ? backCoverDesign.assets : []
  );

  return (
    <ExportRenderer
      bookTitle={book.title || 'Memory Book'}
      pages={transformedPages}
      coverLayout={coverLayout}
      backCoverLayout={backCoverLayout}
      coverAssets={coverAssets}
      backCoverAssets={backCoverAssets}
      spineText={book.spine_text || ''}
      spineBgColour={book.spine_bg_colour || '#0f2040'}
      spineTextColour={book.spine_text_colour || '#d4af37'}
    />
  );
}