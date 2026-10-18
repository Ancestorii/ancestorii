import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Marks a "Confirm my email" token as used. The token is written to public.email_verifications
// by the send-verification-email Edge Function and opened from /auth/confirm/verify-email.
// Service role: the table is not readable from the browser, and holding the token is the proof.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token.trim() : '';

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // One statement: only an unused token is marked, and the row comes back if it was.
  const { data, error } = await admin
    .from('email_verifications')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)
    .is('used_at', null)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('verify-email error:', error.message);
    return NextResponse.json({ ok: false, error: 'Verification unavailable' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ ok: false, error: 'Invalid or used token' }, { status: 410 });
  }

  return NextResponse.json({ ok: true });
}
