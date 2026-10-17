// supabase/functions/_shared/email.ts
// ─────────────────────────────────────────────────────────────────────────────
// WHAT EVERY EDGE FUNCTION EMAIL SHARES: the environment, the guard every
// webhook passes through, and the one call to Resend.
//
// The Supabase CLI bundles this directory into every function that imports
// it, so the shell (letter.ts) is written once and reaches every letter on
// the next deploy.
//
// AUTHENTICATION. The database triggers and cron jobs that call these
// functions have no user JWT, and the gateway now rejects the legacy
// service-role JWT they used to carry (UNAUTHORIZED_LEGACY_JWT). So every
// function called from Postgres deploys with verify_jwt off and checks a
// shared secret in `x-webhook-secret` instead, compared in constant time.
//
// RATE LIMIT. Resend allows two requests a second. A 429 is retried after a
// short wait, and an Idempotency-Key makes the retry safe.
// ─────────────────────────────────────────────────────────────────────────────

import { html, text, type Letter } from './letter.ts';

export * from './letter.ts';

export const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
export const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
export const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
export const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';

export const FROM_TEAM = 'Ancestorii <support@ancestorii.com>';
export const FROM_DANTE = 'Dante from Ancestorii <support@ancestorii.com>';
export const FROM_ORDERS = 'Ancestorii <orders@ancestorii.com>';

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Constant-time compare, so the secret cannot be recovered a byte at a time. */
export function secretMatches(given: string, expected: string): boolean {
  if (!expected) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** The gate every webhook-called function opens with. */
export function unauthorized(req: Request): Response | null {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!secretMatches(req.headers.get('x-webhook-secret') ?? '', WEBHOOK_SECRET)) {
    return json({ error: 'unauthorized' }, 401);
  }
  return null;
}

export type SendResult = { ok: true; id: string | null } | { ok: false; status: number; message: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One send, with the retry Resend's rate limit asks for. */
export async function send(args: {
  to: string;
  letter: Letter;
  idempotencyKey: string;
  from?: string;
  replyTo?: string;
  tag?: string;
}): Promise<SendResult> {
  if (!RESEND_API_KEY) return { ok: false, status: 0, message: 'RESEND_API_KEY is not set' };

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Idempotency-Key': args.idempotencyKey.slice(0, 256),
      },
      body: JSON.stringify({
        from: args.from ?? FROM_TEAM,
        to: [args.to],
        reply_to: args.replyTo ?? 'support@ancestorii.com',
        subject: args.letter.subject,
        html: html(args.letter),
        text: text(args.letter),
        ...(args.tag ? { tags: [{ name: 'kind', value: args.tag }] } : {}),
        ...(args.letter.unsubscribe ? { headers: { 'List-Unsubscribe': `<${args.letter.unsubscribe}>` } } : {}),
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (res.status === 429 && attempt < 3) {
      await sleep(1200 * (attempt + 1));
      continue;
    }
    if (!res.ok) return { ok: false, status: res.status, message: body.message ?? `HTTP ${res.status}` };
    return { ok: true, id: body.id ?? null };
  }
  return { ok: false, status: 429, message: 'rate limited' };
}

/** A preview of the rendered letter, for checking the design. Sends nothing. */
export function preview(l: Letter): Response {
  return json({ subject: l.subject, html: html(l), text: text(l) });
}
