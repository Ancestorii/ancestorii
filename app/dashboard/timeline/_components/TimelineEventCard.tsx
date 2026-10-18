'use client';

import React, { useEffect, useState, type CSSProperties } from 'react';
import { Play } from 'lucide-react';
import { ui } from '@/components/dashboard/ui/AppBits';
import { TimelineEvent } from './HorizontalTimeline';
import s from './eventTimeline.module.css';

const cls = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');


function EventCoverImage({
  src,
  onImgError,
}: {
  src: string;
  onImgError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={onImgError}
      onLoad={async (e) => {
        const img = e.currentTarget;

        // ✅ wait until fully decoded (this is the “albums smoothness” part)
        try {
          if ("decode" in img) await (img as HTMLImageElement).decode();
        } catch {
          // ignore decode failures
        }

        // ✅ ensure opacity-0 paints first
        requestAnimationFrame(() => setLoaded(true));
      }}
      className={`h-full w-full object-cover block transition-opacity duration-500 ease-out ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: "translateZ(0)", // keeps your “split half” fix
        backfaceVisibility: "hidden",
        willChange: "opacity",
      }}
    />
  );
}

type Props = {
  variant?: 'ui' | 'pdf';
  event: TimelineEvent;
  date: Date;
  up: boolean;
  accent: string;
  cover?: {
  url: string;
  type: 'photo' | 'video';
  };
  more: number;
  cardY: number;
  foreignY: number;
  cardWidth?: number;
  cardHeight?: number;
  onImgError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
};

export default function TimelineEventCard({
  event,
  date,
  up,
  accent,
  cover,
  more,
  cardY,
  foreignY,
  cardWidth = 210,
  cardHeight = 280,
  onImgError,
  variant = 'ui',
}: Props) {

  const isPdf = variant === 'pdf';

  // The photo or video (the first of the memory's media), with ink chips over it.
  const thumb = cover && (
    <div className={cls(s.thumb, !isPdf && s.thumbHover)}>
      <div className={s.media}>
        {cover.type === 'photo' ? (
          <EventCoverImage src={cover.url} onImgError={onImgError} />
        ) : (
          <video
            key={cover.url} // ✅ remount when signed url changes
            src={cover.url}
            className="h-full w-full object-cover block"
            muted
            playsInline
            preload="metadata"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
        )}
      </div>

      {cover.type === 'video' && (
        <span className={cls(ui.chip, ui.chipInk, ui.chipSm, s.badge, s.badgeVideo)}>
          <Play size={10} strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
          Video
        </span>
      )}

      {more > 0 && (
        <span className={cls(ui.chip, ui.chipInk, ui.chipSm, s.badge, s.badgeMore)}>
          +{more}
        </span>
      )}
    </div>
  );

  // The date as a chip (its dot in the memory's colour), then the title.
  const meta = (
    <div className={cls(s.meta, cover ? (up ? s.metaBelow : s.metaAbove) : s.metaOnly)}>
      <span
        className={cls(ui.chip, ui.chipSm, ui.chipDot, s.date)}
        style={{ '--dot': accent } as CSSProperties}
      >
        {date.toUTCString().slice(5, 16)}
      </span>
      <p className={s.title}>{event.title}</p>
    </div>
  );

  return (
    <g transform={`translate(0, ${cardY})`}>
      <foreignObject
        x={-cardWidth / 2}
        y={foreignY}
        width={cardWidth}
        height={cardHeight}
        style={{ overflow: 'hidden' }}
      >
        <div className={s.card}>
          {up ? (
            <>
              {thumb}
              {meta}
            </>
          ) : (
            <>
              {meta}
              {thumb}
            </>
          )}
        </div>
      </foreignObject>
    </g>
  );
}
