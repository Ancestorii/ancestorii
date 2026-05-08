'use client';

import { inter } from '@/lib/fonts';
import { ACRYLIC_COLORS } from './AcrylicEditor';
import type { LayoutType, SelectedImage } from '@/types/acrylic-print';
import Image from 'next/image';
import { useState, memo } from 'react';

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
    { id: 'media' as const, icon: <IconMedia />, label: 'Media' },
    { id: 'layout' as const, icon: <IconLayout />, label: 'Layout' },
  ];

  return (
    <>
      <style>{`
        .media-thumb-wrapper:hover .rotate-btn { opacity: 1 !important; }
        .rotate-btn:hover { background: rgba(0, 0, 0, 0.85) !important; transform: scale(1.08); }
      `}</style>
      <aside
        className="fade-up d1"
        style={{
          gridRow: '2',
          gridColumn: '1',
          alignSelf: 'stretch',
          background: ACRYLIC_COLORS.panel,
          borderRight: `1.5px solid ${ACRYLIC_COLORS.line}`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100%',
          overflowY: 'hidden',
          overflowX: 'hidden',
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1.5px solid ${ACRYLIC_COLORS.line}`,
            flexShrink: 0,
            minHeight: 76,
            position: 'sticky',
            top: 0,
            zIndex: 3,
            background: ACRYLIC_COLORS.panel,
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
                  background: active ? ACRYLIC_COLORS.accentBg : 'transparent',
                  border: 'none',
                  borderBottom: active ? `3px solid ${ACRYLIC_COLORS.accent}` : '3px solid transparent',
                  color: active ? ACRYLIC_COLORS.dark : ACRYLIC_COLORS.muted,
                  fontFamily: inter.style.fontFamily,
                }}
              >
                {t.icon}
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div
          data-lenis-prevent
          style={{ flex: 1, minHeight: 0, padding: '18px 16px', overflowY: 'auto', overscrollBehavior: 'contain' }}
        >
          {/* MEDIA TAB */}
          {tab === 'media' && (
            <>
              <SectionHead fontFamily={inter.style.fontFamily} count={images.length}>Library</SectionHead>

              <label
                className="tool-btn"
                style={{
                  width: '100%',
                  padding: '16px 0',
                  marginBottom: 16,
                  background: ACRYLIC_COLORS.accentBg,
                  border: `1.5px dashed ${ACRYLIC_COLORS.accent}55`,
                  borderRadius: 10,
                  textAlign: 'center',
                  display: 'block',
                  cursor: 'pointer',
                  fontFamily: inter.style.fontFamily,
                }}
              >
                <div style={{ fontFamily: inter.style.fontFamily, fontSize: 13, fontWeight: 700, color: ACRYLIC_COLORS.dark }}>
                  {uploading ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…` : 'Upload Photos'}
                </div>
                <div style={{ fontFamily: inter.style.fontFamily, fontSize: 10, fontWeight: 500, color: ACRYLIC_COLORS.accent, marginTop: 2 }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: ACRYLIC_COLORS.lineLight }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {uploading && (
                    <>
                      <UploadingThumb />
                      {uploadProgress.total > 1 && (
                        <div style={{ aspectRatio: '1', borderRadius: 8, background: ACRYLIC_COLORS.canvas, border: `1.5px solid ${ACRYLIC_COLORS.lineLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 700, color: ACRYLIC_COLORS.mid }}>
                          {uploadProgress.done}/{uploadProgress.total}
                        </div>
                      )}
                    </>
                  )}
                  {images.map((img, i) => (
                    <div key={img.id ?? i} style={{ position: 'relative', aspectRatio: '1' }} className="media-thumb-wrapper">
                      <button
                        className={`thumb-btn ${selectedImage?.id === img.id ? 'active' : ''}`}
                        onClick={() =>
                          setSelectedImage(selectedImage?.id === img.id ? null : { id: img.id, file_path: img.file_path })
                        }
                        style={{ width: '100%', height: '100%', padding: 0, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, overflow: 'visible' }}
                      >
                        <MediaThumb src={img.url} rotation={img.rotation} />
                      </button>
                      <button
                        type="button"
                        className="rotate-btn"
                        onClick={(e) => { e.stopPropagation(); onRotateImage(img.id); }}
                        title="Rotate 180°"
                        style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 99, background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s ease', zIndex: 5 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* LAYOUT TAB */}
          {tab === 'layout' && (
            <>
              <SectionHead fontFamily={inter.style.fontFamily}>Acrylic Layouts</SectionHead>
              {LAYOUTS.map((l) => {
                const active = layoutType === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSetLayout(l.id)}
                    className="tool-btn"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      background: active ? ACRYLIC_COLORS.accentBg : ACRYLIC_COLORS.panel,
                      border: active ? `1.5px solid ${ACRYLIC_COLORS.accent}` : `1.5px solid ${ACRYLIC_COLORS.lineLight}`,
                      borderRadius: 10,
                      marginBottom: 8,
                      textAlign: 'left',
                      fontFamily: inter.style.fontFamily,
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: inter.style.fontFamily, fontSize: 13, fontWeight: 700, color: active ? ACRYLIC_COLORS.accent : ACRYLIC_COLORS.dark }}>
                        {l.label}
                      </div>
                      <div style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 500, color: ACRYLIC_COLORS.muted, marginTop: 1 }}>
                        {l.desc} · {l.slots} photo{l.slots !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function SectionHead({ children, count, fontFamily }: { children: React.ReactNode; count?: number; fontFamily: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: `1.5px solid ${ACRYLIC_COLORS.line}` }}>
      <span style={{ fontFamily, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACRYLIC_COLORS.dark }}>{children}</span>
      {count != null && (
        <span style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 800, color: ACRYLIC_COLORS.dark, background: ACRYLIC_COLORS.canvas, padding: '2px 8px', borderRadius: 6, border: `1px solid ${ACRYLIC_COLORS.line}` }}>{count}</span>
      )}
    </div>
  );
}

const MediaThumb = memo(function MediaThumb({ src, rotation = 0 }: { src: string; rotation?: number }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 8, overflow: 'hidden', background: ACRYLIC_COLORS.lineLight }}>
      <Image src={src} alt="" fill sizes="(min-width: 1536px) 180px, (min-width: 1280px) 160px, 120px" quality={70} loading="lazy" className="object-cover" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.25s ease' }} />
    </div>
  );
});

function UploadingThumb() {
  return (
    <div style={{ aspectRatio: '1', borderRadius: 8, background: ACRYLIC_COLORS.accentBg, border: `1.5px solid ${ACRYLIC_COLORS.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes acrylicUploadSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2.5px solid ${ACRYLIC_COLORS.lineLight}`, borderTopColor: ACRYLIC_COLORS.accent, animation: 'acrylicUploadSpin 0.8s linear infinite' }} />
    </div>
  );
}

function IconMedia() {
  return (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>);
}

function IconLayout() {
  return (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>);
}