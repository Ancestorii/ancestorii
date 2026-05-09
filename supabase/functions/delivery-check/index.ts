import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY || !to) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
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

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
    } else {
      console.log(`Email sent to ${to}: ${subject}`);
    }
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Find orders shipped 7+ days ago that are still status "shipped" (not yet marked delivered)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, shipping_email, shipping_name, book_id, shipped_at")
      .eq("status", "shipped")
      .not("shipped_at", "is", null)
      .lt("shipped_at", sevenDaysAgo.toISOString());

    if (error) {
      throw new Error("Failed to query orders: " + error.message);
    }

    console.log(`Found ${orders?.length ?? 0} orders to mark as delivered`);

    let emailsSent = 0;

    for (const order of orders || []) {
      // Get book title
      const { data: book } = await supabase
        .from("memory_books")
        .select("title")
        .eq("id", order.book_id)
        .single();

      const customerEmail = order.shipping_email;
      const customerName = order.shipping_name || "there";
      const bookTitle = book?.title || "your Memory Book";

      // Send delivered email
      if (customerEmail) {
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
        emailsSent++;
      }

      // Mark as delivered
      await supabase
        .from("orders")
        .update({ status: "delivered", prodigi_status: "delivered" })
        .eq("id", order.id);

      await supabase
        .from("memory_books")
        .update({ prodigi_status: "delivered" })
        .eq("id", order.book_id);
    }

    // ══════════════════════════════════════════════
    // CANVAS ORDERS
    // ══════════════════════════════════════════════
    const { data: canvasOrders, error: canvasError } = await supabase
      .from("canvas_orders")
      .select("id, shipping_email, shipping_name, canvas_id, shipped_at")
      .eq("status", "shipped")
      .not("shipped_at", "is", null)
      .lt("shipped_at", sevenDaysAgo.toISOString());

    if (canvasError) {
      console.error("Failed to query canvas orders:", canvasError.message);
    }

    console.log(`Found ${canvasOrders?.length ?? 0} canvas orders to mark as delivered`);

    for (const order of canvasOrders || []) {
      const { data: canvas } = await supabase
        .from("memory_canvases")
        .select("title")
        .eq("id", order.canvas_id)
        .single();

      const customerEmail = order.shipping_email;
      const customerName = order.shipping_name || "there";
      const canvasTitle = canvas?.title || "your Memory Canvas";

      if (customerEmail) {
        await sendEmail(
          customerEmail,
          `Your Memory Canvas has arrived`,
          deliveredEmailHtml(customerName, canvasTitle, "canvas")
        );
        emailsSent++;
      }

      await supabase
        .from("canvas_orders")
        .update({ status: "delivered", prodigi_status: "delivered" })
        .eq("id", order.id);

      await supabase
        .from("memory_canvases")
        .update({ prodigi_status: "delivered" })
        .eq("id", order.canvas_id);
    }

    // ══════════════════════════════════════════════
    // ACRYLIC ORDERS
    // ══════════════════════════════════════════════
    const { data: acrylicOrders, error: acrylicError } = await supabase
      .from("acrylic_orders")
      .select("id, shipping_email, shipping_name, acrylic_id, shipped_at")
      .eq("status", "shipped")
      .not("shipped_at", "is", null)
      .lt("shipped_at", sevenDaysAgo.toISOString());

    if (acrylicError) {
      console.error("Failed to query acrylic orders:", acrylicError.message);
    }

    console.log(`Found ${acrylicOrders?.length ?? 0} acrylic orders to mark as delivered`);

    for (const order of acrylicOrders || []) {
      const { data: acrylic } = await supabase
        .from("acrylic_prints")
        .select("title")
        .eq("id", order.acrylic_id)
        .single();

      const customerEmail = order.shipping_email;
      const customerName = order.shipping_name || "there";
      const acrylicTitle = acrylic?.title || "your Acrylic Print";

      if (customerEmail) {
        await sendEmail(
          customerEmail,
          `Your Acrylic Print has arrived`,
          deliveredEmailHtml(customerName, acrylicTitle, "acrylic")
        );
        emailsSent++;
      }

      await supabase
        .from("acrylic_orders")
        .update({ status: "delivered", prodigi_status: "delivered" })
        .eq("id", order.id);

      await supabase
        .from("acrylic_prints")
        .update({ prodigi_status: "delivered" })
        .eq("id", order.acrylic_id);
    }

    const totalProcessed = (orders?.length ?? 0) + (canvasOrders?.length ?? 0) + (acrylicOrders?.length ?? 0);

    console.log(`Delivery check complete: ${emailsSent} emails sent`);

    return new Response(
      JSON.stringify({ success: true, processed: totalProcessed, emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Delivery check error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ══════════════════════════════════════════════
// Shared delivered email template for canvas & acrylic
// ══════════════════════════════════════════════
function deliveredEmailHtml(customerName: string, productTitle: string, type: "canvas" | "acrylic"): string {
  const productLabel = type === "canvas" ? "Memory Canvas" : "Acrylic Print";
  const psLine = type === "canvas"
    ? "If anything's not right with the canvas — colour, stretching, anything — tell me. I'll fix it personally."
    : "If anything's not right with the print — colour, clarity, anything — tell me. I'll fix it personally.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your ${productLabel} has arrived</title>
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
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">By now, your ${productLabel} should be with you.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;"><em style="color:#16120c;">${productTitle}</em> started as photos on a screen. Now it's something real — on your wall, in your home, part of the room.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">That's the whole point of what we do.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#3d3830; line-height:1.75; margin:0; font-style:italic;">If you have a moment, I'd love to hear what you think. Just reply to this email — every one comes straight to me.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:32px 0 4px 0;">— Dante</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:13px; color:#9a9388; margin:0; font-style:italic;">Founder, Ancestorii</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
                <tr>
                  <td style="border-top:1px solid #ebe4d5; padding-top:22px;">
                    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:14px; color:#7a7368; line-height:1.7; margin:0; font-style:italic;">
                      <span style="font-style:normal; color:#ab8232; letter-spacing:2px; font-size:12px;">P.S.</span>&nbsp;&nbsp;${psLine}
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