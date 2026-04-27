'use client';

import { inter } from '@/lib/fonts';
import { BOOK_CANVAS_COLORS, type CanvasSpread } from './BookCanvas';
import type { LayoutType, SelectedImage } from '@/types/memory-book';
import Image from "next/image";
import { useState, useEffect } from "react";

type PanelTab = 'pages' | 'media' | 'text' | 'layout';

// ── NEW: cover layout type ──
export type CoverLayoutType = 'classic_cover' | 'full_bleed_cover' | 'trio_cover';
export type BackCoverLayoutType = 'blank_back' | 'dedication_back' | 'photo_message_back';

type Image = {
  id: string;
  url: string;
  file_path: string; // required now
};

export default function BookCanvasLeftPanel({
  tab,
  setTab,
  spreads,
  spread,
  setSpread,
  images,
  loading,
  handleUpload,
  selectedImage,
  setSelectedImage,
  currentSpread,
  onOpenLayoutModal,
  totalPages,
  // ── NEW props ──
  coverLayout,
  onCoverLayoutChange,
  backCoverLayout,
  onBackCoverLayoutChange,
  activePageId,
  setActivePageId,
  onTogglePageText,
  spineText,
  onSpineTextChange,
  spineBgColour,
  onSpineBgColourChange,
  spineTextColour,
  onSpineTextColourChange,
  bookTitle,
}: {
  activePageId: string | null;
  setActivePageId: (id: string) => void;
  tab: PanelTab;
  setTab: (tab: PanelTab) => void;
  spreads: CanvasSpread[];
  spread: number;
  setSpread: React.Dispatch<React.SetStateAction<number>>;
  images: Image[];
  loading: boolean;
  handleUpload: (file: File) => Promise<Image | null>;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  currentSpread: CanvasSpread;
  onOpenLayoutModal: (pageId: string, layout: LayoutType) => void;
  totalPages: number;
  // ── NEW props ──
  coverLayout: CoverLayoutType;
  onCoverLayoutChange: (layout: CoverLayoutType) => void;
  backCoverLayout: BackCoverLayoutType;
  onBackCoverLayoutChange: (layout: BackCoverLayoutType) => void;
  onTogglePageText: (pageId: string, field: 'show_subheading' | 'show_comment', value: boolean) => void;
  spineText: string;
  onSpineTextChange: (text: string) => void;
  spineBgColour: string;
  onSpineBgColourChange: (colour: string) => void;
  spineTextColour: string;
  onSpineTextColourChange: (colour: string) => void;
  bookTitle: string;
}) {

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  const handleUploadWithFeedback = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, 20);
    if (fileArray.length === 0) return;

    setUploading(true);
    setUploadProgress({ done: 0, total: fileArray.length });

    let done = 0;
    for (const file of fileArray) {
      await handleUpload(file);
      done++;
      setUploadProgress({ done, total: fileArray.length });
    }

    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
  };

  const tabs = [
    { id: 'pages', icon: <IconPages />, label: 'Pages' },
    { id: 'layout', icon: <IconLayout />, label: 'Layout' },
    { id: 'media', icon: <IconMedia />, label: 'Media' },
    { id: 'text', icon: <IconText />, label: 'Text' },
  ] as const;

  const layouts: {
    id: LayoutType;
    label: string;
    desc: string;
  }[] = [
    {
      id: 'portrait_layout',
      label: 'Portrait',
      desc: 'Single image',
    },
    {
      id: 'landscape_layout',
      label: 'Landscape',
      desc: 'Centred image',
    },
    {
      id: 'duo_layout',
      label: 'Duo',
      desc: 'Two stacked images',
    },
    {
      id: 'grid_layout',
      label: 'Grid',
      desc: 'Four-image collage',
    },
    {
      id: 'feature_layout',
      label: 'Feature',
      desc: 'Hero + supporting',
    },
  ];

  // ── NEW: cover layout definitions ──
  const coverLayouts: {
    id: CoverLayoutType;
    label: string;
    desc: string;
  }[] = [
    {
      id: 'classic_cover',
      label: 'Classic',
      desc: 'Framed photo + title',
    },
    {
      id: 'full_bleed_cover',
      label: 'Full Bleed',
      desc: 'Edge-to-edge image',
    },
    {
      id: 'trio_cover',
      label: 'Trio',
      desc: '1 main + 2 supporting',
    },
  ];

  const backCoverLayouts: {
    id: BackCoverLayoutType;
    label: string;
    desc: string;
  }[] = [
    {
      id: 'blank_back',
      label: 'Blank',
      desc: 'Clean and simple',
    },
    {
      id: 'dedication_back',
      label: 'Dedication',
      desc: 'Personal message or quote',
    },
    {
      id: 'photo_message_back',
      label: 'Photo + Message',
      desc: 'Small photo with dedication',
    },
  ];

  // ── NEW: determine if we're on a cover spread ──
  const isCoverSpread = currentSpread.type === 'cover';
  const isBackCoverSpread = currentSpread.type === 'back_cover';
  const isOnCover = isCoverSpread || isBackCoverSpread;

  const activeCoverLayout = isBackCoverSpread ? backCoverLayout : coverLayout;
  const handleCoverSelect = (layout: CoverLayoutType | BackCoverLayoutType) => {
  if (isBackCoverSpread) {
    onBackCoverLayoutChange(layout as BackCoverLayoutType);
  } else {
    onCoverLayoutChange(layout as CoverLayoutType);
  }
};

  const getSpreadTitle = (s: CanvasSpread) => {
    if (s.type === 'cover') return 'Cover';
    if (s.type === 'back_cover') return 'Back Cover';

    if (s.type === 'single') {
      return `Page ${s.r.page_number}`;
    }

    if (s.l && s.r) {
      return `Pages ${s.l.page_number}–${s.r.page_number}`;
    }

    if (s.l) {
      return `Page ${s.l.page_number}`;
    }

    return '';
  };

  const getCurrentTargetPageId = () => {
    if (currentSpread.type === 'single') return currentSpread.r.id;
    if (currentSpread.type === 'spread') return currentSpread.l?.id || currentSpread.r?.id;
    return null;
  };

  return (
    <aside
      className="fade-up d1"
      style={{
        gridRow: '2',
        gridColumn: '1',
        alignSelf: 'stretch',
        background: BOOK_CANVAS_COLORS.panel,
        borderRight: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        overflowY: 'hidden',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          borderBottom: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
          flexShrink: 0,
          minHeight: 76,
          position: 'sticky',
          top: 0,
          zIndex: 3,
          background: BOOK_CANVAS_COLORS.panel,
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              className="tab-item"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '16px 0 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                background: active
                  ? BOOK_CANVAS_COLORS.accentBg
                  : 'transparent',
                border: 'none',
                borderBottom: active
                  ? `3px solid ${BOOK_CANVAS_COLORS.accent}`
                  : '3px solid transparent',
                color: active
                  ? BOOK_CANVAS_COLORS.dark
                  : BOOK_CANVAS_COLORS.muted,
                fontFamily: inter.style.fontFamily,
              }}
            >
              {t.icon}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '18px 16px',
          overflowY: 'auto',
        }}
      >
        {tab === 'pages' && (
          <>
            <SectionHead
              fontFamily={inter.style.fontFamily}
              count={totalPages}
            >
              Total Pages
            </SectionHead>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {spreads.map((s, i) => {
                const active = spread === i;
                return (
                  <button
                    key={i}
                    className={`spread-thumb ${active ? 'active' : ''}`}
                    onClick={() => setSpread(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      background: active
                        ? BOOK_CANVAS_COLORS.accentBg
                        : BOOK_CANVAS_COLORS.panel,
                      border: active
                        ? `1.5px solid ${BOOK_CANVAS_COLORS.accent}44`
                        : `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
                      borderRadius: 10,
                      padding: '10px 10px',
                      fontFamily: inter.style.fontFamily,
                    }}
                  >
                    <div
                      style={{
                        width: 84,
                        height: 54,
                        display: 'flex',
                        flexShrink: 0,
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: `1px solid ${BOOK_CANVAS_COLORS.line}`,
                        background: BOOK_CANVAS_COLORS.paper,
                      }}
                    >
                      {s.type === 'cover' ? (
                        <div style={{ margin: 'auto' }}>
                          <CoverLayoutIcon type={coverLayout} active={false} />
                        </div>
                      ) : s.type === 'back_cover' ? (
                        <div style={{ margin: 'auto' }}>
                          <LayoutIcon type="portrait_layout" />
                        </div>
                      ) : s.type === 'single' ? (
                        <>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutIcon type="portrait_layout" />
                          </div>
                          <div style={{ width: 2, flexShrink: 0, background: BOOK_CANVAS_COLORS.accentSoft }} />
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutIcon type={s.r.layout_type || 'portrait_layout'} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutIcon type={s.l?.layout_type || 'portrait_layout'} />
                          </div>
                          <div style={{ width: 2, flexShrink: 0, background: BOOK_CANVAS_COLORS.accentSoft }} />
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutIcon type={s.r?.layout_type || 'portrait_layout'} />
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          fontFamily: inter.style.fontFamily,
                          fontSize: 13,
                          fontWeight: 700,
                          color: BOOK_CANVAS_COLORS.dark,
                        }}
                      >
                        {getSpreadTitle(s)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === 'media' && (
          <>
            <SectionHead
              fontFamily={inter.style.fontFamily}
              count={images.length}
            >
              Library
            </SectionHead>

            <label
              className="tool-btn"
              style={{
                width: '100%',
                padding: '16px 0',
                marginBottom: 16,
                background: BOOK_CANVAS_COLORS.accentBg,
                border: `1.5px dashed ${BOOK_CANVAS_COLORS.accent}55`,
                borderRadius: 10,
                textAlign: 'center',
                display: 'block',
                cursor: 'pointer',
                fontFamily: inter.style.fontFamily,
              }}
            >
              <div
                style={{
                  fontFamily: inter.style.fontFamily,
                  fontSize: 13,
                  fontWeight: 700,
                  color: BOOK_CANVAS_COLORS.dark,
                }}
              >
                {uploading ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…` : 'Upload Photos'}
              </div>
              <div
                style={{
                  fontFamily: inter.style.fontFamily,
                  fontSize: 10,
                  fontWeight: 500,
                  color: BOOK_CANVAS_COLORS.accent,
                  marginTop: 2,
                }}
              >
                {uploading ? 'Please wait' : 'Select multiple files at once'}
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleUploadWithFeedback(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
            </label>

            {loading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 8,
                      background: BOOK_CANVAS_COLORS.lineLight,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                {uploading && (
                  <>
                    <UploadingThumb />
                    {uploadProgress.total > 1 && (
                      <div style={{
                        aspectRatio: '1',
                        borderRadius: 8,
                        background: BOOK_CANVAS_COLORS.canvas,
                        border: `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: inter.style.fontFamily,
                        fontSize: 11,
                        fontWeight: 700,
                        color: BOOK_CANVAS_COLORS.mid,
                      }}>
                        {uploadProgress.done}/{uploadProgress.total}
                      </div>
                    )}
                  </>
                )}
                {images.map((img, i) => (
                  <button
                    key={img.id ?? i}
                    className={`thumb-btn ${
                      selectedImage?.id === img.id ? 'active' : ''
                    }`}
                   onClick={() =>
                   setSelectedImage(
    selectedImage?.id === img.id
      ? null
      : {
          id: img.id,
          file_path: img.file_path, // 🔥 THIS IS THE FIX
        }
  )
}
                    style={{
                      aspectRatio: '1',
                      padding: 0,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 8,
                      overflow: 'visible'
                    }}
                  >
                    <MediaThumb src={img.url} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'text' && (
          <>
            <SectionHead fontFamily={inter.style.fontFamily}>
              Text Settings
            </SectionHead>

            {isOnCover ? (
              <div
                style={{
                  fontFamily: inter.style.fontFamily,
                  fontSize: 13,
                  fontWeight: 500,
                  color: BOOK_CANVAS_COLORS.muted,
                  lineHeight: 1.5,
                }}
              >
                Text settings are available on interior pages.
              </div>
            ) : (() => {
              const activePage =
                activePageId && currentSpread.type === 'spread'
                  ? [currentSpread.l, currentSpread.r].find((p) => p?.id === activePageId)
                  : currentSpread.type === 'single'
                  ? currentSpread.r
                  : currentSpread.type === 'spread'
                  ? currentSpread.l || currentSpread.r
                  : null;

              if (!activePage) {
                return (
                  <div
                    style={{
                      fontFamily: inter.style.fontFamily,
                      fontSize: 13,
                      fontWeight: 500,
                      color: BOOK_CANVAS_COLORS.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    No page selected.
                  </div>
                );
              }

              return (
                <>
                  <div
                    style={{
                      fontFamily: inter.style.fontFamily,
                      fontSize: 11,
                      fontWeight: 600,
                      color: BOOK_CANVAS_COLORS.accent,
                      marginBottom: 16,
                      marginTop: -6,
                    }}
                  >
                    Page {activePage.page_number}
                  </div>

                  <ToggleRow
                    fontFamily={inter.style.fontFamily}
                    label="Show Heading"
                    active={activePage.show_subheading}
                    onToggle={() =>
                      onTogglePageText(
                        activePage.id,
                        'show_subheading',
                        !activePage.show_subheading
                      )
                    }
                  />

                  <ToggleRow
                    fontFamily={inter.style.fontFamily}
                    label="Show Comment"
                    active={activePage.show_comment}
                    onToggle={() =>
                      onTogglePageText(
                        activePage.id,
                        'show_comment',
                        !activePage.show_comment
                      )
                    }
                  />
                </>
              );
            })()}
          </>
        )}

        {tab === 'layout' && (
          <>
            {isOnCover && (
  <>
    <SectionHead fontFamily={inter.style.fontFamily}>
      Cover Layouts
    </SectionHead>

    <div
      style={{
        fontFamily: inter.style.fontFamily,
        fontSize: 11,
        fontWeight: 600,
        color: BOOK_CANVAS_COLORS.accent,
        marginBottom: 10,
        marginTop: -6,
      }}
    >
      Editing: {isCoverSpread ? 'Front Cover' : 'Back Cover'}
    </div>

    {isCoverSpread && coverLayouts.map((cl) => {
      const active = activeCoverLayout === cl.id;
      return (
        <button
          key={cl.id}
          type="button"
          onClick={() => handleCoverSelect(cl.id)}
          className="tool-btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 14px',
            background: active
              ? BOOK_CANVAS_COLORS.accentBg
              : BOOK_CANVAS_COLORS.panel,
            border: active
              ? `1.5px solid ${BOOK_CANVAS_COLORS.accent}`
              : `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
            borderRadius: 10,
            marginBottom: 8,
            textAlign: 'left',
            fontFamily: inter.style.fontFamily,
          }}
        >
          <CoverLayoutIcon type={cl.id} active={active} />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: active
                  ? BOOK_CANVAS_COLORS.accent
                  : BOOK_CANVAS_COLORS.dark,
              }}
            >
              {cl.label}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: BOOK_CANVAS_COLORS.muted,
                marginTop: 1,
              }}
            >
              {cl.desc}
            </div>
          </div>
        </button>
      );
    })}

    {isBackCoverSpread && backCoverLayouts.map((bl) => {
  const active = backCoverLayout === bl.id;
  return (
    <button
      key={bl.id}
      type="button"
      onClick={() => onBackCoverLayoutChange(bl.id)}
      className="tool-btn"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 14px',
        background: active
          ? BOOK_CANVAS_COLORS.accentBg
          : BOOK_CANVAS_COLORS.panel,
        border: active
          ? `1.5px solid ${BOOK_CANVAS_COLORS.accent}`
          : `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
        borderRadius: 10,
        marginBottom: 8,
        textAlign: 'left',
        fontFamily: inter.style.fontFamily,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: active ? BOOK_CANVAS_COLORS.accent : BOOK_CANVAS_COLORS.dark }}>
          {bl.label}
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: BOOK_CANVAS_COLORS.muted, marginTop: 1 }}>
          {bl.desc}
        </div>
      </div>
    </button>
  );
})}

    {/* divider only if cover is shown */}
    <div
      style={{
        height: 1,
        background: BOOK_CANVAS_COLORS.line,
        margin: '16px 0 18px',
      }}
    />
    <SectionHead fontFamily={inter.style.fontFamily}>
      Spine
    </SectionHead>

    <div style={{ marginBottom: 12 }}>
      <label style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 600, color: BOOK_CANVAS_COLORS.muted, display: 'block', marginBottom: 6 }}>
        Spine Text
      </label>
      <input
        type="text"
        placeholder={bookTitle || 'Book title'}
        maxLength={40}
        value={spineText}
        onChange={(e) => onSpineTextChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 8,
          border: `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
          background: BOOK_CANVAS_COLORS.panel,
          fontFamily: inter.style.fontFamily,
          fontSize: 12,
          fontWeight: 500,
          color: BOOK_CANVAS_COLORS.dark,
          outline: 'none',
        }}
      />
    </div>

    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 600, color: BOOK_CANVAS_COLORS.muted, display: 'block', marginBottom: 6 }}>
          Background
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={spineBgColour}
            onChange={(e) => onSpineBgColourChange(e.target.value)}
            style={{ width: 28, height: 28, border: `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`, borderRadius: 6, padding: 0, cursor: 'pointer', background: 'none' }}
          />
          <span style={{ fontFamily: inter.style.fontFamily, fontSize: 11, color: BOOK_CANVAS_COLORS.muted }}>{spineBgColour}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 600, color: BOOK_CANVAS_COLORS.muted, display: 'block', marginBottom: 6 }}>
          Text Colour
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={spineTextColour}
            onChange={(e) => onSpineTextColourChange(e.target.value)}
            style={{ width: 28, height: 28, border: `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`, borderRadius: 6, padding: 0, cursor: 'pointer', background: 'none' }}
          />
          <span style={{ fontFamily: inter.style.fontFamily, fontSize: 11, color: BOOK_CANVAS_COLORS.muted }}>{spineTextColour}</span>
        </div>
      </div>
    </div>

    <div
      style={{
        width: '100%',
        height: 36,
        borderRadius: 6,
        background: spineBgColour,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${BOOK_CANVAS_COLORS.lineLight}`,
      }}
    >
      <span style={{ fontFamily: inter.style.fontFamily, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: spineTextColour }}>
        {spineText || bookTitle || 'Spine Preview'}
      </span>
    </div>
  </>
)}



{!isOnCover && (
  <>
    <SectionHead fontFamily={inter.style.fontFamily}>
      Page Selection
    </SectionHead>

  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
    {/* LEFT PAGE */}
    <button
      type="button"
      onClick={() => {
        if (currentSpread.type === 'spread' && currentSpread.l) {
          setActivePageId(currentSpread.l.id);
        }
      }}
      disabled={
        currentSpread.type !== 'spread' || !currentSpread.l
      }
      style={{
        flex: 1,
        padding: '10px 12px',
        borderRadius: 8,
        border:
          activePageId === (currentSpread.type === 'spread' ? currentSpread.l?.id : undefined)
            ? `1.5px solid ${BOOK_CANVAS_COLORS.accent}`
            : `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
        background:
          activePageId === (currentSpread.type === 'spread' ? currentSpread.l?.id : undefined)
            ? BOOK_CANVAS_COLORS.accentBg
            : BOOK_CANVAS_COLORS.panel,
        color:
          currentSpread.type !== 'spread' || !currentSpread.l
            ? BOOK_CANVAS_COLORS.muted
            : BOOK_CANVAS_COLORS.dark,
        fontWeight: 600,
        fontSize: 12,
        cursor:
          currentSpread.type !== 'spread' || !currentSpread.l
            ? 'not-allowed'
            : 'pointer',
        opacity:
          currentSpread.type !== 'spread' || !currentSpread.l ? 0.5 : 1,
      }}
    >
      Edit Left Page
    </button>

    {/* RIGHT PAGE */}
    <button
      type="button"
      onClick={() => {
        if (
          (currentSpread.type === 'spread' && currentSpread.r) ||
          currentSpread.type === 'single'
        ) {
          setActivePageId(
            currentSpread.type === 'single'
              ? currentSpread.r.id
              : currentSpread.r!.id
          );
        }
      }}
      disabled={!currentSpread.r}
      style={{
        flex: 1,
        padding: '10px 12px',
        borderRadius: 8,
        border:
  activePageId === (
    currentSpread.type === 'single'
      ? currentSpread.r.id
      : currentSpread.type === 'spread'
      ? currentSpread.r?.id
      : undefined
  )
            ? `1.5px solid ${BOOK_CANVAS_COLORS.accent}`
            : `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
        background:
  activePageId === (
    currentSpread.type === 'single'
      ? currentSpread.r.id
      : currentSpread.type === 'spread'
      ? currentSpread.r?.id
      : undefined
  )
            ? BOOK_CANVAS_COLORS.accentBg
            : BOOK_CANVAS_COLORS.panel,
        color: currentSpread.r
          ? BOOK_CANVAS_COLORS.dark
          : BOOK_CANVAS_COLORS.muted,
        fontWeight: 600,
        fontSize: 12,
        cursor: currentSpread.r ? 'pointer' : 'not-allowed',
        opacity: currentSpread.r ? 1 : 0.5,
      }}
    >
      Edit Right Page
    </button>
  </div>
  </>
)}

           {!isOnCover && (
  <>
    <SectionHead fontFamily={inter.style.fontFamily}>
      Page Layouts
    </SectionHead>

    {layouts.map((l) => {
      const pageId = activePageId || getCurrentTargetPageId();

      const currentPage =
        activePageId
          ? [
              currentSpread.type === 'spread' ? currentSpread.l : undefined,
              currentSpread.type === 'spread'
                ? currentSpread.r
                : currentSpread.type === 'single'
                ? currentSpread.r
                : undefined,
            ].find((p) => p?.id === activePageId)
          : currentSpread.type === 'single'
          ? currentSpread.r
          : currentSpread.type === 'spread'
          ? currentSpread.l || currentSpread.r
          : null;

      const active = currentPage?.layout_type === l.id;

      return (
        <button
          key={l.id}
          type="button"
          onClick={() => {
            if (!pageId) {
           alert('Select a page first');
           return;
           }
            onOpenLayoutModal(pageId, l.id);
          }}
          className="tool-btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 14px',
            background: active
              ? BOOK_CANVAS_COLORS.accentBg
              : BOOK_CANVAS_COLORS.panel,
            border: active
              ? `1.5px solid ${BOOK_CANVAS_COLORS.accent}`
              : `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
            borderRadius: 10,
            marginBottom: 8,
            textAlign: 'left',
            fontFamily: inter.style.fontFamily,
          }}
        >
          <LayoutIcon type={l.id} />

          <div>
            <div
              style={{
                fontFamily: inter.style.fontFamily,
                fontSize: 13,
                fontWeight: 700,
                color: active
                  ? BOOK_CANVAS_COLORS.accent
                  : BOOK_CANVAS_COLORS.dark,
              }}
            >
              {l.label}
            </div>

            <div
              style={{
                fontFamily: inter.style.fontFamily,
                fontSize: 11,
                fontWeight: 500,
                color: BOOK_CANVAS_COLORS.muted,
                marginTop: 1,
              }}
            >
              {l.desc}
            </div>
          </div>
        </button>
      );
    })}
  </>
)}
          </>
        )}
      </div>
    </aside>
  );
}

