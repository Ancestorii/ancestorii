'use client';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Book, Image as ImageIcon, Plus } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import LegacyCelebration from '@/components/LegacyCelebration';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import CreateBookDrawer from './_components/CreateBookDrawer';
import Image from "next/image";
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  EmptyState,
  IconTile,
  PageHeader,
  btnClass,
  toneByKey,
  toneFor,
  useDialog,
} from '@/components/dashboard/ui/AppBits';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Memory Books are orange in the landing's feature index.
const ORANGE = toneByKey('orange');

// Dates on the card, the British way: "28 Mar 2026".
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

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

  // Escape cancels the delete question, Tab stays inside it.
  const confirmRef = useDialog<HTMLDivElement>(!!confirmDelete, () => setConfirmDelete(null));
  const confirmTitleId = useId();
  const confirmTextId = useId();

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

          // One signing call for every cover (not one per book), and no cache buster: the
          // browser keeps the image between visits, so covers no longer pop in late.
          const rows = (coverRows || []) as { id: string; file_path: string }[];
          const { data: signed } = await supabase.storage
            .from('library-media')
            .createSignedUrls(rows.map((cover) => cover.file_path), 60 * 60 * 24 * 30);

          const urlByPath = new Map<string, string>();
          for (const s of signed || []) {
            if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
          }

          coverMap = new Map(
            rows
              .map((cover) => [cover.id, urlByPath.get(cover.file_path) || ''] as const)
              .filter(([, url]) => Boolean(url))
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
      // deleteWithOwnerCheck: a delete blocked by the creator-only policy removes 0 rows with
      // no error; the page used to say "deleted" and hide the card until the next reload.
      const deleted = await deleteWithOwnerCheck(supabase, 'memory_books', id, 'memory book');
      if (!deleted) return;

      setBooks((prev) => (prev ? prev.filter((b) => b.id !== id) : prev));
      toast.success('Memory book deleted.');
      window.dispatchEvent(new Event('dashboard-data-changed'));
    } catch {
      toast.error('Failed to delete memory book.');
    }
  };

  // The create button (in the header and in the empty state). Memory Books have no plan limit
  // (they are bought, not stored against a tier): the page used to run the five plan-limit
  // queries and, finding no book limit, gate this button on the ALBUM limit by mistake.
  const openCreate = () => {
    setDrawerMode('create');
    setSelectedBook(null);
    setDrawerOpen(true);
  };

  const createButton = (
    <Btn onClick={openCreate} aria-haspopup="dialog" tile={<Plus size={18} strokeWidth={2.6} />}>
      Create New Book
    </Btn>
  );

  const list = books ?? [];

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <PageHeader
          eyebrow="Memory Books"
          eyebrowDot="var(--c2)"
          title={
            <>
              My{' '}
              <Accent>
                <span className="md:hidden">Books</span>
                <span className="hidden md:inline">Memory Books</span>
              </Accent>
            </>
          }
          lead={`${line1} ${line2}`}
          actions={createButton}
        />

        <section className={ui.section} aria-label="Your memory books">
          {loading && <AppLoader label="Loading your books" />}

          {!loading && error && (
            <p className={ui.noticeError} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && list.length === 0 && (
            <EmptyState Icon={Book} tone={ORANGE} title="No memory books yet" text="Start your first one.">
              {createButton}
            </EmptyState>
          )}

          {/* Columns follow the space beside the sidebar: 1 on phones, 2 on tablets, 3 on desktops */}
          {!loading && !error && list.length > 0 && (
            <div className="@container">
              <ul role="list" className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
                {list.map((b) => {
                  const titleId = `book-title-${b.id}`;
                  return (
                    <li key={b.id} className="min-w-0">
                      {/* A white card holding the cover in a solid colour frame (radius 22 inside 28,
                          6px apart, so the corners stay concentric). With its menu open it sits over
                          the cards after it. */}
                      <article
                        aria-labelledby={titleId}
                        className={cx(
                          ui.card,
                          'group flex h-full min-w-0 flex-col rounded-[28px] p-1.5 has-[[aria-expanded=true]]:z-10'
                        )}
                      >
                        <div className={ui.frame} style={{ '--frame': toneFor(b.id).bg } as CSSProperties}>
                          <div className={cx(ui.frameInner, 'aspect-video', !b.cover_url && 'bg-white')}>
                            {b.cover_url ? (
                              <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                                <BookCover src={b.cover_url} />
                              </div>
                            ) : (
                              // No cover yet: the orange tile and its two lines on white. A narrow card
                              // (three columns) gets a smaller tile, so the lines keep room around them.
                              <div className="@container absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                                <IconTile
                                  Icon={ImageIcon}
                                  tone={ORANGE}
                                  className="@max-[300px]:size-10 @max-[300px]:rounded-[13px]"
                                />
                                <p className="mt-3 text-[15px] font-extrabold leading-tight tracking-[-0.01em] @max-[300px]:mt-2">
                                  Design your cover
                                </p>
                                <p className="mt-1 text-balance text-[13px] font-semibold leading-snug">
                                  Open the book to choose a cover photo
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="absolute right-3.5 top-3.5 z-[2]">
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
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-4">
                          <h2 id={titleId} className={cx(ui.h3, 'line-clamp-2 text-[20px]')}>
                            {b.title || 'Untitled Book'}
                          </h2>

                          <div className="mt-3.5 flex flex-wrap gap-2">
                            <span className={cx(ui.chip, ui.chipSm)}>
                              {b.page_count} {b.page_count === 1 ? 'page' : 'pages'}
                            </span>
                            <span className={cx(ui.chip, ui.chipSm)}>
                              Created {formatDate(b.created_at)}
                            </span>
                          </div>

                          <div className="mt-auto pt-[18px]">
                            <Link
                              href={`/dashboard/books/${b.id}`}
                              aria-describedby={titleId}
                              className={btnClass({ variant: 'soft', block: true })}
                            >
                              Open Book
                              <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* delete confirmation */}
      {confirmDelete && (
        <div className={cx(ui.scrim, ui.fadeIn, 'scrim-blur z-[9999] flex items-center justify-center p-4')}>
          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, ui.confirm, ui.popIn)}
          >
            <h2 id={confirmTitleId} className={ui.confirmTitle}>
              Delete “{confirmDelete.title}”?
            </h2>
            <p id={confirmTextId} className={ui.confirmText}>
              This action cannot be undone.
            </p>
            <div className={ui.confirmActions}>
              <Btn variant="soft" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  handleDeleteBook(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Btn>
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
  window.dispatchEvent(new Event('dashboard-data-changed'));

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
  );
}

function BookCover({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden">
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
