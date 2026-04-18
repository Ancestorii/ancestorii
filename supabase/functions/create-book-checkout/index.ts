import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    const bookId = body?.book_id;
    const currencyRaw = body?.currency;
    const currency =
      currencyRaw === "USD" || currencyRaw === "EUR" ? currencyRaw : "GBP";

    if (!tierKey) throw new Error("No tier_key provided");
    if (!bookId) throw new Error("No book_id provided");

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
      chapter: {
        GBP: Deno.env.get("STRIPE_BOOK_CHAPTER_GBP"),
        USD: Deno.env.get("STRIPE_BOOK_CHAPTER_USD"),
        EUR: Deno.env.get("STRIPE_BOOK_CHAPTER_EUR"),
      },
      story: {
        GBP: Deno.env.get("STRIPE_BOOK_STORY_GBP"),
        USD: Deno.env.get("STRIPE_BOOK_STORY_USD"),
        EUR: Deno.env.get("STRIPE_BOOK_STORY_EUR"),
      },
      legacy: {
        GBP: Deno.env.get("STRIPE_BOOK_LEGACY_GBP"),
        USD: Deno.env.get("STRIPE_BOOK_LEGACY_USD"),
        EUR: Deno.env.get("STRIPE_BOOK_LEGACY_EUR"),
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

    // ── Verify book belongs to user ──
    const { data: book, error: bookErr } = await supabase
      .from("memory_books")
      .select("id, title, tier_key, tier_name, price_gbp")
      .eq("id", bookId)
      .eq("user_id", userId)
      .maybeSingle();

    if (bookErr || !book) {
      throw new Error("Book not found or not yours");
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
      chapter: { GBP: 44.99, USD: 59.99, EUR: 49.99 },
      story: { GBP: 54.99, USD: 74.99, EUR: 64.99 },
      legacy: { GBP: 64.99, USD: 84.99, EUR: 74.99 },
    };

    const priceAmount = tierPrices[tierKey]?.[currency] ?? 0;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        book_id: bookId,
        tier_key: tierKey,
        tier_name: book.tier_name,
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

    const successUrl = `${SITE}/dashboard/books/${bookId}?order_success=true&order_id=${order.id}`;
    const cancelUrl = `${SITE}/dashboard/books/${bookId}?order_canceled=true`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: existingCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      shipping_address_collection: {
        allowed_countries: [
          "GB", "US", "CA", "AU", "NZ", "IE", "DE", "FR", "ES", "IT",
          "NL", "BE", "AT", "CH", "SE", "DK", "NO", "FI", "PT", "PL",
        ],
      },
      metadata: {
        type: "book_order",
        order_id: order.id,
        book_id: bookId,
        tier_key: tierKey,
        currency,
        user_id: userId,
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    // ── Save Stripe session ID to order ──
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 200,
    });
  } catch (err: any) {
    console.error("Book checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});