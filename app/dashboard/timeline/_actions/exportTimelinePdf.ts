// app/dashboard/timeline/_actions/exportTimelinePdf.ts
// Server-only helper that generates a branded, zoomed-out, strictly horizontal timeline PDF.
// Designed for V1 export when clicking "Preserve My Legacy".
import { getServerClient } from "@/lib/supabase/server";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

type TimelineMeta = {
  id: string;
  title: string;
  description: string | null;
  cover_path?: string | null;
  created_at?: string | null;
};

type TimelineEventRow = {
  id: string;
  timeline_id?: string;
  title: string;
  description?: string | null;
  event_date: string; // YYYY-MM-DD
};

type MediaRow = {
  id: string;
  event_id: string;
  file_path: string;
  file_type: 'photo' | 'video' | 'audio' | 'file';
  created_at?: string | null;
};

export type ExportTimelinePdfResult = {
  bytes: Uint8Array;
  filename: string;
};

const BRAND = {
  gold: rgb(230 / 255, 194 / 255, 110 / 255), // #E6C26E
  goldSoft: rgb(243 / 255, 217 / 255, 155 / 255), // #F3D99B
  navy: rgb(34 / 255, 43 / 255, 58 / 255), // #222B3A
  text: rgb(31 / 255, 40 / 255, 55 / 255), // #1F2837
  muted: rgb(122 / 255, 133 / 255, 150 / 255), // #7A8596
  line: rgb(200 / 255, 165 / 255, 87 / 255), // #C8A557
};

function safeFilename(name: string) {
  return (name || 'timeline')
    .replace(/[^\w\s\-().]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 80);
}

function parseEventDateISO(iso: string): Date {
  // event_date is YYYY-MM-DD. Use UTC midday to avoid timezone edge cases.
  const [y, m, d] = iso.split('-').map((n) => Number(n));
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1, 12, 0, 0));
}

