import Stripe from "npm:stripe@14.21.0";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Email helper ──
async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY — skipping email");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ancestorii <support@ancestorii.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
    }
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

// ── Resolve a customer's email + name from a Stripe customer id ──
// Subscription/invoice events carry no checkout session, so we read the
// contact straight from Stripe (with invoice-provided values preferred).
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

// ── Email templates ──
function premiumUpgradeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to Ancestorii Premium",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Welcome to Ancestorii Premium</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">

          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">
                Membership confirmed
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">
                Ancestorii
              </p>
            </td>
          </tr>

          <tr><td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:48px 40px 36px 40px;">

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">
                Thank you${name ? `, ${name}` : ''}.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Your upgrade to Ancestorii Premium is confirmed. You now have access to expanded storage and all premium features to preserve and share your family's most precious memories.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Your subscription is active and will renew automatically each month. You can manage it anytime from your Plans page.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                If you have any questions, just reply to this email.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://www.ancestorii.com/dashboard/our-family" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:0;">
                — The Ancestorii Team
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">
                Ancestorii Ltd &middot; London
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;">
                <a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

function paymentFailedEmail(name: string): { subject: string; html: string } {
  return {
    subject: "A quick note about your Ancestorii payment",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>A quick note about your Ancestorii payment</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">

          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">
                A gentle heads up
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">
                Ancestorii
              </p>
            </td>
          </tr>

          <tr><td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:48px 40px 36px 40px;">

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">
                Hi${name ? ` ${name}` : ''}, nothing to worry about.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                We tried to renew your Ancestorii Premium subscription, but your card did not go through this time. It happens often, usually an expired card or a small bank hiccup, and it is nothing to worry about.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Your memories are completely safe. Nothing has been deleted, and everything you have created is exactly where you left it. This is only about the payment.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                To keep your subscription running, just update your card and we will take care of the rest. If you have already sorted it, you can ignore this note.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://www.ancestorii.com/dashboard/plans" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Update payment details
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:0;">
                — The Ancestorii Team
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">
                Ancestorii Ltd &middot; London
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;">
                <a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

function subscriptionCanceledEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Your Ancestorii Premium has ended — your memories stay",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your Ancestorii Premium has ended</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">

          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">
                Your library is safe
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">
                Ancestorii
              </p>
            </td>
          </tr>

          <tr><td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:48px 40px 36px 40px;">

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">
                Thank you for being here${name ? `, ${name}` : ''}.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Your Ancestorii Premium subscription has come to an end, and that is completely okay. No guilt, no hard feelings.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Your memories stay. Every photo, story, voice note and timeline you have added is still here, safe and yours. You keep full access to view and revisit everything you have built. Nothing is locked away, and nothing is deleted.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                The only thing that pauses is adding new content beyond the free limits. Whenever you are ready, you can resubscribe and pick up exactly where you left off.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://www.ancestorii.com/dashboard/plans" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Resubscribe anytime
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:0;">
                — The Ancestorii Team
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">
                Ancestorii Ltd &middot; London
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;">
                <a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

function bookOrderEmail(name: string, bookTitle: string, tierName: string): { subject: string; html: string } {
  return {
    subject: `Your memory book order is confirmed`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your memory book order is confirmed</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">

          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">
                Order confirmed
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">
                Ancestorii
              </p>
            </td>
          </tr>

          <tr><td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:48px 40px 36px 40px;">

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">
                Thank you${name ? `, ${name}` : ''}.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Your memory book <em style="font-style:italic; color:#16120c;">"${bookTitle}"</em> (${tierName}) is now being prepared for print.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 28px 0;">
                Here's what happens next:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">1.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    We prepare your book for printing.
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">2.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    Your book is printed on premium 200gsm gloss pages.
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">3.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    Bound in a hardcover matte finish.
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">4.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    Shipped directly to your door — free worldwide.
                  </td>
                </tr>
              </table>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Please allow up to <strong style="color:#16120c; font-weight:600;">14 days</strong> for your book to arrive. If it hasn't reached you by then, contact us at <a href="mailto:support@ancestorii.com" style="color:#ab8232; text-decoration:none;">support@ancestorii.com</a> and we'll sort it out straight away.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                You can track your order anytime in the Orders section inside Ancestorii.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://www.ancestorii.com/dashboard/orders" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:0;">
                — The Ancestorii Team
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">
                Ancestorii Ltd &middot; London
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;">
                <a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

serve(async (req) => {
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
              bookData?.tier_name ?? "Memory Book"
            );

            await sendEmail(customerEmail, email.subject, email.html);
          }
        } catch (emailErr) {
          console.error("Book order email failed:", emailErr);
        }

        // ── TRIGGER FULFILLMENT ──
        try {
          const fulfillUrl = `${SITE}/api/fulfill/${bookId}`;

          const fulfillRes = await fetch(fulfillUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-fulfill-secret": FULFILL_SECRET || "",
            },
            body: JSON.stringify({ order_id: orderId }),
          });

          if (!fulfillRes.ok) {
            const errText = await fulfillRes.text();
            console.error("Fulfill trigger failed:", fulfillRes.status, errText);
          } else {
            console.log("Fulfill triggered successfully for order:", orderId);
          }
        } catch (fulfillErr) {
          console.error("Fulfill trigger error:", fulfillErr);
        }

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

        // Store shipping method from Stripe checkout selection
        const canvasShippingMethod = (session.shipping_cost?.amount_total ?? 0) > 0 ? 'Express' : 'Standard';
        await supabase
          .from("canvas_orders")
          .update({ shipping_method: canvasShippingMethod })
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

            await sendEmail(customerEmail, email.subject, email.html);
          }
        } catch (emailErr) {
          console.error("Canvas order email failed:", emailErr);
        }

        // ── TRIGGER CANVAS FULFILLMENT ──
        try {
          const fulfillUrl = `${SITE}/api/fulfill/canvas/${canvasId}`;

          const fulfillRes = await fetch(fulfillUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-fulfill-secret": FULFILL_SECRET || "",
            },
            body: JSON.stringify({ order_id: orderId }),
          });

          if (!fulfillRes.ok) {
            const errText = await fulfillRes.text();
            console.error("Canvas fulfill trigger failed:", fulfillRes.status, errText);
          } else {
            console.log("Canvas fulfill triggered for order:", orderId);
          }
        } catch (fulfillErr) {
          console.error("Canvas fulfill trigger error:", fulfillErr);
        }

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

        // Store shipping method from Stripe checkout selection
        const acrylicShippingMethod = (session.shipping_cost?.amount_total ?? 0) > 0 ? 'Express' : 'Standard';
        await supabase
          .from("acrylic_orders")
          .update({ shipping_method: acrylicShippingMethod })
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

            await sendEmail(customerEmail, email.subject, email.html);
          }
        } catch (emailErr) {
          console.error("Acrylic order email failed:", emailErr);
        }

        // ── TRIGGER ACRYLIC FULFILLMENT ──
        try {
          const fulfillUrl = `${SITE}/api/fulfill/acrylic/${acrylicId}`;

          const fulfillRes = await fetch(fulfillUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-fulfill-secret": FULFILL_SECRET || "",
            },
            body: JSON.stringify({ order_id: orderId }),
          });

          if (!fulfillRes.ok) {
            const errText = await fulfillRes.text();
            console.error("Acrylic fulfill trigger failed:", fulfillRes.status, errText);
          } else {
            console.log("Acrylic fulfill triggered for order:", orderId);
          }
        } catch (fulfillErr) {
          console.error("Acrylic fulfill trigger error:", fulfillErr);
        }

        return new Response("Acrylic order handled", { status: 200 });
      }

      // ── SUBSCRIPTION (existing logic — untouched) ──
      const userId =
        session.metadata?.user_id ?? session.client_reference_id;
      const planName = session.metadata?.plan;
      const stripeSubId = session.subscription;
      const customerId = session.customer;

      if (!userId || !planName || !stripeSubId) {
        return new Response("Missing metadata", { status: 200 });
      }

      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

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
          await sendEmail(customerEmail, email.subject, email.html);
        }
      } catch (emailErr) {
        console.error("Premium email failed:", emailErr);
      }

      return new Response("Checkout handled", { status: 200 });
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
          await sendEmail(email, mail.subject, mail.html);
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
          await sendEmail(email, mail.subject, mail.html);
        }
      } catch (emailErr) {
        console.error("Cancellation email failed:", emailErr);
      }

      return new Response("Subscription canceled", { status: 200 });
    }

    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});

