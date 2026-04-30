import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  // ── Auth: shared secret ──
  const authHeader = request.headers.get('x-fulfill-secret') || '';
  if (authHeader !== process.env.FULFILL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId = body?.order_id;

  if (!bookId || !orderId) {
    return NextResponse.json({ error: 'Missing bookId or order_id' }, { status: 400 });
  }

  // ── Supabase service client ──
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let browser;
  const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  try {
    // ── 1. Fetch book data (for page count + spine) ──
    const { data: book, error: bookError } = await supabase
      .from('memory_books')
      .select('total_page_limit, spine_text, spine_bg_colour, spine_text_colour')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      throw new Error('Book not found: ' + (bookError?.message ?? ''));
    }

    // ── 2. Update order status ──
    await supabase
      .from('orders')
      .update({ status: 'generating_pdf' })
      .eq('id', orderId);

    // ── 3. Generate PDF with Puppeteer ──
    const exportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ancestorii.com'}/export/${bookId}`;

    console.log('[FULFILL] connecting to browser');
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
    console.log('[FULFILL] browser connected');

    browser.on('disconnected', () => {
      console.log('[BROWSER DISCONNECTED] at', new Date().toISOString());
    });
    
    const browserProcess = browser.process();
    if (browserProcess) {
      browserProcess.on('exit', (code, signal) => {
        console.log('[CHROMIUM PROCESS EXIT] code:', code, 'signal:', signal);
      });
    }

    const page = await browser.newPage();
    console.log('[FULFILL] new page created');

    page.on('console', (msg) => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('[BROWSER PAGEERROR]', (err as Error)?.message ?? String(err)));
    page.on('requestfailed', (req) => console.log('[BROWSER REQUESTFAILED]', req.url(), req.failure()?.errorText));
    page.on('response', (res) => {
      if (res.status() >= 400) {
        console.log('[BROWSER BAD RESPONSE]', res.status(), res.url());
      }
    });
    page.on('crash', () => console.log('[PAGE CRASH] page crashed at', new Date().toISOString()));
    page.on('close', () => console.log('[PAGE CLOSE] page closed at', new Date().toISOString()));
    page.on('error', (err) => console.log('[PAGE ERROR]', (err as Error)?.message ?? String(err)));
    
    const cdpClient = await page.createCDPSession();
    await cdpClient.send('Performance.enable');
    
    cdpClient.on('Inspector.targetCrashed', () => {
      console.log('[CDP TARGET CRASHED] at', new Date().toISOString());
    });

    page.setDefaultTimeout(90_000);
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });

    console.log('[FULFILL] navigating to', exportUrl);
    await page.goto(exportUrl, {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    });
    const pageContent = await page.content();
    console.log('[FULFILL] page loaded, html length:', pageContent.length);

    console.log('[FULFILL] waiting for data-export-ready signal');
    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"]') !== null,
      { timeout: 60_000 }
    );
    console.log('[FULFILL] export ready signal received');

    await new Promise((r) => setTimeout(r, 1500));

    console.log('[FULFILL] starting page.pdf() at', new Date().toISOString());
    
    const memInterval = setInterval(async () => {
      const mem = process.memoryUsage();
      let pageMetrics: any = null;
      try {
        pageMetrics = await page.metrics();
      } catch {
        pageMetrics = { error: 'metrics unavailable' };
      }
      console.log('[MEM]', JSON.stringify({
        ts: new Date().toISOString(),
        rss_mb: Math.round(mem.rss / 1024 / 1024),
        heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
        external_mb: Math.round(mem.external / 1024 / 1024),
        page_jsHeapUsed_mb: pageMetrics?.JSHeapUsedSize ? Math.round(pageMetrics.JSHeapUsedSize / 1024 / 1024) : null,
        page_jsHeapTotal_mb: pageMetrics?.JSHeapTotalSize ? Math.round(pageMetrics.JSHeapTotalSize / 1024 / 1024) : null,
        page_documents: pageMetrics?.Documents ?? null,
        page_nodes: pageMetrics?.Nodes ?? null,
        page_layoutCount: pageMetrics?.LayoutCount ?? null,
      }));
    }, 5_000);
    
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
  width: '297mm',
  height: '210mm',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  preferCSSPageSize: true,
  timeout: 90_000,
});
    } finally {
      clearInterval(memInterval);
    }
    console.log('[FULFILL] page.pdf() complete, buffer size:', pdfBuffer.length);

    // ── 4. Get order details (need shipping_country for spine dimensions) ──
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found: ' + (orderError?.message ?? ''));
    }

    // ── Guard: don't submit with incomplete address ──
    if (!order.shipping_line1 || !order.shipping_city || !order.shipping_country) {
      await supabase
        .from('orders')
        .update({ status: 'error', prodigi_status: 'error' })
        .eq('id', orderId);

      return NextResponse.json(
        { error: 'Incomplete shipping address — cannot submit to Prodigi' },
        { status: 400 }
      );
    }

    // ── 5. Generate spine image ──
    let spineUrl: string | null = null;

    try {
      // 5a. Query Prodigi for exact spine dimensions
      const spineInfoRes = await fetch(
  'https://api.prodigi.com/v4.0/products/spine',
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.PRODIGI_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
  sku: 'BOOK-FE-A4-L-HARD-G',
  destinationCountryCode: order.shipping_country || 'GB',
  state: order.shipping_state || undefined,
  numberOfPages: book.total_page_limit,
}),
  }
);

      if (!spineInfoRes.ok) {
        throw new Error(`Spine dimensions query failed: ${spineInfoRes.status}`);
      }

      const spineInfo = await spineInfoRes.json();

      // Prodigi returns { spineInfo: { widthMm: number } }
