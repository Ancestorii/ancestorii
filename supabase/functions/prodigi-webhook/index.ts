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
    if (stage === "Complete") {
      orderStatus = "delivered";
      prodigiStatus = "delivered";
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

    // ── Snapshot the order BEFORE updating, for idempotency ──
    const { data: priorOrder } = await supabase
      .from("orders")
      .select("shipped_at")
      .eq("prodigi_order_id", prodigiOrderId)
      .single();

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
      .eq("prodigi_order_id", prodigiOrderId);

    // Also update memory_books
    const memoryBookUpdate: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
    };

    if (trackingUrl) {
      memoryBookUpdate.tracking_url = trackingUrl;
    }

    await supabase
      .from("memory_books")
      .update(memoryBookUpdate)
      .eq("prodigi_order_id", prodigiOrderId);

    // ── Send customer email ──
    if (orderStatus === "shipped" || stage === "Complete") {
      // Fetch order to get customer email, book title, and check if already emailed
      const { data: order } = await supabase
        .from("orders")
        .select("shipping_email, shipping_name, book_id, shipped_at")
        .eq("prodigi_order_id", prodigiOrderId)
        .single();

      const { data: book } = await supabase
        .from("memory_books")
        .select("title")
        .eq("id", order?.book_id)
        .single();

      const customerEmail = order?.shipping_email;
      const customerName = order?.shipping_name?.split(" ")[0] || "there";
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

      if (customerEmail && stage === "Complete") {
        await sendEmail(
          customerEmail,
          `Your Memory Book has arrived`,
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your Memory Book has arrived</title>
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
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">By now, your Memory Book should be in your hands.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">What started as a few photos and an idea is now something physical — something your family can pick up, pass around, come back to in twenty years.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">That's the whole point of what we do.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#3d3830; line-height:1.75; margin:0; font-style:italic;">If you have a moment, I'd love to hear what you think. Just reply to this email — every one comes straight to me.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:32px 0 4px 0;">— Dante</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:13px; color:#9a9388; margin:0; font-style:italic;">Founder, Ancestorii</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
                <tr>
                  <td style="border-top:1px solid #ebe4d5; padding-top:22px;">
                    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:14px; color:#7a7368; line-height:1.7; margin:0; font-style:italic;">
                      <span style="font-style:normal; color:#ab8232; letter-spacing:2px; font-size:12px;">P.S.</span>&nbsp;&nbsp;If anything's not right with the book — printing, binding, anything — tell me. I'll fix it personally.
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