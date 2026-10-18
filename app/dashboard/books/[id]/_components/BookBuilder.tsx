'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Monitor } from 'lucide-react';
import { Btn, EmptyState, toneByKey } from '@/components/dashboard/ui/AppBits';
import { getBrowserClient } from '@/lib/supabase/browser';
import BookCanvas from './book-canvas/BookCanvas';
import type { Asset, Page, SelectedImage, LayoutType } from '@/types/memory-book';
import BookAI from './BookAI';

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
    <div style={{ height: '100%' }}>
      {/* Below the editor's breakpoint: a message instead of the editor (as before). The card
          centres with auto margins, so on a short landscape phone it scrolls instead of losing its top. */}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center overflow-y-auto bg-white px-4 py-8 lg:hidden">
        <EmptyState
          Icon={Monitor}
          tone={toneByKey('orange')}
          title="Bigger screen needed"
          text="The book builder works best on a laptop, desktop, or tablet. Open Ancestorii on a bigger screen to build your memory book."
          className="my-auto w-full max-w-[440px]"
        >
          <Btn href="/dashboard/books" icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}>
            Back to Books
          </Btn>
        </EmptyState>
      </div>
      <BookAI bookTitle={bookTitle} />
      <div className="hidden lg:block" style={{ height: '100%' }}>
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
      </div>
    </div>
  );
}