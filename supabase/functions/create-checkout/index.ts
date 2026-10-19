import Stripe from "npm:stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** An error that carries the HTTP status the browser should see; its message is shown to the user. */
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    status,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const plan = typeof body?.plan === "string" ? body.plan : "";

    const currencyRaw = body?.currency;
    const currency =
      currencyRaw === "USD" || currencyRaw === "EUR" ? currencyRaw : "GBP";

    if (!plan) throw new HttpError(400, "No plan provided");

    const SITE =
      Deno.env.get("NEXT_PUBLIC_SITE_URL") ??
      "https://www.ancestorii.com";

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new HttpError(500, "Checkout is not configured");
    }

    const prices: Record<string, Record<string, string | undefined>> = {
      Premium: {
        GBP: Deno.env.get("STRIPE_PREMIUM_MONTHLY_PRICE_GBP"),
        USD: Deno.env.get("STRIPE_PREMIUM_MONTHLY_PRICE_USD"),
        EUR: Deno.env.get("STRIPE_PREMIUM_MONTHLY_PRICE_EUR"),
      },
    };

    const priceId = Object.hasOwn(prices, plan) ? prices[plan][currency] : undefined;
    if (!priceId) {
      throw new HttpError(400, "Invalid plan or currency");
    }

    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization");

    if (!authHeader) throw new HttpError(401, "Missing Authorization header");

    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userResp } = await supabase.auth.getUser(token);

    const userId = userResp?.user?.id;
    if (!userId) throw new HttpError(401, "Not authenticated");

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

    // ── One subscription per account. The Plans page hides the button once the webhook has
    //    recorded the upgrade, but a second click in the seconds before that, or a hand-made
    //    request, must not start a second subscription on the same card. Stripe is asked, not
    //    our table, so a stale row cannot block a genuine re-subscribe. ──
    if (existingCustomerId) {
      const live = await stripe.subscriptions.list({
        customer: existingCustomerId,
        status: "all",
        limit: 10,
      });
      const open = live.data.some((s) =>
        s.status === "active" || s.status === "trialing" || s.status === "past_due" || s.status === "unpaid"
      );
      if (open) {
        throw new HttpError(
          409,
          "This account already has a Premium subscription, so there is nothing more to pay. If you cancelled it and want it back, reply to support@ancestorii.com and we will reactivate it.",
        );
      }
    }

    const returnPathRaw = body?.returnPath || "/dashboard/plans";
    const returnPath =
      typeof returnPathRaw === "string" && returnPathRaw.startsWith("/")
        ? returnPathRaw
        : "/dashboard/plans";

    const successUrl = `${SITE}/success`;
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

    if (!session.url) throw new HttpError(500, "Failed to create checkout session");

    return jsonResponse({ url: session.url }, 200);
  } catch (err) {
    if (err instanceof HttpError) {
      console.warn(`Checkout refused (${err.status}): ${err.message}`);
      return jsonResponse({ error: err.message }, err.status);
    }
    console.error("Checkout error:", err);
    return jsonResponse({ error: "Something went wrong starting checkout. Please try again." }, 500);
  }
});
