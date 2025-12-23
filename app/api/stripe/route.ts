import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Supabase service role (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

   const { plan, billingCycle, userId, email } = body as {
  plan: string;
  billingCycle: "monthly" | "yearly";
  userId: string;
  email: string;
   };


    // ✅ Validate request data
    if (!plan || !billingCycle || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // ✅ Map plan & billing cycle → correct Stripe price ID
    const priceMap: Record<string, string> = {
      "Basic-monthly": process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!,
      "Basic-yearly": process.env.STRIPE_BASIC_YEARLY_PRICE_ID!,
      "Standard-monthly": process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!,
      "Standard-yearly": process.env.STRIPE_STANDARD_YEARLY_PRICE_ID!,
      "Premium-monthly": process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      "Premium-yearly": process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    };

    const priceId = priceMap[`${plan}-${billingCycle}`];
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan or billing cycle." },
        { status: 400 }
      );
    }

    // ✅ Check if user already has a Stripe customer ID
    let customerId: string | null = null;
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id;
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;

      // Store it in Supabase
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", userId);
    }

    // ✅ Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId!,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL!,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: userId,
          plan,
          billingCycle,
        },
      },
    });

    // ✅ Return checkout URL to the frontend
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
  console.error("Stripe Checkout Error:", err);

  const message =
    err instanceof Error ? err.message : "Internal Server Error";

  return NextResponse.json({ error: message }, { status: 500 });
}
}
