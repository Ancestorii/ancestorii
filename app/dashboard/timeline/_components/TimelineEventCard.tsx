'use client';

import React, { useEffect, useState } from 'react';
import { TimelineEvent } from './HorizontalTimeline';


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

  return (
    <g transform={`translate(0, ${cardY})`}>
      <foreignObject
        x={-cardWidth / 2}
        y={foreignY}
        width={cardWidth}
        height={cardHeight}
        style={{ overflow: 'hidden' }}
      >
        <div
         className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          style={{ borderTop: '4px solid #D4AF37' }}
        >
          <div className={
          isPdf
          ? undefined
          : 'transition-transform duration-200 ease-out hover:scale-[1.018]'}
          style={{ transformOrigin: 'center' }}
          >
          <div  className="p-3">
            {up ? (
              <>
                {cover && (
                  <div className="mt-0 relative w-full h-[140px]">
                    <div className="absolute inset-0 rounded-lg bg-slate-200/70 translate-x-1.5 translate-y-1.5 rotate-[-2deg]" />
                    <div className="absolute inset-0 rounded-lg bg-slate-200/60 translate-x-3 translate-y-3 rotate-[1.8deg]" />
                     <div className={
                      isPdf
                       ? 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200 bg-black'
                       : 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200 bg-black transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-md'
                       }
                       >
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
                      {more > 0 && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-semibold text-white bg-black/60">
                          +{more}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="mt-3 text-[12px] uppercase tracking-wide font-bold"
                  style={{ color: accent }}
                >
                  {date.toUTCString().slice(5, 16)}
                </div>

                <div className="text-sm font-medium text-slate-800 mt-1 line-clamp-1">
                  {event.title}
                </div>
              </>
            ) : (
              <>
                <div
                  className="text-[12px] uppercase tracking-wide font-bold"
                  style={{ color: accent }}
                >
                  {date.toUTCString().slice(5, 16)}
                </div>

                <div className="text-sm font-medium text-slate-800 mt-1 mb-3 line-clamp-1">
                  {event.title}
                </div>

                {cover && (
                  <div className="mt-0 relative w-full h-[140px]">
                    <div className="absolute inset-0 rounded-lg bg-slate-200/70 translate-x-1.5 translate-y-1.5 rotate-[-2deg]" />
                    <div className="absolute inset-0 rounded-lg bg-slate-200/60 translate-x-3 translate-y-3 rotate-[1.8deg]" />
                    <div
                     className={
                      isPdf
                      ? 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200 bg-black'
                      : 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200 bg-black transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-md'
                       }
                      >
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

                      {more > 0 && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-semibold text-white bg-black/60">
                          +{more}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </foreignObject>
    </g>
  );
}
