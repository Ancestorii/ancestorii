import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { getServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// The same budget as the fulfil route, which draws the identical PDF: a 48-page book with
// full-size photos can take longer than two minutes, and a function killed mid-render hands
// the browser a dropped connection instead of an error.
export const maxDuration = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  if (!bookId) {
    return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  }

  // ── Who may download: a signed-in member of the book's family ──
  // The route used to serve any book to anyone who knew its id. The cookie-bound client sees
  // the book through row security (family_select), so a book outside the family reads as
  // missing. getUser verifies the token with the auth server (this is server code).
  const authClient = await getServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Please sign in to download this book.' }, { status: 401 });
  }

  const { data: visibleBook, error: visibleError } = await authClient
    .from('memory_books')
    .select('id')
    .eq('id', bookId)
    .maybeSingle();

  if (visibleError) {
    return NextResponse.json({ error: visibleError.message }, { status: 500 });
  }
  if (!visibleBook) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  // ── Build the export page URL ──
  // The export page reads with the service role, so the user's session cookies are NOT
  // forwarded to the (third-party) browser any more: it never needed them.
  const exportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ancestorii.com'}/export/book/${bookId}`;

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

    // ── Viewport: A4 landscape at 96 DPI (CSS pixels) ──
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });

    // ── Navigate to export page ──
    console.log('[EXPORT] navigating to', exportUrl);
    await page.goto(exportUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    console.log('[EXPORT] page loaded');

    // ── Wait for all images to load (or for the page to report an error) ──
    console.log('[EXPORT] waiting for data-export-ready signal');
    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"], [data-export-error]') !== null,
      { timeout: 60_000 }
    );

    const exportError = await page.evaluate(
      () => document.querySelector('[data-export-error]')?.getAttribute('data-export-error') ?? null
    );
    if (exportError) {
      throw new Error(`Export page error: ${exportError}`);
    }
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
