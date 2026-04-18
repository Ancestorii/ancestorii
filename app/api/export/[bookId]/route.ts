import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  const exportUrl = `${protocol}://${host}/export/${bookId}`;

  // ── Forward auth cookies so server component can query Supabase ──
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader
    .split(';')
    .map((c) => {
      const [name, ...rest] = c.trim().split('=');
      return {
        name: name?.trim(),
        value: rest.join('=')?.trim(),
        domain: host.split(':')[0],
        path: '/',
      };
    })
    .filter((c) => c.name && c.value);

  let browser;

  try {
    // ── Detect environment ──
    const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    const executablePath = isVercel
      ? await chromium.executablePath()
      : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';

    browser = await puppeteer.launch({
      args: isVercel
        ? chromium.args
        : [
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

    const page = await browser.newPage();

    // ── Set auth cookies before navigation ──
    if (cookies.length) {
      await page.setCookie(...cookies);
    }

    // ── Viewport: A4 landscape at 96 DPI (CSS pixels) ──
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });

    // ── Navigate to export page ──
    await page.goto(exportUrl, {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    });

    // ── Wait for all images to load ──
    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"]') !== null,
      { timeout: 60_000 }
    );

    // ── Extra buffer for font rendering + final paints ──
    await new Promise((r) => setTimeout(r, 1500));

    // ── Generate PDF ──
    const pdfBuffer = await page.pdf({
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="memory-book-${bookId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('PDF EXPORT FAILED:', err);

    return NextResponse.json(
      { error: err?.message || 'PDF generation failed' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}