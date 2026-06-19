'use client';

import { useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const navBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ ...navBtn, position: 'absolute', top: 16, right: 16, zIndex: 10 }}><X size={20} /></button>
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{currentIndex + 1} / {allMedia.length}</div>
      {hasPrev && (<button onClick={(e) => { e.stopPropagation(); goPrev(); }} style={{ ...navBtn, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}><ChevronLeft size={20} /></button>)}
      {hasNext && (<button onClick={(e) => { e.stopPropagation(); goNext(); }} style={{ ...navBtn, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}><ChevronRight size={20} /></button>)}
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {realType === 'video'
          ? <video src={media.signed_url || ''} controls autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 2 }} />
          : <img src={media.signed_url || ''} alt={media.caption || ''} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 2 }} />}
      </div>
      {(media.caption || media.memory_date) && (
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 16, maxWidth: 512, textAlign: 'center', padding: '0 24px' }}>
          {media.caption && <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 1.6, fontFamily: "'Playfair Display', Georgia, serif" }}>{media.caption}</p>}
          {media.memory_date && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{media.memory_date}</p>}
        </div>
      )}
    </div>
  );
}