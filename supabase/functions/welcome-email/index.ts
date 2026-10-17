// supabase/functions/welcome-email/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE FIRST THING A NEW ACCOUNT EVER RECEIVES: the founder's welcome letter.
//
// Called by the "welcome-email-on-signup" database trigger (AFTER INSERT on
// public."Profiles", through supabase_functions.http_request). Postgres has no
// user JWT, so this deploys with verify_jwt off and checks the shared
// `x-webhook-secret` instead (see _shared/email.ts).
//
// Sent once per account: the Idempotency-Key is the user's id.
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
  steps,
  stepsText,
  SUPABASE_URL,
  unauthorized,
  wrap,
  type Letter,
} from '../_shared/email.ts';

export function letter(name: string | null, email: string, familyName: string | null): Letter {
  const greeting = name ? `Welcome, ${name}.` : 'Welcome.';
  const opening =
    "Ancestorii was built because the stories in one family kept slipping away. You now have a private place where your family's stories, voices and photos live together, and where the people you invite can add their own.";
  const list = [
    {
      title: 'Write your first memory',
      text: "A moment, a person, a feeling you don't want to lose. It becomes the first entry in your family's private feed.",
    },
    {
      title: 'Ask someone a question',
      text: 'Pick one of the ready-made questions and send it to Mum, Grandad or anyone. When they answer, their memory sits beside yours.',
    },
    {
      title: 'Invite the family',
      text: 'Everything stays between the people you invite. The more of them who add to it, the richer it gets.',
    },
    {
      title: 'Hold it in your hands',
      text: 'When you are ready, turn your photos into a Memory Book, a canvas or an acrylic print, posted to your door.',
    },
  ];
  const closing = 'Ancestorii is not something you use alone. It is built for a family to fill together, one memory at a time.';

  return {
    subject: 'Welcome to Ancestorii',
    preheader: 'Your family library is open. Here is where to start.',
    eyebrow: 'WELCOME',
    heading: 'Your family library is open.',
    bodyHtml: [p(`${esc(greeting)} ${esc(opening)}`), p('Here is where to start.', true), steps(list), p(esc(closing))].join(''),
    bodyText: [wrap(`${greeting} ${opening}`), '', 'Here is where to start.', '', stepsText(list), '', wrap(closing)].join('\n'),
    button: { label: 'Open Ancestorii', href: `${SITE_URL}/dashboard/our-family` },
    note: 'Reply to this email any time. I read every one myself.',
    signature: { name: 'Dante', title: 'Founder, Ancestorii' },
    facts: [
      { label: 'YOUR ACCOUNT', value: email, breakable: true },
      ...(familyName ? [{ label: 'FAMILY LIBRARY', value: familyName }] : []),
    ],
    reason: `You are receiving this because an Ancestorii account was just created for ${email}.`,
  };
}

Deno.serve(async (req: Request) => {
  const denied = unauthorized(req);
  if (denied) return denied;

  let payload: { record?: { id?: string; email?: string | null; full_name?: string | null }; mode?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  if (payload.mode === 'preview') return preview(letter('Jordan', 'you@example.com', 'The Smiths'));

  const record = payload.record;
  if (!record?.id) return json({ error: 'no_record' }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let email = (record.email ?? '').trim();
  let name = firstName(record.full_name);

  if (!email || !name) {
    const { data } = await admin.auth.admin.getUserById(record.id);
    const user = data?.user;
    if (!email && user?.email) email = user.email;
    if (!name) name = firstName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null);
  }

  if (!email) {
    console.log('welcome-email: no email for user', record.id);
    return json({ skipped: true, reason: 'no_email' });
  }

  const { data: membership } = await admin
    .from('family_memberships')
    .select('family_id, families(name)')
    .eq('user_id', record.id)
    .limit(1)
    .maybeSingle();
  const familyRow = membership?.families as { name?: string } | { name?: string }[] | null | undefined;
  const familyName = Array.isArray(familyRow) ? familyRow[0]?.name ?? null : familyRow?.name ?? null;

  const result = await send({
    to: email,
    from: FROM_DANTE,
    letter: letter(name, email, familyName),
    idempotencyKey: `welcome-${record.id}`,
    tag: 'welcome',
  });

  if (!result.ok) {
    console.error(`welcome-email: Resend refused (${result.status}) for ${record.id}: ${result.message}`);
    return json({ sent: false, status: result.status, detail: result.message }, 500);
  }

  console.log(`welcome-email: sent to ${record.id} (resend id ${result.id ?? '?'})`);
  return json({ sent: true, id: result.id });
});
