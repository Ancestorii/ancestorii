import { createHash } from 'crypto';

// The URL Prodigi calls with order status events, built per order by the fulfil routes.
//
// It carries a secret so the prodigi-webhook function can refuse forged events, but not
// FULFILL_SECRET itself: Prodigi stores the callback URL on the order and echoes it in every
// event, and the gateway logs request URLs, so whatever sits in this URL must be worthless on
// its own. The secret is therefore a one-way hash of FULFILL_SECRET; the function derives the
// same value from its own copy (supabase/functions/prodigi-webhook/index.ts), and knowing the
// hash gives nobody the fulfil secret.
export function prodigiCallbackSecret(): string {
  return createHash('sha256').update(`${process.env.FULFILL_SECRET ?? ''}:prodigi-callback`).digest('hex');
}

export function prodigiCallbackUrl(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/prodigi-webhook?secret=${prodigiCallbackSecret()}`;
}
