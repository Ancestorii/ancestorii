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

    const eventType = payload?.event;
    const prodigiOrder = payload?.order;
    const prodigiOrderId = prodigiOrder?.id;

    if (!prodigiOrderId) {
      return new Response("No order ID in payload", { status: 200 });
    }

    console.log(`Prodigi webhook: ${eventType} for order ${prodigiOrderId}`);

    const stage = prodigiOrder?.status?.stage ?? "";

    let orderStatus = "printing";
    let prodigiStatus = stage;
    let trackingUrl: string | null = null;
    let shippedAt: string | null = null;

    if (stage === "Complete") {
      orderStatus = "delivered";
      prodigiStatus = "delivered";
    } else if (stage === "Shipped") {
      orderStatus = "shipped";
      prodigiStatus = "shipped";
      shippedAt = new Date().toISOString();

      const shipments = prodigiOrder?.shipments ?? [];
      if (shipments.length > 0) {
        trackingUrl = shipments[0]?.tracking?.url ?? null;
      }
    } else if (stage === "InProgress") {
      orderStatus = "printing";
      prodigiStatus = "printing";
    } else if (stage === "Cancelled") {
      orderStatus = "cancelled";
      prodigiStatus = "cancelled";
    }

    // Update orders table
    const updateData: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
      status: orderStatus,
    };

    if (trackingUrl) {
      updateData.prodigi_tracking_url = trackingUrl;
    }

    if (shippedAt) {
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
    if (stage === "Shipped" || stage === "Complete") {
      // Fetch order to get customer email and book title
      const { data: order } = await supabase
        .from("orders")
        .select("shipping_email, shipping_name, book_id")
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

      if (customerEmail && stage === "Shipped") {
        const trackingLine = trackingUrl
          ? `<p style="margin: 24px 0;"><a href="${trackingUrl}" style="background: #0f2040; color: #d4af37; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600;">Track your order</a></p>`
          : "";

        await sendEmail(
          customerEmail,
          `Your Memory Book is on its way!`,
          `
          <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1A1714;">
            <div style="background: #0f2040; padding: 32px; text-align: center;">
              <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 0.02em;">Ancestorii</h1>
            </div>
            <div style="padding: 32px; background: #FDFAF5;">
              <p style="font-size: 18px; margin-bottom: 16px;">Hi ${customerName},</p>
              <p style="font-size: 16px; line-height: 1.6;">Great news — <strong>${bookTitle}</strong> has been printed and is on its way to you.</p>
              ${trackingLine}
              <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">We hope it brings you as much joy to hold as it did to create.</p>
              <p style="font-size: 16px; margin-top: 24px;">With warmth,<br/>The Ancestorii Team</p>
            </div>
            <div style="background: #1A1714; padding: 16px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">Ancestorii — Some things a photo can't hold.</p>
            </div>
          </div>
          `
        );
      }

      if (customerEmail && stage === "Complete") {
        await sendEmail(
          customerEmail,
          `Your Memory Book has been delivered`,
          `
          <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1A1714;">
            <div style="background: #0f2040; padding: 32px; text-align: center;">
              <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 0.02em;">Ancestorii</h1>
            </div>
            <div style="padding: 32px; background: #FDFAF5;">
              <p style="font-size: 18px; margin-bottom: 16px;">Hi ${customerName},</p>
              <p style="font-size: 16px; line-height: 1.6;"><strong>${bookTitle}</strong> should have arrived. We hope you love it.</p>
              <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">If you have a moment, we'd love to hear what you think — just reply to this email.</p>
              <p style="font-size: 16px; margin-top: 24px;">With warmth,<br/>The Ancestorii Team</p>
            </div>
            <div style="background: #1A1714; padding: 16px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">Ancestorii — Some things a photo can't hold.</p>
            </div>
          </div>
          `
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