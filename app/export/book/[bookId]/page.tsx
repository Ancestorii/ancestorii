import ExportRenderer from './ExportRenderer';
import type {
  Asset,
  BackCoverLayoutType,
  BookPageRow,
  CoverDesignJson,
  CoverLayoutType,
} from '@/types/memory-book';
import { createClient } from '@supabase/supabase-js';

// Long enough for Puppeteer to load every photo, short because the urls go no further.
const SIGNED_URL_TTL = 60 * 60 * 24;

const COVER_LAYOUTS: string[] = ['classic_cover', 'full_bleed_cover', 'trio_cover'];
const BACK_COVER_LAYOUTS: string[] = ['blank_back', 'dedication_back', 'photo_message_back'];

// An error the print routes can see at once: they wait for data-export-ready OR
// data-export-error, so a missing book fails in a second instead of after a 60s timeout.
function ExportError({ message }: { message: string }) {
  return (
    <div data-export-error={message} style={{ padding: 40, fontFamily: 'sans-serif', color: '#333' }}>
      <h1>Export Error</h1>
      <p>{message}</p>
    </div>
  );
}

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

  // ── 1. Book metadata and pages (independent: one round trip) ──
  const [{ data: book, error: bookError }, { data: pages, error: pagesError }] = await Promise.all([
    supabase
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
      .maybeSingle(),
    supabase
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
            file_path,
            rotation
          )
        )
      `
      )
      .eq('book_id', bookId)
      .order('page_number', { ascending: true }),
  ]);

  if (bookError || !book) {
    return <ExportError message={bookError?.message || 'Book not found.'} />;
  }

  if (pagesError) {
    return <ExportError message={pagesError.message} />;
  }

  // ── 2. Cover assets: library rows by id (one query) ──
  const pageRows = (pages || []) as unknown as BookPageRow[];

  const coverDesign: CoverDesignJson =
    book.cover_design && typeof book.cover_design === 'object'
      ? book.cover_design
      : {};

  const backCoverDesign: CoverDesignJson =
    book.back_cover_design && typeof book.back_cover_design === 'object'
      ? book.back_cover_design
      : {};

  const rawCoverAssets: Asset[] = Array.isArray(coverDesign.assets) ? coverDesign.assets : [];
  const rawBackCoverAssets: Asset[] = Array.isArray(backCoverDesign.assets) ? backCoverDesign.assets : [];

  const coverAssetIds = Array.from(
    new Set(
      [...rawCoverAssets, ...rawBackCoverAssets]
        .map((a) => a.asset_id)
        .filter((id): id is string => !!id)
    )
  );

  const mediaById = new Map<string, { file_path: string; rotation: number }>();
  if (coverAssetIds.length) {
    const { data: mediaRows } = await supabase
      .from('library_media')
      .select('id, file_path, rotation')
      .in('id', coverAssetIds);

    for (const row of mediaRows || []) {
      mediaById.set(row.id, { file_path: row.file_path, rotation: row.rotation ?? 0 });
    }
  }

  // ── 3. Sign every photo (pages and covers) in one call ──
  const paths = new Set<string>();
  for (const p of pageRows) {
    for (const a of p.memory_book_page_assets || []) {
      if (a.library_media?.file_path) paths.add(a.library_media.file_path);
    }
  }
  for (const media of mediaById.values()) paths.add(media.file_path);

  const urlByPath = new Map<string, string>();
  if (paths.size) {
    const { data: signed } = await supabase.storage
      .from('library-media')
      .createSignedUrls(Array.from(paths), SIGNED_URL_TTL);

    for (const s of signed || []) {
      if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
    }
  }

  // ── 4. Pages with their urls ──
  const transformedPages = pageRows.map((p) => ({
    id: p.id,
    page_number: p.page_number,
    layout_type: p.layout_type,
    show_subheading: p.show_subheading,
    show_comment: p.show_comment,
    assets: (p.memory_book_page_assets || []).map((a) => {
      const filePath = a.library_media?.file_path;
      return {
        id: a.id,
        asset_id: a.asset_id,
        slot_index: a.slot_index,
        subheading: a.subheading,
        comment: a.comment,
        url: filePath ? urlByPath.get(filePath) || '' : '',
        rotation: a.library_media?.rotation ?? 0,
      };
    }),
  }));

  // ── 5. Covers with their urls ──
  const hydrateAssets = (rawAssets: Asset[]): Asset[] =>
    rawAssets.map((asset) => {
      if (!asset.asset_id) return asset;
      const media = mediaById.get(asset.asset_id);
      if (!media) return asset;
      return { ...asset, url: urlByPath.get(media.file_path) || '', rotation: media.rotation };
    });

  const coverLayout: CoverLayoutType =
    typeof coverDesign.layout === 'string' && COVER_LAYOUTS.includes(coverDesign.layout)
      ? (coverDesign.layout as CoverLayoutType)
      : 'classic_cover';

  const backCoverLayout: BackCoverLayoutType =
    typeof backCoverDesign.layout === 'string' && BACK_COVER_LAYOUTS.includes(backCoverDesign.layout)
      ? (backCoverDesign.layout as BackCoverLayoutType)
      : 'blank_back';

  const coverAssets = hydrateAssets(rawCoverAssets);
  const backCoverAssets = hydrateAssets(rawBackCoverAssets);

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
