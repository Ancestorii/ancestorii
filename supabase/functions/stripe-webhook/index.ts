import Stripe from "npm:stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { esc, p, send, SITE_URL, steps, stepsText, wrap, type Letter } from "../_shared/email.ts";

// Supabase's Edge Runtime keeps a promise handed to EdgeRuntime.waitUntil running after the
// response has gone out. The fulfil call below can take minutes (a book is rendered and sent to
// Prodigi), so it runs there and Stripe gets its 200 at once.
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void } | undefined;
function inBackground(task: Promise<unknown>): void {
  if (typeof EdgeRuntime !== "undefined" && EdgeRuntime && typeof EdgeRuntime.waitUntil === "function") {
    EdgeRuntime.waitUntil(task);
  } else {
    task.catch((err) => console.error("Background task failed:", err));
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Email helper (every letter is drawn in the shared shell, _shared/letter.ts) ──
async function sendEmail(to: string, letter: Letter, idempotencyKey: string) {
  const result = await send({ to, letter, idempotencyKey, tag: 'stripe' });
  if (!result.ok) console.error(`Resend refused (${result.status}): ${result.message}`);
}

// ── Hand a paid order to the print pipeline, off the request ──
// /api/fulfill renders the product and submits it to Prodigi, which takes up to five minutes
// for a book. Stripe gives a webhook a few seconds before it retries, so this runs through
// inBackground() and the owner is emailed when the call does not come back 2xx (the route has
// marked the order 'error' by then, or never received the call at all).
type FulfilProduct = "Memory Book" | "Memory Canvas" | "Acrylic Print";

function fulfilFailedLetter(product: FulfilProduct, orderId: string, customerEmail: string | null, failure: string): Letter {
  const first = `A customer has paid for a ${product}, but the order did not reach the printer: the fulfil call for order ${orderId} did not succeed.`;
  const second = 'The payment is safe and the order is marked paid. Check the order row before re-running the fulfil route for it, or the customer will wait for a print that is not coming.';
  return {
    subject: `Action needed: ${product} order ${orderId.slice(0, 8)} did not reach the printer`,
    preheader: `Order ${orderId} is paid but was not sent to Prodigi.`,
    eyebrow: 'ACTION NEEDED',
    heading: 'A paid order did not reach the printer.',
    bodyHtml: [p(esc(first)), p(esc(second))].join(''),
    bodyText: [wrap(first), '', wrap(second)].join('\n'),
    note: `Error: ${failure}`,
    facts: [
      { label: 'ORDER', value: orderId, breakable: true },
      { label: 'PRODUCT', value: product },
      { label: 'CUSTOMER', value: customerEmail || 'unknown', breakable: true },
    ],
    reason: 'You are receiving this because you look after Ancestorii orders.',
  };
}

async function triggerFulfil(args: {
  url: string;
  secret: string;
  orderId: string;
  product: FulfilProduct;
  customerEmail: string | null;
}): Promise<void> {
  let failure = "";
  try {
    const res = await fetch(args.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fulfill-secret": args.secret,
      },
      body: JSON.stringify({ order_id: args.orderId }),
    });
    if (res.ok) {
      console.log(`Fulfil triggered for ${args.product} order ${args.orderId}`);
      return;
    }
    const text = await res.text().catch(() => "");
    failure = `HTTP ${res.status} ${text.slice(0, 500)}`.trim();
  } catch (err) {
    failure = `fetch failed: ${(err as Error)?.message ?? String(err)}`;
  }
  console.error(`Fulfil trigger failed for ${args.product} order ${args.orderId}: ${failure}`);

  const to = Deno.env.get("ALERT_EMAIL") || "support@ancestorii.com";
  const result = await send({
    to,
    letter: fulfilFailedLetter(args.product, args.orderId, args.customerEmail, failure),
    idempotencyKey: `fulfil-failed-${args.orderId}`,
    tag: "alert",
  });
  if (!result.ok) console.error(`Alert email refused (${result.status}): ${result.message}`);
}
// ── Resolve a customer's email + name from a Stripe customer id ──
// Subscription/invoice events carry no checkout session, so we read the
// contact straight from Stripe (with invoice-provided values preferred).
// (Restored: f471c51 deleted this helper but kept its two calls.)
async function resolveContact(
  stripe: Stripe,
  customerId: string,
  fallbackEmail?: string | null,
  fallbackName?: string | null,
): Promise<{ email: string | null; name: string }> {
  if (fallbackEmail) {
    return { email: fallbackEmail, name: fallbackName ?? "" };
  }
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !(customer as Stripe.DeletedCustomer).deleted) {
      const c = customer as Stripe.Customer;
      return { email: c.email ?? null, name: c.name ?? fallbackName ?? "" };
    }
  } catch (err) {
    console.error("resolveContact failed:", err);
  }
  return { email: null, name: fallbackName ?? "" };
}

