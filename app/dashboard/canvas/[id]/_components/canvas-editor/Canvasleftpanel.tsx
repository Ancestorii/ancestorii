'use client';

import type { LayoutType, SelectedImage } from '@/types/memory-canvas';
import Image from 'next/image';
import { useState, memo } from 'react';
import { Check, Image as ImageIcon, PanelsTopLeft, RotateCw, Upload } from 'lucide-react';
import { ui, IconBtn, Spinner, Tag } from '@/components/dashboard/ui/AppBits';
import s from './canvasEditor.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type PanelTab = 'media' | 'layout';

type SidebarImage = {
  id: string;
  url: string;
  file_path: string;
  rotation: number;
};

type LayoutOption = {
  id: LayoutType;
  label: string;
  slots: number;
  desc: string;
};

const LAYOUTS: Record<string, Record<string, LayoutOption[]>> = {
  moment: {
    landscape: [
      { id: 'solo', label: 'Solo', slots: 1, desc: 'Single full-bleed image' },
      { id: 'triptych', label: 'Triptych', slots: 3, desc: 'Three equal panels' },
      { id: 'highlight', label: 'Highlight', slots: 3, desc: 'Large centre, two sides' },
      { id: 'filmstrip', label: 'Filmstrip', slots: 5, desc: 'Five images in a strip' },
      { id: 'storyboard', label: 'Storyboard', slots: 3, desc: 'Large left, two stacked right' },
    ],
    portrait: [
      { id: 'solo', label: 'Solo', slots: 1, desc: 'Single full-bleed image' },
      { id: 'stack', label: 'Stack', slots: 3, desc: 'Three horizontal rows' },
      { id: 'hero_2', label: 'Hero', slots: 3, desc: 'Large top, two below' },
      { id: 'cascade', label: 'Cascade', slots: 4, desc: 'Four staggered images' },
      { id: 'journal', label: 'Journal', slots: 2, desc: 'Image and caption area' },
    ],
  },
  heirloom: {
    landscape: [
      { id: 'solo', label: 'Solo', slots: 1, desc: 'Single full-bleed image' },
      { id: 'duo', label: 'Duo', slots: 2, desc: 'Two images side by side' },
      { id: 'grid', label: 'Grid', slots: 6, desc: '3×2 image grid' },
      { id: 'feature', label: 'Feature', slots: 4, desc: 'Hero with three supporting' },
      { id: 'mosaic', label: 'Mosaic', slots: 5, desc: 'Asymmetric five-image layout' },
    ],
    portrait: [
      { id: 'solo', label: 'Solo', slots: 1, desc: 'Single full-bleed image' },
      { id: 'stack', label: 'Stack', slots: 3, desc: 'Three horizontal rows' },
      { id: 'hero_2', label: 'Hero', slots: 3, desc: 'Large top, two below' },
      { id: 'grid', label: 'Grid', slots: 6, desc: '2×3 image grid' },
      { id: 'journal', label: 'Journal', slots: 2, desc: 'Image and caption area' },
    ],
  },
  heritage: {
    landscape: [
      { id: 'timeline', label: 'Timeline', slots: 6, desc: 'Six images in sequence' },
      { id: 'gallery', label: 'Gallery', slots: 7, desc: 'Museum-style arrangement' },
      { id: 'centrepiece', label: 'Centrepiece', slots: 7, desc: 'Large centre with six around' },
      { id: 'mosaic', label: 'Mosaic', slots: 10, desc: 'Ten-image mosaic grid' },
    ],
    portrait: [
      { id: 'tower', label: 'Tower', slots: 5, desc: 'Five images stacked' },
      { id: 'generations', label: 'Generations', slots: 3, desc: 'Three portrait frames' },
      { id: 'cascade', label: 'Cascade', slots: 6, desc: 'Six staggered images' },
    ],
  },
};

