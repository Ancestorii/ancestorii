// supabase/functions/family-activity/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// "SOMETHING NEW IN YOUR FAMILY": tells the other members when someone adds a
// loved one, a timeline, an album, a capsule, a Memory Book, a canvas or an
// acrylic print.
//
// Meant to be called by database triggers on those tables (none are wired at
// the moment; wiring one is a product decision, since it emails everyone on
// every creation). Deploys with verify_jwt off and checks the shared
// `x-webhook-secret` (see _shared/email.ts).
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  esc,
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

type ActivityInfo = { action: string; headline: string; what: string };

// deno-lint-ignore no-explicit-any
function getActivityInfo(table: string, record: any): ActivityInfo {
  const titled = (noun: string, title?: string | null) => (title ? `${noun} "${title}"` : noun);
  switch (table) {
    case 'family_members':
      return {
        action: `added a new loved one${record.name ? `, ${record.name}` : ''}`,
        headline: 'Someone new has been added to your family.',
        what: record.name ? `Loved one: ${record.name}` : 'A new loved one',
      };
    case 'timelines':
      return { action: `started a new timeline ${titled('', record.title).trim()}`.trim(), headline: 'A new timeline has been started.', what: titled('Timeline', record.title) };
    case 'albums':
      return { action: `created a new album ${titled('', record.title).trim()}`.trim(), headline: 'A new album has been created.', what: titled('Album', record.title) };
    case 'memory_capsules':
      return { action: `sealed a new time capsule ${titled('', record.title).trim()}`.trim(), headline: 'A time capsule has been sealed.', what: titled('Capsule', record.title) };
    case 'memory_books':
      return { action: `started a new Memory Book ${titled('', record.title).trim()}`.trim(), headline: 'A new Memory Book is being made.', what: titled('Memory Book', record.title) };
    case 'memory_canvases':
      return { action: `created a new canvas ${titled('', record.title).trim()}`.trim(), headline: 'A new canvas has been created.', what: titled('Canvas', record.title) };
    case 'acrylic_prints':
      return { action: `created a new acrylic print ${titled('', record.title).trim()}`.trim(), headline: 'A new acrylic print has been created.', what: titled('Acrylic print', record.title) };
    default:
      return { action: 'added something new to the library', headline: 'Something new has been added.', what: 'Something new' };
  }
}

// deno-lint-ignore no-explicit-any
function getCreatorId(table: string, record: any): string | null {
  if (table === 'family_members' || table === 'timelines') return record.owner_id || null;
  return record.user_id || null;
}

export function letter(creatorName: string, activity: ActivityInfo, familyName: string): Letter {
  const first = `${creatorName} just ${activity.action} in ${familyName}.`;
  const second = 'Head over to your family library to see what is new, and add your own memories while you are there.';
  return {
    subject: `${creatorName} ${activity.action} in ${familyName}`,
    preheader: activity.headline,
    eyebrow: 'FAMILY UPDATE',
    heading: activity.headline,
    bodyHtml: [p(`<strong>${esc(creatorName)}</strong> just ${esc(activity.action)} in <strong>${esc(familyName)}</strong>.`), p(esc(second))].join(''),
    bodyText: [wrap(first), '', wrap(second)].join('\n'),
    button: { label: 'View your library', href: `${SITE_URL}/dashboard/our-family` },
    facts: [
      { label: 'ADDED BY', value: creatorName },
      { label: 'WHAT', value: activity.what },
    ],
    reason: `You are receiving this because you are a member of ${familyName} on Ancestorii.`,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req: Request) => {
  const denied = unauthorized(req);
  if (denied) return denied;

  // deno-lint-ignore no-explicit-any
  let payload: { record?: any; table?: string; mode?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  if (payload.mode === 'preview') {
    return preview(letter('Jordan Smith', getActivityInfo('albums', { title: 'Summer 1994' }), 'The Smiths'));
  }

  const record = payload.record;
  const table = payload.table ?? '';
  if (!record) return json({ error: 'no_record' }, 400);

  const creatorId = getCreatorId(table, record);
  if (!creatorId) return json({ skipped: true, reason: 'no_creator_id' });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: creator } = await admin.from('Profiles').select('full_name').eq('id', creatorId).maybeSingle();
  const creatorName = creator?.full_name || 'A family member';

  let familyId: string | null = record.family_id || null;
  if (!familyId) {
    const { data: membership } = await admin.from('family_memberships').select('family_id').eq('user_id', creatorId).limit(1).maybeSingle();
    familyId = membership?.family_id || null;
  }
  if (!familyId) return json({ skipped: true, reason: 'no_family_id' });

  const { data: family } = await admin.from('families').select('name').eq('id', familyId).maybeSingle();
  const familyName = family?.name || 'your family';

  const { data: memberships } = await admin.from('family_memberships').select('user_id').eq('family_id', familyId).neq('user_id', creatorId);
  if (!memberships || memberships.length === 0) return json({ skipped: true, reason: 'no_other_members' });

  const { data: profiles } = await admin
    .from('Profiles')
    .select('email')
    .in('id', memberships.map((m: { user_id: string }) => m.user_id));
  const emails = (profiles || []).map((r: { email: string | null }) => r.email).filter(Boolean) as string[];
  if (emails.length === 0) return json({ skipped: true, reason: 'no_recipient_emails' });

  const activity = getActivityInfo(table, record);
  let sent = 0;
  let failed = 0;
  for (const email of emails) {
    const r = await send({
      to: email,
      letter: letter(creatorName, activity, familyName),
      idempotencyKey: `activity-${table}-${record.id ?? crypto.randomUUID()}-${email}`,
      tag: 'family-activity',
    });
    if (r.ok) sent++;
    else {
      failed++;
      console.error(`family-activity: Resend refused (${r.status}) for ${email}: ${r.message}`);
    }
    await sleep(600);
  }

  console.log(`family-activity: sent ${sent}, failed ${failed} for table=${table}`);
  return json({ sent, failed, table, familyId });
});