// Convert mm to pixels at 300 DPI for print
const spineWidthMm = spineInfo?.spineInfo?.widthMm ?? 10;
const spineWidthPx = Math.round(spineWidthMm * (300 / 25.4));
const spineHeightPx = 3508; // A4 long edge at 300 DPI (297mm)

const spineWidth = spineWidthPx;
const spineHeight = spineHeightPx;

      console.log('SPINE DIMENSIONS:', JSON.stringify(spineInfo));
      console.log(`SPINE SIZE: ${spineWidth} x ${spineHeight}`);

      // 5b. Render spine image with Puppeteer (browser is still open)
      const spineText = book.spine_text || '';
      const spineBg = book.spine_bg_colour || '#0f2040';
      const spineTextColour = book.spine_text_colour || '#d4af37';

      const spinePage = await browser.newPage();
      spinePage.setDefaultTimeout(60_000);
      await spinePage.setViewport({
        width: spineWidth,
        height: spineHeight,
        deviceScaleFactor: 1,
      });

      const spineHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: ${spineWidth}px;
              height: ${spineHeight}px;
              overflow: hidden;
              background: ${spineBg};
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .spine-text {
              writing-mode: vertical-rl;
              text-orientation: mixed;
              transform: rotate(180deg);
              font-family: 'Georgia', 'Times New Roman', serif;
              font-size: ${Math.max(10, Math.floor(spineWidth * 0.45))}px;
              font-weight: 600;
              letter-spacing: 0.08em;
              color: ${spineTextColour};
              text-align: center;
              max-height: ${Math.floor(spineHeight * 0.85)}px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          </style>
        </head>
        <body>
          <div class="spine-text">${spineText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </body>
        </html>
      `;

      await spinePage.setContent(spineHtml, {
        waitUntil: 'networkidle0',
        timeout: 60_000,
      });
      await new Promise((r) => setTimeout(r, 300));

      const spineBuffer = await spinePage.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: spineWidth, height: spineHeight },
      });

      await spinePage.close();

      // 5c. Upload spine image to Supabase storage
      const spinePath = `book-pdfs/${bookId}/${orderId}-spine.png`;

      const { error: spineUploadError } = await supabase.storage
        .from('library-media')
        .upload(spinePath, Buffer.from(spineBuffer), {
          contentType: 'image/png',
          upsert: true,
        });

      if (spineUploadError) {
        throw new Error('Spine upload failed: ' + spineUploadError.message);
      }

      // 5d. Get signed URL for spine (14 days)
      const { data: spineSignedData, error: spineSignedError } = await supabase.storage
        .from('library-media')
        .createSignedUrl(spinePath, 60 * 60 * 24 * 14);

      if (spineSignedError || !spineSignedData?.signedUrl) {
        throw new Error('Failed to create signed URL for spine');
      }

      spineUrl = spineSignedData.signedUrl;

      console.log('SPINE GENERATED AND UPLOADED:', spinePath);
    } catch (spineErr: any) {
      // Spine failed — log it but don't block the order
      // Prodigi will use a blank spine if we don't provide one
      console.error('SPINE GENERATION FAILED (order will proceed without spine):', spineErr?.message);
    }

    // ── 6. Close/disconnect browser (done with all rendering) ──
    if (isVercel) {
      await browser.disconnect();
    } else {
      await browser.close();
    }
    browser = null;

    // ── 7. Upload PDF to Supabase Storage ──
    const pdfPath = `book-pdfs/${bookId}/${orderId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('library-media')
      .upload(pdfPath, Buffer.from(pdfBuffer), {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) throw new Error('PDF upload failed: ' + uploadError.message);

    // Get a long-lived signed URL for Prodigi (7 days)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('library-media')
      .createSignedUrl(pdfPath, 60 * 60 * 24 * 7);

    if (signedError || !signedData?.signedUrl) {
      throw new Error('Failed to create signed URL for PDF');
    }

    const pdfUrl = signedData.signedUrl;

    // ── 8. Submit to Prodigi ──
    await supabase
      .from('orders')
      .update({ status: 'submitting', pdf_storage_path: pdfPath, pdf_url: pdfUrl })
      .eq('id', orderId);

    // Build assets array — always include default, add spine if generated
    const prodigiAssets: any[] = [
      {
        printArea: 'default',
        url: pdfUrl,
        pageCount: book.total_page_limit,
      },
    ];

    if (spineUrl) {
      prodigiAssets.push({
        printArea: 'spine',
        url: spineUrl,
      });
    }

    const prodigiResponse = await fetch('https://api.prodigi.com/v4.0/Orders', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PRODIGI_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shippingMethod: 'Standard',
        idempotencyKey: `ancestorii-${orderId}`,
        merchantReference: orderId,
        recipient: {
          name: order.shipping_name || 'Customer',
          email: order.shipping_email || undefined,
          phone: order.shipping_phone || undefined,
          address: {
            line1: order.shipping_line1 || '',
            line2: order.shipping_line2 || undefined,
            postalOrZipCode: order.shipping_postal || '',
            countryCode: order.shipping_country || 'GB',
            townOrCity: order.shipping_city || '',
            stateOrCounty: order.shipping_state || '',
          },
        },
        items: [
          {
            merchantReference: bookId,
            sku: 'BOOK-FE-A4-L-HARD-G',
            copies: 1,
            sizing: 'fillPrintArea',
            assets: prodigiAssets,
          },
        ],
      }),
    });

    const prodigiData = await prodigiResponse.json();

    if (!prodigiResponse.ok) {
      console.error('PRODIGI ERROR:', JSON.stringify(prodigiData));

      await supabase
        .from('orders')
        .update({
          status: 'error',
          prodigi_status: 'error',
        })
        .eq('id', orderId);

      return NextResponse.json(
        { error: 'Prodigi submission failed', details: prodigiData },
        { status: 500 }
      );
    }

    // ── 9. Update order with Prodigi details ──
    const prodigiOrderId = prodigiData?.order?.id ?? null;

    await supabase
      .from('orders')
      .update({
        status: 'printing',
        prodigi_order_id: prodigiOrderId,
        prodigi_status: prodigiData?.order?.status?.stage ?? 'submitted',
      })
      .eq('id', orderId);

    // Also update the memory_books table
    await supabase
      .from('memory_books')
      .update({
        pdf_file_path: pdfPath,
        pdf_status: 'ready',
        pdf_generated_at: new Date().toISOString(),
        prodigi_order_id: prodigiOrderId,
        prodigi_status: prodigiData?.order?.status?.stage ?? 'submitted',
      })
      .eq('id', bookId);

    return NextResponse.json({
      success: true,
      prodigi_order_id: prodigiOrderId,
    });
  } catch (err: any) {
    console.error('FULFILL ERROR:', err);
    console.error('FULFILL ERROR DETAILS:', JSON.stringify({
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.split('\n').slice(0, 10).join(' | '),
      code: err?.code,
    }));

    await supabase
      .from('orders')
      .update({ status: 'error' })
      .eq('id', orderId);

    return NextResponse.json(
      { error: err?.message || 'Fulfillment failed' },
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
        console.error('[FULFILL] browser cleanup error:', cleanupErr);
      }
    }
  }
}