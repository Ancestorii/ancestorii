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
    const canvasId = body?.canvas_id;
    const currencyRaw = body?.currency;
    const shippingMethod = body?.shipping_method === 'Express' ? 'Express' : 'Standard';
    const currency =
      currencyRaw === "USD" || currencyRaw === "EUR" ? currencyRaw : "GBP";

    if (!tierKey) throw new Error("No tier_key provided");
    if (!canvasId) throw new Error("No canvas_id provided");

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
      moment: {
        GBP: Deno.env.get("STRIPE_PRICE_CANVAS_MOMENT_GBP"),
        USD: Deno.env.get("STRIPE_PRICE_CANVAS_MOMENT_USD"),
        EUR: Deno.env.get("STRIPE_PRICE_CANVAS_MOMENT_EUR"),
      },
      heirloom: {
        GBP: Deno.env.get("STRIPE_PRICE_CANVAS_HEIRLOOM_GBP"),
        USD: Deno.env.get("STRIPE_PRICE_CANVAS_HEIRLOOM_USD"),
        EUR: Deno.env.get("STRIPE_PRICE_CANVAS_HEIRLOOM_EUR"),
      },
      heritage: {
        GBP: Deno.env.get("STRIPE_PRICE_CANVAS_HERITAGE_GBP"),
        USD: Deno.env.get("STRIPE_PRICE_CANVAS_HERITAGE_USD"),
        EUR: Deno.env.get("STRIPE_PRICE_CANVAS_HERITAGE_EUR"),
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

    // ── Verify canvas belongs to user ──
    const { data: canvas, error: canvasErr } = await supabase
      .from("memory_canvases")
      .select("id, title, tier_key, tier_name, price_gbp")
      .eq("id", canvasId)
      .eq("user_id", userId)
      .maybeSingle();

    if (canvasErr || !canvas) {
      throw new Error("Canvas not found or not yours");
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
      moment: { GBP: 99.99, USD: 139.99, EUR: 119.99 },
      heirloom: { GBP: 129.99, USD: 179.99, EUR: 154.99 },
      heritage: { GBP: 169.99, USD: 229.99, EUR: 199.99 },
    };

    const priceAmount = tierPrices[tierKey]?.[currency] ?? 0;

    const { data: order, error: orderErr } = await supabase
      .from("canvas_orders")
      .insert({
        user_id: userId,
        canvas_id: canvasId,
        tier_key: tierKey,
        tier_name: canvas.tier_name,
        price_amount: priceAmount,
        price_currency: currency,
        shipping_method: shippingMethod,
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

    const successUrl = `${SITE}/dashboard/canvas/${canvasId}?order_success=true&order_id=${order.id}`;
    const cancelUrl = `${SITE}/dashboard/canvas/${canvasId}?order_canceled=true`;

    // Express shipping line item
    const expressPrices: Record<string, string | undefined> = {
      GBP: Deno.env.get("STRIPE_PRICE_ACRYLIC_EXPRESS_GBP"),
      USD: Deno.env.get("STRIPE_PRICE_ACRYLIC_EXPRESS_USD"),
      EUR: Deno.env.get("STRIPE_PRICE_ACRYLIC_EXPRESS_EUR"),
    };

    const lineItems: { price: string; quantity: number }[] = [
      { price: priceId, quantity: 1 },
    ];

    if (shippingMethod === 'Express') {
      const expressPriceId = expressPrices[currency];
      if (!expressPriceId) throw new Error('Express shipping price not configured for ' + currency);
      lineItems.push({ price: expressPriceId, quantity: 1 });
    }

    // Heritage tier: UK only
    const allowedCountries = tierKey === 'heritage'
      ? ["GB" as const]
      : [
          "GB", "US", "CA", "AU", "NZ", "IE", "DE", "FR", "ES", "IT",
          "NL", "BE", "AT", "CH", "SE", "DK", "NO", "FI", "PT", "PL",
        ] as const;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: existingCustomerId,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      allow_promotion_codes: true,
      shipping_address_collection: {
        allowed_countries: allowedCountries,
      },
      metadata: {
        type: "canvas_order",
        order_id: order.id,
        canvas_id: canvasId,
        tier_key: tierKey,
        currency,
        user_id: userId,
        shipping_method: shippingMethod,
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    // ── Save Stripe session ID to order ──
    await supabase
      .from("canvas_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 200,
    });
  } catch (err: any) {
    console.error("Canvas checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});