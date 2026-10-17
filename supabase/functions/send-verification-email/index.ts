// supabase/functions/send-verification-email/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// "CONFIRM IT'S YOU": the verification link a new account gets right after
// signing up (app/signup/_components/SignupForm.tsx invokes this with the
// user's own session, so the gateway's JWT check stays on).
//
// The token lives in public.email_verifications and is checked by
// /auth/confirm/verify-email.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  esc,
  json,
  p,
  send,
  SERVICE_ROLE_KEY,
  SITE_URL,
  SUPABASE_URL,
  wrap,
  type Letter,
} from '../_shared/email.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function letter(email: string, verifyUrl: string): Letter {
  const first = 'Thanks for joining Ancestorii. Press the button below to confirm this is your email address, and your account is all set.';
  const second = 'If you did not create this account, you can ignore this email and nothing will happen.';
  return {
    subject: 'Confirm your email for Ancestorii',
    preheader: 'One press and your account is confirmed.',
    eyebrow: 'CONFIRM YOUR EMAIL',
    heading: "Let's make sure it's you.",
    bodyHtml: [p(esc(first)), p(esc(second), true)].join(''),
    bodyText: [wrap(first), '', wrap(second)].join('\n'),
    button: { label: 'Confirm my email', href: verifyUrl },
    note: `If the button does not work, copy this link into your browser: ${verifyUrl}`,
    facts: [{ label: 'YOUR ACCOUNT', value: email, breakable: true }],
    reason: `You are receiving this because an Ancestorii account was just created for ${email}.`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const { userId, email } = (await req.json()) as { userId?: string; email?: string };
    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'Missing userId or email' }), { status: 400, headers: CORS_HEADERS });
    }

    // The address comes from the account, never from the request body.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await admin.auth.admin.getUserById(userId);
    const accountEmail = data?.user?.email;
    if (!accountEmail || accountEmail.toLowerCase() !== String(email).toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Email does not match the account' }), { status: 400, headers: CORS_HEADERS });
    }

    const token = crypto.randomUUID();
    await admin.from('email_verifications').insert({ user_id: userId, token });

    const verifyUrl = `${SITE_URL}/auth/confirm/verify-email?token=${token}`;
    const result = await send({
      to: accountEmail,
      letter: letter(accountEmail, verifyUrl),
      idempotencyKey: `verify-${token}`,
      tag: 'verify-email',
    });

    if (!result.ok) {
      console.error(`send-verification-email: Resend refused (${result.status}): ${result.message}`);
      return new Response(JSON.stringify({ error: 'Failed to send verification email' }), { status: 500, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
  } catch (e) {
    console.error('send-verification-email error:', e);
    return new Response(JSON.stringify({ error: 'Failed to send verification email' }), { status: 500, headers: CORS_HEADERS });
  }
});
