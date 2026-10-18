'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Images, Mic, Play } from 'lucide-react';
import { EmptyState, IconTile, toneByKey } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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

// Decorative: bars in the current colour (blue, the voice notes colour).
function AudioWaveform({ count = 34 }: { count?: number }) {
  const pattern = [3,5,8,4,7,11,6,9,4,7,12,5,8,3,6,10,4,8,5,9,11,6,3,7,10,4,8,5,7,3,6,9,5,8];
  const bars = Array.from({ length: count }, (_, i) => pattern[i % pattern.length]);
  const w = count * 4;
  return (
    <svg viewBox={`0 0 ${w} 18`} style={{ width: '100%', height: 18 }} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((h, i) => (<rect key={i} x={i * 4} y={9 - h / 2} width={2} height={h} rx={1} fill="currentColor" opacity={0.8} />))}
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

/* A memory's name for screen readers: its title, or what it is. */
const nameOf = (media: Media, kind: string) => media.caption || kind;

/* ───────────────────── PHOTO CARD ───────────────────── */

function PhotoCard({ media, isSelected, onClick, onDoubleClick }: { media: Media; isSelected: boolean; onClick: () => void; onDoubleClick: () => void }) {
  return (
    <button type="button" onClick={onClick} onDoubleClick={onDoubleClick} aria-pressed={isSelected} aria-label={nameOf(media, 'Photo')}
      className={s.tile}>
      <GridImage src={media.signed_url || ''} />
    </button>
  );
}

/* ───────────────────── VIDEO CARD ───────────────────── */

function VideoCard({ media, isSelected, onClick, onDoubleClick }: { media: Media; isSelected: boolean; onClick: () => void; onDoubleClick: () => void }) {
  return (
    <button type="button" onClick={onClick} onDoubleClick={onDoubleClick} aria-pressed={isSelected} aria-label={nameOf(media, 'Video')}
      className={s.tile}>
      <video key={media.signed_url || media.id} src={media.signed_url || ''} playsInline preload="metadata" muted />
      <span className={s.playBadge} aria-hidden="true">
        <span>
          <Play size={22} fill="currentColor" stroke="none" />
        </span>
      </span>
    </button>
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
    <button type="button" onClick={onClick} aria-pressed={isSelected}
      aria-label={[media.caption, media.memory_date].filter(Boolean).join(', ') || 'Photo'}
      className={cx(s.tile, s.tileCard)}>
      {media.signed_url && (
        <span className={cx(s.tlPolaroid, 'block')}>
          <span className={cx(s.tlFrame, 'block')}>
            <span className={cx(s.tlPhoto, 'block')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.signed_url} alt="" />
            </span>
          </span>
          {dateLabel && <span className={cx(s.tlDate, 'block')}>{dateLabel}</span>}
          <span className={cx(s.tlCaption, 'block')}>{media.caption || 'Untitled'}</span>
        </span>
      )}
      <span className="block" aria-hidden="true">
        <span className={s.tlYears}>
          <span>{yearStart}</span>
          <span>{yearEnd}</span>
        </span>
        <span className={cx(s.tlAxis, 'block')}>
          <span className={s.tlLine} />
          {[0,25,50,75,100].map((pos) => (<span key={pos} className={s.tlTick} style={{ left: `${pos}%` }} />))}
          <span className={s.tlDot} style={{ left: `${dotPosition}%` }} />
        </span>
        <span className={s.tlMonths}>
          {timelineMonths.map((m, i) => (<span key={i}>{m}</span>))}
        </span>
      </span>
    </button>
  );
}

/* ───────────────────── AUDIO CARD ───────────────────── */

function AudioCard({ media, isSelected, onClick }: { media: Media; isSelected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={isSelected} aria-label={nameOf(media, 'Audio recording')}
      className={cx(s.tile, s.tileCard)}>
      <span className={s.audioRow}>
        <IconTile Icon={Mic} tone={toneByKey('blue')} />
        <span className={s.wave}><AudioWaveform /></span>
      </span>
      <span className={cx(s.audioTitle, 'block')}>{media.caption || 'Audio recording'}</span>
      <span className={cx(s.audioSub, 'block')}>{media.memory_date || 'Voice memory'}</span>
    </button>
  );
}

/* ───────────────────── MAIN GRID ───────────────────── */

export default function MediaGrid({ media, selectedMedia, enrichment, onSelect, onLightbox }: { media: Media[]; selectedMedia: Media | null; enrichment: Enrichment; onSelect: (m: Media) => void; onLightbox: (m: Media) => void }) {
  void enrichment;

  if (media.length === 0) {
    return (
      <EmptyState
        Icon={Images}
        tone={toneByKey('orange')}
        title="No memories yet"
        text="Upload your first photo or video to begin."
      />
    );
  }

  return (
    <div className={s.masonry}>
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