// ── Derive the SELECTED shipping method + the real amounts from the session ──
// Every order now charges shipping, so the old `amount_total > 0 → Express` inference
// is wrong. Read the actual chosen shipping rate's display_name (Standard vs Express)
// by expanding shipping_cost.shipping_rate, with an amount-based fallback only if the
// expand fails. Also returns what was actually charged (total) and the shipping fee.
// (Restored: f471c51 deleted this helper but kept its three calls, so every paid book,
// canvas and acrylic checkout threw before the order was marked paid.)
async function deriveShippingInfo(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<{ method: string; shippingAmount: number | null; amountCharged: number | null }> {
  let displayName = "";
  let shippingMinor = session.shipping_cost?.amount_total ?? null;
  let totalMinor = session.amount_total ?? null;

  try {
    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["shipping_cost.shipping_rate"],
    });
    const rate = full.shipping_cost?.shipping_rate;
    if (rate && typeof rate !== "string") {
      displayName = (rate.display_name ?? "").toLowerCase();
    }
    if (full.shipping_cost?.amount_total != null) shippingMinor = full.shipping_cost.amount_total;
    if (full.amount_total != null) totalMinor = full.amount_total;
  } catch (err) {
    console.error("deriveShippingInfo: session retrieve failed, falling back to amount:", err);
  }

  let method: string;
  if (displayName.includes("express")) method = "Express";
  else if (displayName.includes("standard")) method = "Standard";
  // Fallback: Standard rates are 499/599/599, Express 899/1099/999, so split at 800 minor units.
  else method = (shippingMinor ?? 0) >= 800 ? "Express" : "Standard";

  return {
    method,
    shippingAmount: shippingMinor != null ? shippingMinor / 100 : null,
    amountCharged: totalMinor != null ? totalMinor / 100 : null,
  };
}

// ── Email templates ──
function premiumUpgradeEmail(name: string): Letter {
  const greeting = name ? `Thank you, ${name}.` : 'Thank you.';
  const first = 'Your upgrade to Ancestorii Premium is confirmed. You now have the room and every premium feature to keep and share the memories that matter most.';
  const second = 'Your subscription is active and renews automatically each month. You can manage it any time from your Plans page.';
  const third = 'If you have any questions, just reply to this email.';
  return {
    subject: 'Welcome to Ancestorii Premium',
    preheader: 'Your upgrade is confirmed. More room, every feature.',
    eyebrow: 'PREMIUM',
    heading: 'Welcome to Premium.',
    bodyHtml: [p(`${esc(greeting)} ${esc(first)}`), p(esc(second)), p(esc(third), true)].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', wrap(second), '', third].join('\n'),
    button: { label: 'Open Ancestorii', href: `${SITE_URL}/dashboard/our-family` },
    facts: [
      { label: 'PLAN', value: 'Premium' },
      { label: 'RENEWS', value: 'Monthly, automatically' },
    ],
    reason: 'You are receiving this because you upgraded your Ancestorii account to Premium.',
  };
}

