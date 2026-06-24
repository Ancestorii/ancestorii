import Stripe from "npm:stripe@14.21.0";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Shipping rates (minor units), charged on EVERY order, all products ──
const SHIPPING = {
  standard: { GBP: 499, USD: 599, EUR: 599 },
  express: { GBP: 899, USD: 1099, EUR: 999 },
} as const;

function shippingOptions(currency: "GBP" | "USD" | "EUR") {
  const cur = currency.toLowerCase();
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: SHIPPING.standard[currency], currency: cur },
        display_name: "Standard Shipping (10–14 working days)",
        delivery_estimate: {
          minimum: { unit: "business_day" as const, value: 10 },
          maximum: { unit: "business_day" as const, value: 14 },
        },
      },
    },
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: SHIPPING.express[currency], currency: cur },
        display_name: "Express Shipping (5–7 working days)",
        delivery_estimate: {
          minimum: { unit: "business_day" as const, value: 5 },
          maximum: { unit: "business_day" as const, value: 7 },
        },
      },
    },
  ];
}

// ── Reward-code helpers (kept identical across the three print checkouts) ──
function rewardErrorMessage(reason?: string): string {
  switch (reason) {
    case "not_found": return "That reward code was not recognised.";
    case "wrong_family": return "That reward code belongs to a different family.";
    case "already_used": return "That reward code has already been used.";
    case "expired": return "That reward code has expired.";
    case "void": return "That reward code is no longer valid.";
    case "unavailable": return "That reward code is no longer available.";
    default: return "That reward code could not be applied.";
  }
}

// Eligibility for free_product codes. discount_pct codes apply to any print/tier.
// NOTE (product policy — flagged for review): 'memory_book_chapter' → Chapter book only;
// 'any_print_standard' → the standard (entry) tier of whichever product. Mapping:
// book=chapter, canvas=moment, acrylic=portrait.
function checkRewardEligibility(
  meta: { kind?: string; product_key?: string | null },
  product: "book" | "canvas" | "acrylic",
  standardTier: string,
  tierKey: string,
): { ok: boolean; message?: string } {
  if (meta.kind === "discount_pct") return { ok: true };
  if (meta.kind === "free_product") {
    if (meta.product_key === "memory_book_chapter") {
      return product === "book" && tierKey === "chapter"
        ? { ok: true }
        : { ok: false, message: "This reward is a free Chapter memory book — choose a Chapter book to redeem it." };
    }
    if (meta.product_key === "any_print_standard") {
      return tierKey === standardTier
        ? { ok: true }
        : { ok: false, message: "This reward covers a free print at standard size — switch to the standard tier to redeem it." };
    }
  }
  return { ok: false, message: "This reward code cannot be applied to this product." };
}

const PRODUCT = "canvas" as const;
const STANDARD_TIER = "moment";

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
    const rewardCode =
      typeof body?.reward_code === "string"
        ? body.reward_code.trim().toUpperCase()
        : "";

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

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // ── Reward code: VALIDATE up-front (abort before any order is created) ──
    let rewardMeta:
      | { ok: boolean; kind?: string; discount_pct?: number | null; product_key?: string | null; code?: string; family_id?: string }
      | null = null;

    if (rewardCode) {
      const { data: vres, error: verr } = await supabase.rpc("validate_reward_code", {
        p_code: rewardCode,
        p_user_id: userId,
      });
      if (verr) throw new Error("Could not validate reward code");
      if (!vres?.ok) throw new Error(rewardErrorMessage(vres?.reason));

      const elig = checkRewardEligibility(vres, PRODUCT, STANDARD_TIER, tierKey);
      if (!elig.ok) throw new Error(elig.message);

      rewardMeta = vres;
    }

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
        reward_code: rewardMeta ? rewardCode : null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      throw new Error("Failed to create order: " + (orderErr?.message ?? ""));
    }

    // ── Reward code: REDEEM atomically (tied to this order), then mint coupon ──
    let rewardCouponId: string | null = null;

    if (rewardMeta) {
      const { data: rres, error: rerr } = await supabase.rpc("redeem_reward_code", {
        p_code: rewardCode,
        p_user_id: userId,
        p_order_ref: order.id,
      });

      if (rerr || !rres?.ok) {
        await supabase.from("canvas_orders").delete().eq("id", order.id);
        throw new Error(rerr ? "Could not redeem reward code" : rewardErrorMessage(rres?.reason));
      }

      try {
        const pct = rres.kind === "free_product" ? 100 : Number(rres.discount_pct);
        if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
          throw new Error("Invalid reward discount");
        }
        // DYNAMIC, single-use coupon for THIS redemption only. Never a shared/static coupon.
        const coupon = await stripe.coupons.create({
          percent_off: pct,
          duration: "once",
          max_redemptions: 1,
          name: `Reward ${rres.code}`,
          metadata: {
            reward_code: String(rres.code ?? rewardCode),
            family_id: String(rres.family_id ?? ""),
            kind: String(rres.kind ?? ""),
          },
        });
        rewardCouponId = coupon.id;
      } catch {
        await supabase.rpc("release_reward_code", { p_code: rewardCode, p_order_ref: order.id });
        await supabase.from("canvas_orders").delete().eq("id", order.id);
        throw new Error("Could not apply reward discount");
      }
    }

    // ── No-stacking: reward coupon wins and suppresses the heirloom coupon. ──
    let discountConfig: Record<string, unknown>;
    if (rewardCouponId) {
      discountConfig = { discounts: [{ coupon: rewardCouponId }] };
    } else if (isPremium && couponId) {
      discountConfig = { discounts: [{ coupon: couponId }] };
    } else {
      discountConfig = { allow_promotion_codes: true };
    }

    // ── Create Stripe Checkout ──
    const successUrl = `${SITE}/dashboard/canvas/${canvasId}?order_success=true&order_id=${order.id}`;
    const cancelUrl = `${SITE}/dashboard/canvas/${canvasId}?order_canceled=true`;

    // Heritage tier: UK only
    const allowedCountries = tierKey === "heritage"
      ? ["GB" as const]
      : [
          "GB", "US", "CA", "AU", "NZ", "IE", "DE", "FR", "ES", "IT",
          "NL", "BE", "AT", "CH", "SE", "DK", "NO", "FI", "PT", "PL",
        ] as const;

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: existingCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        ...discountConfig,
        shipping_options: shippingOptions(currency),
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
          reward_code: rewardMeta ? rewardCode : "",
        },
      });
    } catch (sessErr) {
      if (rewardMeta) {
        if (rewardCouponId) {
          await supabase.rpc("release_reward_code", { p_code: rewardCode, p_order_ref: order.id });
        }
        await supabase.from("canvas_orders").delete().eq("id", order.id);
      }
      throw sessErr;
    }

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
