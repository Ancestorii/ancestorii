'use client';

import React from 'react';
import { TimelineEvent } from './HorizontalTimeline';

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
                       ? 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200'
                       : 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200 transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-md'
                       }
                       >
                      {cover.type === 'photo' ? (
                        <img
                        src={cover.url}
                        alt=""
                        className="h-full w-full object-cover"
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        onError={onImgError}
                        />
                       ) : (
                       <video
                       src={cover.url}
                       className="h-full w-full object-cover"
                       muted
                       playsInline
                       preload="metadata"
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
                      ? 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200'
                      : 'relative h-full w-full rounded-lg overflow-hidden ring-1 ring-slate-200 transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-md'
                       }
                      >
                      {cover.type === 'photo' ? (
                     <img
                     src={cover.url}
                     alt=""
                     className="h-full w-full object-cover"
                     draggable={false}
                     loading="lazy"
                     decoding="async"
                     onError={onImgError}
                     />
                     ) : (
                    <video
                    src={cover.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
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
