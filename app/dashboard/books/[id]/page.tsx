import { getServerClient } from '@/lib/supabase/server';
import BookBuilder from './_components/BookBuilder';

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await getServerClient();
  const { id: bookId } = await params;

  const { data: pages, error } = await supabase
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
          file_path
        )
      )
    `)
    .eq('book_id', bookId)
    .order('page_number', { ascending: true });

  if (error) {
    console.error('Failed to load pages:', error);
    throw new Error(error.message || 'Failed to load pages');
  }

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('library-media')
      .createSignedUrl(path, 60 * 60 * 24 * 30);

    return data?.signedUrl || '';
  };

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

 const { data: book } = await supabase
  .from('memory_books')
  .select('title, tier_key')
  .eq('id', bookId)
  .single();

  return (
  <BookBuilder
    bookId={bookId}
    initialPages={transformedPages}
    bookTitle={book?.title || 'Memory Book'}
    tierKey={book?.tier_key || 'story'}
  />
)}