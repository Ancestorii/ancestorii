import Stripe from "npm:stripe@14.21.0";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const tierKey = body?.tier_key;
    const acrylicId = body?.acrylic_id;
    const currencyRaw = body?.currency;
    const currency =
      currencyRaw === "USD" || currencyRaw === "EUR" ? currencyRaw : "GBP";

    if (!tierKey) throw new Error("No tier_key provided");
    if (!acrylicId) throw new Error("No acrylic_id provided");

    const SITE =
      Deno.env.get("NEXT_PUBLIC_SITE_URL") ??
      "https://www.ancestorii.com";

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing environment variables");
    }

    // ── Price lookup ──
    const prices: Record<string, Record<string, string | undefined>> = {
      portrait: {
        GBP: Deno.env.get("STRIPE_PRICE_ACRYLIC_PORTRAIT_GBP"),
        USD: Deno.env.get("STRIPE_PRICE_ACRYLIC_PORTRAIT_USD"),
        EUR: Deno.env.get("STRIPE_PRICE_ACRYLIC_PORTRAIT_EUR"),
      },
      centrepiece: {
        GBP: Deno.env.get("STRIPE_PRICE_ACRYLIC_CENTREPIECE_GBP"),
        USD: Deno.env.get("STRIPE_PRICE_ACRYLIC_CENTREPIECE_USD"),
        EUR: Deno.env.get("STRIPE_PRICE_ACRYLIC_CENTREPIECE_EUR"),
      },
      masterpiece: {
        GBP: Deno.env.get("STRIPE_PRICE_ACRYLIC_MASTERPIECE_GBP"),
        USD: Deno.env.get("STRIPE_PRICE_ACRYLIC_MASTERPIECE_USD"),
        EUR: Deno.env.get("STRIPE_PRICE_ACRYLIC_MASTERPIECE_EUR"),
      },
    };

    const priceId = prices[tierKey]?.[currency];
    if (!priceId) {
      throw new Error(`Invalid tier_key (${tierKey}) or currency (${currency})`);
    }

    // ── Auth ──
    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization");

    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!);
    const { data: userResp } = await supabase.auth.getUser(token);

    const userId = userResp?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    // ── Verify acrylic belongs to user ──
    const { data: acrylic, error: acrylicErr } = await supabase
      .from("acrylic_prints")
      .select("id, title, tier_key, tier_name, price_gbp")
      .eq("id", acrylicId)
      .eq("user_id", userId)
      .maybeSingle();

    if (acrylicErr || !acrylic) {
      throw new Error("Acrylic print not found or not yours");
    }

    // ── Reuse existing Stripe customer if they have one ──
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    const existingCustomerId =
      existingSub?.stripe_customer_id?.startsWith("cus_")
        ? existingSub.stripe_customer_id
        : undefined;

    // ── Create order record ──
    const tierPrices: Record<string, Record<string, number>> = {
      portrait: { GBP: 99.99, USD: 139.99, EUR: 119.99 },
      centrepiece: { GBP: 149.99, USD: 199.99, EUR: 179.99 },
      masterpiece: { GBP: 199.99, USD: 269.99, EUR: 239.99 },
    };

    const priceAmount = tierPrices[tierKey]?.[currency] ?? 0;

    const { data: order, error: orderErr } = await supabase
      .from("acrylic_orders")
      .insert({
        user_id: userId,
        acrylic_id: acrylicId,
        tier_key: tierKey,
        tier_name: acrylic.tier_name,
        price_amount: priceAmount,
        price_currency: currency,
        status: "created",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      throw new Error("Failed to create order: " + (orderErr?.message ?? ""));
    }

    // ── Create Stripe Checkout ──
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const successUrl = `${SITE}/dashboard/acrylic/${acrylicId}?order_success=true&order_id=${order.id}`;
    const cancelUrl = `${SITE}/dashboard/acrylic/${acrylicId}?order_canceled=true`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: existingCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      allow_promotion_codes: true,
      shipping_address_collection: {
        allowed_countries: [
          "GB", "US", "CA", "AU", "NZ", "IE", "DE", "FR", "ES", "IT",
          "NL", "BE", "AT", "CH", "SE", "DK", "NO", "FI", "PT", "PL",
        ],
      },
      metadata: {
        type: "acrylic_order",
        order_id: order.id,
        acrylic_id: acrylicId,
        tier_key: tierKey,
        currency,
        user_id: userId,
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    // ── Save Stripe session ID to order ──
    await supabase
      .from("acrylic_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 200,
    });
  } catch (err: any) {
    console.error("Acrylic checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});