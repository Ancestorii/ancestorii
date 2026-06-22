'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';

/**
 * Waveform audio player for a single voice note (signed URL).
 * Pure player row — callers provide any surrounding frame/header.
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
  const [bars] = useState(() => Array.from({ length: barCount }, () => 0.2 + Math.random() * 0.8));

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    playing ? el.pause() : el.play();
    setPlaying(!playing);
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * duration;
  };
  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const pPct = duration > 0 ? progress / duration : 0;

  const btnSize = compact
    ? 'h-9 w-9'
    : 'h-[48px] w-[48px] sm:h-[52px] sm:w-[52px]';
  const barsHeight = compact ? 'h-[24px]' : 'h-[36px]';

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className={`flex ${btnSize} flex-shrink-0 items-center justify-center text-white transition-transform duration-200 hover:scale-105 active:scale-95`}
        style={{ background: 'linear-gradient(135deg, #D8BE8B 0%, #A9782F 100%)' }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={compact ? 14 : 18} strokeWidth={2.2} /> : <Play size={compact ? 14 : 18} strokeWidth={2.2} className="ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div
          className={`flex items-end gap-[2px] ${barsHeight} cursor-pointer`}
          onClick={seek}
          role="slider"
          aria-valuenow={Math.round(pPct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 transition-colors duration-150"
              style={{ height: `${h * 100}%`, minWidth: '2px', backgroundColor: i / barCount <= pPct ? '#A9782F' : '#DDD6CC' }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] sm:text-[11px] text-[#9C9488] tabular-nums">
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
      {showDownload && (
        <a
          href={src}
          download
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-[#9C9488] transition-colors duration-200 hover:text-[#A9782F]"
          aria-label="Download voice note"
        >
          <Download size={16} strokeWidth={1.6} />
        </a>
      )}
    </div>
  );
}
