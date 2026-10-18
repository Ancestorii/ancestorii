'use client';

import type { LayoutType, SelectedImage } from '@/types/acrylic-print';
import Image from 'next/image';
import { useState, memo } from 'react';
import { Check, Image as ImageIcon, LayoutGrid, RotateCw, Upload } from 'lucide-react';
import { ui, IconBtn, IconTile, Spinner, Tag, toneByKey } from '@/components/dashboard/ui/AppBits';
import s from './acrylicEditor.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// Acrylic Prints are orange in the landing's feature index.
const ORANGE = toneByKey('orange');

type PanelTab = 'media' | 'layout';

type SidebarImage = {
  id: string;
  url: string;
  file_path: string;
  rotation: number;
};

const LAYOUTS: { id: LayoutType; label: string; slots: number; desc: string }[] = [
  { id: 'solo', label: 'Solo', slots: 1, desc: 'Single full-bleed image' },
  { id: 'duo', label: 'Duo', slots: 2, desc: 'Two images side by side' },
  { id: 'grid', label: 'Grid', slots: 4, desc: '2×2 image grid' },
];

export default function AcrylicLeftPanel({
  tab,
  setTab,
  images,
  loading,
  handleUpload,
  onRotateImage,
  selectedImage,
  setSelectedImage,
  layoutType,
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
    { id: 'layout' as const, icon: <LayoutGrid size={17} strokeWidth={2.2} aria-hidden="true" />, label: 'Layout' },
  ];

  return (
    <aside
      className={cx('fade-up d1', s.panel)}
      style={{ gridRow: '2', gridColumn: '1' }}
      aria-label="Photos and layout"
    >
      {/* Tabs */}
      <div className={s.tabsBar}>
        <div className={cx(ui.tabs, ui.tabsBlock)} role="group" aria-label="Panel">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cx(ui.tab, s.tab)}
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div data-lenis-prevent className={s.scroll}>
        {/* MEDIA TAB */}
        {tab === 'media' && (
          <>
            <h2 className={s.sectionHead}>
              <Tag dot="var(--c2)">Library</Tag>
              <span className={cx(ui.chip, ui.chipSm)}>{images.length}</span>
            </h2>

            {/* The file input is hidden but focusable: the zone shows the focus ring. */}
            <label className={cx(ui.dropzone, s.dropzone)} data-busy={uploading || undefined}>
              <IconTile Icon={Upload} tone={ORANGE} size="sm" />
              <span className={ui.dropzoneTitle}>
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
              <div className={s.mediaGrid} aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={cx(ui.skeleton, s.skeleton)} />
                ))}
              </div>
            ) : (
              <div className={s.mediaGrid}>
                {uploading && (
                  <>
                    <div className={s.statusTile}>
                      <Spinner size={22} label="Uploading" />
                    </div>
                    {uploadProgress.total > 1 && (
                      <div className={s.statusTile}>
                        {uploadProgress.done}/{uploadProgress.total}
                      </div>
                    )}
                  </>
                )}
                {images.map((img, i) => {
                  const picked = selectedImage?.id === img.id;
                  return (
                    <div key={img.id ?? i} className={cx(ui.photoTile, picked && ui.photoTileSelected, s.mediaTile)}>
                      <button
                        type="button"
                        className={cx(s.mediaPick, ui.focusInset)}
                        aria-pressed={picked}
                        aria-label={`Photo ${i + 1}`}
                        onClick={() =>
                          setSelectedImage(picked ? null : { id: img.id, file_path: img.file_path })
                        }
                      >
                        <MediaThumb src={img.url} rotation={img.rotation} />
                      </button>
                      <IconBtn
                        label="Rotate 180°"
                        size="sm"
                        onPhoto
                        className={s.rotate}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotateImage(img.id);
                        }}
                      >
                        <RotateCw size={16} strokeWidth={2.4} aria-hidden="true" />
                      </IconBtn>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* LAYOUT TAB */}
        {tab === 'layout' && (
          <>
            <h2 className={s.sectionHead}>
              <Tag dot="var(--c2)">Acrylic Layouts</Tag>
            </h2>
            <div className={s.optionList}>
              {LAYOUTS.map((l) => {
                const active = layoutType === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSetLayout(l.id)}
                    aria-pressed={active}
                    className={cx(ui.option, s.option)}
                  >
                    <span className={s.optionText}>
                      <span className={s.optionLabel}>{l.label}</span>
                      <span className={s.optionDesc}>
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

const MediaThumb = memo(function MediaThumb({ src, rotation = 0 }: { src: string; rotation?: number }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1536px) 180px, (min-width: 1280px) 160px, 120px"
      quality={70}
      loading="lazy"
      className={cx('object-cover', s.mediaImage)}
      style={{ transform: `rotate(${rotation}deg)` }}
    />
  );
});
