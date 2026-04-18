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
    const plan = body?.plan;

    const currencyRaw = body?.currency;
    const currency =
      currencyRaw === "USD" || currencyRaw === "EUR" ? currencyRaw : "GBP";

    if (!plan) throw new Error("No plan provided");

    const SITE =
      Deno.env.get("NEXT_PUBLIC_SITE_URL") ??
      "https://www.ancestorii.com";

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing environment variables");
    }

    const prices = {
      Premium: {
        GBP: Deno.env.get("STRIPE_PREMIUM_YEARLY_PRICE_GBP"),
        USD: Deno.env.get("STRIPE_PREMIUM_YEARLY_PRICE_USD"),
        EUR: Deno.env.get("STRIPE_PREMIUM_YEARLY_PRICE_EUR"),
      },
    } as const;

    const priceId = prices[plan]?.[currency];
    if (!priceId) {
      throw new Error("Invalid plan or currency");
    }

    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization");

    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userResp } = await supabase.auth.getUser(token);

    const userId = userResp?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id, plan_id, status, cancel_at_period_end, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const existingCustomerId =
      existingSub?.stripe_customer_id?.startsWith("cus_")
        ? existingSub.stripe_customer_id
        : undefined;

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const returnPathRaw = body?.returnPath || "/dashboard/plans";
    const returnPath =
      typeof returnPathRaw === "string" && returnPathRaw.startsWith("/")
        ? returnPathRaw
        : "/dashboard/plans";

    const successUrl = `${SITE}/dashboard/home?success=true`;
    const cancelUrl = `${SITE}${returnPath}?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existingCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        plan,
        currency,
        user_id: userId,
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 200,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});