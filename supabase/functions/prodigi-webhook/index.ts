import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Email helper ──
async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ancestorii <orders@ancestorii.com>",
        to: [to],
        subject,
        html,
      }),
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error("Email send failed:", err);
  }
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
    // EXISTING BOOK ORDER PROCESSING — UNTOUCHED BELOW
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

    // Only set shipped_at the first time — never overwrite
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
        .select("shipping_email, shipping_name, book_id, shipped_at")
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
        const trackingButton = trackingUrl
          ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
              <tr>
                <td align="center" style="background-color:#16120c;">
                  <a href="${trackingUrl}" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">Track Your Book</a>
                </td>
              </tr>
            </table>`
          : "";

        await sendEmail(
          customerEmail,
          `Your Memory Book is in the post`,
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your Memory Book is in the post</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">
          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">A letter from</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">Ancestorii</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:48px 40px 36px 40px;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">Hey ${customerName},</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">It's no longer just pages on a screen — <em style="color:#16120c;">${bookTitle}</em> is now a real book. Printed, bound, and packed up.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 36px 0;">It's on its way to you now.</p>
              ${trackingButton}
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#3d3830; line-height:1.75; margin:0; font-style:italic;">When it arrives, find somewhere quiet to open it. Some moments deserve that.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:32px 0 4px 0;">— Dante</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:13px; color:#9a9388; margin:0; font-style:italic;">Founder, Ancestorii</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
                <tr>
                  <td style="border-top:1px solid #ebe4d5; padding-top:22px;">
                    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:14px; color:#7a7368; line-height:1.7; margin:0; font-style:italic;">
                      <span style="font-style:normal; color:#ab8232; letter-spacing:2px; font-size:12px;">P.S.</span>&nbsp;&nbsp;The first time you hold one of these is something. I'd love to hear about it — just reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">Ancestorii Ltd &middot; London</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;"><a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        `Your Memory Canvas is in the post`,
        shippedEmailHtml(customerName, canvasTitle, "Memory Canvas", trackingUrl, "Track Your Canvas", canvasOrder.shipping_method)
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
        `Your Acrylic Print is in the post`,
        shippedEmailHtml(customerName, acrylicTitle, "Acrylic Print", trackingUrl, "Track Your Print", acrylicOrder.shipping_method)
      );
    }

    console.log(`Acrylic order updated: ${acrylicOrder.id}`);
    return true;
  }

  return false;
}

// ══════════════════════════════════════════════════════════
// Shared shipped email for canvas & acrylic
// ══════════════════════════════════════════════════════════
function shippedEmailHtml(
  customerName: string,
  productTitle: string,
  productLabel: string,
  trackingUrl: string | null,
  trackingCta: string,
  shippingMethod?: string
): string {
  const isExpress = shippingMethod === 'Express';
  const contactDays = isExpress ? '7 working days' : '14 working days';
  const trackingButton = trackingUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
        <tr>
          <td align="center" style="background-color:#16120c;">
            <a href="${trackingUrl}" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">${trackingCta}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your ${productLabel} is in the post</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">
          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">A letter from</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">Ancestorii</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:48px 40px 36px 40px;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">Hey ${customerName},</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">It's no longer just pixels on a screen — <em style="color:#16120c;">${productTitle}</em> is now a real ${productLabel.toLowerCase()}. Printed, packed, and on its way.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 36px 0;">It's heading to you now.</p>
              ${trackingButton}
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#3d3830; line-height:1.75; margin:0 0 22px 0; font-style:italic;">When it arrives, find the right wall for it. Some pieces just belong somewhere.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:14px; color:#7a7368; line-height:1.75; margin:0;">If your order hasn't arrived within ${contactDays}, please contact us at <a href="mailto:support@ancestorii.com" style="color:#ab8232; text-decoration:none;">support@ancestorii.com</a>.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:32px 0 4px 0;">— Dante</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:13px; color:#9a9388; margin:0; font-style:italic;">Founder, Ancestorii</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
                <tr>
                  <td style="border-top:1px solid #ebe4d5; padding-top:22px;">
                    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:14px; color:#7a7368; line-height:1.7; margin:0; font-style:italic;">
                      <span style="font-style:normal; color:#ab8232; letter-spacing:2px; font-size:12px;">P.S.</span>&nbsp;&nbsp;The first time you see it on your wall is something. I'd love to hear about it — just reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">Ancestorii Ltd &middot; London</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;"><a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}