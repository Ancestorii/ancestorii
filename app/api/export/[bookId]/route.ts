import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  if (!bookId) {
    return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  }

  // ── Build the export page URL ──
  const exportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ancestorii.com'}/export/${bookId}`;

  // ── Forward auth cookies so server component can query Supabase ──
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader
    .split(';')
    .map((c) => {
      const [name, ...rest] = c.trim().split('=');
      return {
        name: name?.trim(),
        value: rest.join('=')?.trim(),
        domain: 'www.ancestorii.com',
        path: '/',
      };
    })
    .filter((c) => c.name && c.value);

  let browser;
  const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  try {
    console.log('[EXPORT] connecting to browser');
    if (isVercel) {
      const browserlessToken = process.env.BROWSERLESS_TOKEN;
      if (!browserlessToken) {
        throw new Error('BROWSERLESS_TOKEN environment variable not set');
      }
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
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ],
        defaultViewport: null,
        executablePath,
        headless: true,
      });
    }
    console.log('[EXPORT] browser connected');

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('googletagmanager.com') ||
        url.includes('google-analytics.com') ||
        url.includes('googleadservices.com') ||
        url.includes('google.com/ccm') ||
        url.includes('google.com/pagead') ||
        url.includes('google.com/rmkt') ||
        url.includes('redditstatic.com') ||
        url.includes('reddit.com') ||
        url.includes('connect.facebook.net') ||
        url.includes('facebook.com') ||
        url.includes('byspotify.com')
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // ── Set auth cookies before navigation ──
    if (cookies.length) {
      await page.setCookie(...cookies);
    }

    // ── Viewport: A4 landscape at 96 DPI (CSS pixels) ──
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });

    // ── Navigate to export page ──
    console.log('[EXPORT] navigating to', exportUrl);
    await page.goto(exportUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    console.log('[EXPORT] page loaded');

    // ── Wait for all images to load ──
    console.log('[EXPORT] waiting for data-export-ready signal');
    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"]') !== null,
      { timeout: 60_000 }
    );
    console.log('[EXPORT] export ready signal received');

    // ── Extra buffer for font rendering + final paints ──
    await new Promise((r) => setTimeout(r, 1500));

    // ── Generate PDF ──
    console.log('[EXPORT] starting page.pdf()');
    const pdfBuffer = await page.pdf({
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
      timeout: 90_000,
    });
    console.log('[EXPORT] page.pdf() complete, buffer size:', pdfBuffer.length);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="memory-book-${bookId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[EXPORT] PDF EXPORT FAILED:', err);

    return NextResponse.json(
      { error: err?.message || 'PDF generation failed' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        if (isVercel) {
          await browser.disconnect();
        } else {
          await browser.close();
        }
      } catch (cleanupErr) {
        console.error('[EXPORT] browser cleanup error:', cleanupErr);
      }
    }
  }
}