import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  const { canvasId } = await params;

  if (!canvasId) {
    return NextResponse.json({ error: 'Missing canvasId' }, { status: 400 });
  }

  // ── Fetch export dimensions ──
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: canvas, error: canvasError } = await supabase
    .from('memory_canvases')
    .select('title, export_width_px, export_height_px')
    .eq('id', canvasId)
    .single();

  if (canvasError || !canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 });
  }

  const exportW = canvas.export_width_px;
  const exportH = canvas.export_height_px;

  // ── Compute viewport + DPR ──
  const MAX_VP = 4000;
  const dpr = Math.max(1, Math.ceil(Math.max(exportW, exportH) / MAX_VP));
  const vpW = Math.ceil(exportW / dpr);
  const vpH = Math.ceil(exportH / dpr);

  const exportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ancestorii.com'}/export/canvas/${canvasId}`;

  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader
    .split(';')
    .map((c) => {
      const [name, ...rest] = c.trim().split('=');
      return { name: name?.trim(), value: rest.join('=')?.trim(), domain: 'www.ancestorii.com', path: '/' };
    })
    .filter((c) => c.name && c.value);

  let browser;
  const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  try {
    console.log('[CANVAS EXPORT] connecting to browser');
    if (isVercel) {
      const browserlessToken = process.env.BROWSERLESS_TOKEN;
      if (!browserlessToken) throw new Error('BROWSERLESS_TOKEN not set');
      browser = await puppeteer.connect({
        browserWSEndpoint: `wss://production-sfo.browserless.io?token=${browserlessToken}`,
      });
    } else {
      const executablePath =
        process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : process.platform === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : '/usr/bin/google-chrome';

      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        defaultViewport: null,
        executablePath,
        headless: true,
      });
    }

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('googletagmanager.com') || url.includes('google-analytics.com') ||
        url.includes('facebook.com') || url.includes('connect.facebook.net') ||
        url.includes('redditstatic.com') || url.includes('reddit.com')
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    if (cookies.length) await page.setCookie(...cookies);

    await page.setViewport({ width: vpW, height: vpH, deviceScaleFactor: dpr });

    console.log(`[CANVAS EXPORT] navigating, viewport ${vpW}×${vpH} @ ${dpr}x`);
    await page.goto(exportUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    console.log('[CANVAS EXPORT] waiting for data-export-ready');
    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"]') !== null,
      { timeout: 60_000 }
    );

    await new Promise((r) => setTimeout(r, 1500));

    console.log('[CANVAS EXPORT] taking screenshot');
    const pngBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: vpW, height: vpH },
      omitBackground: false,
    });

    const title = canvas.title || 'memory-canvas';
    const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').toLowerCase();

    return new NextResponse(Buffer.from(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${safeName}-${canvasId.slice(0, 8)}.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[CANVAS EXPORT] FAILED:', err);
    return NextResponse.json({ error: err?.message || 'PNG export failed' }, { status: 500 });
  } finally {
    if (browser) {
      try {
        if (isVercel) await browser.disconnect();
        else await browser.close();
      } catch (e) {
        console.error('[CANVAS EXPORT] cleanup error:', e);
      }
    }
  }
}