export default function CanvasLeftPanel({
  tab,
  setTab,
  images,
  loading,
  handleUpload,
  onRotateImage,
  selectedImage,
  setSelectedImage,
  layoutType,
  tierKey,
  orientation,
  onSetLayout,
}: {
  tab: PanelTab;
  setTab: (tab: PanelTab) => void;
  images: SidebarImage[];
  loading: boolean;
  handleUpload: (file: File) => Promise<SidebarImage | null>;
  onRotateImage: (imageId: string) => Promise<void>;
  selectedImage: SelectedImage | null;
  setSelectedImage: (img: SelectedImage | null) => void;
  layoutType: LayoutType;
  tierKey: string;
  orientation: string;
  onSetLayout: (layout: LayoutType) => void;
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
    { id: 'media' as const, icon: <ImageIcon size={17} strokeWidth={2.2} aria-hidden="true" />, label: 'Media' },
    { id: 'layout' as const, icon: <PanelsTopLeft size={17} strokeWidth={2.2} aria-hidden="true" />, label: 'Layout' },
  ];

  const availableLayouts = LAYOUTS[tierKey]?.[orientation] ?? [];

  return (
    <aside className={`fade-up d1 ${s.leftPanel}`} aria-label="Media and layouts">
      {/* ── Tabs ── */}
      <div className={s.panelTabs}>
        <div className={cx(ui.tabs, ui.tabsBlock)} role="group" aria-label="Show media or layouts">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cx(ui.tab, s.panelTab)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div data-lenis-prevent className={s.panelBody}>
        {/* ═══════ MEDIA TAB ═══════ */}
        {tab === 'media' && (
          <>
            <div className={s.panelHead}>
              <Tag dot="var(--c2)">Library</Tag>
              <span className={cx(ui.chip, ui.chipSm)}>{images.length}</span>
            </div>

            <label className={cx(ui.dropzone, s.upload)}>
              <span className={s.uploadTile} aria-hidden="true">
                {uploading ? <Spinner size={18} /> : <Upload size={18} strokeWidth={2.4} />}
              </span>
              <span className={ui.dropzoneTitle}>
                {uploading
                  ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                  : 'Upload Photos'}
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
              <div className={s.thumbGrid} aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={cx(ui.skeleton, s.skeletonTile)} />
                ))}
              </div>
            ) : (
              <div className={s.thumbGrid}>
                {uploading && (
                  <>
                    <UploadingThumb />
                    {uploadProgress.total > 1 && (
                      <div className={s.busyTile}>
                        {uploadProgress.done}/{uploadProgress.total}
                      </div>
                    )}
                  </>
                )}
                {images.map((img, i) => (
                  <div key={img.id ?? i} className={s.thumb}>
                    <button
                      type="button"
                      aria-pressed={selectedImage?.id === img.id}
                      aria-label={`Photo ${i + 1}`}
                      className={ui.photoTile}
                      onClick={() =>
                        setSelectedImage(
                          selectedImage?.id === img.id
                            ? null
                            : {
                                id: img.id,
                                file_path: img.file_path,
                                url: img.url,
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
                      className={s.rotateBtn}
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
          </>
        )}

        {/* ═══════ LAYOUT TAB ═══════ */}
        {tab === 'layout' && (
          <>
            <div className={s.panelHead}>
              <Tag dot="var(--c2)">Canvas Layouts</Tag>
            </div>

            <div className={s.layoutList}>
              {availableLayouts.map((l) => {
                const active = layoutType === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSetLayout(l.id)}
                    aria-pressed={active}
                    className={cx(ui.option, s.layoutOption)}
                  >
                    <span className={s.layoutText}>
                      <span className={s.layoutLabel}>{l.label}</span>
                      <span className={s.layoutDesc}>
                        {l.desc} · {l.slots} photo{l.slots !== 1 ? 's' : ''}
                      </span>
                    </span>
                    <span className={ui.checkBadge} aria-hidden="true">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════ */

/** A library photo inside its tile (ui.photoTile is the positioned, rounded box). */
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

function UploadingThumb() {
  return (
    <div className={s.busyTile}>
      <Spinner size={22} label="Uploading" />
    </div>
  );
}