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
    <div style={{ height: '100%' }}>
      <div
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#FDFAF5',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <svg width="48" height="48" fill="none" stroke="#d4af37" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 24 }}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1714', marginBottom: 8 }}>Bigger screen needed</h2>
        <p style={{ fontSize: 14, color: '#6B6358', lineHeight: 1.6, maxWidth: 320 }}>The book builder works best on a laptop, desktop, or tablet. Open Ancestorii on a bigger screen to build your memory book.</p>
        <a href="/dashboard/books" style={{ marginTop: 24, padding: '10px 24px', borderRadius: 10, background: '#1A1714', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Back to Books</a>
      </div>
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