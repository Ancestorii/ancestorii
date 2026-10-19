import Stripe from "npm:stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
        display_name: "Standard Shipping (10 to 14 working days)",
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
        display_name: "Express Shipping (5 to 7 working days)",
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
// NOTE (product policy: flagged for review): 'memory_book_chapter' → Chapter book only;
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
        : { ok: false, message: "This reward is a free Chapter memory book. Choose a Chapter book to redeem it." };
    }
    if (meta.product_key === "any_print_standard") {
      return tierKey === standardTier
        ? { ok: true }
        : { ok: false, message: "This reward covers a free print at standard size. Switch to the standard tier to redeem it." };
    }
  }
  return { ok: false, message: "This reward code cannot be applied to this product." };
}

const PRODUCT = "book" as const;
const STANDARD_TIER = "chapter";

type Currency = "GBP" | "USD" | "EUR";

// ── The book tiers: the Stripe price per currency and the amount written on the order ──
// Which tier applies comes from the book ROW (fixed when the book was created, with its page
// count), never from the request: a tier_key the browser sends is only checked against it.
const TIERS: Record<string, { prices: Record<Currency, string | undefined>; amounts: Record<Currency, number> }> = {
  chapter: {
    prices: {
      GBP: Deno.env.get("STRIPE_BOOK_CHAPTER_GBP"),
      USD: Deno.env.get("STRIPE_BOOK_CHAPTER_USD"),
      EUR: Deno.env.get("STRIPE_BOOK_CHAPTER_EUR"),
    },
    amounts: { GBP: 44.99, USD: 59.99, EUR: 49.99 },
  },
  story: {
    prices: {
      GBP: Deno.env.get("STRIPE_BOOK_STORY_GBP"),
      USD: Deno.env.get("STRIPE_BOOK_STORY_USD"),
      EUR: Deno.env.get("STRIPE_BOOK_STORY_EUR"),
    },
    amounts: { GBP: 54.99, USD: 74.99, EUR: 64.99 },
  },
  legacy: {
    prices: {
      GBP: Deno.env.get("STRIPE_BOOK_LEGACY_GBP"),
      USD: Deno.env.get("STRIPE_BOOK_LEGACY_USD"),
      EUR: Deno.env.get("STRIPE_BOOK_LEGACY_EUR"),
    },
    amounts: { GBP: 64.99, USD: 84.99, EUR: 74.99 },
  },
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
    const requestedTier = typeof body?.tier_key === "string" ? body.tier_key : "";
    const bookId = typeof body?.book_id === "string" ? body.book_id : "";
    const currencyRaw = body?.currency;
    const currency: Currency =
      currencyRaw === "USD" || currencyRaw === "EUR" ? currencyRaw : "GBP";
    const rewardCode =
      typeof body?.reward_code === "string"
        ? body.reward_code.trim().toUpperCase()
        : "";

    if (!bookId) throw new HttpError(400, "No book_id provided");

    const SITE =
      Deno.env.get("NEXT_PUBLIC_SITE_URL") ??
      "https://www.ancestorii.com";

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new HttpError(500, "Checkout is not configured");
    }

    // ── Auth ──
    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization");

    if (!authHeader) throw new HttpError(401, "Missing Authorization header");

    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userResp } = await supabase.auth.getUser(token);

    const userId = userResp?.user?.id;
    if (!userId) throw new HttpError(401, "Not authenticated");

    // ── The book row is what is being bought: tier, size and page count come from it ──
    const { data: book, error: bookErr } = await supabase
      .from("memory_books")
      .select("id, user_id, family_id, title, tier_key, tier_name, price_gbp, book_size, total_page_limit, content_page_limit")
      .eq("id", bookId)
      .maybeSingle();

    if (bookErr || !book) {
      throw new HttpError(404, "Book not found");
    }

    // Access: the rule the app's row security applies (a member of the book's family). A book
    // with no family falls back to its creator.
    let allowed = false;
    if (book.family_id) {
      const { data: bookMembership } = await supabase
        .from("family_memberships")
        .select("id")
        .eq("user_id", userId)
        .eq("family_id", book.family_id)
        .limit(1)
        .maybeSingle();
      allowed = !!bookMembership;
    } else {
      allowed = book.user_id === userId;
    }
    if (!allowed) throw new HttpError(403, "You don't have access to this book");

    // ── Tier and price from the row, never from the request ──
    const tierKey: string = book.tier_key;
    const tier = TIERS[tierKey];
    if (!tier) throw new HttpError(400, `This book has a tier that cannot be ordered (${tierKey})`);
    if (requestedTier && requestedTier !== tierKey) {
      throw new HttpError(400, "The tier sent does not match this book. Reload the page and try again.");
    }

    const priceId = tier.prices[currency];
    if (!priceId) {
      throw new HttpError(500, `No price is configured for the ${tierKey} tier in ${currency}`);
    }
    const priceAmount = tier.amounts[currency];

    // ── Ready to print? create_memory_book_with_pages makes every content page up front and the
    //    editor never adds or removes one, so fewer pages than the tier allows means the book is
    //    broken (the PDF would be short of the page count Prodigi is told). And a book with no
    //    photo on any page would print as blank pages. ──
    const { data: counted, error: countErr } = await supabase
      .from("memory_books_with_page_count")
      .select("created_content_pages")
      .eq("id", bookId)
      .maybeSingle();
    if (countErr) throw new HttpError(500, "Could not check the book");
    const pagesMade = counted?.created_content_pages ?? 0;
    const pagesNeeded = Number(book.content_page_limit ?? 0);
    if (pagesNeeded > 0 && pagesMade < pagesNeeded) {
      throw new HttpError(400, `This book has ${pagesMade} of its ${pagesNeeded} pages. Open it in the editor again before ordering.`);
    }

    const { data: pageRows, error: pagesErr } = await supabase
      .from("memory_book_pages")
      .select("id")
      .eq("book_id", bookId);
    if (pagesErr) throw new HttpError(500, "Could not check the book's pages");
    const pageIds = (pageRows ?? []).map((pg: { id: string }) => pg.id);
    let photos = 0;
    if (pageIds.length > 0) {
      const { count, error: assetsErr } = await supabase
        .from("memory_book_page_assets")
        .select("id", { count: "exact", head: true })
        .in("page_id", pageIds);
      if (assetsErr) throw new HttpError(500, "Could not check the book's photos");
      photos = count ?? 0;
    }
    if (photos < 1) {
      throw new HttpError(400, "Add at least one photo to your book before ordering.");
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

    // ── Premium discount: the buyer's own subscription, or any family they belong to, on an
    //    active Premium plan. One query over every membership, so a two-family member is not
    //    skipped (the old single-row lookup errored for them and quietly charged full price). ──
    let isPremium = false;
    const { data: premiumPlan } = await supabase
      .from("plans")
      .select("id")
      .eq("name", "Premium")
      .maybeSingle();

    if (premiumPlan) {
      const { data: memberships } = await supabase
        .from("family_memberships")
        .select("family_id")
        .eq("user_id", userId);
      const familyIds = (memberships ?? [])
        .map((m: { family_id: string | null }) => m.family_id)
        .filter((id: string | null): id is string => !!id);
      const scope = familyIds.length
        ? `user_id.eq.${userId},family_id.in.(${familyIds.join(",")})`
        : `user_id.eq.${userId}`;

      const { data: premiumSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("plan_id", premiumPlan.id)
        .eq("status", "active")
        .or(scope)
        .limit(1)
        .maybeSingle();

      isPremium = !!premiumSub;
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
      if (verr) throw new HttpError(500, "Could not validate reward code");
      if (!vres?.ok) throw new HttpError(400, rewardErrorMessage(vres?.reason));

      const elig = checkRewardEligibility(vres, PRODUCT, STANDARD_TIER, tierKey);
      if (!elig.ok) throw new HttpError(400, elig.message ?? "This reward code cannot be applied to this product.");

      rewardMeta = vres;
    }

    // ── Create order record (the row's tier and that tier's price) ──
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
        reward_code: rewardMeta ? rewardCode : null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("orders insert failed:", orderErr?.message);
      throw new HttpError(500, "Failed to create order");
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
        // Lost the race / already used / expired between validate and redeem,
        // clean up the orphan order so nothing dangles.
        await supabase.from("orders").delete().eq("id", order.id);
        throw rerr
          ? new HttpError(500, "Could not redeem reward code")
          : new HttpError(400, rewardErrorMessage(rres?.reason));
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
        // Roll the redemption back so the code is reusable, then drop the order.
        await supabase.rpc("release_reward_code", { p_code: rewardCode, p_order_ref: order.id });
        await supabase.from("orders").delete().eq("id", order.id);
        throw new HttpError(500, "Could not apply reward discount");
      }
    }

    // ── No-stacking: a reward coupon always wins and SUPPRESSES the heirloom coupon.
    //    Only when no reward is applied do we fall back to heirloom (premium) or the
    //    hosted promotion-code field. discounts + allow_promotion_codes are mutually
    //    exclusive in Stripe, so exactly one branch is chosen.
    let discountConfig: Record<string, unknown>;
    if (rewardCouponId) {
      discountConfig = { discounts: [{ coupon: rewardCouponId }] };
    } else if (isPremium && couponId) {
      discountConfig = { discounts: [{ coupon: couponId }] };
    } else {
      discountConfig = { allow_promotion_codes: true };
    }

    // ── Create Stripe Checkout ──
    const successUrl = `${SITE}/dashboard/books/${bookId}?order_success=true&order_id=${order.id}`;
    const cancelUrl = `${SITE}/dashboard/books/${bookId}?order_canceled=true`;

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
          tier_name: book.tier_name ?? "",
          book_size: book.book_size ?? "",
          page_count: String(book.total_page_limit ?? ""),
          currency,
          user_id: userId,
          reward_code: rewardMeta ? rewardCode : "",
        },
      });
    } catch (sessErr) {
      // No session, no order: free the code (if one was consumed) and drop the orphan row.
      if (rewardCouponId) {
        await supabase.rpc("release_reward_code", { p_code: rewardCode, p_order_ref: order.id });
      }
      await supabase.from("orders").delete().eq("id", order.id);
      throw sessErr;
    }

    if (!session.url) throw new HttpError(500, "Failed to create checkout session");

    // ── Save Stripe session ID to order ──
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return jsonResponse({ url: session.url }, 200);
  } catch (err) {
    if (err instanceof HttpError) {
      console.warn(`Book checkout refused (${err.status}): ${err.message}`);
      return jsonResponse({ error: err.message }, err.status);
    }
    console.error("Book checkout error:", err);
    return jsonResponse({ error: "Something went wrong starting checkout. Please try again." }, 500);
  }
});
