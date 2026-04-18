'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { motion } from 'framer-motion';
import LegacyCelebration from '@/components/LegacyCelebration';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import { usePlanLimits } from '@/lib/usePlanLimits';
import CreateBookDrawer from './_components/CreateBookDrawer';
import Image from "next/image";

type Book = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  page_count?: number;
  cover_asset_id: string | null;
  cover_url?: string | null;
};

export default function BooksPage() {
  const supabase = getBrowserClient();

  const [books, setBooks] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const [celebrate, setCelebrate] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { loading: limitsLoading, canCreate } = usePlanLimits();

  const line1 = '“Turn your memories into something you can hold.”';
  const line2 = 'Create beautifully structured memory books from your moments.';

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    (async () => {
      try {
        const { data: sess, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const user = sess?.session?.user;

        if (!user) {
          setError('You need to sign in.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('memory_books_with_page_count')
          .select(`
            id,
            title,
            description,
            created_at,
            cover_asset_id,
            created_content_pages
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const coverIds = Array.from(
          new Set(
            (data || [])
              .map((book: any) => book.cover_asset_id)
              .filter(Boolean)
          )
        ) as string[];

        let coverMap = new Map<string, string>();

        if (coverIds.length > 0) {
          const { data: coverRows, error: coverError } = await supabase
            .from('library_media')
            .select('id, file_path')
            .in('id', coverIds);

          if (coverError) throw coverError;

          const signedEntries = await Promise.all(
            (coverRows || []).map(async (cover: any) => {
              const { data: signed } = await supabase.storage
                .from('library-media')
                .createSignedUrl(cover.file_path, 60 * 60 * 24 * 30);

              return [
                cover.id,
                signed?.signedUrl ? `${signed.signedUrl}&cb=${Date.now()}` : '',
              ] as const;
            })
          );

          coverMap = new Map(
            signedEntries.filter(([, url]) => Boolean(url))
          );
        }

        const booksWithCovers: Book[] = (data || []).map((book: any) => ({
          id: book.id,
          title: book.title,
          description: book.description,
          created_at: book.created_at,
          cover_asset_id: book.cover_asset_id,
          page_count: book.created_content_pages || 0,
          cover_url: book.cover_asset_id
            ? coverMap.get(book.cover_asset_id) || null
            : null,
        }));

        setBooks(booksWithCovers);
      } catch (e: any) {
        setError(e?.message || String(e));
        toast.error('Failed to load memory books.');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleDeleteBook = async (id: string) => {
    try {
      const { error } = await supabase.from('memory_books').delete().eq('id', id);

      if (error) throw error;

      setBooks((prev) => (prev ? prev.filter((b) => b.id !== id) : prev));
      toast.success('Memory book deleted.');
    } catch {
      toast.error('Failed to delete memory book.');
    }
  };

  const canCreateBook =
    (canCreate as any)?.book ??
    (canCreate as any)?.memory_book ??
    (canCreate as any)?.memoryBooks ??
    (canCreate as any)?.album ??
    true;

  return (
    <>
      <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
        <div className="relative z-10 pl-8 pr-6 sm:pl-14 sm:pr-12 lg:pl-20 lg:pr-32 pt-20 pb-16 max-w-[1700px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-start gap-6 mb-14">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-[#222B3A] mb-4 relative inline-block whitespace-nowrap">
                <span className="relative">
                  My
                  <motion.span
                    className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: 70 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                  />
                </span>{' '}
                <span className="text-[#C8A557]">
                  <span className="md:hidden">Books</span>
                  <span className="hidden md:inline">Memory Books</span>
                </span>
              </h1>

              <p className="text-[#000000] mt-3 text-lg italic">{line1}</p>
              <p className="text-[#000000] text-sm mt-2">{line2}</p>
            </div>

            <div className="flex justify-center md:justify-end flex-1">
              <button
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] relative overflow-hidden"
                onClick={() => {
                  if (limitsLoading) return;

                  if (!canCreateBook) {
                    toast.error('You’ve reached your plan limit.');
                    return;
                  }

                  setDrawerMode('create');
                  setSelectedBook(null);
                  setDrawerOpen(true);
                }}
              >
                <span className="relative z-10">+ Create New Book</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
              </button>
            </div>
          </div>

          {loading && <p className="text-center italic">Loading your books...</p>}
          {!loading && error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (books ?? []).length === 0 && (
            <div className="text-center italic mt-12">
              No memory books yet. Start your first one ✨
            </div>
          )}

          {!loading && !error && (books ?? []).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {(books ?? []).map((b) => (
                <div
                  key={b.id}
                  className="relative rounded-3xl border border-[#B7932F]/60 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/95 flex flex-col"
                >
                  <div className="aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden group">
                    {b.cover_url ? (
                      <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105 bg-[#E6C26E]/10">
                        <BookCover src={b.cover_url} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#9AA3AF] text-sm">
                        No cover image
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 z-20">
                    <ContextMenuDots
                      editLabel="Edit Book"
                      onEdit={() => {
                        setDrawerMode('edit');
                        setSelectedBook(b);
                        setDrawerOpen(true);
                      }}
                      onDelete={() =>
                        setConfirmDelete({
                          id: b.id,
                          title: b.title || 'Untitled Book',
                        })
                      }
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-[#222B3A] mb-2 line-clamp-1">
                      {b.title || 'Untitled Book'}
                    </h3>

                    <p className="text-sm text-[#5B6473] mb-3">
                     {b.page_count} pages
                    </p>

                    <p className="text-xs text-[#7A8596] mb-4">
                      Created {new Date(b.created_at).toLocaleDateString()}
                    </p>

                    <Link
                      href={`/dashboard/books/${b.id}`}
                      className="mt-auto block text-center font-semibold px-4 py-3 rounded-full text-[#1F2837] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]"
                    >
                      Open Book →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center">
              <h3 className="text-lg font-semibold text-[#1F2837] mb-3">
                Delete “{confirmDelete.title}”?
              </h3>
              <p className="text-sm text-[#5B6473] mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837]"
                  onClick={() => {
                    handleDeleteBook(confirmDelete.id);
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateBookDrawer
          open={drawerOpen}
          mode={drawerMode}
          book={selectedBook}
          onClose={() => setDrawerOpen(false)}
          onCreated={(book) => {
  setDrawerOpen(false);

  const nextBook: Book = {
    id: book.id,
    title: book.title || 'Untitled Book',
    description: null,
    created_at: new Date().toISOString(),
    page_count: book.content_page_limit ?? 0,
    cover_asset_id: book.cover_asset_id,
    cover_url: book._signed_cover ?? book.cover_image ?? null,
  };

  setBooks((prev) => [nextBook, ...(prev ?? [])]);

  setTimeout(() => setCelebrate(true), 200);
}}
          onUpdated={(book) => {
  setBooks((prev) =>
    prev
      ? prev.map((x) =>
          x.id === book.id
            ? {
                ...x,
                title: book.title || 'Untitled Book',
                cover_asset_id: book.cover_asset_id,
                cover_url: book._signed_cover ?? book.cover_image ?? x.cover_url ?? null,
                page_count: book.content_page_limit ?? x.page_count ?? 0,
              }
            : x
        )
      : prev
  );
}}
        />

        <LegacyCelebration
          open={celebrate}
          onClose={() => setCelebrate(false)}
          emoji="📖"
          message="Your story has begun."
        />
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
}

function BookCover({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full bg-[#E6C26E]/10 overflow-hidden">
      <Image
        src={src}
        alt=""
        fill
        sizes="300px"
        quality={75}
        unoptimized
        loading="lazy"
        className={`object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}