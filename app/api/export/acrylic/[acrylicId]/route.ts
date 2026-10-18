import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';
import { getServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ acrylicId: string }> }
) {
  const { acrylicId } = await params;

  if (!acrylicId) {
    return NextResponse.json({ error: 'Missing acrylicId' }, { status: 400 });
  }

  // Only a signed-in member of the print's family may download it. The cookie-bound client
  // verifies the user (getUser checks the token with the auth server, which is right for a
  // route handler) and asks for the print under row security; the service role below is used
  // only after that for the export dimensions. The route used to answer anyone who knew the id.
  const authed = await getServerClient();
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: visible } = await authed
    .from('acrylic_prints')
    .select('id')
    .eq('id', acrylicId)
    .maybeSingle();
  if (!visible) {
    return NextResponse.json({ error: 'Acrylic print not found' }, { status: 404 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: acrylic, error: acrylicError } = await supabase
    .from('acrylic_prints')
    .select('title, export_width_px, export_height_px')
    .eq('id', acrylicId)
    .maybeSingle();

  if (acrylicError || !acrylic) {
    return NextResponse.json({ error: 'Acrylic print not found' }, { status: 404 });
  }

  const exportW = acrylic.export_width_px;
  const exportH = acrylic.export_height_px;
  const MAX_VP = 4000;
  const dpr = Math.max(1, Math.ceil(Math.max(exportW, exportH) / MAX_VP));
  const vpW = Math.ceil(exportW / dpr);
  const vpH = Math.ceil(exportH / dpr);

  const exportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ancestorii.com'}/export/acrylic/${acrylicId}`;

  // The export page reads with the service role, so the caller's session cookies are not
  // forwarded to the (third-party) print browser: it never needed them.
  let browser;
  const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  try {
    console.log('[ACRYLIC EXPORT] connecting to browser');
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

    await page.setViewport({ width: vpW, height: vpH, deviceScaleFactor: dpr });

    console.log(`[ACRYLIC EXPORT] navigating, viewport ${vpW}×${vpH} @ ${dpr}x`);
    await page.goto(exportUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"]') !== null,
      { timeout: 60_000 }
    );

    await new Promise((r) => setTimeout(r, 1500));

    const pngBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: vpW, height: vpH },
      omitBackground: false,
    });

    const title = acrylic.title || 'acrylic-print';
    const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').toLowerCase();

    return new NextResponse(Buffer.from(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${safeName}-${acrylicId.slice(0, 8)}.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[ACRYLIC EXPORT] FAILED:', err);
    return NextResponse.json({ error: err?.message || 'PNG export failed' }, { status: 500 });
  } finally {
    if (browser) {
      try {
        if (isVercel) await browser.disconnect();
        else await browser.close();
      } catch (e) {
        console.error('[ACRYLIC EXPORT] cleanup error:', e);
      }
    }
  }
}