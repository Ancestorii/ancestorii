'use client';

import { useMemo, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import BookCanvas from './book-canvas/BookCanvas';
import type { Asset, Page, SelectedImage, LayoutType } from '@/types/memory-book';

export default function BookBuilder({
  bookId,
  initialPages,
  bookTitle,
  tierKey,
}: {
  bookId: string;
  initialPages: Page[];
  bookTitle: string;
  tierKey: string;
}) {
  const supabase = getBrowserClient();

  const [pages, setPages] = useState<Page[]>(initialPages || []);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.page_number - b.page_number),
    [pages]
  );

 const handleSetLayout = async (pageId: string, layout: LayoutType) => {
    console.log('LAYOUT CHANGE:', pageId, layout);
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('memory_book_pages')
        .update({ layout_type: layout })
        .eq('id', pageId)
        .eq('book_id', bookId)
        .select('id, layout_type')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update page layout');

      setPages((prev) =>
        prev.map((page) =>
          page.id === pageId
            ? { ...page, layout_type: data.layout_type as LayoutType }
            : page
        )
      );
    } catch (err) {
      console.error('LAYOUT CHANGE FAILED:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAsset = (pageId: string, updatedAsset: Asset) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;

        const existingIndex = page.assets.findIndex(
          (asset) => asset.slot_index === updatedAsset.slot_index
        );

        const nextAssets = [...page.assets];

        if (existingIndex >= 0) {
          nextAssets[existingIndex] = updatedAsset;
        } else {
          nextAssets.push(updatedAsset);
        }

        return {
          ...page,
          assets: nextAssets.sort((a, b) => a.slot_index - b.slot_index),
        };
      })
    );
  };

  const handleUpdatePage = (pageId: string, field: string, value: boolean) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <>
      <BookCanvas
        bookId={bookId}
        pages={sortedPages}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        onOpenLayoutModal={handleSetLayout}
        onUpdateAsset={handleUpdateAsset}
        bookTitle={bookTitle}
        tierKey={tierKey}
        onUpdatePage={handleUpdatePage}
      />
    </>
  );
}