function paymentFailedEmail(name: string): Letter {
  const greeting = name ? `Hi ${name}, nothing to worry about.` : 'Hi, nothing to worry about.';
  const first = 'We tried to renew your Ancestorii Premium subscription, but your card did not go through this time. It happens often, usually an expired card or a small bank hiccup.';
  const second = 'Your memories are completely safe. Nothing has been deleted, and everything you have created is exactly where you left it. This is only about the payment.';
  const third = 'To keep your subscription running, update your card and we will take care of the rest. If you have already sorted it, you can ignore this note.';
  return {
    subject: 'A quick note about your Ancestorii payment',
    preheader: 'Your card did not go through. Your memories are safe.',
    eyebrow: 'PAYMENT',
    heading: 'A quick note about your payment.',
    bodyHtml: [p(`${esc(greeting)} ${esc(first)}`), p(esc(second)), p(esc(third))].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', wrap(second), '', wrap(third)].join('\n'),
    button: { label: 'Update payment details', href: `${SITE_URL}/dashboard/plans` },
    facts: [
      { label: 'PLAN', value: 'Premium' },
      { label: 'YOUR MEMORIES', value: 'Safe and untouched' },
    ],
    reason: 'You are receiving this because a payment for your Ancestorii Premium subscription did not go through.',
  };
}

function subscriptionCanceledEmail(name: string): Letter {
  const greeting = name ? `Thank you for being here, ${name}.` : 'Thank you for being here.';
  const first = 'Your Ancestorii Premium subscription has come to an end, and that is completely okay. No guilt, no hard feelings.';
  const second = 'Your memories stay. Every photo, story, voice note and timeline you have added is still here, safe and yours. Nothing is locked away and nothing is deleted.';
  const third = 'The only thing that pauses is adding new content beyond the free limits. Whenever you are ready, you can resubscribe and pick up exactly where you left off.';
  return {
    subject: 'Your Ancestorii Premium has ended. Your memories stay.',
    preheader: 'Nothing is deleted. Everything you added is still yours.',
    eyebrow: 'SUBSCRIPTION',
    heading: 'Your memories stay.',
    bodyHtml: [p(`${esc(greeting)} ${esc(first)}`), p(esc(second)), p(esc(third))].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', wrap(second), '', wrap(third)].join('\n'),
    button: { label: 'Resubscribe any time', href: `${SITE_URL}/dashboard/plans` },
    facts: [
      { label: 'PLAN', value: 'Free' },
      { label: 'YOUR MEMORIES', value: 'Safe and untouched' },
    ],
    reason: 'You are receiving this because your Ancestorii Premium subscription ended.',
  };
}

