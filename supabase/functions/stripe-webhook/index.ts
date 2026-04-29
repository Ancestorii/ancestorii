import Stripe from "npm:stripe@14.21.0";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Email helper ──
async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY — skipping email");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ancestorii <support@ancestorii.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
    }
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

// ── Email templates ──
function premiumUpgradeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to Ancestorii Premium",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#FDFAF5; font-family:Arial, sans-serif;">
  <div style="max-width:560px; margin:0 auto; padding:48px 24px;">
    
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:48px; height:3px; background:#d4af37; border-radius:2px; margin:0 auto 20px;"></div>
      <h1 style="font-size:24px; font-weight:800; color:#1A1714; letter-spacing:-0.02em; margin:0 0 8px;">
        Welcome to Premium
      </h1>
      <p style="font-size:14px; color:#6B6358; margin:0;">
        Your upgrade is confirmed.
      </p>
    </div>

    <div style="background:#FFFFFF; border:1px solid #E8E4DC; border-radius:16px; padding:32px 28px; margin-bottom:24px;">
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0 0 16px;">
        Hi${name ? ` ${name}` : ''},
      </p>
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0 0 16px;">
        Thank you for upgrading to Ancestorii Premium. You now have access to expanded storage and all premium features to preserve and share your family's most precious memories.
      </p>
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0 0 16px;">
        Your subscription is active and will renew automatically each year. You can manage it anytime from your Plans page.
      </p>
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0;">
        If you have any questions, just reply to this email.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="https://www.ancestorii.com/dashboard/home" 
         style="display:inline-block; padding:12px 32px; background:#1A1714; color:#FFFFFF; font-size:14px; font-weight:700; text-decoration:none; border-radius:10px;">
        Go to Dashboard
      </a>
    </div>

    <div style="text-align:center; margin-top:40px; padding-top:24px; border-top:1px solid #E8E4DC;">
      <p style="font-size:11px; color:#A39B8F; margin:0;">
        Ancestorii · Preserving what matters most
      </p>
    </div>

  </div>
