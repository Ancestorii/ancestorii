import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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

  try {
    // ── 1. Update order status ──
    await supabase
      .from('orders')
      .update({ status: 'generating_pdf' })
      .eq('id', orderId);

    // ── 2. Generate PDF with Puppeteer ──
    const exportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ancestorii.com'}/export/${bookId}`;

    const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    const executablePath = isVercel
      ? await chromium.executablePath('https://github.com/nicholidev/chromium-for-lambda/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
      : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';

    browser = await puppeteer.launch({
      args: isVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--font-render-hinting=none'],
      defaultViewport: null,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });

    await page.goto(exportUrl, {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    });

    await page.waitForFunction(
      () => document.querySelector('[data-export-ready="true"]') !== null,
      { timeout: 60_000 }
    );

    await new Promise((r) => setTimeout(r, 1500));

    const pdfBuffer = await page.pdf({
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    // ── 3. Upload PDF to Supabase Storage ──
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

    // ── 4. Get order details (shipping address) ──
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found: ' + (orderError?.message ?? ''));
    }

    // ── 5. Submit to Prodigi ──
    await supabase
      .from('orders')
      .update({ status: 'submitting', pdf_storage_path: pdfPath, pdf_url: pdfUrl })
      .eq('id', orderId);

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
          address: {
            line1: order.shipping_line1 || '',
            line2: order.shipping_line2 || '',
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
            assets: [
              {
                printArea: 'default',
                url: pdfUrl,
              },
            ],
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

    // ── 6. Update order with Prodigi details ──
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
      await browser.close();
    }
  }
}