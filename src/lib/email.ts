// src/lib/email.ts
// The API routes' side of the one email shell. The renderer lives with the
// Edge Functions (supabase/functions/_shared/letter.ts, plain TypeScript with
// no runtime API) so every email the product sends is drawn the same way.

import { html, text, type Letter } from '../../supabase/functions/_shared/letter';

export * from '../../supabase/functions/_shared/letter';

export const FROM_TEAM = 'Ancestorii <support@ancestorii.com>';

export type SendResult = { ok: true; id: string | null } | { ok: false; status: number; message: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One send through Resend, retried once or twice if its rate limit answers. */
export async function sendEmail(args: {
  to: string;
  letter: Letter;
  idempotencyKey?: string;
  from?: string;
  replyTo?: string;
  tag?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, status: 0, message: 'RESEND_API_KEY is not set' };

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        ...(args.idempotencyKey ? { 'Idempotency-Key': args.idempotencyKey.slice(0, 256) } : {}),
      },
      body: JSON.stringify({
        from: args.from ?? FROM_TEAM,
        to: [args.to],
        reply_to: args.replyTo ?? 'support@ancestorii.com',
        subject: args.letter.subject,
        html: html(args.letter),
        text: text(args.letter),
        ...(args.tag ? { tags: [{ name: 'kind', value: args.tag }] } : {}),
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

/** A plain internal note to the team (reports, moderation alerts): no letter shell, just facts. */
export function internalNote(title: string, rows: Array<[string, string]>, extra?: string): Letter {
  const esc = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const list = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0; font-size:12px; font-weight:700; letter-spacing:1px; color:#7A7A85; white-space:nowrap; vertical-align:top;">${esc(k.toUpperCase())}</td><td style="padding:6px 0; font-size:15px; line-height:22px; color:#0A0A0F; word-break:break-word;">${esc(v)}</td></tr>`,
    )
    .join('');
  return {
    subject: title,
    preheader: rows.map(([k, v]) => `${k}: ${v}`).join(' · ').slice(0, 140),
    eyebrow: 'INTERNAL',
    heading: title,
    bodyHtml: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">${list}</table>${extra ?? ''}`,
    bodyText: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    reason: 'An internal note from the Ancestorii platform.',
  };
}
