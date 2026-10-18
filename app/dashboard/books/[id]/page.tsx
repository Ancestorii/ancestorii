import { notFound } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';
import BookBuilder from './_components/BookBuilder';
import type {
  Asset,
  BackCoverLayoutType,
  BookCoverState,
  BookPageRow,
  CoverDesignJson,
  CoverLayoutType,
} from '@/types/memory-book';

// Photos are signed once for a month: the editor keeps the same urls through every autosave,
// so nothing re-downloads or flickers while the book is being built.
const SIGNED_URL_TTL = 60 * 60 * 24 * 30;

const COVER_LAYOUTS: string[] = ['classic_cover', 'full_bleed_cover', 'trio_cover'];
const BACK_COVER_LAYOUTS: string[] = ['blank_back', 'dedication_back', 'photo_message_back'];

const asCoverLayout = (v: unknown): CoverLayoutType =>
  typeof v === 'string' && COVER_LAYOUTS.includes(v) ? (v as CoverLayoutType) : 'classic_cover';

const asBackCoverLayout = (v: unknown): BackCoverLayoutType =>
  typeof v === 'string' && BACK_COVER_LAYOUTS.includes(v) ? (v as BackCoverLayoutType) : 'blank_back';

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await getServerClient();
  const { id: bookId } = await params;

  // The book and its pages do not depend on each other: one round trip instead of two.
  const [{ data: book, error: bookError }, { data: pages, error: pagesError }] = await Promise.all([
    supabase
      .from('memory_books')
      .select('title, tier_key, cover_design, back_cover_design, spine_text, spine_bg_colour, spine_text_colour')
      .eq('id', bookId)
      .maybeSingle(),
    supabase
      .from('memory_book_pages')
      .select(`
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
      `)
      .eq('book_id', bookId)
      .order('page_number', { ascending: true }),
  ]);

  if (bookError) {
    console.error('Failed to load book:', bookError);
    throw new Error(bookError.message || 'Failed to load book');
  }

  // Row security hides a book from anyone outside its family (and a deleted one from everyone):
  // a plain not-found page, not a 406 from .single().
  if (!book) notFound();

  if (pagesError) {
    console.error('Failed to load pages:', pagesError);
    throw new Error(pagesError.message || 'Failed to load pages');
  }

  const pageRows = (pages || []) as unknown as BookPageRow[];

  const coverDesign: CoverDesignJson =
    book.cover_design && typeof book.cover_design === 'object' ? book.cover_design : {};
  const backCoverDesign: CoverDesignJson =
    book.back_cover_design && typeof book.back_cover_design === 'object' ? book.back_cover_design : {};

  const rawCoverAssets: Asset[] = Array.isArray(coverDesign.assets) ? coverDesign.assets : [];
  const rawBackCoverAssets: Asset[] = Array.isArray(backCoverDesign.assets) ? backCoverDesign.assets : [];

  // Cover photos are stored by library id: look their paths up in one query.
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

  // Every photo on every page and cover is signed in ONE call (they used to be signed one by one).
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

  const hydrateCover = (assets: Asset[]): Asset[] =>
    assets.map((asset) => {
      if (!asset.asset_id) return asset;
      const media = mediaById.get(asset.asset_id);
      if (!media) return asset;
      return { ...asset, url: urlByPath.get(media.file_path) || '', rotation: media.rotation };
    });

  // The cover state travels with the page, so the editor no longer fetches it (and signs its
  // photos one by one) after it has painted: the cover is there from the first frame.
  const initialCover: BookCoverState = {
    coverLayout: asCoverLayout(coverDesign.layout),
    backCoverLayout: asBackCoverLayout(backCoverDesign.layout),
    coverAssets: hydrateCover(rawCoverAssets),
    backCoverAssets: hydrateCover(rawBackCoverAssets),
    spineText: book.spine_text || '',
    spineBgColour: book.spine_bg_colour || '#0f2040',
    spineTextColour: book.spine_text_colour || '#d4af37',
  };

  return (
    <BookBuilder
      bookId={bookId}
      initialPages={transformedPages}
      initialCover={initialCover}
      bookTitle={book.title || 'Memory Book'}
      tierKey={book.tier_key || 'story'}
    />
  );
}
