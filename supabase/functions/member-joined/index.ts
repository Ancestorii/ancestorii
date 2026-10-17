// supabase/functions/member-joined/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// SOMEONE JOINED A FAMILY. Two letters:
//   1. "You're in" to the person who just joined;
//   2. "Your family is growing" to everyone already there.
//
// Called by the "member-joined" database trigger (AFTER INSERT on
// public.family_memberships). Deploys with verify_jwt off and checks the
// shared `x-webhook-secret` (see _shared/email.ts).
//
// A solo family creation (the row every new account gets) is skipped: this
// only fires when someone joins an existing family by invite or link.
//
// The welcome letter from the founder (welcome-email) fires at the same
// moment for a brand new account, so this one waits a beat and sends its
// letters one after another, inside Resend's two-a-second limit.
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

export function welcomeLetter(name: string | null, familyName: string): Letter {
  const greeting = name ? `Welcome, ${name}.` : 'Welcome.';
  const first = `You are now part of ${familyName} on Ancestorii: a private space where your family keeps the stories, photos and voices that matter, between the people who were invited.`;
  const second =
    'Start by reading what is already there. Then add a photo, a memory or a story of your own. Every person who adds to it makes it richer for everyone else.';

  return {
    subject: `Welcome to ${familyName} on Ancestorii`,
    preheader: `You are in. ${familyName} is waiting for you.`,
    eyebrow: "YOU'RE IN",
    heading: `Welcome to ${familyName}.`,
    bodyHtml: [p(`${esc(greeting)} ${esc(first)}`), p(esc(second))].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', wrap(second)].join('\n'),
    button: { label: 'Open your family', href: `${SITE_URL}/dashboard/our-family` },
    facts: [
      { label: 'FAMILY', value: familyName },
      { label: 'WHO CAN SEE IT', value: 'Only invited members' },
    ],
    reason: `You are receiving this because you joined ${familyName} on Ancestorii.`,
  };
}

export function notifyLetter(newMemberName: string, familyName: string): Letter {
  const first = `${newMemberName} just joined ${familyName} on Ancestorii. They can now read your family's memories, add their own photos and stories, and help keep what matters.`;
  const second = 'The more people adding to it, the richer the story becomes. Go and say hello.';

  return {
    subject: `${newMemberName} just joined ${familyName}`,
    preheader: `${newMemberName} is now part of ${familyName}.`,
    eyebrow: 'FAMILY UPDATE',
    heading: 'Your family is growing.',
    bodyHtml: [p(`<strong>${esc(newMemberName)}</strong> ${esc(first.slice(newMemberName.length + 1))}`), p(esc(second))].join(''),
    bodyText: [wrap(first), '', wrap(second)].join('\n'),
    button: { label: 'See your family', href: `${SITE_URL}/dashboard/family` },
    facts: [
      { label: 'NEW MEMBER', value: newMemberName },
      { label: 'FAMILY', value: familyName },
    ],
    reason: `You are receiving this because you are a member of ${familyName} on Ancestorii.`,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req: Request) => {
  const denied = unauthorized(req);
  if (denied) return denied;

  let payload: { record?: { id?: string; user_id?: string; family_id?: string }; mode?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  if (payload.mode === 'preview') return preview(welcomeLetter('Jordan', 'The Smiths'));
  if (payload.mode === 'preview-notify') return preview(notifyLetter('Jordan Smith', 'The Smiths'));

  const record = payload.record;
  if (!record?.user_id || !record.family_id) return json({ error: 'missing_membership_data' }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const newUserId = record.user_id;
  const familyId = record.family_id;
  const membershipKey = record.id ?? `${familyId}-${newUserId}`;

  const { count } = await admin
    .from('family_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId);
  if ((count || 0) <= 1) return json({ skipped: true, reason: 'solo_family_creation' });

  const { data: newMember } = await admin.from('Profiles').select('full_name, email').eq('id', newUserId).maybeSingle();
  if (!newMember?.email) return json({ skipped: true, reason: 'no_new_member_email' });

  const { data: family } = await admin.from('families').select('name').eq('id', familyId).maybeSingle();
  const familyName = family?.name || 'your family';

  const { data: others } = await admin
    .from('family_memberships')
    .select('user_id')
    .eq('family_id', familyId)
    .neq('user_id', newUserId);
  const otherIds = (others || []).map((m: { user_id: string }) => m.user_id);

  let otherEmails: string[] = [];
  if (otherIds.length > 0) {
    const { data: profiles } = await admin.from('Profiles').select('email').in('id', otherIds);
    otherEmails = (profiles || []).map((r: { email: string | null }) => r.email).filter(Boolean) as string[];
  }

  // Let the founder's welcome letter (fired by the same signup) go first.
  await sleep(1500);

  const results: Array<{ to: string; ok: boolean; detail?: string }> = [];

  const welcome = await send({
    to: newMember.email,
    letter: welcomeLetter(firstName(newMember.full_name), familyName),
    idempotencyKey: `joined-${membershipKey}-welcome`,
    tag: 'member-joined',
  });
  results.push({ to: newMember.email, ok: welcome.ok, detail: welcome.ok ? undefined : welcome.message });

  const newMemberName = (newMember.full_name ?? '').trim() || 'A new family member';
  for (const email of otherEmails) {
    await sleep(600);
    const r = await send({
      to: email,
      letter: notifyLetter(newMemberName, familyName),
      idempotencyKey: `joined-${membershipKey}-notify-${email}`,
      tag: 'member-joined-notify',
    });
    results.push({ to: email, ok: r.ok, detail: r.ok ? undefined : r.message });
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;
  if (failed) console.error('member-joined: some sends failed', JSON.stringify(results.filter((r) => !r.ok)));
  console.log(`member-joined: sent ${sent}, failed ${failed} for family ${familyId}`);
  return json({ sent, failed });
});
