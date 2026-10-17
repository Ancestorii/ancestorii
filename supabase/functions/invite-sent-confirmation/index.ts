// supabase/functions/invite-sent-confirmation/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// "Your invite is on its way": the note the INVITER gets after sending one.
//
// Called by the "invite-sent-confirmation" database trigger (AFTER INSERT on
// public.family_invites). Deploys with verify_jwt off and checks the shared
// `x-webhook-secret` (see _shared/email.ts). One email per invite row.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  esc,
  firstName,
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

export function letter(name: string | null, inviteeEmail: string, familyName: string): Letter {
  const greeting = name ? `Nice one, ${name}.` : 'Nice one.';
  const first = `We have sent an invitation to ${inviteeEmail} to join ${familyName} on Ancestorii.`;
  const second =
    'Once they accept, they can read what is already there, add their own photos, memories and stories, and help you build something that lasts.';
  const third =
    'Their link is valid for 7 days. If it has not arrived, ask them to check their spam folder, or send it again from your family page.';

  return {
    subject: `Your invite to ${inviteeEmail} is on its way`,
    preheader: `${inviteeEmail} has been invited to ${familyName}.`,
    eyebrow: 'INVITE SENT',
    heading: 'Your invite is on its way.',
    bodyHtml: [
      p(`${esc(greeting)} We have sent an invitation to <strong>${esc(inviteeEmail)}</strong> to join <strong>${esc(familyName)}</strong> on Ancestorii.`),
      p(esc(second)),
      p(esc(third), true),
    ].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', wrap(second), '', wrap(third)].join('\n'),
    button: { label: 'Back to your family', href: `${SITE_URL}/dashboard/family` },
    facts: [
      { label: 'INVITED', value: inviteeEmail, breakable: true },
      { label: 'TO JOIN', value: familyName },
      { label: 'LINK VALID FOR', value: '7 days' },
    ],
    reason: 'You are receiving this because you sent an invitation from your Ancestorii family.',
  };
}

Deno.serve(async (req: Request) => {
  const denied = unauthorized(req);
  if (denied) return denied;

  let payload: {
    record?: { id?: string; invited_by?: string; email?: string; family_id?: string };
    mode?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  if (payload.mode === 'preview') return preview(letter('Jordan', 'nan@example.com', 'The Smiths'));

  const record = payload.record;
  if (!record?.id || !record.invited_by || !record.email) return json({ error: 'missing_invite_data' }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: inviter } = await admin
    .from('Profiles')
    .select('full_name, email')
    .eq('id', record.invited_by)
    .maybeSingle();

  if (!inviter?.email) {
    console.log('invite-sent-confirmation: no email for inviter', record.invited_by);
    return json({ skipped: true, reason: 'no_inviter_email' });
  }

  const { data: family } = await admin.from('families').select('name').eq('id', record.family_id).maybeSingle();

  const result = await send({
    to: inviter.email,
    letter: letter(firstName(inviter.full_name), record.email, family?.name || 'your family'),
    idempotencyKey: `invite-sent-${record.id}`,
    tag: 'invite-sent',
  });

  if (!result.ok) {
    console.error(`invite-sent-confirmation: Resend refused (${result.status}): ${result.message}`);
    return json({ sent: false, status: result.status, detail: result.message }, 500);
  }

  return json({ sent: true, id: result.id });
});