/* ── NEW: Cover layout icons ── */
function CoverLayoutIcon({ type, active }: { type: CoverLayoutType; active: boolean }) {
  const fill = active ? BOOK_CANVAS_COLORS.accent : BOOK_CANVAS_COLORS.dark;

  return (
    <div
      style={{
        width: 40,
        height: 32,
        borderRadius: 6,
        background: active ? BOOK_CANVAS_COLORS.accentBg : BOOK_CANVAS_COLORS.canvas,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${active ? BOOK_CANVAS_COLORS.accent + '44' : BOOK_CANVAS_COLORS.line}`,
      }}
    >
      {type === 'classic_cover' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 16, height: 3, borderRadius: 1, background: fill, opacity: 0.5 }} />
          <div style={{ width: 18, height: 16, borderRadius: 2, background: fill }} />
          <div style={{ width: 8, height: 2, borderRadius: 1, background: fill, opacity: 0.4 }} />
        </div>
      )}
      {type === 'full_bleed_cover' && (
        <div style={{ width: 26, height: 24, borderRadius: 2, background: fill }} />
      )}
      {type === 'trio_cover' && (
        <div style={{ display: 'flex', gap: 2, height: 22, width: 24 }}>
          <div style={{ flex: 1.4, borderRadius: 2, background: fill }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ flex: 1, borderRadius: 2, background: fill }} />
            <div style={{ flex: 1, borderRadius: 2, background: fill }} />
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHead({
  children,
  count,
  fontFamily,
}: {
  children: React.ReactNode;
  count?: number;
  fontFamily: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: BOOK_CANVAS_COLORS.dark,
        }}
      >
        {children}
      </span>

      {count != null && (
        <span
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 11,
            fontWeight: 800,
            color: BOOK_CANVAS_COLORS.dark,
            background: BOOK_CANVAS_COLORS.canvas,
            padding: '2px 8px',
            borderRadius: 6,
            border: `1px solid ${BOOK_CANVAS_COLORS.line}`,
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function SingleThumb({ url }: { url?: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [url]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {url ? (
        <Image
  src={url}
  alt=""
  fill
  sizes="84px"
  quality={75}
  unoptimized
  loading="eager"
  className={`object-cover transition-opacity duration-200 ${
    loaded ? 'opacity-100' : 'opacity-0'
  }`}
  onLoadingComplete={() => setLoaded(true)}
/>
      ) : (
        <div
          style={{
            width: 16,
            height: 20,
            borderRadius: 2,
            background: BOOK_CANVAS_COLORS.lineLight,
            margin: 'auto',
          }}
        />
      )}
    </div>
  );
}

function ThumbHalf({ url }: { url?: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [url]);

  return (
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {url ? (
       <Image
  src={url}
  alt=""
  fill
  sizes="42px"
  quality={75}
  unoptimized
  loading="eager"
  className={`object-cover transition-opacity duration-200 ${
    loaded ? 'opacity-100' : 'opacity-0'
  }`}
  onLoadingComplete={() => setLoaded(true)}
/>
      ) : (
        <div
          style={{
            width: 14,
            height: 18,
            borderRadius: 2,
            background: BOOK_CANVAS_COLORS.lineLight,
            margin: 'auto',
          }}
        />
      )}
    </div>
  );
}

function MediaThumb({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        background: BOOK_CANVAS_COLORS.lineLight,
      }}
    >
      <Image
  src={src}
  alt=""
  fill
  sizes="96px"
  quality={75}
  unoptimized
  loading="eager"
  className={`object-cover transition-opacity duration-200 ${
    loaded ? 'opacity-100' : 'opacity-0'
  }`}
  onLoadingComplete={() => setLoaded(true)}
/>
    </div>
  );
}

function LayoutIcon({ type }: { type: LayoutType }) {
  const f: React.CSSProperties = {
    background: BOOK_CANVAS_COLORS.dark,
    borderRadius: 2,
  };

  return (
    <div
      style={{
        width: 40,
        height: 32,
        borderRadius: 6,
        background: BOOK_CANVAS_COLORS.canvas,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${BOOK_CANVAS_COLORS.line}`,
      }}
    >
      {type === 'portrait_layout' && (
        <div style={{ ...f, width: 14, height: 22 }} />
      )}
      {type === 'landscape_layout' && (
        <div style={{ ...f, width: 22, height: 14, borderRadius: 2 }} />
      )}
      {type === 'duo_layout' && (
        <div style={{ display: 'flex', gap: 2 }}>
          <div style={{ ...f, width: 12, height: 20 }} />
          <div style={{ ...f, width: 12, height: 20 }} />
        </div>
      )}
      {type === 'grid_layout' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            width: 20,
            height: 20,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={f} />
          ))}
        </div>
      )}
      {type === 'feature_layout' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: 22,
            height: 20,
          }}
        >
          <div style={{ ...f, flex: 3 }} />
          <div style={{ display: 'flex', gap: 2, flex: 2 }}>
            <div style={{ ...f, flex: 2 }} />
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ width: 8, height: 2, borderRadius: 1, background: BOOK_CANVAS_COLORS.dark, opacity: 0.5 }} />
              <div style={{ width: 12, height: 1, borderRadius: 1, background: BOOK_CANVAS_COLORS.dark, opacity: 0.3 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconPages() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M12 3v18" />
    </svg>
  );
}

function IconMedia() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function IconText() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

function ToggleRow({
  label,
  active,
  onToggle,
  fontFamily,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  fontFamily: string;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        cursor: 'pointer',
        borderBottom: `1px solid ${BOOK_CANVAS_COLORS.lineLight}`,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 12,
          fontWeight: 500,
          color: BOOK_CANVAS_COLORS.mid,
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: active
            ? BOOK_CANVAS_COLORS.accent
            : BOOK_CANVAS_COLORS.lineLight,
          transition: 'background 0.2s ease',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: '#fff',
            position: 'absolute',
            top: 2,
            left: active ? 18 : 2,
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </div>
  );
}

function UploadingThumb() {
  return (
    <div
      style={{
        aspectRatio: '1',
        borderRadius: 8,
        background: BOOK_CANVAS_COLORS.accentBg,
        border: `1.5px solid ${BOOK_CANVAS_COLORS.accent}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes bookCanvasUploadSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `2.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
          borderTopColor: BOOK_CANVAS_COLORS.accent,
          animation: 'bookCanvasUploadSpin 0.8s linear infinite',
        }}
      />
    </div>
  );
}