'use client';

import { inter } from '@/lib/fonts';
import { BOOK_CANVAS_COLORS, type CanvasSpread } from './BookCanvas';
import type { LayoutType, SelectedImage } from '@/types/memory-book';
import Image from "next/image";
import { useState, useEffect, useId, memo, type CSSProperties } from "react";
import { BookOpen, ImageIcon, ImagePlus, Info, PanelsTopLeft, RotateCw, Type } from 'lucide-react';
import { IconBtn, IconTile, Spinner, Tag, toneByKey, ui } from '@/components/dashboard/ui/AppBits';
import css from './bookCanvasLeftPanel.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Memory Books are orange in the landing's feature index: the panel's dots use it.
const ORANGE_DOT = { '--dot': 'var(--c2)' } as CSSProperties;

type PanelTab = 'pages' | 'media' | 'text' | 'layout';

// ── NEW: cover layout type ──
export type CoverLayoutType = 'classic_cover' | 'full_bleed_cover' | 'trio_cover';
export type BackCoverLayoutType = 'blank_back' | 'dedication_back' | 'photo_message_back';

type Image = {
  id: string;
  url: string;
  file_path: string;
  rotation: number;
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
  onRotateImage,
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
  onRotateImage: (imageId: string) => Promise<void>;
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
  const uid = useId();

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
    { id: 'pages', icon: <BookOpen size={20} strokeWidth={2.2} aria-hidden="true" />, label: 'Pages' },
    { id: 'layout', icon: <PanelsTopLeft size={20} strokeWidth={2.2} aria-hidden="true" />, label: 'Layout' },
    { id: 'media', icon: <ImageIcon size={20} strokeWidth={2.2} aria-hidden="true" />, label: 'Media' },
    { id: 'text', icon: <Type size={20} strokeWidth={2.2} aria-hidden="true" />, label: 'Text' },
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
      return `Pages ${s.l.page_number} to ${s.r.page_number}`;
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
      className={cx('fade-up d1', css.panel)}
      style={{ gridRow: '2', gridColumn: '1' }}
      aria-label="Book tools"
    >
      {/* Tabs */}
      <div className={css.tabsBar}>
        <div className={cx(ui.tabs, ui.tabsBlock, css.tabs)} role="tablist" aria-label="Tools">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${uid}-tab-${t.id}`}
                aria-selected={active}
                aria-controls={`${uid}-panel`}
                className={cx(ui.tab, css.tab)}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        data-lenis-prevent
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${tab}`}
        className={css.scroll}
      >
        {tab === 'pages' && (
          <section className={css.section}>
            <SectionHead count={totalPages}>Total Pages</SectionHead>

            <div className={css.spreadList}>
              {spreads.map((s, i) => {
                const active = spread === i;
                return (
                  <button
                    key={i}
                    type="button"
                    className={css.spreadTile}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => setSpread(i)}
                  >
                    {/* The page plan; its ground is the paper colour */}
                    <div
                      className={css.spreadThumb}
                      style={{ background: BOOK_CANVAS_COLORS.paper }}
                      aria-hidden="true"
                    >
                      {s.type === 'cover' ? (
                        <div className={css.spreadCentre}>
                          <CoverLayoutIcon type={coverLayout} active={false} />
                        </div>
                      ) : s.type === 'back_cover' ? (
                        <div className={css.spreadCentre}>
                          <LayoutIcon type="portrait_layout" />
                        </div>
                      ) : s.type === 'single' ? (
                        <>
                          <div className={css.spreadHalf}>
                            <LayoutIcon type="portrait_layout" />
                          </div>
                          <div className={css.spreadDivider} />
                          <div className={css.spreadHalf}>
                            <LayoutIcon type={s.r.layout_type || 'portrait_layout'} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={css.spreadHalf}>
                            <LayoutIcon type={s.l?.layout_type || 'portrait_layout'} />
                          </div>
                          <div className={css.spreadDivider} />
                          <div className={css.spreadHalf}>
                            <LayoutIcon type={s.r?.layout_type || 'portrait_layout'} />
                          </div>
                        </>
                      )}
                    </div>

                    <span className={css.spreadTitle}>{getSpreadTitle(s)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {tab === 'media' && (
          <section className={css.section}>
            <SectionHead count={images.length}>Library</SectionHead>

            {/* The file field is visually hidden, not display:none, so the keyboard reaches it */}
            <label className={cx(ui.dropzone, css.dropzone)}>
              <IconTile Icon={ImagePlus} tone={toneByKey('orange')} size="sm" />
              <span className={ui.dropzoneTitle} aria-live="polite">
                {uploading ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…` : 'Upload Photos'}
              </span>
              <span className={ui.dropzoneHint}>
                {uploading ? 'Please wait' : 'Select multiple files at once'}
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                className={ui.srOnly}
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleUploadWithFeedback(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
            </label>

            {loading ? (
              <div className={css.mediaGrid} aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={cx(ui.skeleton, css.skeleton)} />
                ))}
              </div>
            ) : (
              <div className={css.mediaGrid}>
                {uploading && (
                  <>
                    <UploadingThumb />
                    {uploadProgress.total > 1 && (
                      <div className={css.statusTile} aria-hidden="true">
                        {uploadProgress.done}/{uploadProgress.total}
                      </div>
                    )}
                  </>
                )}
                {images.map((img, i) => (
                  <div key={img.id ?? i} className={css.mediaItem}>
                    <button
                      type="button"
                      className={ui.photoTile}
                      aria-pressed={selectedImage?.id === img.id}
                      aria-label={`Photo ${i + 1} of ${images.length}`}
                      onClick={() =>
                        setSelectedImage(
                          selectedImage?.id === img.id
                            ? null
                            : {
                                id: img.id,
                                file_path: img.file_path,
                                rotation: img.rotation,
                              }
                        )
                      }
                    >
                      <MediaThumb src={img.url} rotation={img.rotation} />
                    </button>

                    <IconBtn
                      label="Rotate 180°"
                      size="sm"
                      onPhoto
                      className={css.rotate}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotateImage(img.id);
                      }}
                    >
                      <RotateCw size={16} strokeWidth={2.4} aria-hidden="true" />
                    </IconBtn>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'text' && (
          <section className={css.section}>
            <SectionHead>Text Settings</SectionHead>

            {isOnCover ? (
              <p className={cx(ui.noticeInfo, css.note)}>
                <Info size={18} strokeWidth={2.4} aria-hidden="true" />
                <span>Text settings are available on interior pages.</span>
              </p>
            ) : (<>
              {currentSpread.type === 'spread' && currentSpread.l && currentSpread.r && (
                <div className={cx(ui.tabs, ui.tabsBlock, css.segment)} role="group" aria-label="Page">
                  <button
                    type="button"
                    onClick={() => setActivePageId(currentSpread.l!.id)}
                    aria-pressed={activePageId === currentSpread.l.id}
                    className={cx(ui.tab, css.segTab)}
                  >
                    Left Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePageId(currentSpread.r!.id)}
                    aria-pressed={activePageId === currentSpread.r.id}
                    className={cx(ui.tab, css.segTab)}
                  >
                    Right Page
                  </button>
                </div>
              )}
              {(() => {
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
                    <p className={cx(ui.noticeInfo, css.note)}>
                      <Info size={18} strokeWidth={2.4} aria-hidden="true" />
                      <span>No page selected.</span>
                    </p>
                  );
                }

                return (
                  <>
                    <span className={cx(ui.chip, ui.chipSm, ui.chipDot, css.contextChip)} style={ORANGE_DOT}>
                      Page {activePage.page_number}
                    </span>

                    <div className={css.toggleCard}>
                      <ToggleRow
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
                    </div>
                  </>
                );
              })()}
            </>)}
          </section>
        )}

        {tab === 'layout' && (
          <>
            {isOnCover && (
              <>
                <section className={css.section}>
                  <SectionHead>Cover Layouts</SectionHead>

                  <span className={cx(ui.chip, ui.chipSm, ui.chipDot, css.contextChip)} style={ORANGE_DOT}>
                    Editing: {isCoverSpread ? 'Front Cover' : 'Back Cover'}
                  </span>

                  <div className={css.optionList}>
                    {isCoverSpread && coverLayouts.map((cl) => {
                      const active = activeCoverLayout === cl.id;
                      return (
                        <button
                          key={cl.id}
                          type="button"
                          onClick={() => handleCoverSelect(cl.id)}
                          aria-pressed={active}
                          className={cx(ui.option, css.option)}
                        >
                          <CoverLayoutIcon type={cl.id} active={active} />
                          <span className={css.optionText}>
                            <span className={css.optionLabel}>{cl.label}</span>
                            <span className={css.optionDesc}>{cl.desc}</span>
                          </span>
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
                          aria-pressed={active}
                          className={cx(ui.option, css.option)}
                        >
                          <span className={css.optionText}>
                            <span className={css.optionLabel}>{bl.label}</span>
                            <span className={css.optionDesc}>{bl.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* divider only if cover is shown */}
                <hr className={cx(ui.rule, css.divider)} />

                <section className={css.section}>
                  <SectionHead>Spine</SectionHead>

                  <div>
                    <label htmlFor={`${uid}-spine-text`} className={cx(ui.label, css.fieldLabel)}>
                      Spine Text
                    </label>
                    <input
                      id={`${uid}-spine-text`}
                      type="text"
                      placeholder={bookTitle || 'Book title'}
                      maxLength={40}
                      value={spineText}
                      onChange={(e) => onSpineTextChange(e.target.value)}
                      className={cx(ui.input, css.spineInput)}
                    />
                  </div>

                  <div className={css.colourGrid}>
                    <div className={css.colourField}>
                      <label htmlFor={`${uid}-spine-bg`} className={cx(ui.label, css.fieldLabel)}>
                        Background
                      </label>
                      <div className={css.colourPick}>
                        <input
                          id={`${uid}-spine-bg`}
                          type="color"
                          value={spineBgColour}
                          onChange={(e) => onSpineBgColourChange(e.target.value)}
                          className={css.swatch}
                        />
                        <span className={css.hex}>{spineBgColour}</span>
                      </div>
                    </div>
                    <div className={css.colourField}>
                      <label htmlFor={`${uid}-spine-colour`} className={cx(ui.label, css.fieldLabel)}>
                        Text Colour
                      </label>
                      <div className={css.colourPick}>
                        <input
                          id={`${uid}-spine-colour`}
                          type="color"
                          value={spineTextColour}
                          onChange={(e) => onSpineTextColourChange(e.target.value)}
                          className={css.swatch}
                        />
                        <span className={css.hex}>{spineTextColour}</span>
                      </div>
                    </div>
                  </div>

                  {/* The spine as it will print: its colours and its Inter lettering */}
                  <div
                    className={css.spinePreview}
                    style={{
                      width: '100%',
                      height: 36,
                      borderRadius: 6,
                      background: spineBgColour,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--rule)',
                    }}
                  >
                    <span
                      className={css.spinePreviewText}
                      style={{ fontFamily: inter.style.fontFamily, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: spineTextColour }}
                    >
                      {spineText || bookTitle || 'Spine Preview'}
                    </span>
                  </div>
                </section>
              </>
            )}

            {!isOnCover && (
              <section className={css.section}>
                <SectionHead>Page Selection</SectionHead>

                <div className={cx(ui.tabs, ui.tabsBlock, css.segment)} role="group" aria-label="Page Selection">
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
                    aria-pressed={
                      activePageId === (currentSpread.type === 'spread' ? currentSpread.l?.id : undefined)
                    }
                    className={cx(ui.tab, css.segTab)}
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
                    aria-pressed={
                      activePageId === (
                        currentSpread.type === 'single'
                          ? currentSpread.r.id
                          : currentSpread.type === 'spread'
                          ? currentSpread.r?.id
                          : undefined
                      )
                    }
                    className={cx(ui.tab, css.segTab)}
                  >
                    Edit Right Page
                  </button>
                </div>
              </section>
            )}

            {!isOnCover && (
              <section className={css.section}>
                <SectionHead>Page Layouts</SectionHead>

                <div className={css.optionList}>
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
                        aria-pressed={active}
                        className={cx(ui.option, css.option)}
                      >
                        <LayoutIcon type={l.id} active={active} />

                        <span className={css.optionText}>
                          <span className={css.optionLabel}>{l.label}</span>
                          <span className={css.optionDesc}>{l.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

/* ── NEW: Cover layout icons ── */
// The drawings preview the printed cover layouts: their shapes stay exactly as they are.
// Chosen: an ink tile with white shapes.
function CoverLayoutIcon({ type, active }: { type: CoverLayoutType; active: boolean }) {
  const fill = active ? '#fff' : 'var(--ink)';

  return (
    <div
      style={{
        width: 40,
        height: 32,
        borderRadius: 6,
        background: active ? 'var(--ink)' : 'var(--hover)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${active ? 'var(--ink)' : 'var(--rule)'}`,
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

/** A panel section's heading: the kit's dotted tag, and a count on the right. */
function SectionHead({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <h2 className={css.sectionHead}>
      <Tag dot="var(--c2)">{children}</Tag>

      {count != null && (
        <span className={cx(ui.chip, ui.chipSm)}>{count}</span>
      )}
    </h2>
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
            background: 'var(--hover)',
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
            background: 'var(--hover)',
            margin: 'auto',
          }}
        />
      )}
    </div>
  );
}

// Inside a kit photo tile (it clips, rounds and greys the ground while the photo loads).
const MediaThumb = memo(function MediaThumb({
  src,
  rotation = 0,
}: {
  src: string;
  rotation?: number;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1536px) 180px, (min-width: 1280px) 160px, 120px"
      quality={70}
      loading="lazy"
      className="object-cover"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.25s ease',
      }}
    />
  );
});

// The drawings preview the printed page layouts: their shapes stay exactly as they are.
// Chosen: an ink tile with white shapes.
function LayoutIcon({ type, active = false }: { type: LayoutType; active?: boolean }) {
  const ink = active ? '#fff' : 'var(--ink)';
  const f: React.CSSProperties = {
    background: ink,
    borderRadius: 2,
  };

  return (
    <div
      style={{
        width: 40,
        height: 32,
        borderRadius: 6,
        background: active ? 'var(--ink)' : 'var(--hover)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${active ? 'var(--ink)' : 'var(--rule)'}`,
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
              <div style={{ width: 8, height: 2, borderRadius: 1, background: ink, opacity: 0.5 }} />
              <div style={{ width: 12, height: 1, borderRadius: 1, background: ink, opacity: 0.3 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A show or hide switch: the whole row is the switch. */
function ToggleRow({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={css.toggleRow}
    >
      <span>{label}</span>
      <span className={css.track} aria-hidden="true" />
    </button>
  );
}

function UploadingThumb() {
  return (
    <div className={css.statusTile} aria-hidden="true">
      <Spinner size={22} />
    </div>
  );
}
