'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Sidebar from '../Sidebar';
import BookCanvasHeader from './BookCanvasHeader';
import BookCanvasLeftPanel, { type CoverLayoutType, type BackCoverLayoutType } from './BookCanvasLeftPanel';
import BookCanvasStage from './BookCanvasStage';
import BookCanvasRightPanel from './BookCanvasRightPanel';
import type { Asset, BookCoverState, Page, SelectedImage, LayoutType } from '@/types/memory-book';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { flushBookWrites, queueBookWrite } from '../bookAutosave';
import BookGuideOverlay from './BookGuideOverlay';
import BookPreviewOverlay from './BookPreviewOverlay';


export type CanvasSpread =
  | { type: 'cover' }
  | { type: 'single'; r: Page }
  | { type: 'spread'; l?: Page; r?: Page }
  | { type: 'back_cover' };

type PanelTab = 'pages' | 'media' | 'text' | 'layout';

// The editor's colours. paper and paperAlt are the printed pages' own whites: they draw the
// product, so they never change. Every other key is chrome around the book, in the app's palette
// (hex, because some panels add an alpha suffix): the stage draws its own borders and labels from
// the product's original values, not from here.
export const BOOK_CANVAS_COLORS = {
  canvas: '#F2F2F4',
  panel: '#FFFFFF',
  paper: '#FFFFFF',
  paperAlt: '#FDFCF9',
  dark: '#0A0A0F',
  darkSoft: '#0A0A0F',
  mid: '#0A0A0F',
  muted: '#0A0A0F',
  accent: '#FF2D87',
  accentSoft: '#FFE3EF',
  accentBg: '#FFE3EF',
  line: '#DDDDDD',
  lineLight: '#EBEBEC',
  lineDark: '#C4C4C5',
  stage: '#F2F2F4',
  hover: '#F2F2F4',
} as const;

const SPREAD_RATIO = (29.7 * 2) / 21;

