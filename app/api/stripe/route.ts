import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// -----------------------------
// Stripe
// -----------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// -----------------------------
// Supabase (service role – server only)
// -----------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// -----------------------------
// POST
// -----------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { plan, billingCycle, userId, email } = body as {
      plan: "Basic" | "Standard" | "Premium";
      billingCycle: "monthly" | "yearly";
      userId: string;
      email: string;
    };

    // -----------------------------
    // Validate input
    // -----------------------------
    if (!plan || !billingCycle || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // -----------------------------
    // Map plan → Stripe price ID
    // -----------------------------
    const priceMap: Record<string, string | undefined> = {
      "Basic-monthly": process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
      "Basic-yearly": process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
      "Standard-monthly": process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID,
      "Standard-yearly": process.env.STRIPE_STANDARD_YEARLY_PRICE_ID,
      "Premium-monthly": process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
      "Premium-yearly": process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    };

    const priceId = priceMap[`${plan}-${billingCycle}`];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan or billing cycle." },
        { status: 400 }
      );
    }

    // -----------------------------
    // Get or create Stripe customer
    // -----------------------------
    const { data: existingSub, error } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    let customerId = existingSub?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
        },
      });

      customerId = customer.id;

      // Upsert subscription row safely
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan,
        billing_cycle: billingCycle,
        status: "incomplete",
      });
    }

    // -----------------------------
    // Create Checkout Session
    // -----------------------------
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: userId,
          plan,
          billing_cycle: billingCycle,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL!,
    });

    // -----------------------------
    // Return URL
    // -----------------------------
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