function formatPrettyDate(iso: string) {
  const dt = parseEventDateISO(iso);
  // Keep it stable and classy (UK-friendly but not locale-dependent)
  const day = String(dt.getUTCDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = monthNames[dt.getUTCMonth()] ?? 'Jan';
  const year = dt.getUTCFullYear();
  return `${day} ${mon} ${year}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}


function wrapText(text: string, maxChars: number) {
  const t = (text || '').trim();
  if (!t) return [];
  const words = t.split(/\s+/g);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

async function readLogoBytesFromPublic(): Promise<Uint8Array | null> {
  // /public/actual white logo.png
  try {
    const p = path.join(process.cwd(), 'public', 'actual white logo.png');
    const buf = fs.readFileSync(p);
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

function detectPng(bytes: Uint8Array) {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function detectJpg(bytes: Uint8Array) {
  // JPEG signature: FF D8 FF
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

async function downloadStorageBytes(
  supabase: any,
  bucket: string,
  filePath: string
): Promise<Uint8Array | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(filePath);
    if (error || !data) return null;

    // data can be Blob (edge/browser) or Readable/Buffer-like in node depending on adapter
    // Try arrayBuffer first:
    if (typeof data.arrayBuffer === 'function') {
      const ab = await data.arrayBuffer();
      return new Uint8Array(ab);
    }

    // Fallback: if it's a Buffer already
    if (Buffer.isBuffer(data)) return new Uint8Array(data);

    return null;
  } catch {
    return null;
  }
}

export async function exportTimelinePdf(
  params: { timelineId: string }
): Promise<ExportTimelinePdfResult> {
  const supabase = await getServerClient();

  const { timelineId } = params;

  // Fetch timeline meta
  const { data: timeline, error: tlErr } = await supabase
    .from('timelines')
    .select('id, title, description, cover_path, created_at')
    .eq('id', timelineId)
    .maybeSingle();

  if (tlErr || !timeline) throw new Error(tlErr?.message || 'Timeline not found');

  // Fetch events
  const { data: rows, error: evErr } = await supabase
    .from('timeline_events')
    .select('id, title, description, event_date')
    .eq('timeline_id', timelineId)
    .order('event_date', { ascending: true });

  if (evErr) throw new Error(evErr.message);

  const events = (rows ?? []) as TimelineEventRow[];

  // Early: still generate a PDF even if no events
  const pdf = await PDFDocument.create();

  // Use landscape for horizontal timeline.
  // A4 landscape: 841.89 x 595.28 pts approx (pdf-lib uses points)
  const PAGE_W = 842;
  const PAGE_H = 595;

  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontBoldItalic = await pdf.embedFont(StandardFonts.HelveticaBoldOblique);


  // Logo watermark (optional)
  const logoBytes = await readLogoBytesFromPublic();
  let logoImage: any = null;
  if (logoBytes) {
    try {
      if (detectPng(logoBytes)) logoImage = await pdf.embedPng(logoBytes);
      else if (detectJpg(logoBytes)) logoImage = await pdf.embedJpg(logoBytes);
    } catch {
      logoImage = null;
    }
  }

  // Preload 1 photo thumbnail per event (best effort, never block export)
  const firstPhotoByEvent: Record<string, Uint8Array | null> = {};
  if (events.length) {
    const eventIds = events.map((e) => e.id);
    const { data: mediaRows } = await supabase
      .from('timeline_event_media')
      .select('id, event_id, file_path, file_type, created_at')
      .in('event_id', eventIds)
      .eq('file_type', 'photo')
      .order('created_at', { ascending: true });

    const media = (mediaRows ?? []) as MediaRow[];
    const firstBy: Record<string, MediaRow> = {};
    for (const m of media) {
      if (!firstBy[m.event_id]) firstBy[m.event_id] = m;
    }

    // download sequentially (keep it simple & stable)
    for (const ev of events) {
      const pick = firstBy[ev.id];
      if (!pick?.file_path) {
        firstPhotoByEvent[ev.id] = null;
        continue;
      }
      firstPhotoByEvent[ev.id] = await downloadStorageBytes(supabase, 'timeline-media', pick.file_path);
    }
  }

  // ---------- Layout math (strictly horizontal) ----------
  // We aim to show the entire timeline on ONE page if possible.
  // If too wide, we create multiple pages with horizontal "windows".

  // Determine domain by date (min/max)
  const dates = events.map((e) => parseEventDateISO(e.event_date).getTime());
  const minT = dates.length ? Math.min(...dates) : Date.UTC(new Date().getUTCFullYear(), 0, 1, 12);
  const maxT = dates.length ? Math.max(...dates) : Date.UTC(new Date().getUTCFullYear() + 1, 0, 1, 12);

  // Add padding to domain so endpoints aren’t glued to edges
  const padDays = 25;
  const padMs = padDays * 24 * 60 * 60 * 1000;
  const domainStart = minT - padMs;
  const domainEnd = maxT + padMs;

  // Canvas inside page
  const MARGIN = 48;
  const HEADER_H = 96;
  const FOOTER_H = 44;
  const contentTop = PAGE_H - MARGIN - HEADER_H;
  const contentBottom = MARGIN + FOOTER_H;
  const contentH = contentTop - contentBottom;

  const railY = contentBottom + contentH * 0.42; // slightly above mid, matches your UI feel
  const cardUpY = railY + 64; // below rail
  const cardDownY = railY - 64; // above rail

  const viewW = PAGE_W - MARGIN * 2;

  // Determine needed width:
  // Keep it zoomed out by using a SMALL px-per-month baseline, but also prevent overlaps.
  const msRange = domainEnd - domainStart || 1;
  const daysRange = msRange / (24 * 60 * 60 * 1000);
  const axisMode = getAxisMode(daysRange, events.length);

  // Base scale: ~ 10 pts per month (~0.33/day) => very zoomed out.
  // Then increase if events are dense to prevent cards sitting on top of each other.
  const basePxPerDay = 0.33;
  const minGap = 140; // minimum distance between event centers
  const desiredMinWidthByScale = daysRange * basePxPerDay;

  // Also compute a width that can give each event breathing room:
  const desiredMinWidthByEvents = events.length ? (events.length - 1) * minGap : viewW;

  const totalContentW = Math.max(viewW, desiredMinWidthByScale, desiredMinWidthByEvents);

  // Decide pages
  const pagesNeeded = Math.max(1, Math.ceil(totalContentW / viewW));

  // Map timestamp -> x in [0, totalContentW]
  const timeToX = (t: number) => {
    const p = (t - domainStart) / msRange;
    return p * totalContentW;
  };

  // We will draw only events that fall within a page window (with a small bleed margin).
  const BLEED = 120;

  // ---------- Draw helpers ----------
  const drawWatermark = (page: any) => {
    if (!logoImage) return;
    const targetW = 120;
    const scale = targetW / logoImage.width;
    const w = targetW;
    const h = logoImage.height * scale;

    const x = MARGIN;
    const y = MARGIN; // bottom-left area
    page.drawImage(logoImage, {
      x,
      y,
      width: w,
      height: h,
      opacity: 0.6,
    });
  };

  const drawHeader = (page: any, meta: TimelineMeta) => {
    const title = (meta.title || '').trim() || 'My Timeline';
    const desc = (meta.description || '').trim();

    const titleSize = 26;
    const descSize = 11;

    // Title (gold, italic-ish feel by sizing + spacing)
    page.drawText(title, {
      x: MARGIN,
      y: PAGE_H - MARGIN - 34,
      size: titleSize - 1,
      font: fontBoldItalic,
      color: BRAND.line,
      skew: { xAxis: -8, yAxis: 0 }, // ← italic effect
      letterSpacing: 2,
    });

    if (desc) {
      const lines = wrapText(desc, 92).slice(0, 2);
      let yy = PAGE_H - MARGIN - 34 - 28;
      for (const line of lines) {
        page.drawText(line, {
          x: MARGIN,
          y: yy,
          size: descSize,
          font: fontRegular,
          color: BRAND.muted,
        });
        yy -= 14;
      }
    }

    // Thin gold divider
    page.drawLine({
      start: { x: MARGIN, y: PAGE_H - MARGIN - HEADER_H + 16 },
      end: { x: PAGE_W - MARGIN, y: PAGE_H - MARGIN - HEADER_H + 16 },
      thickness: 1,
      color: rgb(230 / 255, 194 / 255, 110 / 255),
      opacity: 0.55,
    });
  };

  const drawFooter = (page: any, pageIndex: number, total: number) => {
    const label = `${pageIndex + 1} / ${total}`;
    page.drawText(label, {
      x: PAGE_W - MARGIN - fontRegular.widthOfTextAtSize(label, 10),
      y: MARGIN - 18,
      size: 10,
      font: fontRegular,
      color: BRAND.muted,
      opacity: 0.9,
    });
  };

  const drawRail = (page: any) => {
    // Base rail
    page.drawLine({
      start: { x: MARGIN, y: railY },
      end: { x: PAGE_W - MARGIN, y: railY },
      thickness: 3,
      color: BRAND.gold,
      opacity: 0.55,
    });

    // Soft glow rail underlay (subtle)
    page.drawLine({
      start: { x: MARGIN, y: railY - 1 },
      end: { x: PAGE_W - MARGIN, y: railY - 1 },
      thickness: 8,
      color: BRAND.goldSoft,
      opacity: 0.18,
    });
  };

  const drawMonthTicks = (page: any, windowStartX: number, windowEndX: number) => {
    // Minimal ticks: we show just the year label where it appears on the window.
    // We’ll place one year tick per year boundary if visible.
    const startDate = new Date(domainStart);
    const endDate = new Date(domainEnd);

    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();

    for (let y = startYear; y <= endYear; y++) {
      const t = Date.UTC(y, 0, 1, 12);
      const xGlobal = timeToX(t);
      if (xGlobal < windowStartX - 40 || xGlobal > windowEndX + 40) continue;

      const x = MARGIN + (xGlobal - windowStartX);
      // Tick
      page.drawLine({
        start: { x, y: railY - 10 },
        end: { x, y: railY + 10 },
        thickness: 1,
        color: BRAND.muted,
        opacity: 0.35,
      });
      // Label
      const label = String(y);
      page.drawText(label, {
        x: x - fontRegular.widthOfTextAtSize(label, 9) / 2,
        y: railY + 16,
        size: 9,
        font: fontRegular,
        color: BRAND.muted,
        opacity: 0.75,
      });
    }
  };

  const drawAdaptiveAxisTicks = (
  page: any,
  windowStartX: number,
  windowEndX: number,
  axisMode: 'month' | 'quarter' | 'year'
) => {
  const start = new Date(Date.UTC(
    new Date(domainStart).getUTCFullYear(),
    new Date(domainStart).getUTCMonth(),
    1,
    12
  ));

  const end = new Date(domainEnd);
  let lastYearDrawn: number | null = null;

  while (start <= end) {
    const t = start.getTime();
    const xGlobal = timeToX(t);

    if (xGlobal >= windowStartX - 40 && xGlobal <= windowEndX + 40) {
      const x = MARGIN + (xGlobal - windowStartX);

      // MONTH LABEL
      if (axisMode === 'month') {
        const month = start.toLocaleString('en-GB', { month: 'long' });

        page.drawText(month, {
          x: x - fontRegular.widthOfTextAtSize(month, 9) / 2,
          y: railY - 26,
          size: 9,
          font: fontRegular,
          color: BRAND.muted,
          opacity: 0.85,
        });
      }

      // YEAR (only once per year)
      const year = start.getUTCFullYear();
      if (year !== lastYearDrawn && start.getUTCMonth() === 0) {
        const label = String(year);
        page.drawText(label, {
          x: x - fontBold.widthOfTextAtSize(label, 10) / 2,
          y: railY + 18,
          size: 10,
          font: fontBold,
          color: BRAND.text,
          opacity: 0.9,
        });
        lastYearDrawn = year;
      }

      // tick
      page.drawLine({
        start: { x, y: railY - 6 },
        end: { x, y: railY + 6 },
        thickness: 1,
        color: BRAND.muted,
        opacity: 0.25,
      });
    }

    start.setUTCMonth(start.getUTCMonth() + 1);
  }
};



  function getAxisMode(daysRange: number, eventCount: number) {
  if (eventCount <= 6 && daysRange <= 400) return 'month';
  if (eventCount <= 14 && daysRange <= 1200) return 'quarter';
  return 'year';
}

function drawCenteredYear(
  page: any,
  year: number,
  centerX: number
) {
  const label = String(year);
  page.drawText(label, {
    x: centerX - fontBold.widthOfTextAtSize(label, 14) / 2,
    y: railY + 14,
    size: 14,
    font: fontBold,
    color: BRAND.text,
    opacity: 0.9,
  });
}

  const embedEventThumb = async (bytes: Uint8Array | null) => {
    if (!bytes) return null;
    try {
      if (detectPng(bytes)) return await pdf.embedPng(bytes);
      if (detectJpg(bytes)) return await pdf.embedJpg(bytes);
      return null;
    } catch {
      return null;
    }
  };

  // Cache embedded thumbs to reduce size a bit if same bytes appear (rare but safe)
  const embeddedThumbCache = new Map<string, any>();
  const thumbForEvent: Record<string, any | null> = {};
  for (const ev of events) {
    const b = firstPhotoByEvent[ev.id];
    if (!b) {
      thumbForEvent[ev.id] = null;
      continue;
    }
    // cache key by first 32 bytes
    const key = Array.from(b.slice(0, 32)).join(',');
    if (embeddedThumbCache.has(key)) {
      thumbForEvent[ev.id] = embeddedThumbCache.get(key);
      continue;
    }
    const img = await embedEventThumb(b);
    thumbForEvent[ev.id] = img;
    if (img) embeddedThumbCache.set(key, img);
  }

  // Draw pages
  for (let p = 0; p < pagesNeeded; p++) {
    const page = pdf.addPage([PAGE_W, PAGE_H]);

    const windowStartX = p * viewW;
    const windowEndX = windowStartX + viewW;

    drawHeader(page, timeline as TimelineMeta);
    drawRail(page);
    drawAdaptiveAxisTicks(page, windowStartX, windowEndX, axisMode);
    // Always show the year centered in the visible window
    const windowMidX = (windowStartX + windowEndX) / 2;
    const midTime =
    domainStart + (windowMidX / totalContentW) * msRange;

    const midYear = new Date(midTime).getUTCFullYear();
    drawCenteredYear(page, midYear, MARGIN + 40);
    drawWatermark(page);
    drawFooter(page, p, pagesNeeded);

    // Render events in this window
    const visible = events
      .map((ev, idx) => {
        const t = parseEventDateISO(ev.event_date).getTime();
        const xGlobal = timeToX(t);
        return { ev, idx, xGlobal };
      })
      .filter(({ xGlobal }) => xGlobal >= windowStartX - BLEED && xGlobal <= windowEndX + BLEED);

    // In dense timelines, we nudge overlapping events minimally (still horizontal, but micro-offset)
    // We do NOT change chronology — only tiny separation if two events land on same x.
    visible.sort((a, b) => a.xGlobal - b.xGlobal);

    const adjustedX: number[] = [];
    for (let i = 0; i < visible.length; i++) {
      const base = visible[i].xGlobal;
      const prev = adjustedX[i - 1];
      if (i === 0) adjustedX.push(base);
      else adjustedX.push(base < prev + 40 ? prev + 40 : base);
    }

    for (let i = 0; i < visible.length; i++) {
      const { ev, idx } = visible[i];
      const xGlobal = adjustedX[i];
      const x = MARGIN + (xGlobal - windowStartX);

      // Skip if fully off page
      if (x < MARGIN - 80 || x > PAGE_W - MARGIN + 80) continue;

      const isDown = idx % 2 === 0; // alternate like typical timeline UI
      const cardW = 210;
      const cardH = 86; // small to keep zoomed out
      const cardX = clamp(x - cardW / 2, MARGIN, PAGE_W - MARGIN - cardW);
      const cardY = isDown ? cardUpY : cardDownY - cardH;

      // Connector line
      const dotR = 7;
      const dotY = railY;

      const connectTop = isDown ? dotY + dotR : cardY + cardH;
      const connectBottom = isDown ? cardY : dotY - dotR;

      page.drawLine({
        start: { x, y: connectTop },
        end: { x, y: connectBottom },
        thickness: 2,
        color: BRAND.gold,
        opacity: 0.85,
      });

      // Dot
      page.drawCircle({
        x,
        y: dotY,
        size: dotR,
        color: BRAND.gold,
        opacity: 0.95,
      });
      page.drawCircle({
        x,
        y: dotY,
        size: dotR - 3.2,
        color: rgb(1, 1, 1),
        opacity: 0.9,
      });

      // Card shadow (soft)
      page.drawRectangle({
        x: cardX + 2,
        y: cardY - 2,
        width: cardW,
        height: cardH,
        color: rgb(0, 0, 0),
        opacity: 0.06,
      });

      // Card body (white, subtle border)
page.drawRectangle({
  x: cardX,
  y: cardY,
  width: cardW,
  height: cardH,
  color: rgb(1, 1, 1),
  borderColor: rgb(0.9, 0.9, 0.9),
  borderWidth: 0.8,
});

// Gold top strip (matches UI)
page.drawRectangle({
  x: cardX,
  y: cardY + cardH - 4,
  width: cardW,
  height: 4,
  color: BRAND.gold,
});




      // Thumb (optional) — small square on left
      const thumb = thumbForEvent[ev.id];
      const hasThumb = !!thumb;
      const pad = 10;
      const thumbSize = 56;
      const textStartX = hasThumb ? cardX + pad + thumbSize + 10 : cardX + pad;

      if (hasThumb) {
        // Image container
        page.drawRectangle({
          x: cardX + pad,
          y: cardY + pad,
          width: thumbSize,
          height: thumbSize,
          color: rgb(1, 1, 1),
          opacity: 1,
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 0.8,
        });

        // Fit image into square (contain)
        const scale = Math.min(thumbSize / thumb.width, thumbSize / thumb.height);
        const w = thumb.width * scale;
        const h = thumb.height * scale;
        const ix = cardX + pad + (thumbSize - w) / 2;
        const iy = cardY + pad + (thumbSize - h) / 2;

        page.drawImage(thumb, {
          x: ix,
          y: iy,
          width: w,
          height: h,
          opacity: 1,
        });
      }

      // Date
      const dateStr = formatPrettyDate(ev.event_date);
      page.drawText(dateStr.toUpperCase(), {
        x: textStartX,
        y: cardY + cardH - 22,
        size: 8.5,
        font: fontBold,
        color: rgb(86 / 255, 97 / 255, 255 / 255),
        opacity: 0.9,
      });

      // Title
      const title = (ev.title || '').trim() || 'Memory';
      const titleLines = wrapText(title, hasThumb ? 20 : 28).slice(0, 2);
      let ty = cardY + cardH - 36;
      for (const line of titleLines) {
        page.drawText(line, {
          x: textStartX,
          y: ty,
          size: 11,
          font: fontBold,
          color: BRAND.text,
          opacity: 0.98,
        });
        ty -= 13;
      }

      // Description (tiny, optional, 1 line)
      const desc = (ev.description || '').trim();
      if (desc) {
        const d = wrapText(desc, hasThumb ? 28 : 40)[0];
        if (d) {
          page.drawText(d, {
            x: textStartX,
            y: cardY + 12,
            size: 9,
            font: fontRegular,
            color: BRAND.muted,
            opacity: 0.95,
          });
        }
      }
    }
  }

  const bytes = await pdf.save();

  const filename = `${safeFilename((timeline as TimelineMeta).title)}.pdf`;
  return { bytes, filename };
}
