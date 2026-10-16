'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import styles from './storyPage.module.css';

// 0..1 from a small integer hash of the bar's position: looks random, same everywhere.
function barNoise(i: number) {
  const h = ((i + 1) * 2654435761) % 4294967296;
  return (((h ^ (h >>> 15)) >>> 0) % 1000) / 1000;
}

/**
 * Waveform player for a voice note on the public story page (the story's own voice note
 * and voice comments). Same behaviour as the shared VoiceNotePlayer, in the landing's look.
 * Callers provide any surrounding frame or label.
 */
export default function StoryVoicePlayer({
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

  // Generate pseudo-waveform bars (fixed per position, so the server and the browser
  // draw the same bars and hydration matches)
  const barCount = compact ? 32 : 48;
  const [bars] = useState(() =>
    Array.from({ length: barCount }, (_, i) => 0.2 + barNoise(i) * 0.8)
  );

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? progress / duration : 0;

  return (
    <div className={`${styles.voice} ${compact ? styles.voiceCompact : ''}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) =>
          setProgress((e.target as HTMLAudioElement).currentTime)
        }
        onLoadedMetadata={(e) =>
          setDuration((e.target as HTMLAudioElement).duration)
        }
        onEnded={() => setPlaying(false)}
      />

      {/* Play button */}
      <button
        type="button"
        onClick={toggle}
        className={styles.voicePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <Pause size={compact ? 15 : 19} strokeWidth={2.6} aria-hidden="true" />
        ) : (
          <Play size={compact ? 15 : 19} strokeWidth={2.6} className={styles.playGlyph} aria-hidden="true" />
        )}
      </button>

      {/* Waveform */}
      <div className={styles.voiceTrack}>
        <div
          className={styles.wave}
          onClick={seek}
          role="slider"
          aria-valuenow={Math.round(progressPct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {bars.map((height, i) => (
            <div
              key={i}
              className={`${styles.bar} ${i / barCount <= progressPct ? styles.barOn : ''}`}
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>

        {/* Time display */}
        <div className={styles.times}>
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Download */}
      {showDownload && (
        <a
          href={src}
          download
          className={styles.download}
          aria-label="Download voice note"
        >
          <Download size={18} strokeWidth={2.2} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
