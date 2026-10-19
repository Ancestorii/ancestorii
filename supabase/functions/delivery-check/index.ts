// supabase/functions/delivery-check/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// "IT SHOULD BE WITH YOU NOW": seven days after an order ships it is marked
// delivered and the founder writes to ask how it looks.
//
// Called once a day by the "delivery-check-daily" pg_cron job through
// net.http_post. Postgres has no user JWT, so this deploys with verify_jwt
// off and checks the shared `x-webhook-secret` (see _shared/email.ts).
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  esc,
  firstName,
  FROM_DANTE,
  json,
  p,
  preview,
  send,
  SERVICE_ROLE_KEY,
  SITE_URL,
  SUPABASE_URL,
  unauthorized,
  wrap,
  type Letter,
} from '../_shared/email.ts';

type Kind = 'book' | 'canvas' | 'acrylic';

const LABEL: Record<Kind, string> = { book: 'Memory Book', canvas: 'Memory Canvas', acrylic: 'Acrylic Print' };

export function letter(name: string | null, title: string, kind: Kind): Letter {
  const label = LABEL[kind];
  const greeting = name ? `${name},` : 'Hello,';
  const first = `by now your ${label} should be with you.`;
  const second =
    kind === 'book'
      ? `"${title}" started as a few photos and an idea. Now it is something your family can pick up, pass around, and come back to in twenty years.`
      : `"${title}" started as photos on a screen. Now it is something real: on your wall, in your home, part of the room.`;
  const third = 'That is the whole point of what we do.';
  const fourth = 'If you have a moment, I would love to hear what you think. Just reply to this email. Every one comes straight to me.';
  const ps =
    kind === 'book'
      ? 'If anything is not right with the book, the printing, the binding, anything, tell me. I will fix it personally.'
      : 'If anything is not right with the print, tell me. I will fix it personally.';

  return {
    subject: `Your ${label} has arrived`,
    preheader: `${title} should be with you now. How does it look?`,
    eyebrow: 'DELIVERED',
    heading: `Your ${label} should be with you.`,
    bodyHtml: [p(`${esc(greeting)} ${esc(first)}`), p(esc(second)), p(esc(third)), p(esc(fourth))].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', wrap(second), '', third, '', wrap(fourth)].join('\n'),
    note: ps,
    signature: { name: 'Dante', title: 'Founder, Ancestorii' },
    facts: [
      { label: 'YOUR ORDER', value: title },
      { label: 'PRODUCT', value: label },
    ],
    reason: `You are receiving this because you ordered a ${label} from Ancestorii.`,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req: Request) => {
  const denied = unauthorized(req);
  if (denied) return denied;

  let payload: { mode?: string; kind?: Kind } = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }
  if (payload.mode === 'preview') return preview(letter('Jordan', 'The Smiths, 1962 to today', payload.kind ?? 'book'));

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();

    let emailsSent = 0;

    const run = async (
      kind: Kind,
      ordersTable: string,
      productTable: string,
      productKey: string,
      fallbackTitle: string,
    ) => {
      const { data: orders, error } = await admin
        .from(ordersTable)
        .select(`id, shipping_email, shipping_name, ${productKey}, shipped_at`)
        .eq('status', 'shipped')
        .not('shipped_at', 'is', null)
        .lt('shipped_at', cutoff);

      if (error) {
        console.error(`delivery-check: failed to query ${ordersTable}:`, error.message);
        return;
      }
      console.log(`delivery-check: ${orders?.length ?? 0} ${kind} orders to mark as delivered`);

      // deno-lint-ignore no-explicit-any
      for (const order of (orders || []) as any[]) {
        const productId = order[productKey];
        const { data: product } = await admin.from(productTable).select('title').eq('id', productId).maybeSingle();
        const title = product?.title || fallbackTitle;

        if (order.shipping_email) {
          const r = await send({
            to: order.shipping_email,
            from: FROM_DANTE,
            letter: letter(firstName(order.shipping_name), title, kind),
            idempotencyKey: `delivered-${kind}-${order.id}`,
            tag: 'delivered',
          });
          if (r.ok) emailsSent++;
          else {
            console.error(`delivery-check: Resend refused (${r.status}) for ${order.id}: ${r.message}`);
            // Resend down, rate-limiting us, or no key set: leave the order 'shipped' so tomorrow's
            // run writes again (the Idempotency-Key stops a late duplicate). A 4xx is final, a bad
            // address say, and the order is still marked delivered below.
            if (r.status === 0 || r.status === 429 || r.status >= 500) {
              await sleep(600);
              continue;
            }
          }
          await sleep(600);
        }

        await admin.from(ordersTable).update({ status: 'delivered', prodigi_status: 'delivered' }).eq('id', order.id);
        await admin.from(productTable).update({ prodigi_status: 'delivered' }).eq('id', productId);
      }
    };

    await run('book', 'orders', 'memory_books', 'book_id', 'your Memory Book');
    await run('canvas', 'canvas_orders', 'memory_canvases', 'canvas_id', 'your Memory Canvas');
    await run('acrylic', 'acrylic_orders', 'acrylic_prints', 'acrylic_id', 'your Acrylic Print');

    return json({ success: true, emailsSent });
  } catch (err) {
    console.error('delivery-check error:', err);
    return json({ error: String(err) }, 500);
  }
});
