'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Monitor } from 'lucide-react';
import { Btn, EmptyState, toneByKey } from '@/components/dashboard/ui/AppBits';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import BookCanvas from './book-canvas/BookCanvas';
import type { Asset, BookCoverState, Page, SelectedImage, LayoutType } from '@/types/memory-book';
import BookAI from './BookAI';

export default function BookBuilder({
  bookId,
  initialPages,
  initialCover,
  bookTitle,
  tierKey,
}: {
  bookId: string;
  initialPages: Page[];
  initialCover: BookCoverState;
  bookTitle: string;
  tierKey: string;
}) {
  const supabase = getBrowserClient();

  const [pages, setPages] = useState<Page[]>(initialPages || []);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  // Back from Stripe: checkout returns to this page with order_success or order_canceled in the
  // url. Say so once, then drop the flag so a refresh does not repeat it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('order_success');
    const canceled = params.get('order_canceled');
    if (!success && !canceled) return;

    if (success) {
      toast.success('Thank you! Your order is confirmed. We will email you when your book ships.');
    } else {
      toast.info('Checkout cancelled. Your book is saved and ready whenever you are.');
    }

    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, []);

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.page_number - b.page_number),
    [pages]
  );

 const handleSetLayout = async (pageId: string, layout: LayoutType) => {
    try {
      setLoading(true);

      // .maybeSingle(): a change row security refuses comes back as no row, not a 406.
      const { data, error } = await supabase
        .from('memory_book_pages')
        .update({ layout_type: layout })
        .eq('id', pageId)
        .eq('book_id', bookId)
        .select('id, layout_type')
        .maybeSingle();

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
      toast.error('Could not change the page layout. Please try again.');
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
          centres with auto margins, so on a short landscape phone it scrolls instead of losing its top.
          Under the floating phone navigation (z 200) and over the Story Assistance pill (z 150),
          with room for the navigation at the bottom, as on the Timeline page. */}
      <div className="fixed inset-0 z-[190] flex flex-col items-center overflow-y-auto bg-white px-4 pt-8 pb-[calc(112px+env(safe-area-inset-bottom,0px))] lg:hidden">
        <EmptyState
          Icon={Monitor}
          tone={toneByKey('orange')}
          title="Bigger screen needed"
          text="The book builder needs a wider screen: a laptop, a desktop, or a tablet turned sideways. Open Ancestorii on one to build your memory book."
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
          initialCover={initialCover}
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
