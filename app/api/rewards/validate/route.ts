import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Read-only PREVIEW of a family reward code. Calls the SECURITY DEFINER
// validate_reward_code RPC with the REAL authenticated user id (derived server-side
// from the verified session, never trusted from the request body), then layers the
// same free-product eligibility check the checkout edge functions enforce. Redeeming
// (the atomic consume) happens only in the checkout function — this never mutates.

const STANDARD_TIER: Record<string, string> = {
  book: 'chapter',
  canvas: 'moment',
  acrylic: 'portrait',
};

function messageFor(reason?: string): string {
  switch (reason) {
    case 'not_found': return 'That reward code was not recognised.';
    case 'wrong_family': return 'That reward code belongs to a different family.';
    case 'already_used': return 'That reward code has already been used.';
    case 'expired': return 'That reward code has expired.';
    case 'void': return 'That reward code is no longer valid.';
    case 'unavailable': return 'That reward code is no longer available.';
    default: return 'That reward code could not be applied.';
  }
}

// MUST match checkRewardEligibility in the three create-*-checkout edge functions.
function checkEligibility(
  meta: { kind?: string; product_key?: string | null },
  product: 'book' | 'canvas' | 'acrylic',
  tierKey: string,
): { ok: boolean; message?: string } {
  if (meta.kind === 'discount_pct') return { ok: true };
  if (meta.kind === 'free_product') {
    if (meta.product_key === 'memory_book_chapter') {
      return product === 'book' && tierKey === 'chapter'
        ? { ok: true }
        : { ok: false, message: 'This reward is a free Chapter memory book — choose a Chapter book to redeem it.' };
    }
    if (meta.product_key === 'any_print_standard') {
      return tierKey === STANDARD_TIER[product]
        ? { ok: true }
        : { ok: false, message: 'This reward covers a free print at standard size — switch to the standard tier to redeem it.' };
    }
  }
  return { ok: false, message: 'This reward code cannot be applied to this product.' };
}

function labelFor(meta: { kind?: string; discount_pct?: number | null; product_key?: string | null }): string {
  if (meta.kind === 'discount_pct') return `${meta.discount_pct}% off`;
  if (meta.kind === 'free_product') {
    if (meta.product_key === 'memory_book_chapter') return 'Free Chapter book';
    return 'Free print (standard tier)';
  }
  return 'Reward applied';
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
  const product = body?.product;
  const tierKey = typeof body?.tier_key === 'string' ? body.tier_key : '';

  if (!code) {
    return NextResponse.json({ ok: false, reason: 'not_found', message: 'Enter a reward code.' });
  }
  if (product !== 'book' && product !== 'canvas' && product !== 'acrylic') {
    return NextResponse.json({ ok: false, reason: 'bad_request', message: 'Unknown product.' }, { status: 400 });
  }

  // Authenticated user (verified token, not getSession).
  const userClient = await getServerClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: 'unauthenticated', message: 'Please sign in to use a reward code.' }, { status: 401 });
  }

  // Service-role client to call the SECURITY DEFINER RPC with the trusted user id.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: vres, error } = await admin.rpc('validate_reward_code', {
    p_code: code,
    p_user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ ok: false, reason: 'error', message: 'Could not check that code right now.' }, { status: 500 });
  }
  if (!vres?.ok) {
    return NextResponse.json({ ok: false, reason: vres?.reason, message: messageFor(vres?.reason) });
  }

  const elig = checkEligibility(vres, product, tierKey);
  if (!elig.ok) {
    return NextResponse.json({ ok: false, reason: 'ineligible', message: elig.message });
  }

  return NextResponse.json({
    ok: true,
    label: labelFor(vres),
    kind: vres.kind,
    discount_pct: vres.discount_pct ?? null,
    product_key: vres.product_key ?? null,
  });
}
