'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { inter } from '@/lib/fonts';
import Sidebar from '../Sidebar';
import BookCanvasHeader from './BookCanvasHeader';
import BookCanvasLeftPanel, { type CoverLayoutType, type BackCoverLayoutType } from './BookCanvasLeftPanel';
import BookCanvasStage from './BookCanvasStage';
import BookCanvasRightPanel from './BookCanvasRightPanel';
import type { Asset, Page, SelectedImage, LayoutType } from '@/types/memory-book';
import { getBrowserClient } from '@/lib/supabase/browser';
import BookGuideOverlay from './BookGuideOverlay';
import BookPreviewOverlay from './BookPreviewOverlay';


export type CanvasSpread =
  | { type: 'cover' }
  | { type: 'single'; r: Page }
  | { type: 'spread'; l?: Page; r?: Page }
  | { type: 'back_cover' };

type PanelTab = 'pages' | 'media' | 'text' | 'layout';

export const BOOK_CANVAS_COLORS = {
  canvas: '#F7F5F0',
  panel: '#FFFFFF',
  paper: '#FFFFFF',
  paperAlt: '#FDFCF9',
  dark: '#1A1714',
  darkSoft: '#2E2A24',
  mid: '#6B6358',
  muted: '#A39B8F',
  accent: '#B8860B',
  accentSoft: '#F0E2BF',
  accentBg: '#FBF6EA',
  line: '#D9D3C7',
  lineLight: '#EAE5DB',
  lineDark: '#B5AFA3',
  stage: '#EDEBE5',
  hover: '#F2EFE8',
} as const;

const SPREAD_RATIO = (29.7 * 2) / 21;