function bookOrderEmail(name: string, bookTitle: string, tierName: string, shippingMethod?: string): Letter {
  const isExpress = shippingMethod === "Express";
  const deliveryLine = isExpress
    ? "Posted to your door by Express delivery (5 to 7 working days)."
    : "Posted to your door by Standard delivery (10 to 14 working days).";
  return orderLetter(name, bookTitle, tierName, "Memory Book", shippingMethod, [
    { title: "We prepare your book for print", text: "Every page is checked and sent to the press." },
    { title: "Printed on premium 200gsm gloss pages", text: "Rich colour, built to be handled for years." },
    { title: "Bound in a hardcover matte finish", text: "A real book, made to sit on a shelf." },
    { title: "On its way", text: deliveryLine },
  ]);
}


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const FULFILL_SECRET = Deno.env.get("FULFILL_SECRET");
    const SITE = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://www.ancestorii.com";

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing Stripe environment variables");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const body = await req.arrayBuffer();
    const payload = new TextDecoder().decode(body);

    const sig = req.headers.get("stripe-signature");
    if (!sig) throw new Error("Missing Stripe signature");

    const event = await stripe.webhooks.constructEventAsync(
      payload,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Supabase is not configured");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

   // 1️⃣ checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // ── BOOK ORDER (one-time payment) ──
      if (session.metadata?.type === "book_order") {
        const orderId = session.metadata?.order_id;
        const bookId = session.metadata?.book_id;
        const userId = session.metadata?.user_id;

        if (!orderId || !bookId || !userId) {
          return new Response("Missing book order metadata", { status: 200 });
        }

        // ── Idempotency check: skip if this order is already paid ──
        // Stripe retries webhooks aggressively. Without this, every retry
        // re-runs the order update, re-sends the email, and re-triggers fulfillment.
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (existingOrder?.payment_status === "paid") {
          console.log("Order already processed, skipping duplicate webhook:", orderId);
          return new Response("Already processed", { status: 200 });
        }

        // Extract shipping address from Stripe
        const shipping = session.shipping_details ?? session.customer_details;
        const address = shipping?.address;

        // Read the SELECTED shipping method + actual amounts charged.
        const bookShip = await deriveShippingInfo(stripe, session);

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent,
            shipping_name: shipping?.name ?? null,
            shipping_line1: address?.line1 ?? null,
            shipping_line2: address?.line2 ?? null,
            shipping_city: address?.city ?? null,
            shipping_state: address?.state ?? null,
            shipping_postal: address?.postal_code ?? null,
            shipping_country: address?.country ?? null,
            shipping_email: session.customer_details?.email ?? null,
            shipping_phone: session.customer_details?.phone ?? null,
            shipping_method: bookShip.method,
            shipping_amount: bookShip.shippingAmount,
            amount_charged: bookShip.amountCharged,
          })
          .eq("id", orderId);

        // Update book status
        await supabase
          .from("memory_books")
          .update({ status: "ordered" })
          .eq("id", bookId);

        // ── SEND BOOK ORDER EMAIL ──
        try {
          const customerEmail = session.customer_details?.email ?? session.customer_email;
          const customerName = shipping?.name ?? session.customer_details?.name ?? "";

          if (customerEmail) {
            const { data: bookData } = await supabase
              .from("memory_books")
              .select("title, tier_name")
              .eq("id", bookId)
              .maybeSingle();

            const email = bookOrderEmail(
              customerName,
              bookData?.title ?? "Memory Book",
              bookData?.tier_name ?? "Memory Book",
              bookShip.method
            );

            await sendEmail(customerEmail, email, `order-${session.id}`);
          }
        } catch (emailErr) {
          console.error("Book order email failed:", emailErr);
        }

        // ── TRIGGER FULFILLMENT (in the background, see triggerFulfil) ──
        inBackground(triggerFulfil({
          url: `${SITE}/api/fulfill/${bookId}`,
          secret: FULFILL_SECRET || "",
          orderId,
          product: "Memory Book",
          customerEmail: session.customer_details?.email ?? null,
        }));

        return new Response("Book order handled", { status: 200 });
      }

      // ══════════════════════════════════════════════
      // ── CANVAS ORDER (one-time payment) ──
      // ══════════════════════════════════════════════
      if (session.metadata?.type === "canvas_order") {
        const orderId = session.metadata?.order_id;
        const canvasId = session.metadata?.canvas_id;
        const userId = session.metadata?.user_id;

        if (!orderId || !canvasId || !userId) {
          return new Response("Missing canvas order metadata", { status: 200 });
        }

        const { data: existingOrder } = await supabase
          .from("canvas_orders")
          .select("payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (existingOrder?.payment_status === "paid") {
          console.log("Canvas order already processed, skipping:", orderId);
          return new Response("Already processed", { status: 200 });
        }

        const shipping = session.shipping_details ?? session.customer_details;
        const address = shipping?.address;

        await supabase
          .from("canvas_orders")
          .update({
            payment_status: "paid",
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent,
            shipping_name: shipping?.name ?? null,
            shipping_line1: address?.line1 ?? null,
            shipping_line2: address?.line2 ?? null,
            shipping_city: address?.city ?? null,
            shipping_state: address?.state ?? null,
            shipping_postal: address?.postal_code ?? null,
            shipping_country: address?.country ?? null,
            shipping_email: session.customer_details?.email ?? null,
            shipping_phone: session.customer_details?.phone ?? null,
          })
          .eq("id", orderId);

        await supabase
          .from("memory_canvases")
          .update({ status: "ordered" })
          .eq("id", canvasId);

        // Store the SELECTED shipping method + actual amounts from Stripe checkout.
        const canvasShip = await deriveShippingInfo(stripe, session);
        const canvasShippingMethod = canvasShip.method;
        await supabase
          .from("canvas_orders")
          .update({
            shipping_method: canvasShippingMethod,
            shipping_amount: canvasShip.shippingAmount,
            amount_charged: canvasShip.amountCharged,
          })
          .eq("id", orderId);

        // ── SEND CANVAS ORDER EMAIL ──
        try {
          const customerEmail = session.customer_details?.email ?? session.customer_email;
          const customerName = shipping?.name ?? session.customer_details?.name ?? "";

          if (customerEmail) {
            const { data: canvasData } = await supabase
              .from("memory_canvases")
              .select("title, tier_name")
              .eq("id", canvasId)
              .maybeSingle();

            const email = canvasOrderEmail(
              customerName,
              canvasData?.title ?? "Memory Canvas",
              canvasData?.tier_name ?? "Memory Canvas",
              canvasShippingMethod
            );

            await sendEmail(customerEmail, email, `order-${session.id}`);
          }
        } catch (emailErr) {
          console.error("Canvas order email failed:", emailErr);
        }

        // ── TRIGGER CANVAS FULFILLMENT (in the background, see triggerFulfil) ──
        inBackground(triggerFulfil({
          url: `${SITE}/api/fulfill/canvas/${canvasId}`,
          secret: FULFILL_SECRET || "",
          orderId,
          product: "Memory Canvas",
          customerEmail: session.customer_details?.email ?? null,
        }));

        return new Response("Canvas order handled", { status: 200 });
      }

      // ══════════════════════════════════════════════
      // ── ACRYLIC ORDER (one-time payment) ──
      // ══════════════════════════════════════════════
      if (session.metadata?.type === "acrylic_order") {
        const orderId = session.metadata?.order_id;
        const acrylicId = session.metadata?.acrylic_id;
        const userId = session.metadata?.user_id;

        if (!orderId || !acrylicId || !userId) {
          return new Response("Missing acrylic order metadata", { status: 200 });
        }

        const { data: existingOrder } = await supabase
          .from("acrylic_orders")
          .select("payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (existingOrder?.payment_status === "paid") {
          console.log("Acrylic order already processed, skipping:", orderId);
          return new Response("Already processed", { status: 200 });
        }

        const shipping = session.shipping_details ?? session.customer_details;
        const address = shipping?.address;

        await supabase
          .from("acrylic_orders")
          .update({
            payment_status: "paid",
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent,
            shipping_name: shipping?.name ?? null,
            shipping_line1: address?.line1 ?? null,
            shipping_line2: address?.line2 ?? null,
            shipping_city: address?.city ?? null,
            shipping_state: address?.state ?? null,
            shipping_postal: address?.postal_code ?? null,
            shipping_country: address?.country ?? null,
            shipping_email: session.customer_details?.email ?? null,
            shipping_phone: session.customer_details?.phone ?? null,
          })
          .eq("id", orderId);

        await supabase
          .from("acrylic_prints")
          .update({ status: "ordered" })
          .eq("id", acrylicId);

        // Store the SELECTED shipping method + actual amounts from Stripe checkout.
        const acrylicShip = await deriveShippingInfo(stripe, session);
        const acrylicShippingMethod = acrylicShip.method;
        await supabase
          .from("acrylic_orders")
          .update({
            shipping_method: acrylicShippingMethod,
            shipping_amount: acrylicShip.shippingAmount,
            amount_charged: acrylicShip.amountCharged,
          })
          .eq("id", orderId);

        // ── SEND ACRYLIC ORDER EMAIL ──
        try {
          const customerEmail = session.customer_details?.email ?? session.customer_email;
          const customerName = shipping?.name ?? session.customer_details?.name ?? "";

          if (customerEmail) {
            const { data: acrylicData } = await supabase
              .from("acrylic_prints")
              .select("title, tier_name")
              .eq("id", acrylicId)
              .maybeSingle();

            const email = acrylicOrderEmail(
              customerName,
              acrylicData?.title ?? "Acrylic Print",
              acrylicData?.tier_name ?? "Acrylic Print",
              acrylicShippingMethod
            );

            await sendEmail(customerEmail, email, `order-${session.id}`);
          }
        } catch (emailErr) {
          console.error("Acrylic order email failed:", emailErr);
        }

        // ── TRIGGER ACRYLIC FULFILLMENT (in the background, see triggerFulfil) ──
        inBackground(triggerFulfil({
          url: `${SITE}/api/fulfill/acrylic/${acrylicId}`,
          secret: FULFILL_SECRET || "",
          orderId,
          product: "Acrylic Print",
          customerEmail: session.customer_details?.email ?? null,
        }));

        return new Response("Acrylic order handled", { status: 200 });
      }

      // ── SUBSCRIPTION (existing logic, untouched) ──
      const userId =
        session.metadata?.user_id ?? session.client_reference_id;
      const planName = session.metadata?.plan;
      const stripeSubId = session.subscription;
      const customerId = session.customer;

      if (!userId || !planName || !stripeSubId) {
        return new Response("Missing metadata", { status: 200 });
      }

      const stripeSub = await stripe.subscriptions.retrieve(
        typeof stripeSubId === "string" ? stripeSubId : stripeSubId.id
      );

      const { data: planRow } = await supabase
        .from("plans")
        .select("id")
        .eq("name", planName)
        .maybeSingle();

      if (!planRow?.id) {
        return new Response("Unknown plan", { status: 200 });
      }

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan_id: planRow.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubId,
          status: "active",
          cancel_at_period_end: stripeSub.cancel_at_period_end ?? false,
          current_period_end: new Date(
            stripeSub.current_period_end * 1000
          ).toISOString(),
        },
        { onConflict: "user_id" }
      );

      // ── SEND PREMIUM UPGRADE EMAIL ──
      try {
        const customerEmail = session.customer_details?.email ?? session.customer_email;
        const customerName = session.customer_details?.name ?? "";

        if (customerEmail) {
          const email = premiumUpgradeEmail(customerName);
          await sendEmail(customerEmail, email, `order-${session.id}`);
        }
      } catch (emailErr) {
        console.error("Premium email failed:", emailErr);
      }

      return new Response("Checkout handled", { status: 200 });
    }

    // 1️⃣b checkout.session.expired: abandoned print checkout.
    // A redeemed reward code is consumed BEFORE payment, so an abandoned/expired
    // session would otherwise burn a single-use code forever. Release it back to
    // 'issued' and cancel the dangling unpaid order. (expired and completed are
    // mutually exclusive for a given session, so this never frees a paid order.)
    // NOTE: requires the webhook endpoint to be subscribed to checkout.session.expired.
    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const type = session.metadata?.type;
      const orderId = session.metadata?.order_id;
      const rewardCode = session.metadata?.reward_code;

      const tableByType: Record<string, string> = {
        book_order: "orders",
        canvas_order: "canvas_orders",
        acrylic_order: "acrylic_orders",
      };
      const table = type ? tableByType[type] : undefined;

      if (table && orderId) {
        const { data: ord } = await supabase
          .from(table)
          .select("payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (ord && ord.payment_status !== "paid") {
          if (rewardCode) {
            await supabase.rpc("release_reward_code", {
              p_code: rewardCode,
              p_order_ref: orderId,
            });
          }
          await supabase
            .from(table)
            .update({ status: "cancelled" })
            .eq("id", orderId);
        }
      }

      return new Response("Session expired handled", { status: 200 });
    }

    // 2️⃣ invoice.paid
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          cancel_at_period_end: false,
          current_period_end: invoice.lines?.data?.[0]?.period?.end
            ? new Date(
                invoice.lines.data[0].period.end * 1000
              ).toISOString()
            : null,
        })
        .eq("stripe_customer_id", invoice.customer);

      return new Response("Invoice handled", { status: 200 });
    }

    // 3️⃣ invoice.payment_failed
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;

      await supabase
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("stripe_customer_id", invoice.customer);

      // ── Send the payment-failed email (front line against involuntary churn) ──
      try {
        const { email, name } = await resolveContact(
          stripe,
          invoice.customer as string,
          invoice.customer_email,
          invoice.customer_name,
        );
        if (email) {
          const mail = paymentFailedEmail(name);
          await sendEmail(email, mail, `payment-failed-${event.id}`);
        }
      } catch (emailErr) {
        console.error("Payment-failed email failed:", emailErr);
      }

      return new Response("Payment failed handled", { status: 200 });
    }

    // 4️⃣ customer.subscription.deleted
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: true,
          current_period_end: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      // ── Send the cancellation email (a re-subscribe door, not a goodbye) ──
      try {
        const { email, name } = await resolveContact(
          stripe,
          subscription.customer as string,
        );
        if (email) {
          const mail = subscriptionCanceledEmail(name);
          await sendEmail(email, mail, `subscription-ended-${subscription.id}`);
        }
      } catch (emailErr) {
        console.error("Cancellation email failed:", emailErr);
      }

      return new Response("Subscription canceled", { status: 200 });
    }

    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: (err as Error)?.message ?? String(err) }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});

