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
    const returnPathRaw = body?.returnPath || "/plans";

    if (!plan) throw new Error("No plan provided.");

    const returnPath =
      typeof returnPathRaw === "string" && returnPathRaw.startsWith("/")
        ? returnPathRaw
        : "/plans";

    // 🔥 Determine environment URL
   const SITE =
  Deno.env.get("NEXT_PUBLIC_SITE_URL") ??
  "https://www.ancestorii.com";


    // 🔥 Stripe & Supabase secrets
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
    if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
    if (!SERVICE_ROLE) throw new Error("Missing SERVICE_ROLE");

    const prices = {
      Basic: {
        monthly: Deno.env.get("STRIPE_BASIC_MONTHLY_PRICE_ID"),
        yearly: Deno.env.get("STRIPE_BASIC_YEARLY_PRICE_ID"),
      },
      Standard: {
        monthly: Deno.env.get("STRIPE_STANDARD_MONTHLY_PRICE_ID"),
        yearly: Deno.env.get("STRIPE_STANDARD_YEARLY_PRICE_ID"),
      },
      Premium: {
        monthly: Deno.env.get("STRIPE_PREMIUM_MONTHLY_PRICE_ID"),
        yearly: Deno.env.get("STRIPE_PREMIUM_YEARLY_PRICE_ID"),
      },
    };

    const priceId = prices[plan]?.[body.billingCycle];
    if (!priceId) {
      throw new Error(
        `Invalid plan or billing cycle: ${plan} / ${body.billingCycle}`
      );
    }

    // 🔥 Auth header (GUARDED)
    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization");

    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userResp } = await supabase.auth.getUser(token);
    const userId = userResp?.user?.id;

    if (!userId) throw new Error("Not authenticated.");

    // 🔥 Reuse Stripe customer if available
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    const existingCustomerId = existingSub?.stripe_customer_id || undefined;

    // 🔥 Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // 🔥 URLs
    const successUrl = `${SITE}${returnPath}?success=true`;
    const cancelUrl = `${SITE}${returnPath}?canceled=true`;

    // 🔥 Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existingCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // 👇 ADD THIS BLOCK
  subscription_data: {
    trial_period_days: 14,
  },
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId, // 🔥 REQUIRED
      
      metadata: {
        plan,
        user_id: userId,
      },
    });

    if (!session.url) throw new Error("Failed to get checkout URL.");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
      status: 200,
    });
  } catch (err) {
    console.error("Checkout error:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
      status: 400,
    });
  }
});
