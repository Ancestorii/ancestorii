// supabase/functions/stripe-webhook/index.ts

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
    // ---- ENV ----
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

    // ---- Read raw body & verify signature ----
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) throw new Error("Missing Stripe signature");

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature error", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // ---- Supabase client ----
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // =====================================================================
    // 📌 1. checkout.session.completed — user just paid & subscribed
    // =====================================================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.client_reference_id;
      const planName = session.metadata?.plan;
      const customerId = session.customer;
      const stripeSubId = session.subscription;
      if (!stripeSubId) {
  console.error("Missing stripe subscription id");
  return new Response("Missing subscription", { status: 200 });
}
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

      if (!userId || !planName) {
        console.error("Missing metadata in checkout session");
        return new Response("Missing metadata", { status: 200 });
      }

      console.log("Checkout completed:", { userId, planName });

      // Find plan UUID
      const { data: planRow } = await supabase
        .from("plans")
        .select("id")
        .eq("name", planName)
        .maybeSingle();

      if (!planRow?.id) {
        console.error("Unknown plan:", planName);
        return new Response("Unknown plan", { status: 200 });
      }

      // Upsert subscription
      await supabase.from("subscriptions").upsert({
  user_id: userId,
  plan_id: planRow.id,
  stripe_customer_id: customerId,
  stripe_subscription_id: stripeSubId,
  status: stripeSub.status, // trialing
  current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
  current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
});


      return new Response("Checkout handled", { headers: CORS_HEADERS, status: 200 });
    }

    // =====================================================================
    // 📌 2. invoice.paid — subscription renewed successfully
    // =====================================================================
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_end: invoice.lines?.data?.[0]?.period?.end
            ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
            : null,
        })
        .eq("stripe_customer_id", customerId);

      return new Response("Invoice handled", { headers: CORS_HEADERS, status: 200 });
    }

    // =====================================================================
    // 📌 3. invoice.payment_failed — card expired / failed charge
    // =====================================================================
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await supabase
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("stripe_customer_id", customerId);

      return new Response("Payment failed handled", {
        headers: CORS_HEADERS,
        status: 200,
      });
    }

    // =====================================================================
// 📌 3.5 customer.subscription.updated — trial ended / status changed
// =====================================================================
if (event.type === "customer.subscription.updated") {
  const subscription = event.data.object;

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    })
    .eq("stripe_subscription_id", subscription.id);

  return new Response("Subscription updated", {
    headers: CORS_HEADERS,
    status: 200,
  });
}


    // =====================================================================
    // 📌 4. customer.subscription.deleted — user cancelled subscription
    // =====================================================================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Downgrade to Basic
      const { data: basicPlan } = await supabase
        .from("plans")
        .select("id")
        .eq("name", "Basic")
        .maybeSingle();

      await supabase
        .from("subscriptions")
        .update({
          plan_id: basicPlan?.id,
          status: "canceled",
          current_period_end: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);

      return new Response("Subscription canceled", {
        headers: CORS_HEADERS,
        status: 200,
      });
    }

    // =====================================================================
    // 📌 UNHANDLED EVENTS
    // =====================================================================
    console.log("Unhandled event:", event.type);

    return new Response("Event ignored", { headers: CORS_HEADERS, status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});