// ══════════════════════════════════════════════════════════
// NEW: Canvas order confirmation email
// ══════════════════════════════════════════════════════════
function canvasOrderEmail(name: string, canvasTitle: string, tierName: string, shippingMethod?: string): { subject: string; html: string } {
  const isExpress = shippingMethod === 'Express';
  const deliveryLine = isExpress
    ? "Shipped directly to your door via Express delivery (5–7 working days)."
    : "Shipped directly to your door — free Standard delivery (10–14 working days).";

  return {
    subject: `Your memory canvas order is confirmed`,
    html: orderConfirmationHtml(name, canvasTitle, tierName, "Memory Canvas", [
      "We prepare your canvas for printing.",
      "Your image is printed on 400gsm gallery-grade canvas.",
      "Stretched on a 38mm premium stretcher bar with imagewrap finish.",
      deliveryLine,
    ]),
  };
}

// ══════════════════════════════════════════════════════════
// NEW: Acrylic order confirmation email
// ══════════════════════════════════════════════════════════
function acrylicOrderEmail(name: string, acrylicTitle: string, tierName: string, shippingMethod?: string): { subject: string; html: string } {
  const isExpress = shippingMethod === 'Express';
  const deliveryLine = isExpress
    ? "Shipped directly to your door via Express delivery (5–7 working days)."
    : "Shipped directly to your door — free Standard delivery (10–14 working days).";

  return {
    subject: `Your acrylic print order is confirmed`,
    html: orderConfirmationHtml(name, acrylicTitle, tierName, "Acrylic Print", [
      "We prepare your print for production.",
      "Your image is printed on crystal-clear acrylic with vivid colour depth.",
      "Float-mount hardware is included for effortless hanging.",
      deliveryLine,
    ]),
  };
}

