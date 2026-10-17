import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
import { esc, firstName, FROM_DANTE, p, send, SITE_URL, wrap, type Letter } from "../_shared/email.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Email helper (every letter is drawn in the shared shell, _shared/letter.ts) ──
async function sendEmail(to: string, letter: Letter, idempotencyKey: string) {
  if (!to) return;
  const result = await send({ to, from: FROM_DANTE, letter, idempotencyKey, tag: 'shipped' });
  if (!result.ok) console.error(`Resend refused (${result.status}): ${result.message}`);
  else console.log(`Email sent to ${to}: ${letter.subject}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const payload = await req.json();
    console.log("PRODIGI PAYLOAD:", JSON.stringify(payload));

    const eventType = payload?.type;
    const prodigiOrder = payload?.data?.order;
    const prodigiOrderId = prodigiOrder?.id;

    if (!prodigiOrderId) {
      return new Response("No order ID in payload", { status: 200 });
    }

    console.log(`Prodigi webhook: ${eventType} for order ${prodigiOrderId}`);

    const stage = prodigiOrder?.status?.stage ?? "";
    const shipments = prodigiOrder?.shipments ?? [];
    const hasShipped = shipments.length > 0;

    let orderStatus = "printing";
    let prodigiStatus = stage;
    let trackingUrl: string | null = null;
    let shippedAt: string | null = null;

    // ── Original stage-based detection (primary path) ──
    if (stage === "Complete" && hasShipped) {
      orderStatus = "shipped";
      prodigiStatus = "shipped";
      shippedAt = new Date().toISOString();
      trackingUrl = shipments[0]?.tracking?.url ?? null;
    } else if (stage === "Complete" && !hasShipped) {
      orderStatus = "printing";
      prodigiStatus = "complete";
    } else if (stage === "Shipped") {
      orderStatus = "shipped";
      prodigiStatus = "shipped";
      shippedAt = new Date().toISOString();

      if (hasShipped) {
        trackingUrl = shipments[0]?.tracking?.url ?? null;
      }
    } else if (stage === "InProgress") {
      orderStatus = "printing";
      prodigiStatus = "printing";
    } else if (stage === "Cancelled") {
      orderStatus = "cancelled";
      prodigiStatus = "cancelled";
    }

    // ── Backup detection: shipments array populated but stage didn't say "Shipped" ──
   if (
      hasShipped &&
      stage !== "InProgress" &&
      orderStatus !== "shipped" &&
      orderStatus !== "delivered" &&
      orderStatus !== "cancelled"
    ) {
      orderStatus = "shipped";
      prodigiStatus = "shipped";
      shippedAt = new Date().toISOString();
      trackingUrl = shipments[0]?.tracking?.url ?? null;
      console.log(`Shipped detected via shipments array (stage was: ${stage})`);
    }

    // ── Find the order (primary: prodigi_order_id, fallback: merchantReference) ──
    const merchantRef = prodigiOrder?.merchantReference;

    let { data: priorOrder } = await supabase
      .from("orders")
      .select("id, shipped_at, prodigi_order_id")
      .eq("prodigi_order_id", prodigiOrderId)
      .single();

    if (!priorOrder && merchantRef) {
      const { data: fallbackOrder } = await supabase
        .from("orders")
        .select("id, shipped_at, prodigi_order_id")
        .eq("id", merchantRef)
        .single();

      if (fallbackOrder) {
        priorOrder = fallbackOrder;
        console.log(`Order found via merchantReference fallback: ${merchantRef}`);

        await supabase
          .from("orders")
          .update({ prodigi_order_id: prodigiOrderId })
          .eq("id", merchantRef);
      }
    }

    // ══════════════════════════════════════════════════════
    // If not found in book orders, try canvas and acrylic
    // ══════════════════════════════════════════════════════
    if (!priorOrder) {
      const handled = await handleCanvasOrAcrylicOrder(
        supabase, prodigiOrderId, merchantRef,
        orderStatus, prodigiStatus, trackingUrl, shippedAt
      );

      if (handled) {
        return new Response("OK", { status: 200 });
      }

      console.error(`Order not found: prodigi=${prodigiOrderId}, merchant=${merchantRef}`);
      return new Response("Order not found", { status: 200 });
    }

    // ══════════════════════════════════════════════════════
    // EXISTING BOOK ORDER PROCESSING, UNTOUCHED BELOW
    // ══════════════════════════════════════════════════════

    const internalOrderId = priorOrder.id;
    const wasAlreadyShipped = !!priorOrder?.shipped_at;

    // Update orders table
    const updateData: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
      status: orderStatus,
    };

    if (trackingUrl) {
      updateData.prodigi_tracking_url = trackingUrl;
    }

    // Only set shipped_at the first time, never overwrite
    if (shippedAt && !wasAlreadyShipped) {
      updateData.shipped_at = shippedAt;
    }

    await supabase
      .from("orders")
      .update(updateData)
      .eq("id", internalOrderId);

    // Also update memory_books
    const memoryBookUpdate: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
    };

    if (trackingUrl) {
      memoryBookUpdate.tracking_url = trackingUrl;
    }

    const { data: orderForBook } = await supabase
      .from("orders")
      .select("book_id")
      .eq("id", internalOrderId)
      .single();

    if (orderForBook?.book_id) {
      await supabase
        .from("memory_books")
        .update({ ...memoryBookUpdate, prodigi_order_id: prodigiOrderId })
        .eq("id", orderForBook.book_id);
    }

    // ── Send customer email ──
    if (orderStatus === "shipped") {
      // Fetch order to get customer email, book title, and check if already emailed
      const { data: order } = await supabase
        .from("orders")
        .select("shipping_email, shipping_name, book_id, shipped_at, shipping_method")
        .eq("id", internalOrderId)
        .single();

      const { data: book } = await supabase
        .from("memory_books")
        .select("title")
        .eq("id", order?.book_id)
        .single();

      const customerEmail = order?.shipping_email;
      const customerName = order?.shipping_name || "there";
      const bookTitle = book?.title || "your Memory Book";

      if (customerEmail && orderStatus === "shipped" && !wasAlreadyShipped) {
        await sendEmail(
          customerEmail,
          shippedLetter(customerName, bookTitle, "Memory Book", trackingUrl, order?.shipping_method),
          `shipped-book-${internalOrderId}`
        );
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Prodigi webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});

// ══════════════════════════════════════════════════════════
// Canvas + Acrylic order handler
// Called ONLY when the order was NOT found in the book
// orders table. Returns true if handled, false if not found.
// ══════════════════════════════════════════════════════════
async function handleCanvasOrAcrylicOrder(
  supabase: any,
  prodigiOrderId: string,
  merchantRef: string | undefined,
  orderStatus: string,
  prodigiStatus: string,
  trackingUrl: string | null,
  shippedAt: string | null
): Promise<boolean> {

  // ── Try canvas_orders ──
  let canvasOrder: any = null;

  const { data: canvasByProdigi } = await supabase
    .from("canvas_orders")
    .select("id, shipped_at, prodigi_order_id, canvas_id, shipping_email, shipping_name, shipping_method")
    .eq("prodigi_order_id", prodigiOrderId)
    .single();

  if (canvasByProdigi) {
    canvasOrder = canvasByProdigi;
  } else if (merchantRef) {
    const { data: canvasByMerchant } = await supabase
      .from("canvas_orders")
      .select("id, shipped_at, prodigi_order_id, canvas_id, shipping_email, shipping_name, shipping_method")
    .eq("id", merchantRef)
      .single();

    if (canvasByMerchant) {
      canvasOrder = canvasByMerchant;
      console.log(`Canvas order found via merchantReference fallback: ${merchantRef}`);
      await supabase.from("canvas_orders").update({ prodigi_order_id: prodigiOrderId }).eq("id", merchantRef);
    }
  }

  if (canvasOrder) {
    const wasAlreadyShipped = !!canvasOrder.shipped_at;

    const updateData: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
      status: orderStatus,
    };
    if (trackingUrl) updateData.prodigi_tracking_url = trackingUrl;
    if (shippedAt && !wasAlreadyShipped) updateData.shipped_at = shippedAt;

    await supabase.from("canvas_orders").update(updateData).eq("id", canvasOrder.id);

    const canvasUpdate: Record<string, unknown> = { prodigi_status: prodigiStatus };
    if (trackingUrl) canvasUpdate.tracking_url = trackingUrl;

    await supabase
      .from("memory_canvases")
      .update({ ...canvasUpdate, prodigi_order_id: prodigiOrderId })
      .eq("id", canvasOrder.canvas_id);

    // Send shipped email
    if (orderStatus === "shipped" && !wasAlreadyShipped && canvasOrder.shipping_email) {
      const { data: canvas } = await supabase
        .from("memory_canvases")
        .select("title")
        .eq("id", canvasOrder.canvas_id)
        .single();

      const customerName = canvasOrder.shipping_name || "there";
      const canvasTitle = canvas?.title || "your Memory Canvas";

      await sendEmail(
        canvasOrder.shipping_email,
        shippedLetter(customerName, canvasTitle, "Memory Canvas", trackingUrl, canvasOrder.shipping_method),
        `shipped-canvas-${canvasOrder.id}`
      );
    }

    console.log(`Canvas order updated: ${canvasOrder.id}`);
    return true;
  }

  // ── Try acrylic_orders ──
  let acrylicOrder: any = null;

  const { data: acrylicByProdigi } = await supabase
    .from("acrylic_orders")
    .select("id, shipped_at, prodigi_order_id, acrylic_id, shipping_email, shipping_name, shipping_method")
    .eq("prodigi_order_id", prodigiOrderId)
    .single();

  if (acrylicByProdigi) {
    acrylicOrder = acrylicByProdigi;
  } else if (merchantRef) {
    const { data: acrylicByMerchant } = await supabase
      .from("acrylic_orders")
      .select("id, shipped_at, prodigi_order_id, acrylic_id, shipping_email, shipping_name, shipping_method")
      .eq("id", merchantRef)
      .single();

    if (acrylicByMerchant) {
      acrylicOrder = acrylicByMerchant;
      console.log(`Acrylic order found via merchantReference fallback: ${merchantRef}`);
      await supabase.from("acrylic_orders").update({ prodigi_order_id: prodigiOrderId }).eq("id", merchantRef);
    }
  }

  if (acrylicOrder) {
    const wasAlreadyShipped = !!acrylicOrder.shipped_at;

    const updateData: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
      status: orderStatus,
    };
    if (trackingUrl) updateData.prodigi_tracking_url = trackingUrl;
    if (shippedAt && !wasAlreadyShipped) updateData.shipped_at = shippedAt;

    await supabase.from("acrylic_orders").update(updateData).eq("id", acrylicOrder.id);

    const acrylicUpdate: Record<string, unknown> = { prodigi_status: prodigiStatus };
    if (trackingUrl) acrylicUpdate.tracking_url = trackingUrl;

    await supabase
      .from("acrylic_prints")
      .update({ ...acrylicUpdate, prodigi_order_id: prodigiOrderId })
      .eq("id", acrylicOrder.acrylic_id);

    // Send shipped email
    if (orderStatus === "shipped" && !wasAlreadyShipped && acrylicOrder.shipping_email) {
      const { data: acrylic } = await supabase
        .from("acrylic_prints")
        .select("title")
        .eq("id", acrylicOrder.acrylic_id)
        .single();

      const customerName = acrylicOrder.shipping_name || "there";
      const acrylicTitle = acrylic?.title || "your Acrylic Print";

      await sendEmail(
        acrylicOrder.shipping_email,
        shippedLetter(customerName, acrylicTitle, "Acrylic Print", trackingUrl, acrylicOrder.shipping_method),
        `shipped-acrylic-${acrylicOrder.id}`
      );
    }

    console.log(`Acrylic order updated: ${acrylicOrder.id}`);
    return true;
  }

  return false;
}

// ══════════════════════════════════════════════════════════
// The shipped letter, for books, canvases and acrylic prints
// ══════════════════════════════════════════════════════════
function shippedLetter(
  customerName: string,
  productTitle: string,
  productLabel: "Memory Book" | "Memory Canvas" | "Acrylic Print",
  trackingUrl: string | null,
  shippingMethod?: string
): Letter {
  const isExpress = shippingMethod === 'Express';
  const contactDays = isExpress ? '7 working days' : '14 working days';
  const isBook = productLabel === 'Memory Book';
  const name = firstName(customerName === 'there' ? null : customerName);
  const greeting = name ? `${name},` : 'Hello,';
  const first = isBook
    ? `it is no longer just pages on a screen. "${productTitle}" is now a real book. Printed, bound, packed up, and on its way to you.`
    : `it is no longer just pixels on a screen. "${productTitle}" is now a real ${productLabel.toLowerCase()}. Printed, packed, and on its way to you.`;
  const second = isBook
    ? 'When it arrives, find somewhere quiet to open it. Some moments deserve that.'
    : 'When it arrives, find the right wall for it. Some pieces just belong somewhere.';
  const third = `If it has not arrived within ${contactDays}, reply to this email and we will chase it for you.`;
  const ps = isBook
    ? 'The first time you hold one of these is something. I would love to hear about it. Just reply to this email.'
    : 'The first time you see it on your wall is something. I would love to hear about it. Just reply to this email.';
  return {
    subject: `Your ${productLabel} is in the post`,
    preheader: `"${productTitle}" has shipped.`,
    eyebrow: 'IN THE POST',
    heading: `Your ${productLabel} is on its way.`,
    bodyHtml: [p(`${esc(greeting)} ${esc(first)}`), p(esc(second)), p(esc(third), true)].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', wrap(second), '', wrap(third)].join('\n'),
    button: trackingUrl
      ? { label: `Track your ${isBook ? 'book' : 'print'}`, href: trackingUrl }
      : { label: 'See your order', href: `${SITE_URL}/dashboard/orders` },
    note: ps,
    signature: { name: 'Dante', title: 'Founder, Ancestorii' },
    facts: [
      { label: 'YOUR ORDER', value: productTitle },
      { label: 'DELIVERY', value: shippingMethod || 'Standard' },
    ],
    reason: `You are receiving this because you ordered a ${productLabel} from Ancestorii.`,
  };
}
