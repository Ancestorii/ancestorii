'use client';

import { useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { IconBtn, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Media = {
  id: string;
  album_id: string;
  user_id?: string | null;
  file_path: string | null;
  file_type: string | null;
  library_media_id?: string | null;
  library_media?: { id: string; file_path: string; file_type: string; created_at: string | null } | null;
  created_at: string;
  signed_url?: string | null;
  caption?: string | null;
  memory_date?: string | null;
};

export default function Lightbox({ media, allMedia, open, onClose, onNavigate }: { media: Media | null; allMedia: Media[]; open: boolean; onClose: () => void; onNavigate: (m: Media) => void }) {
  const currentIndex = media ? allMedia.findIndex((m) => m.id === media.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allMedia.length - 1;

  const goPrev = useCallback(() => { if (hasPrev) onNavigate(allMedia[currentIndex - 1]); }, [hasPrev, currentIndex, allMedia, onNavigate]);
  const goNext = useCallback(() => { if (hasNext) onNavigate(allMedia[currentIndex + 1]); }, [hasNext, currentIndex, allMedia, onNavigate]);

  // Focus moves into the viewer and stays there (Tab), and returns to the button that opened it.
  const viewerRef = useDialog<HTMLDivElement>(open && !!media, onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') goPrev(); if (e.key === 'ArrowRight') goNext(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, goPrev, goNext]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || !media) return null;

  const realType = (media.file_type ?? media.library_media?.file_type) || '';

  return (
    <div
      ref={viewerRef}
      role="dialog"
      aria-modal="true"
      aria-label={media.caption || 'Full screen view'}
      onClick={onClose}
      className={s.viewer}
    >
      <IconBtn label="Close" onPhoto onClick={onClose} className={s.viewerClose}>
        <X size={20} strokeWidth={2.4} aria-hidden="true" />
      </IconBtn>
      <div className={s.viewerCount}>{currentIndex + 1} / {allMedia.length}</div>
      {hasPrev && (
        <IconBtn label="Previous" onPhoto onClick={(e) => { e.stopPropagation(); goPrev(); }} className={cx(s.viewerNav, s.viewerPrev)}>
          <ChevronLeft size={22} strokeWidth={2.4} aria-hidden="true" />
        </IconBtn>
      )}
      {hasNext && (
        <IconBtn label="Next" onPhoto onClick={(e) => { e.stopPropagation(); goNext(); }} className={cx(s.viewerNav, s.viewerNext)}>
          <ChevronRight size={22} strokeWidth={2.4} aria-hidden="true" />
        </IconBtn>
      )}
      <div onClick={(e) => e.stopPropagation()} className={s.viewerStage}>
        {realType === 'video'
          ? <video src={media.signed_url || ''} controls autoPlay playsInline />
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={media.signed_url || ''} alt={media.caption || ''} />}
      </div>
      {(media.caption || media.memory_date) && (
        <div onClick={(e) => e.stopPropagation()} className={s.viewerCaption}>
          {media.caption && <p className={s.viewerCaptionText}>{media.caption}</p>}
          {media.memory_date && <p className={s.viewerDate}>{media.memory_date}</p>}
        </div>
      )}
    </div>
  );
}