export default function BookCanvas({
  bookId,
  pages,
  initialCover,
  selectedImage,
  setSelectedImage,
  onOpenLayoutModal,
  onUpdateAsset,
  bookTitle,
  tierKey,
  onUpdatePage,
}: {
  bookId: string;
  pages: Page[];
  initialCover: BookCoverState;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  onOpenLayoutModal: (pageId: string, layout: LayoutType) => void;
  onUpdateAsset: (pageId: string, asset: Asset) => void;
  onUpdatePage: (pageId: string, field: string, value: boolean) => void;
  bookTitle: string;
  tierKey: string;
}) {
  const supabase = getBrowserClient();
  const [spread, setSpread] = useState(0);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const [tab, setTab] = useState<PanelTab>('pages');
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [rootH, setRootH] = useState(760);
  const [bW, setBW] = useState(0);
  const [bH, setBH] = useState(0);

  const [guideOpen, setGuideOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // ── Cover layout state (loaded with the page, so the cover is drawn from the first frame) ──
  const [coverLayout, setCoverLayout] = useState<CoverLayoutType>(initialCover.coverLayout);
  const [backCoverLayout, setBackCoverLayout] = useState<BackCoverLayoutType>(initialCover.backCoverLayout);

  const [spineText, setSpineText] = useState(initialCover.spineText);
  const [spineBgColour, setSpineBgColour] = useState(initialCover.spineBgColour);
  const [spineTextColour, setSpineTextColour] = useState(initialCover.spineTextColour);

  // ── Cover asset state ──
  const [coverAssets, setCoverAssets] = useState<Asset[]>(initialCover.coverAssets);
  const [backCoverAssets, setBackCoverAssets] = useState<Asset[]>(initialCover.backCoverAssets);

  const handleTogglePageText = async (
  pageId: string,
  field: 'show_subheading' | 'show_comment',
  value: boolean
) => {
  try {
    // The reply is checked: row security refuses with no error and no rows.
    const { data, error } = await supabase
      .from('memory_book_pages')
      .update({ [field]: value })
      .eq('id', pageId)
      .select('id');

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Page text setting was not saved');

    onUpdatePage(pageId, field, value);
  } catch (err) {
    console.error('Failed to toggle page text:', err);
    toast.error('Could not change the page text setting. Please try again.');
  }
};

  const handleUpdateCoverAsset = (asset: Asset) => {
    setCoverAssets((prev) => {
      const idx = prev.findIndex((a) => a.slot_index === asset.slot_index);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = asset;
        return next;
      }
      return [...prev, asset];
    });
  };

  const handleUpdateBackCoverAsset = (asset: Asset) => {
    setBackCoverAssets((prev) => {
      const idx = prev.findIndex((a) => a.slot_index === asset.slot_index);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = asset;
        return next;
      }
      return [...prev, asset];
    });
  };

  // ── Cover autosave ──
  // What the database last received (to begin with, what the server handed us), so a render
  // that changes nothing sends nothing. A change waits 300ms in the queue, where later changes
  // merge into it; the queue checks the reply, flushes on Save and when the editor is left, and
  // its timer is no longer cleared on unmount (which used to drop the last keystroke).
  const lastSavedCoverRef = useRef<string | null>(null);

  useEffect(() => {
    const payload = {
      cover_asset_id: coverAssets.find((a) => a.slot_index === 0)?.asset_id ?? null,
      back_cover_asset_id: backCoverAssets.find((a) => a.slot_index === 0)?.asset_id ?? null,
      cover_design: {
        layout: coverLayout,
        assets: coverAssets.map(({ url, ...asset }) => asset),
      },
      back_cover_design: {
        layout: backCoverLayout,
        assets: backCoverAssets.map(({ url, ...asset }) => asset),
      },
      spine_text: spineText,
      spine_bg_colour: spineBgColour,
      spine_text_colour: spineTextColour,
    };

    const snapshot = JSON.stringify(payload);

    if (lastSavedCoverRef.current === null) {
      lastSavedCoverRef.current = snapshot;
      return;
    }
    if (snapshot === lastSavedCoverRef.current) return;

    lastSavedCoverRef.current = snapshot;
    queueBookWrite('memory_books', bookId, payload, 300);
  }, [
    bookId,
    coverLayout,
    backCoverLayout,
    coverAssets,
    backCoverAssets,
    spineText,
    spineBgColour,
    spineTextColour,
  ]);

  // Leaving the editor (Back to Books, another route): send whatever is still waiting.
  useEffect(() => {
    return () => {
      void flushBookWrites();
    };
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setRootH(window.innerHeight - top);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const spreads = useMemo<CanvasSpread[]>(() => {
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
  const grouped: CanvasSpread[] = [{ type: 'cover' }];

  if (sorted.length > 0) {
    grouped.push({ type: 'single', r: sorted[0] });
  }

  for (let i = 1; i < sorted.length; i += 2) {
    grouped.push({
      type: 'spread',
      l: sorted[i],
      r: sorted[i + 1],
    });
  }

  grouped.push({ type: 'back_cover' });

  return grouped;
}, [pages]);

useEffect(() => {
    const cur = spreads[spread];
    if (!cur) return;

    if (cur.type === 'single') {
      setActivePageId(cur.r.id);
    } else if (cur.type === 'spread') {
      setActivePageId(cur.l?.id || cur.r?.id || null);
    } else {
      setActivePageId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread]);

  useEffect(() => {
    if (spread > spreads.length - 1) {
      setSpread(Math.max(spreads.length - 1, 0));
    }
  }, [spread, spreads.length]);

  useLayoutEffect(() => {
    const calc = () => {
      const s = stageRef.current;
      if (!s) return;

      const sw = s.clientWidth;
      const sh = s.clientHeight;
      const maxW = sw * 0.86;
      const maxH = sh * 0.74;

      let w = maxW;
      let h = maxW / SPREAD_RATIO;

      if (h > maxH) {
        h = maxH;
        w = maxH * SPREAD_RATIO;
      }

      setBW(w);
      setBH(h);
    };

    calc();

    const ro = new ResizeObserver(calc);
    if (stageRef.current) ro.observe(stageRef.current);

    return () => ro.disconnect();
  }, [rootH]);

  const cur = spreads[spread] ?? { type: 'cover' as const };

  const totalPhotos = pages.reduce(
    (acc, page) => acc + page.assets.filter((x) => x.url || x.id).length,
    0
  )
  + coverAssets.filter((x) => x.url || x.asset_id).length
  + backCoverAssets.filter((x) => x.url || x.asset_id).length;

  const totalCaptions = pages.reduce(
    (acc, page) =>
      acc +
      page.assets.filter((x) => x.subheading?.trim() || x.comment?.trim())
        .length,
    0
  )
  + coverAssets.filter((x) => x.subheading?.trim() || x.comment?.trim()).length
  + backCoverAssets.filter((x) => x.subheading?.trim() || x.comment?.trim()).length;

  const totalComments = pages.reduce(
    (acc, page) => acc + page.assets.filter((x) => x.comment?.trim()).length,
    0
  )
  + coverAssets.filter((x) => x.comment?.trim()).length
  + backCoverAssets.filter((x) => x.comment?.trim()).length;

const coverFilled = coverAssets.some((a) => a.url || a.asset_id) ? 1 : 0;
const backCoverFilled = backCoverAssets.some((a) => a.url || a.asset_id) ? 1 : 0;

const filled = pages.filter((page) =>
    page.assets.some(
      (asset) =>
        asset.url ||
        asset.id ||
        asset.subheading?.trim() ||
        asset.comment?.trim()
    )
  ).length + coverFilled + backCoverFilled;

  const totalPageCount = pages.length + 2;
  const progress = totalPageCount
    ? Math.round((filled / totalPageCount) * 100)
    : 0;

  const currentSpreadLabel =
  cur.type === 'cover'
    ? 'Cover'
    : cur.type === 'back_cover'
    ? 'Back Cover'
    : cur.type === 'single'
    ? `Page ${cur.r.page_number}`
    : cur.l && cur.r
    ? `Pages ${cur.l.page_number} to ${cur.r.page_number}`
    : cur.l
    ? `Page ${cur.l.page_number}`
    : '';

  return (
    <Sidebar onSelectImage={setSelectedImage}>
      {({ images, loading, handleUpload, handleRotateImage }) => (
        <>
          <style>{`
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: ${BOOK_CANVAS_COLORS.lineDark}; border-radius: 99px; }
  ::-webkit-scrollbar-track { background: transparent; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }

  .fade-up { animation: fadeUp 0.4s ease both; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.1s; }
  .d3 { animation-delay: 0.15s; }
  .scale-in { animation: scaleIn 0.45s ease both; animation-delay: 0.12s; }

  .thumb-btn { transition: transform 0.15s ease; position: relative; }
  .thumb-btn::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 10px;
    border: 2px solid transparent;
    transition: border-color 0.15s ease;
    pointer-events: none;
  }
  .thumb-btn:hover::after { border-color: rgba(10, 10, 15, 0.3); }
  .thumb-btn.active::after { border-color: #0A0A0F; border-width: 3px; }

  .spread-thumb { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
  .spread-thumb:hover { transform: translateY(-1px); box-shadow: 0 12px 24px -16px rgba(10, 10, 15, 0.4); }
  .spread-thumb.active,
  .spread-thumb.active:hover { box-shadow: 0 0 0 2px #0A0A0F; }

  .tool-btn { transition: background-color 0.15s ease; cursor: pointer; }
  .tool-btn:hover { background: ${BOOK_CANVAS_COLORS.hover} !important; }

  .tab-item { transition: background-color 0.12s ease; cursor: pointer; }
  .tab-item:hover { background: ${BOOK_CANVAS_COLORS.hover}; }

  .book-canvas-root {
    display: grid;
    min-height: 0;
  }

  .book-canvas-root > * {
    min-width: 0;
    min-height: 0;
  }

  .book-canvas-root {
  grid-template-columns: 1fr;
  grid-template-rows: auto minmax(0, 1fr);
}

  @media (min-width: 768px) {
    .book-canvas-root {
      grid-template-columns: 240px minmax(0, 1fr) 220px;
      grid-template-rows: auto minmax(0, 1fr);
    }
  }

  @media (min-width: 1280px) {
  .book-canvas-root {
    grid-template-columns: 320px minmax(0, 1fr) 260px;
  }
}

  @media (min-width: 1536px) {
    .book-canvas-root {
      grid-template-columns: 360px minmax(0, 1fr) 280px;
    }
  }
  /* Fields in the editor's panels: the app's placeholder (in the kit's layer, so a panel's
     own classes can still restyle it). */
  @layer components {
    .book-canvas-root :is(input, textarea)::placeholder {
      color: rgba(10, 10, 15, 0.42);
      font-style: normal;
      font-weight: 500;
      opacity: 1;
    }
  }

  /* The book on the stage keeps its own placeholders (part of the page as it is drawn). */
  .book-canvas-root .book-stage input::placeholder {
    color: #C4BDB2 !important;
    font-style: italic;
    font-weight: 400 !important;
  }
  .book-canvas-root .book-stage textarea::placeholder {
    color: #C4BDB2 !important;
    font-style: italic;
    font-weight: 400 !important;
  }
.book-canvas-root input[type="text"] {
  text-overflow: ellipsis;
}
`}</style>

          <div
  ref={rootRef}
  className="book-canvas-root"
  style={{
    width: '100%',
    height: rootH,
    minHeight: 0,
    overflow: 'hidden',
    background: BOOK_CANVAS_COLORS.panel,
    color: BOOK_CANVAS_COLORS.dark,
  }}
>
           <BookCanvasHeader
  title={bookTitle}
  bookId={bookId}
  tierKey={tierKey}
  onPreview={() => setPreviewOpen(true)}
  onExport={async () => {
  try {
    // Anything typed in the last moment goes to the database before the PDF is drawn from it.
    await flushBookWrites();

    const res = await fetch(`/api/export/${bookId}`);

    if (!res.ok) {
      const text = await res.text();
      console.error('EXPORT ERROR:', text);
      toast.error('Sorry, the PDF export failed. Please try again or contact support.');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle || 'memory-book'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('EXPORT ERROR:', err);
    toast.error('Sorry, the PDF export failed. Please try again or contact support.');
  }
}}
  onSave={async () => {
    // Everything autosaves; Save sends what is still waiting and reports the result.
    setSaveState('saving');
    const ok = await flushBookWrites();
    setSaveState(ok ? 'saved' : 'idle');
    if (ok) setTimeout(() => setSaveState('idle'), 1500);
  }}
  saveState={saveState}
/>

            <BookCanvasLeftPanel
  tab={tab}
  setTab={setTab}
  spreads={spreads}
  spread={spread}
  setSpread={setSpread}
  images={images}
  loading={loading}
  handleUpload={handleUpload}
  onRotateImage={handleRotateImage}
  selectedImage={selectedImage}
  setSelectedImage={setSelectedImage}
  currentSpread={cur}
  onOpenLayoutModal={onOpenLayoutModal}
  totalPages={pages.length + 2}
  coverLayout={coverLayout}
  onCoverLayoutChange={setCoverLayout}
  backCoverLayout={backCoverLayout}
  onBackCoverLayoutChange={setBackCoverLayout}
  activePageId={activePageId}
  setActivePageId={setActivePageId}
  onTogglePageText={handleTogglePageText}
  spineText={spineText}
  onSpineTextChange={setSpineText}
  spineBgColour={spineBgColour}
  onSpineBgColourChange={setSpineBgColour}
  spineTextColour={spineTextColour}
  onSpineTextColourChange={setSpineTextColour}
  bookTitle={bookTitle}
/>

            
            <BookCanvasStage
              setTab={setTab}
              stageRef={stageRef}
              bookWidth={bW}
              bookHeight={bH}
              spread={spread}
              setSpread={setSpread}
              spreads={spreads}
              pages={pages}
              currentSpread={cur}
              currentSpreadLabel={currentSpreadLabel}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              onOpenLayoutModal={onOpenLayoutModal}
              onUpdateAsset={onUpdateAsset}
              coverLayout={coverLayout}
              backCoverLayout={backCoverLayout}
              bookTitle={bookTitle}
              coverAssets={coverAssets}
              backCoverAssets={backCoverAssets}
              onUpdateCoverAsset={handleUpdateCoverAsset}
              onUpdateBackCoverAsset={handleUpdateBackCoverAsset}
              spineBgColour={spineBgColour}
            />

            <BookCanvasRightPanel
  progress={progress}
  filled={filled}
  totalPages={pages.length + 2}
  totalPhotos={totalPhotos}
  totalCaptions={totalCaptions}
  totalComments={totalComments}
  currentSpread={cur}
  currentSpreadLabel={currentSpreadLabel}
  spread={spread}
  onOpenGuide={() => setGuideOpen(true)}
/>

<BookGuideOverlay
  open={guideOpen}
  onClose={() => setGuideOpen(false)}
/>
<BookPreviewOverlay
  open={previewOpen}
  onClose={() => setPreviewOpen(false)}
  spreads={spreads}
  pages={pages}
  coverLayout={coverLayout}
  backCoverLayout={backCoverLayout}
  bookTitle={bookTitle}
  coverAssets={coverAssets}
  backCoverAssets={backCoverAssets}
  spineBgColour={spineBgColour}
  initialSpread={spread}
/>
          </div>
        </>
      )}
    </Sidebar>
  );
}