</body>
</html>`,
  };
}

function bookOrderEmail(name: string, bookTitle: string, tierName: string): { subject: string; html: string } {
  return {
    subject: `Your memory book order is confirmed`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#FDFAF5; font-family:Arial, sans-serif;">
  <div style="max-width:560px; margin:0 auto; padding:48px 24px;">
    
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:48px; height:3px; background:#d4af37; border-radius:2px; margin:0 auto 20px;"></div>
      <h1 style="font-size:24px; font-weight:800; color:#1A1714; letter-spacing:-0.02em; margin:0 0 8px;">
        Your Book Is on Its Way
      </h1>
      <p style="font-size:14px; color:#6B6358; margin:0;">
        Order confirmed. We're making it real.
      </p>
    </div>

    <div style="background:#FFFFFF; border:1px solid #E8E4DC; border-radius:16px; padding:32px 28px; margin-bottom:24px;">
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0 0 16px;">
        Hi${name ? ` ${name}` : ''},
      </p>
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0 0 16px;">
        Thank you for your order. Your memory book <strong>"${bookTitle}"</strong> (${tierName}) is now being prepared for print.
      </p>
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0 0 16px;">
        Here's what happens next:
      </p>
      <div style="background:#FBF6EA; border-radius:10px; padding:16px 20px; margin:0 0 16px;">
        <p style="font-size:13px; color:#1A1714; line-height:1.7; margin:0;">
          <strong style="color:#B8860B;">1.</strong> We prepare your book for printing<br/>
          <strong style="color:#B8860B;">2.</strong> Your book is printed on premium 200gsm gloss pages<br/>
          <strong style="color:#B8860B;">3.</strong> Bound in a hardcover matte finish<br/>
          <strong style="color:#B8860B;">4.</strong> Shipped directly to your door — free worldwide
        </p>
      </div>
      <p style="font-size:15px; color:#1A1714; line-height:1.6; margin:0;">
        You can track your order anytime in the <strong>Orders</strong> section inside Ancestorii.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="https://www.ancestorii.com/dashboard/orders" 
         style="display:inline-block; padding:12px 32px; background:#1A1714; color:#FFFFFF; font-size:14px; font-weight:700; text-decoration:none; border-radius:10px;">
        Track Your Order
      </a>
    </div>

    <div style="text-align:center; margin-top:40px; padding-top:24px; border-top:1px solid #E8E4DC;">
      <p style="font-size:11px; color:#A39B8F; margin:0;">
        Ancestorii · Preserving what matters most
      </p>
    </div>

  </div>
</body>
</html>`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const FULFILL_SECRET = Deno.env.get("FULFILL_SECRET");
    const SITE = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://www.ancestorii.com";

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing Stripe environment variables");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const body = await req.arrayBuffer();
    const payload = new TextDecoder().decode(body);

    const sig = req.headers.get("stripe-signature");
    if (!sig) throw new Error("Missing Stripe signature");

    const event = await stripe.webhooks.constructEventAsync(
      payload,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1️⃣ checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // ── BOOK ORDER (one-time payment) ──
      if (session.metadata?.type === "book_order") {
        const orderId = session.metadata?.order_id;
        const bookId = session.metadata?.book_id;
        const userId = session.metadata?.user_id;

        if (!orderId || !bookId || !userId) {
          return new Response("Missing book order metadata", { status: 200 });
        }

        // Extract shipping address from Stripe
        const shipping = session.shipping_details ?? session.customer_details;
        const address = shipping?.address;

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent,
            shipping_name: shipping?.name ?? null,
            shipping_line1: address?.line1 ?? null,
            shipping_line2: address?.line2 ?? null,
            shipping_city: address?.city ?? null,
            shipping_state: address?.state ?? null,
            shipping_postal: address?.postal_code ?? null,
            shipping_country: address?.country ?? null,
            shipping_email: session.customer_details?.email ?? null,
            shipping_phone: session.customer_details?.phone ?? null,
          })
          .eq("id", orderId);

        // Update book status
        await supabase
          .from("memory_books")
          .update({ status: "ordered" })
          .eq("id", bookId);

        // ── SEND BOOK ORDER EMAIL ──
        try {
          const customerEmail = session.customer_details?.email ?? session.customer_email;
          const customerName = shipping?.name ?? session.customer_details?.name ?? "";

          if (customerEmail) {
            const { data: bookData } = await supabase
              .from("memory_books")
              .select("title, tier_name")
              .eq("id", bookId)
              .maybeSingle();

            const email = bookOrderEmail(
              customerName,
              bookData?.title ?? "Memory Book",
              bookData?.tier_name ?? "Memory Book"
            );

            await sendEmail(customerEmail, email.subject, email.html);
          }
        } catch (emailErr) {
          console.error("Book order email failed:", emailErr);
        }

        // ── TRIGGER FULFILLMENT ──
        try {
          const fulfillUrl = `${SITE}/api/fulfill/${bookId}`;

          const fulfillRes = await fetch(fulfillUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-fulfill-secret": FULFILL_SECRET || "",
            },
            body: JSON.stringify({ order_id: orderId }),
          });

          if (!fulfillRes.ok) {
            const errText = await fulfillRes.text();
            console.error("Fulfill trigger failed:", fulfillRes.status, errText);
          } else {
            console.log("Fulfill triggered successfully for order:", orderId);
          }
        } catch (fulfillErr) {
          console.error("Fulfill trigger error:", fulfillErr);
        }

        return new Response("Book order handled", { status: 200 });
      }

      // ── SUBSCRIPTION (existing logic — untouched) ──
      const userId =
        session.metadata?.user_id ?? session.client_reference_id;
      const planName = session.metadata?.plan;
      const stripeSubId = session.subscription;
      const customerId = session.customer;

      if (!userId || !planName || !stripeSubId) {
        return new Response("Missing metadata", { status: 200 });
      }

      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

      const { data: planRow } = await supabase
        .from("plans")
        .select("id")
        .eq("name", planName)
        .maybeSingle();

      if (!planRow?.id) {
        return new Response("Unknown plan", { status: 200 });
      }

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan_id: planRow.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubId,
          status: "active",
          cancel_at_period_end: stripeSub.cancel_at_period_end ?? false,
          current_period_end: new Date(
            stripeSub.current_period_end * 1000
          ).toISOString(),
        },
        { onConflict: "user_id" }
      );

      // ── SEND PREMIUM UPGRADE EMAIL ──
      try {
        const customerEmail = session.customer_details?.email ?? session.customer_email;
        const customerName = session.customer_details?.name ?? "";

        if (customerEmail) {
          const email = premiumUpgradeEmail(customerName);
          await sendEmail(customerEmail, email.subject, email.html);
        }
      } catch (emailErr) {
        console.error("Premium email failed:", emailErr);
      }

      return new Response("Checkout handled", { status: 200 });
    }

    // 2️⃣ invoice.paid
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          cancel_at_period_end: false,
          current_period_end: invoice.lines?.data?.[0]?.period?.end
            ? new Date(
                invoice.lines.data[0].period.end * 1000
              ).toISOString()
            : null,
        })
        .eq("stripe_customer_id", invoice.customer);

      return new Response("Invoice handled", { status: 200 });
    }

    // 3️⃣ invoice.payment_failed
    if (event.type === "invoice.payment_failed") {
      await supabase
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("stripe_customer_id", event.data.object.customer);

      return new Response("Payment failed handled", { status: 200 });
    }

    // 4️⃣ customer.subscription.deleted
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: true,
          current_period_end: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      return new Response("Subscription canceled", { status: 200 });
    }

    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});