export default function BookCanvas({
  bookId,
  pages,
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

  // ── Cover layout state ──
  const [coverLayout, setCoverLayout] = useState<CoverLayoutType>('classic_cover');
  const [backCoverLayout, setBackCoverLayout] = useState<BackCoverLayoutType>('blank_back');

  const [spineText, setSpineText] = useState('');
  const [spineBgColour, setSpineBgColour] = useState('#0f2040');
  const [spineTextColour, setSpineTextColour] = useState('#d4af37');

  // ── NEW: Cover asset state ──
  const [coverAssets, setCoverAssets] = useState<Asset[]>([]);
  const [backCoverAssets, setBackCoverAssets] = useState<Asset[]>([]);
  const [coversHydrated, setCoversHydrated] = useState(false);

  const handleTogglePageText = async (
  pageId: string,
  field: 'show_subheading' | 'show_comment',
  value: boolean
) => {
  try {
    const { error } = await supabase
      .from('memory_book_pages')
      .update({ [field]: value })
      .eq('id', pageId);

    if (error) throw error;

    onUpdatePage(pageId, field, value);
  } catch (err) {
    console.error('Failed to toggle page text:', err);
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

    useEffect(() => {
    let active = true;

    const loadCoverState = async () => {
      try {
        const { data, error } = await supabase
          .from('memory_books')
          .select('cover_design, back_cover_design, spine_text, spine_bg_colour, spine_text_colour')
          .eq('id', bookId)
          .single();

        if (error) throw error;
        if (!active) return;

        const coverDesign =
          data?.cover_design && typeof data.cover_design === 'object'
            ? data.cover_design
            : {};

        const backCoverDesign =
          data?.back_cover_design && typeof data.back_cover_design === 'object'
            ? data.back_cover_design
            : {};

        setCoverLayout(
          coverDesign.layout === 'classic_cover' ||
          coverDesign.layout === 'full_bleed_cover' ||
          coverDesign.layout === 'trio_cover'
            ? coverDesign.layout
            : 'classic_cover'
        );

                setBackCoverLayout(
          backCoverDesign.layout === 'blank_back' ||
          backCoverDesign.layout === 'dedication_back' ||
          backCoverDesign.layout === 'photo_message_back'
            ? backCoverDesign.layout
            : 'blank_back'
        );

        setSpineText(data?.spine_text || '');
        setSpineBgColour(data?.spine_bg_colour || '#0f2040');
        setSpineTextColour(data?.spine_text_colour || '#d4af37');

        const hydrateAssetsWithUrls = async (assets: Asset[]) => {
          const assetIds = assets
            .map((a) => a.asset_id)
            .filter((id): id is string => !!id);

          if (!assetIds.length) return assets;

          const { data: mediaRows, error: mediaError } = await supabase
            .from('library_media')
            .select('id, file_path')
            .in('id', assetIds);

          if (mediaError) throw mediaError;

          const filePathById = new Map(
            (mediaRows || []).map((row) => [row.id, row.file_path])
          );

          const hydrated = await Promise.all(
            assets.map(async (asset) => {
              if (!asset.asset_id) return asset;

              const filePath = filePathById.get(asset.asset_id);
              if (!filePath) return asset;

              const { data: signed, error: signedError } = await supabase.storage
                .from('library-media')
                .createSignedUrl(filePath, 60 * 60 * 24 * 30);

              if (signedError) {
                console.error('FAILED TO SIGN COVER IMAGE:', signedError);
                return asset;
              }

              return {
                ...asset,
                url: signed?.signedUrl || '',
              };
            })
          );

          return hydrated;
        };

        const rawCoverAssets = Array.isArray(coverDesign.assets)
          ? coverDesign.assets
          : [];

        const rawBackCoverAssets = Array.isArray(backCoverDesign.assets)
          ? backCoverDesign.assets
          : [];

        const hydratedCoverAssets = await hydrateAssetsWithUrls(rawCoverAssets);
        const hydratedBackCoverAssets = await hydrateAssetsWithUrls(rawBackCoverAssets);

        if (!active) return;

        setCoverAssets(hydratedCoverAssets);
        setBackCoverAssets(hydratedBackCoverAssets);
      } catch (err) {
        console.error('FAILED TO LOAD COVER STATE:', err);
      } finally {
        if (active) setCoversHydrated(true);
      }
    };

    loadCoverState();

    return () => {
      active = false;
    };
  }, [bookId]);

    useEffect(() => {
    if (!coversHydrated) return;

    const timeout = window.setTimeout(async () => {
      try {
        const frontMain =
          coverAssets.find((a) => a.slot_index === 0)?.asset_id ?? null;

        const backMain =
          backCoverAssets.find((a) => a.slot_index === 0)?.asset_id ?? null;

        const { error } = await supabase
          .from('memory_books')
          .update({
            cover_asset_id: frontMain,
            back_cover_asset_id: backMain,
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
          })
          .eq('id', bookId);

        if (error) throw error;
      } catch (err) {
        console.error('FAILED TO SAVE COVER STATE:', err);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [
  bookId,
  coverLayout,
  backCoverLayout,
  coverAssets,
  backCoverAssets,
  coversHydrated,
  spineText,
  spineBgColour,
  spineTextColour,
]);

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
  }, [spread, spreads]);

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
    ? `Pages ${cur.l.page_number}–${cur.r.page_number}`
    : cur.l
    ? `Page ${cur.l.page_number}`
    : '';

  return (
    <Sidebar onSelectImage={setSelectedImage}>
      {({ images, loading, handleUpload }) => (
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

  .thumb-btn { transition: all 0.15s ease; position: relative; }
  .thumb-btn::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 10px;
    border: 2px solid transparent;
    transition: border-color 0.15s ease;
    pointer-events: none;
  }
  .thumb-btn:hover::after { border-color: ${BOOK_CANVAS_COLORS.accent}66; }
  .thumb-btn.active::after { border-color: #D4A017; border-width: 4px; }

  .spread-thumb { transition: all 0.18s ease; cursor: pointer; }
  .spread-thumb:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
  .spread-thumb.active { box-shadow: 0 0 0 2.5px ${BOOK_CANVAS_COLORS.accent}, 0 4px 16px rgba(0,0,0,0.1); }

  .tool-btn { transition: all 0.15s ease; cursor: pointer; }
  .tool-btn:hover { background: ${BOOK_CANVAS_COLORS.hover} !important; }

  .nav-arrow { transition: all 0.15s ease; }
  .nav-arrow:hover:not(:disabled) { background: ${BOOK_CANVAS_COLORS.panel} !important; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

  .tab-item { transition: all 0.12s ease; cursor: pointer; }
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
`}</style>

          <div
  ref={rootRef}
  className="book-canvas-root"
  style={{
    width: '100%',
    height: rootH,
    minHeight: 0,
    overflow: 'hidden',
    background: BOOK_CANVAS_COLORS.canvas,
    fontFamily: inter.style.fontFamily,
    color: BOOK_CANVAS_COLORS.dark,
  }}
>
           <BookCanvasHeader
  title={bookTitle}
  bookId={bookId}
  tierKey={tierKey}
  onPreview={() => setPreviewOpen(true)}
  onExport={async () => {
    const res = await fetch(`/api/export/${bookId}`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle || 'memory-book'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }}
  onSave={async () => {
    setSaveState('saving');
    await new Promise((r) => setTimeout(r, 500));
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1500);
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