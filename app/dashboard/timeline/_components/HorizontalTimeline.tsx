'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleTime, zoom, zoomIdentity, select, timeYear } from 'd3';
import MemoryModal from '@app/dashboard/timeline/_components/MemoryModal';
import TimelineEventCard from './TimelineEventCard';


export type TimelineEvent = {
  id: string;
  title: string;
  happened_at: string; // ISO
  media?: Array<{ type: 'photo' | 'video' | 'audio'; url: string }>;
  note?: string | null;
};

type TimelineThumbnail = {
  url: string;
  type: 'photo' | 'video';
};

type Props = {
  events?: TimelineEvent[];
  startYear?: number | null;
  endYear?: number | null;
  height?: number;
  minContentPxPerYear?: number;
  onEventClick?: (ev: TimelineEvent) => void;
  onCreateMemory?: () => void;
  thumbnailResolver?: (ev: TimelineEvent) => Promise<TimelineThumbnail[]>;
};

export default function HorizontalTimeline({
  events = [],
  startYear = null,
  endYear = null,
  height = 420,
  minContentPxPerYear = 250,
  onEventClick,
  onCreateMemory,
  thumbnailResolver,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1200);

  // Modal state (centered)
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<{ id: string; title?: string } | null>(null);

  function handleEventClick(ev: TimelineEvent) {
    setActiveEvent({ id: ev.id, title: ev.title });
    setModalOpen(true);
    onEventClick?.(ev);
  }

  // Track component width
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(Math.max(360, Math.round(entries[0].contentRect.width)));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Basic timeline domain
  const [autoStart, autoEnd] = useMemo(() => {
    if (!events.length) {
      const y = new Date().getUTCFullYear();
      return [y, y + 1];
    }
    const ms = events.map((e) => new Date(e.happened_at).getTime());
    const min = new Date(Math.min(...ms));
    const max = new Date(Math.max(...ms));
    return [min.getUTCFullYear(), max.getUTCFullYear()];
  }, [events]);

  const start = startYear ?? autoStart;
  const end = endYear ?? autoEnd;
  const domainStart = new Date(Date.UTC(start, 0, 1));
  const domainEnd = new Date(Date.UTC(end + 1, 0, 1));
  const midY = height / 2;

  const baseX = useMemo(() => {
    const eventCount = events.length || 1;
    const contentWidth = Math.max(
      (end - start + 1) * minContentPxPerYear + eventCount * 250,
      width * 1.8
    );
    return scaleTime().domain([domainStart, domainEnd]).range([0, contentWidth]);
  }, [domainStart, domainEnd, start, end, minContentPxPerYear, events.length, width]);

  const [transform, setTransform] = useState<any>(zoomIdentity);
  const [zoomLevel, setZoomLevel] = useState(1);
  const x = useMemo(
    () => (transform.rescaleX ? transform.rescaleX(baseX) : baseX),
    [transform, baseX]
  );

  // Label visibility helpers
  const refYear = start;
  const jan1 = useMemo(() => new Date(Date.UTC(refYear, 0, 1)), [refYear]);
  const feb1 = useMemo(() => new Date(Date.UTC(refYear, 1, 1)), [refYear]);
  const apr1 = useMemo(() => new Date(Date.UTC(refYear, 3, 1)), [refYear]);
  const pxPerMonth = useMemo(() => Math.abs(x(feb1)! - x(jan1)!), [x, jan1, feb1]);
  const pxPerQuarter = useMemo(() => Math.abs(x(apr1)! - x(jan1)!), [x, jan1, apr1]);
  const showMonths = pxPerMonth >= 80;
  const showQuarters = !showMonths && pxPerQuarter >= 90;

  const [monthsEntered, setMonthsEntered] = useState(true);
  useEffect(() => {
    const eligible = showMonths || showQuarters;
    if (eligible && !monthsEntered) {
      requestAnimationFrame(() => requestAnimationFrame(() => setMonthsEntered(true)));
    }
    if (!eligible && monthsEntered) setMonthsEntered(false);
  }, [showMonths, showQuarters, monthsEntered]);

  // Zoom
  useEffect(() => {
    if (!svgRef.current) return;
    const sel = select(svgRef.current);
    const z = zoom()
      .scaleExtent([0.4, 8])
      .on('zoom', (e: any) => {
        setTransform(e.transform);
        setZoomLevel(e.transform.k);
      });
    (sel as any).call(z as any);
    (sel as any).call((z as any).transform, zoomIdentity);
    return () => (sel as any).on('.zoom', null);
  }, []);

  // Cache thumbnails for each event
  const [thumbsById, setThumbsById] = useState<
  Record<string, TimelineThumbnail[]>
  >({});
  useEffect(() => {
    if (!thumbnailResolver || !events.length) return;
    let cancelled = false;
    (async () => {
      const need = events.filter((ev) => !thumbsById[ev.id]);
      for (const ev of need) {
        try {
          const urls = (await thumbnailResolver(ev)) || [];
          if (cancelled) return;
          setThumbsById((p) => ({ ...p, [ev.id]: urls }));
        } catch {
          if (cancelled) return;
          setThumbsById((p) => ({ ...p, [ev.id]: [] }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [events, thumbnailResolver, thumbsById]);

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    el.onerror = null;
    el.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="' +
      el.width +
      '" height="' +
      el.height +
      '"></svg>';
  };

  // Rail gradient helpers
  const years = useMemo(
    () => timeYear.every(1)!.range(domainStart, domainEnd),
    [domainStart, domainEnd]
  );
  const yearSegments = useMemo(() => {
    if (!years.length) return [];
    return years.slice(0, -1).map((d, i) => {
      const next = years[i + 1];
      const x1 = x(d)!;
      const x2 = x(next)!;
      const hue = 260 + i * 6;
      const hue2 = hue + 4;
      const startCol = `hsl(${hue}deg 86% 60%)`;
      const endCol = `hsl(${hue2}deg 86% 52%)`;
      return { year: d.getUTCFullYear(), x1, x2, startCol, endCol };
    });
  }, [years, x]);

  // Floating active year label
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [visibleYear, setVisibleYear] = useState<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  useEffect(() => {
    const leftDate = x.invert(0);
    const rightDate = x.invert(width * 2);
    const mid = new Date((leftDate.getTime() + rightDate.getTime()) / 2);
    setActiveYear(mid.getUTCFullYear());
  }, [transform, x, width]);
  useEffect(() => {
    if (activeYear == null) return;
    setVisibleYear(activeYear);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setVisibleYear(null), 900);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [activeYear]);

  if (!events.length) {
    return (
      <div ref={wrapRef} className="w-full py-24 flex justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">✨</div>
          <h3 className="text-lg font-semibold">Your timeline is empty</h3>
          <p className="text-slate-600 mt-1">Add your first memory to begin your story.</p>
          <div className="mt-4">
            <button
              onClick={onCreateMemory}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:opacity-95"
            >
              Add your first memory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative w-full bg-white">
      {/* Floating year */}
      <div
        className={[
          'pointer-events-none absolute left-1/2 top-6 -translate-x-1/2',
          'transition-all duration-500',
          visibleYear ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1',
        ].join(' ')}
      >
        <div className="px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-slate-200">
          <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900/80">
            {visibleYear}
          </span>
        </div>
      </div>

      <svg
        ref={svgRef}
        width="200%"
        height={height + 40}
        viewBox={`0 0 ${width * 2} ${height + 40}`}
        style={{ display: 'block', background: 'transparent', overflow: 'visible' }}
      >
       {/* premium light gold rail with soft golden shadow */}
<line
  x1={-100}
  y1={midY}
  x2={baseX(domainEnd)! + 200}
  y2={midY}
  stroke="#E8C875"           // lighter, champagne-style gold
  strokeWidth={5}
  strokeLinecap="round"
  style={{
    filter:
      'drop-shadow(0 2px 4px rgba(212,175,55,0.35)) drop-shadow(0 0 6px rgba(212,175,55,0.25))',
  }}
/>


        {/* year ticks */}
        {timeYear.every(1)!.range(domainStart, domainEnd).map((d) => {
          const yr = d.getUTCFullYear();
          const cx = x(d)!;
          return (
            <g key={yr} transform={`translate(${cx}, ${midY})`}>
              <line y1={-24} y2={24} stroke="#cbd5e1" strokeWidth={2} />
              <text y={-32} textAnchor="middle" style={{ fontSize: 12, fill: '#64748b' }}>
                {yr}
              </text>
            </g>
          );
        })}

        {/* events */}
        {events.map((ev, i) => {
          const d = new Date(ev.happened_at);
          const cx = x(d)!;
          const up = i % 2 === 0;
          const CARD_W = 210;
          const CARD_H = 280;
          const arm = up ? -230 : 60;

          const accent = [
            '#6366F1', '#F59E0B', '#10B981', '#EF4444',
            '#3B82F6', '#EC4899', '#9333EA', '#F97316',
          ][i % 8];

          const resolved: TimelineThumbnail[] =
          thumbsById[ev.id]?.length
         ? thumbsById[ev.id]
         : (ev.media ?? []).filter(
          (m): m is TimelineThumbnail =>
          (m.type === 'photo' || m.type === 'video') && !!m.url
        );

          const cover = resolved[0] ?? null;
          const more = Math.max(0, resolved.length - 1);

          const cardY = up ? arm - 10 : arm + 10;
          const foreignY = up ? -58 : -6;

          return (
            <g
              key={ev.id}
              transform={`translate(${cx}, ${midY})`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleEventClick(ev)}
            >

{/* connector + premium gold/navy dot */}
<line y1={arm} y2={0} stroke="#D4AF37" strokeWidth={2} />

<g className="timeline-dot">
  {/* Thin navy edge */}
  <circle
    r={11}
    fill="#0F2040"
    stroke="#0F2040"
    strokeWidth={1}
  />

  {/* Warm rich gold core with gentle pulsating glow */}
  <circle
    r={9}
    fill="#D4AF37"
    style={{
      filter:
        'drop-shadow(0 0 6px rgba(218,165,32,0.65)) drop-shadow(0 0 10px rgba(218,165,32,0.45))',
      animation: 'goldGlow 3.5s ease-in-out infinite',
      transformOrigin: 'center',
    }}
  />
</g>


 <TimelineEventCard
  event={ev}
  date={d}
  up={up}
  accent={accent}
  cover={cover}
  more={more}
  cardY={cardY}
  foreignY={foreignY}
  cardWidth={CARD_W}
  cardHeight={CARD_H}
  onImgError={onImgError}
  />
            </g>
          );
        })}

       {/* month ticks — showQuarters => Apr/Jul/Oct only; showMonths => all 12 */}
{(() => {
  if (!showMonths && !showQuarters) return null;

  // Build all months from Jan so the math is stable
  const months: Date[] = [];
  const cur = new Date(Date.UTC(domainStart.getUTCFullYear(), 0, 1)); // Jan 1
  while (cur < domainEnd) {
    months.push(new Date(cur));
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }

  // If we're on quarter stage (and not full months), filter to Apr/Jul/Oct only
  const ticks = showMonths
    ? months
    : months.filter((d) => {
        const m = d.getUTCMonth(); // 0=Jan,1=Feb,...,3=Apr,6=Jul,9=Oct
        return m === 3 || m === 6 || m === 9; // Apr/Jul/Oct only
      });

  const LABEL_FONT = showMonths ? 12 : 13;
  const TICK_Y1 = 0;
  const TICK_Y2 = showMonths ? 14 : 18;
  const LABEL_Y  = showMonths ? 24 : 28;

  return ticks.map((d) => {
    const cx = x(d)!;
    const label = d.toLocaleString('default', { month: 'long' });

    return (
      <g
        key={`month-${d.toISOString()}`}
        transform={`translate(${cx}, ${midY})`}
        style={{ opacity: monthsEntered ? 1 : 0, transition: 'opacity 0.25s ease' }}
      >
        <line y1={TICK_Y1} y2={TICK_Y2} stroke="#d4d4d8" strokeWidth={1} />
        <text
          y={LABEL_Y}
          textAnchor="middle"
          dominantBaseline="hanging"
          style={{ fontSize: LABEL_FONT, fontWeight: 600, fill: '#475569', letterSpacing: '0.3px' }}
        >
          {label}
        </text>
      </g>
    );
  });
})()}

        {/* defs */}
        <defs>
          {yearSegments.map((seg) => (
            <linearGradient
              key={`grad-${seg.year}`}
              id={`grad-${seg.year}`}
              gradientUnits="userSpaceOnUse"
              x1={seg.x1}
              y1={midY}
              x2={seg.x2}
              y2={midY}
            >
              <stop offset="0%" stopColor={seg.startCol} />
              <stop offset="100%" stopColor={seg.endCol} />
            </linearGradient>
          ))}
          <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>
  {`
    @keyframes goldGlow {
      0%, 100% {
        filter: drop-shadow(0 0 6px rgba(218,165,32,0.55))
                drop-shadow(0 0 10px rgba(218,165,32,0.35));
      }
      50% {
        filter: drop-shadow(0 0 10px rgba(218,165,32,0.9))
                drop-shadow(0 0 16px rgba(218,165,32,0.65));
      }
    }
  `}
</style>
      </svg>

      {/* Centered Memory Modal */}
      {activeEvent && (
        <MemoryModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          eventId={activeEvent.id}
          eventTitle={activeEvent.title}
        />
      )}
    </div>
  );
}