// ══════════════════════════════════════════════════════════
// Canvas and acrylic order confirmation emails
// ══════════════════════════════════════════════════════════
function canvasOrderEmail(name: string, canvasTitle: string, tierName: string, shippingMethod?: string): Letter {
  const isExpress = shippingMethod === 'Express';
  const deliveryLine = isExpress
    ? "Posted to your door by Express delivery (5 to 7 working days)."
    : "Posted to your door by Standard delivery (10 to 14 working days).";
  return orderLetter(name, canvasTitle, tierName, "Memory Canvas", shippingMethod, [
    { title: "We prepare your canvas for print", text: "Your image is checked and sent to the press." },
    { title: "Printed on 400gsm gallery-grade canvas", text: "Deep colour that holds for decades." },
    { title: "Stretched on a 38mm bar, image wrapped", text: "Ready to hang the moment it arrives." },
    { title: "On its way", text: deliveryLine },
  ]);
}

function acrylicOrderEmail(name: string, acrylicTitle: string, tierName: string, shippingMethod?: string): Letter {
  const isExpress = shippingMethod === 'Express';
  const deliveryLine = isExpress
    ? "Posted to your door by Express delivery (5 to 7 working days)."
    : "Posted to your door by Standard delivery (10 to 14 working days).";
  return orderLetter(name, acrylicTitle, tierName, "Acrylic Print", shippingMethod, [
    { title: "We prepare your print for production", text: "Your image is checked and sent to the press." },
    { title: "Printed on crystal-clear acrylic", text: "Vivid colour with real depth." },
    { title: "Float-mount hardware included", text: "Effortless to hang." },
    { title: "On its way", text: deliveryLine },
  ]);
}

