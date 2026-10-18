'use client';

import { useMemo, useRef, useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import s from './voice.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/**
 * Bar heights (0.2 to 1) from a seeded generator, so the server and the browser
 * draw the same waveform. Seeded by the URL without its query string, so a
 * note keeps its shape when its signed URL is renewed.
 */
function waveformBars(src: string, count: number) {
  let seed = 2166136261;
  for (const ch of src.split('?')[0]) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: count }, () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return 0.2 + (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 0.8;
  });
}

/**
 * Waveform audio player for a single voice note (signed URL), in the app kit's look:
 * a pill with an ink play button, the waveform (played bars in pink) and the times.
 * Callers provide any surrounding header (who recorded it, and when).
 */
export default function VoiceNotePlayer({
  src,
  compact = false,
  showDownload = true,
}: {
  src: string;
  compact?: boolean;
  showDownload?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const barCount = compact ? 32 : 48;
  const bars = useMemo(() => waveformBars(src, barCount), [src, barCount]);

  // The element's own events drive the button (below), so it never shows "Pause" while nothing
  // plays: a note still being converted, or one this browser can't decode, rejects play()
  // instead of spinning.
  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    // A WebM recording can report an Infinity duration: there is nothing to seek across.
    if (!el || !duration || !Number.isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * duration;
  };
  // An unknown (Infinity) duration showed as "Infinity:NaN".
  const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` : '0:00');
  const pPct = duration > 0 ? progress / duration : 0;

  return (
    <div className={cx(s.player, compact && s.compact, showDownload && s.withDownload)}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className={s.play}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <Pause size={compact ? 15 : 17} strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
        ) : (
          <Play size={compact ? 15 : 17} strokeWidth={2.6} fill="currentColor" className={s.playGlyph} aria-hidden="true" />
        )}
      </button>
      <div className={s.track}>
        <div
          className={s.wave}
          onClick={seek}
          role="slider"
          aria-label="Playback position"
          aria-valuenow={Math.round(pPct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {bars.map((h, i) => (
            <span
              key={i}
              className={cx(s.bar, i / barCount <= pPct && s.barOn)}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
        <div className={s.times}>
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
      {showDownload && (
        <a
          href={src}
          download
          className={s.download}
          aria-label="Download voice note"
          title="Download voice note"
        >
          <Download size={18} strokeWidth={2.2} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