// ══════════════════════════════════════════════════════════
// Shared order confirmation email builder
// ══════════════════════════════════════════════════════════
function orderConfirmationHtml(
  name: string,
  productTitle: string,
  tierName: string,
  productLabel: string,
  steps: string[]
): string {
  const stepsHtml = steps
    .map(
      (step, i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">${i + 1}.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    ${step}
                  </td>
                </tr>
              </table>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your ${productLabel.toLowerCase()} order is confirmed</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">
          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">Order confirmed</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">Ancestorii</p>
            </td>
          </tr>
          <tr><td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:48px 40px 36px 40px;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">Thank you${name ? `, ${name}` : ''}.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">Your ${productLabel.toLowerCase()} <em style="font-style:italic; color:#16120c;">"${productTitle}"</em> (${tierName}) is now being prepared for production.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 28px 0;">Here's what happens next:</p>
              ${stepsHtml}
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:22px 0 22px 0;">Please allow up to <strong style="color:#16120c; font-weight:600;">14 working days</strong> for your ${productLabel.toLowerCase()} to arrive. If it hasn't reached you by then, contact us at <a href="mailto:support@ancestorii.com" style="color:#ab8232; text-decoration:none;">support@ancestorii.com</a> and we'll sort it out straight away.</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">You can track your order anytime in the Orders section inside Ancestorii.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://www.ancestorii.com/dashboard/orders" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">Track Your Order</a>
                  </td>
                </tr>
              </table>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:0;">— The Ancestorii Team</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">Ancestorii Ltd &middot; London</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;"><a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}