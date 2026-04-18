import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
          })
          .eq("id", orderId);

        // Update book status
        await supabase
          .from("memory_books")
          .update({ status: "ordered" })
          .eq("id", bookId);

        return new Response("Book order handled", { status: 200 });
      }

      // ── SUBSCRIPTION (existing logic) ──
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