// ══════════════════════════════════════════════════════════
// Shared order confirmation letter
// ══════════════════════════════════════════════════════════
function orderLetter(
  name: string,
  productTitle: string,
  tierName: string,
  productLabel: string,
  shippingMethod: string | undefined,
  list: Array<{ title: string; text: string }>,
): Letter {
  const lower = productLabel.toLowerCase();
  const greeting = name ? `Thank you, ${name}.` : 'Thank you.';
  const first = `Your ${lower} "${productTitle}" (${tierName}) is now being prepared for production.`;
  const second = `Please allow up to 14 working days for your ${lower} to arrive. If it has not reached you by then, reply to this email and we will sort it out straight away.`;
  return {
    subject: `Your ${lower} order is confirmed`,
    preheader: `"${productTitle}" is being prepared for print.`,
    eyebrow: 'ORDER CONFIRMED',
    heading: `Your ${lower} is on its way to print.`,
    bodyHtml: [
      p(`${esc(greeting)} Your ${esc(lower)} <strong>&ldquo;${esc(productTitle)}&rdquo;</strong> (${esc(tierName)}) is now being prepared for production.`),
      p('Here is what happens next.', true),
      steps(list),
      p(esc(second)),
    ].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', 'Here is what happens next.', '', stepsText(list), '', wrap(second)].join('\n'),
    button: { label: 'Track your order', href: `${SITE_URL}/dashboard/orders` },
    facts: [
      { label: 'YOUR ORDER', value: productTitle },
      { label: 'PRODUCT', value: `${productLabel} (${tierName})` },
      { label: 'DELIVERY', value: shippingMethod || 'Standard' },
    ],
    reason: `You are receiving this because you ordered a ${lower} from Ancestorii.`,
  };
}
