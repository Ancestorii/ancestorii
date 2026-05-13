'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

/* ───────────────────── types ───────────────────── */

type Media = {
  id: string;
  album_id: string;
  user_id?: string | null;
  file_path: string | null;
  file_type: string | null;
  library_media_id?: string | null;
  library_media?: {
    id: string;
    file_path: string;
    file_type: string;
    created_at: string | null;
  } | null;
  created_at: string;
  signed_url?: string | null;
  caption?: string | null;
  memory_date?: string | null;
};

type Enrichment = {
  comments: Record<string, number>;
  voiceNotes: Record<string, number>;
};

/* ───────────────────── helpers ───────────────────── */

function getMediaType(m: Media): string {
  return (m.file_type ?? m.library_media?.file_type) || '';
}

function resolveMedia(m: Media): Media {
  return {
    ...m,
    file_path: m.file_path ?? m.library_media?.file_path ?? null,
    file_type: m.file_type ?? m.library_media?.file_type ?? null,
  };
}

function parseMemoryDate(raw: string): { day?: number; month: number; year: number } | null {
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const m1 = raw.match(/(\d{1,2})?\s*([a-zA-Z]+)\s+(\d{4})/);
  if (m1) { const mIdx = months.findIndex((mn) => mn.startsWith(m1[2].toLowerCase().slice(0, 3))); if (mIdx !== -1) return { day: m1[1] ? parseInt(m1[1], 10) : undefined, month: mIdx, year: parseInt(m1[3], 10) }; }
  const m2 = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return { day: parseInt(m2[3], 10), month: parseInt(m2[2], 10) - 1, year: parseInt(m2[1], 10) };
  const m3 = raw.match(/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (m3) { const mIdx = months.findIndex((mn) => mn.startsWith(m3[1].toLowerCase().slice(0, 3))); if (mIdx !== -1) return { day: parseInt(m3[2], 10), month: mIdx, year: parseInt(m3[3], 10) }; }
  return null;
}

function formatDateLabel(raw: string): string {
  const parsed = parseMemoryDate(raw);
  if (!parsed) return raw.toUpperCase();
  const m = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  if (parsed.day) return `${String(parsed.day).padStart(2, '0')} ${m[parsed.month]} ${parsed.year}`;
  return `${m[parsed.month]} ${parsed.year}`;
}

/* ───────────────────── AudioWaveform ───────────────────── */

function AudioWaveform({ count = 34 }: { count?: number }) {
  const pattern = [3,5,8,4,7,11,6,9,4,7,12,5,8,3,6,10,4,8,5,9,11,6,3,7,10,4,8,5,7,3,6,9,5,8];
  const bars = Array.from({ length: count }, (_, i) => pattern[i % pattern.length]);
  const w = count * 4;
  return (
    <svg viewBox={`0 0 ${w} 18`} style={{ width: '100%', height: 18 }} preserveAspectRatio="none">
      {bars.map((h, i) => (<rect key={i} x={i * 4} y={9 - h / 2} width={2} height={h} rx={1} fill="#d4af37" opacity={0.65} />))}
    </svg>
  );
}

/* ───────────────────── GridImage ───────────────────── */

function GridImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); }, [src]);
  return (
    <Image src={src} alt="" width={1600} height={1200} sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={82}
      style={{ width: '100%', height: 'auto', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
      onLoadingComplete={() => setLoaded(true)}
    />
  );
}

/* ───────────────────── PHOTO CARD ───────────────────── */

function PhotoCard({ media, isSelected, onClick, onDoubleClick }: { media: Media; isSelected: boolean; onClick: () => void; onDoubleClick: () => void }) {
  return (
    <div onClick={onClick} onDoubleClick={onDoubleClick}
      style={{ breakInside: 'avoid', marginBottom: 24, cursor: 'pointer', borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s ease', boxShadow: isSelected ? '0 16px 40px rgba(182,152,79,0.18)' : 'none', outline: isSelected ? '2px solid #caa64b' : 'none', background: '#ece5d8' }}>
      <GridImage src={media.signed_url || ''} />
    </div>
  );
}

/* ───────────────────── VIDEO CARD ───────────────────── */

function VideoCard({ media, isSelected, onClick, onDoubleClick }: { media: Media; isSelected: boolean; onClick: () => void; onDoubleClick: () => void }) {
  return (
    <div onClick={onClick} onDoubleClick={onDoubleClick}
      style={{ breakInside: 'avoid', marginBottom: 24, cursor: 'pointer', borderRadius: 20, overflow: 'hidden', position: 'relative', border: isSelected ? '2px solid #caa64b' : '1px solid #e5ddd0', background: '#f8f5ef', boxShadow: isSelected ? '0 16px 40px rgba(182,152,79,0.18)' : 'none', transition: 'all 0.3s ease' }}>
      <video key={media.signed_url || media.id} src={media.signed_url || ''} playsInline preload="metadata" muted style={{ width: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.18), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play size={20} fill="white" stroke="none" />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── TIMELINE CARD ───────────────────── */

function TimelineCard({ media, isSelected, onClick }: { media: Media; isSelected: boolean; onClick: () => void }) {
  const parsed = media.memory_date ? parseMemoryDate(media.memory_date) : null;
  const dateLabel = media.memory_date ? formatDateLabel(media.memory_date) : '';
  let timelineMonths: string[] = ['April','July','October','April'];
  let dotPosition = 50;
  let yearStart = '';
  let yearEnd = '';

  if (parsed) {
    const m = parsed.month;
    const startMonth = ((m - 6) + 12) % 12;
    const startYear = m < 6 ? parsed.year - 1 : parsed.year;
    yearStart = String(startYear);
    yearEnd = String(startYear + 1);
    const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    timelineMonths = [0,3,6,11].map((offset) => fullMonths[(startMonth + offset) % 12]);
    dotPosition = ((((m - startMonth) + 12) % 12) / 11) * 100;
  }

  return (
    <div onClick={onClick} style={{ breakInside: 'avoid', marginBottom: 24, cursor: 'pointer', borderRadius: 20, overflow: 'hidden', border: isSelected ? '2px solid #caa64b' : '1px solid #dcc797', background: '#fcfbf8', boxShadow: isSelected ? '0 16px 40px rgba(182,152,79,0.18)' : '0 10px 28px rgba(196,171,111,0.14)', transition: 'all 0.3s ease' }}>
      <div style={{ padding: 24 }}>
        {media.signed_url && (
          <div style={{ margin: '0 auto', width: 132, borderRadius: 16, border: '1px solid #e8deca', background: 'white', padding: 8, boxShadow: '0 10px 20px rgba(34,28,16,0.06)', marginBottom: 24 }}>
            <div style={{ overflow: 'hidden', borderRadius: 10, background: '#ece7dc', aspectRatio: '4/3' }}>
              <img src={media.signed_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ paddingTop: 8 }}>
              {dateLabel && <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4b57a5', margin: 0, fontFamily: "'Inter', sans-serif" }}>{dateLabel}</p>}
              <p style={{ fontSize: 12, lineHeight: 1.3, color: '#2b2925', fontWeight: 600, marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{media.caption || 'Untitled'}</p>
            </div>
          </div>
        )}
        <div style={{ paddingTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: '#9f998f', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{yearStart}</span>
            <span style={{ fontSize: 10, color: '#9f998f', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{yearEnd}</span>
          </div>
          <div style={{ position: 'relative', height: 20, marginBottom: 8 }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, transform: 'translateY(-50%)', background: '#d9bf6b' }} />
            {[0,25,50,75,100].map((pos) => (<div key={pos} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: `${pos}%`, width: 1, height: 12, background: '#d8ccae' }} />))}
            <div style={{ position: 'absolute', top: '50%', left: `${dotPosition}%`, transform: 'translate(-50%, -50%)', width: 18, height: 18, borderRadius: '50%', background: '#d4af37', border: '3px solid #fcfbf8', boxShadow: '0 3px 10px rgba(122,98,32,0.18)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            {timelineMonths.map((m, i) => (<span key={i} style={{ fontSize: 9, color: '#9b958a', lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>{m}</span>))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── AUDIO CARD ───────────────────── */

function AudioCard({ media, isSelected, onClick }: { media: Media; isSelected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ breakInside: 'avoid', marginBottom: 24, cursor: 'pointer', borderRadius: 20, overflow: 'hidden', border: isSelected ? '2px solid #caa64b' : '1px solid #e8dfd0', background: '#faf7f0', boxShadow: isSelected ? '0 16px 40px rgba(182,152,79,0.18)' : 'none', transition: 'all 0.3s ease' }}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 18px rgba(212,175,55,0.18)' }}>
            <Play size={16} fill="white" stroke="none" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}><AudioWaveform /></div>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#26231f', margin: 0, fontFamily: "'Inter', sans-serif" }}>{media.caption || 'Audio recording'}</p>
        <p style={{ fontSize: 12, color: '#9a9488', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{media.memory_date || 'Voice memory'}</p>
      </div>
    </div>
  );
}

/* ───────────────────── MAIN GRID ───────────────────── */

export default function MediaGrid({ media, selectedMedia, enrichment, onSelect, onLightbox }: { media: Media[]; selectedMedia: Media | null; enrichment: Enrichment; onSelect: (m: Media) => void; onLightbox: (m: Media) => void }) {
  void enrichment;

  if (media.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '128px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontStyle: 'italic', color: '#9d978d', marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif" }}>No memories yet</p>
        <p style={{ fontSize: 14, color: '#8f887d', fontFamily: "'Inter', sans-serif" }}>Upload your first photo or video to begin.</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {media.map((m) => {
        const realType = getMediaType(m);
        const isSelected = selectedMedia?.id === m.id;
        const resolved = resolveMedia(m);
        const isAudio = realType === 'audio' || realType.startsWith('audio/');
        const hasTimelineData = !!(m.caption && m.memory_date);

        if (isAudio) return <AudioCard key={m.id} media={resolved} isSelected={isSelected} onClick={() => onSelect(resolved)} />;
        if (hasTimelineData && realType !== 'video') return <TimelineCard key={m.id} media={resolved} isSelected={isSelected} onClick={() => onSelect(resolved)} />;
        if (realType === 'video') return <VideoCard key={m.id} media={resolved} isSelected={isSelected} onClick={() => onSelect(resolved)} onDoubleClick={() => onLightbox(resolved)} />;
        return <PhotoCard key={m.id} media={resolved} isSelected={isSelected} onClick={() => onSelect(resolved)} onDoubleClick={() => onLightbox(resolved)} />;
      })}
    </div>
  );
}