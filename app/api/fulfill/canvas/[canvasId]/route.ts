import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  const { canvasId } = await params;

  const authHeader = request.headers.get('x-fulfill-secret') || '';
  if (authHeader !== process.env.FULFILL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId = body?.order_id;

  if (!canvasId || !orderId) {
    return NextResponse.json({ error: 'Missing canvasId or order_id' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let browser;
  const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  try {
    // ── 1. Fetch canvas data ──
    const { data: canvas, error: canvasError } = await supabase
      .from('memory_canvases')
      .select('title, export_width_px, export_height_px, prodigi_sku, wrap_type')
      .eq('id', canvasId)
      .single();

    if (canvasError || !canvas) {
      throw new Error('Canvas not found: ' + (canvasError?.message ?? ''));
    }

    // ── 2. Fetch order ──
    const { data: order, error: orderError } = await supabase
      .from('canvas_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found: ' + (orderError?.message ?? ''));
    }

    if (!order.shipping_line1 || !order.shipping_city || !order.shipping_country) {
      await supabase.from('canvas_orders').update({ status: 'error', prodigi_status: 'error' }).eq('id', orderId);
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 });
    }

    // ── 3. Update order status ──
    await supabase.from('canvas_orders').update({ status: 'generating_image' }).eq('id', orderId);

    // ── 4. Generate PNG with Puppeteer ──
    const exportW = canvas.export_width_px;
    const exportH = canvas.export_height_px;
    const MAX_VP = 4000;
    const dpr = Math.max(1, Math.ceil(Math.max(exportW, exportH) / MAX_VP));
    const vpW = Math.ceil(exportW / dpr);
    const vpH = Math.ceil(exportH / dpr);

    const exportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ancestorii.com'}/export/canvas/${canvasId}`;

    console.log('[CANVAS FULFILL] connecting to browser');
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

    page.setDefaultTimeout(90_000);
    await page.setViewport({ width: vpW, height: vpH, deviceScaleFactor: dpr });

    console.log(`[CANVAS FULFILL] navigating, viewport ${vpW}×${vpH} @ ${dpr}x`);
    await page.goto(exportUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"]') !== null,
      { timeout: 60_000 }
    );

    await new Promise((r) => setTimeout(r, 1500));

    console.log('[CANVAS FULFILL] taking screenshot');
    const pngBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: vpW, height: vpH },
      omitBackground: false,
    });
    console.log('[CANVAS FULFILL] screenshot complete, size:', pngBuffer.length);

    // ── 5. Close browser ──
    if (isVercel) await browser.disconnect();
    else await browser.close();
    browser = null;

    // ── 6. Upload PNG to Supabase Storage ──
    const pngPath = `canvas-exports/${canvasId}/${orderId}.png`;

    const { error: uploadError } = await supabase.storage
      .from('library-media')
      .upload(pngPath, Buffer.from(pngBuffer), {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) throw new Error('PNG upload failed: ' + uploadError.message);

    const { data: signedData, error: signedError } = await supabase.storage
      .from('library-media')
      .createSignedUrl(pngPath, 60 * 60 * 24 * 7);

    if (signedError || !signedData?.signedUrl) {
      throw new Error('Failed to create signed URL for PNG');
    }

    const pngUrl = signedData.signedUrl;

    // ── 7. Submit to Prodigi ──
    await supabase
      .from('canvas_orders')
      .update({ status: 'submitting', image_storage_path: pngPath, image_url: pngUrl })
      .eq('id', orderId);

    const prodigiResponse = await fetch('https://api.prodigi.com/v4.0/Orders', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PRODIGI_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shippingMethod: 'Standard',
        idempotencyKey: `ancestorii-canvas-${orderId}`,
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
            stateOrCounty: order.shipping_state || order.shipping_city || 'N/A',
          },
        },
        items: [
          {
            merchantReference: canvasId,
            sku: canvas.prodigi_sku,
            copies: 1,
            sizing: 'fillPrintArea',
            attributes: {
              wrap: canvas.wrap_type || 'imagewrap',
            },
            assets: [
              {
                printArea: 'default',
                url: pngUrl,
              },
            ],
          },
        ],
      }),
    });

    const prodigiData = await prodigiResponse.json();

    if (!prodigiResponse.ok) {
      console.error('[CANVAS FULFILL] PRODIGI ERROR:', JSON.stringify(prodigiData));
      await supabase.from('canvas_orders').update({ status: 'error', prodigi_status: 'error' }).eq('id', orderId);
      return NextResponse.json({ error: 'Prodigi submission failed', details: prodigiData }, { status: 500 });
    }

    // ── 8. Update order + canvas with Prodigi details ──
    const prodigiOrderId = prodigiData?.order?.id ?? null;

    await supabase
      .from('canvas_orders')
      .update({
        prodigi_order_id: prodigiOrderId,
        status: 'printing',
        prodigi_status: prodigiData?.order?.status?.stage ?? 'submitted',
      })
      .eq('id', orderId);

    await supabase
      .from('memory_canvases')
      .update({
        image_file_path: pngPath,
        image_status: 'ready',
        image_generated_at: new Date().toISOString(),
        prodigi_order_id: prodigiOrderId,
        prodigi_status: prodigiData?.order?.status?.stage ?? 'submitted',
      })
      .eq('id', canvasId);

    return NextResponse.json({ success: true, prodigi_order_id: prodigiOrderId });
  } catch (err: any) {
    console.error('[CANVAS FULFILL] ERROR:', err);
    await supabase.from('canvas_orders').update({ status: 'error' }).eq('id', orderId);
    return NextResponse.json({ error: err?.message || 'Fulfillment failed' }, { status: 500 });
  } finally {
    if (browser) {
      try {
        if (isVercel) await browser.disconnect();
        else await browser.close();
      } catch (e) {
        console.error('[CANVAS FULFILL] cleanup error:', e);
      }
    }
  }
}