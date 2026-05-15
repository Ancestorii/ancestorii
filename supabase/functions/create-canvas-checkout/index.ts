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
      .select("id, title, tier_key, tier_name, price_gbp, family_id")
      .eq("id", canvasId)
      .maybeSingle();

    if (canvasErr || !canvas) {
      throw new Error("Canvas not found");
    }

    // Verify user belongs to the same family
    const { data: canvasMembership } = await supabase
      .from("family_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("family_id", canvas.family_id)
      .maybeSingle();

    if (!canvasMembership) {
      throw new Error("You don't have access to this canvas");
    }

    // ── Reuse existing Stripe customer if they have one ──
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id, plan_id, status")
      .eq("user_id", userId)
      .maybeSingle();

    const existingCustomerId =
      existingSub?.stripe_customer_id?.startsWith("cus_")
        ? existingSub.stripe_customer_id
        : undefined;

    // ── Check if family has Premium (for heirloom discount) ──
    let isPremium = false;
    const { data: userMembership } = await supabase
      .from("family_memberships")
      .select("family_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userMembership?.family_id) {
      const { data: premiumPlan } = await supabase
        .from("plans")
        .select("id")
        .eq("name", "Premium")
        .maybeSingle();

      if (premiumPlan) {
        const { data: premiumSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("family_id", userMembership.family_id)
          .eq("plan_id", premiumPlan.id)
          .eq("status", "active")
          .maybeSingle();

        isPremium = !!premiumSub;
      }
    }
    const couponId = Deno.env.get("STRIPE_COUPON_PREMIUM_HEIRLOOM");

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
      line_items: [{ price: priceId, quantity: 1 }],
      ...(isPremium && couponId
        ? { discounts: [{ coupon: couponId }] }
        : { allow_promotion_codes: true }),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: currency.toLowerCase() },
            display_name: 'Standard Shipping (10–14 working days)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 10 },
              maximum: { unit: 'business_day', value: 14 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: currency === 'GBP' ? 599 : currency === 'USD' ? 799 : 699,
              currency: currency.toLowerCase(),
            },
            display_name: 'Express Shipping (5–7 working days)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
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