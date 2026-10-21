// supabase/functions/onboarding-drip/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE FOUNDER'S FOUR FOLLOW-UP LETTERS: day 3, 7, 14 and 21 after signup.
//
// Called once a day by the "onboarding-drip-daily" pg_cron job through
// net.http_post. Postgres has no user JWT, so this deploys with verify_jwt
// off and checks the shared `x-webhook-secret` (see _shared/email.ts).
//
// Each step is sent once per account: public.onboarding_emails_log is
// checked before and written after, and Resend gets an Idempotency-Key.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  esc,
  firstName,
  FROM_TEAM,
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

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SIGN = { name: 'Dante', title: 'Founder, Ancestorii' };
const UNSUBSCRIBE = 'mailto:support@ancestorii.com?subject=Stop%20the%20onboarding%20emails';

function founderLetter(args: {
  subject: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  greeting: string;
  paragraphs: string[];
  button: { label: string; href: string };
  note?: string;
}): Letter {
  const [first, ...rest] = args.paragraphs;
  return {
    subject: args.subject,
    preheader: args.preheader,
    eyebrow: args.eyebrow,
    heading: args.heading,
    bodyHtml: [p(`${esc(args.greeting)} ${esc(first)}`), ...rest.map((t) => p(esc(t)))].join(''),
    bodyText: [wrap(`${args.greeting} ${first}`), ...rest.map((t) => `\n${wrap(t)}`)].join('\n'),
    button: args.button,
    note: args.note,
    signature: SIGN,
    reason: 'You are receiving this because you created an Ancestorii account recently.',
    unsubscribe: UNSUBSCRIBE,
  };
}

export function day3(name: string | null): Letter {
  return founderLetter({
    subject: 'Who would you ask?',
    preheader: 'Someone came to mind just now. Send them one question.',
    eyebrow: 'DAY THREE',
    heading: 'Who would you ask?',
    greeting: name ? `${name},` : 'Hello,',
    paragraphs: [
      'when you think about the people who shaped your life, someone comes to mind first. You probably thought of them just now.',
      "What would you ask them? What is the one story you have heard a dozen times but never actually saved? What is the memory only they can tell?",
      'Ancestorii has dozens of ready-made questions, such as "What is your earliest childhood memory?" and "What meal reminds you most of home?". Pick one, type their name and email, and send it. They do not even need an account.',
      'When they answer, their memory appears in your family feed beside yours.',
    ],
    button: { label: 'Ask someone a question', href: `${SITE_URL}/dashboard/our-family` },
    note: 'If it feels strange to start, that is okay. It is supposed to feel like something.',
  });
}

export function day7(name: string | null): Letter {
  return founderLetter({
    subject: 'One question. One memory.',
    preheader: 'It takes them two minutes to answer. No app, no account.',
    eyebrow: 'DAY SEVEN',
    heading: 'One question. One memory.',
    greeting: name ? `${name},` : 'Hello,',
    paragraphs: [
      'the hardest part is starting. So start small.',
      'Think about someone in your family: your mum, your nan, your uncle. What is a story only they can tell? A recipe they never wrote down? A trip they always talk about? Something they remember differently to everyone else?',
      'Send them a question. It takes them two minutes to answer. They click the link, write what comes to mind, and their memory appears in your family feed. No app to download, no account to set up.',
      'What comes back might be something you never want to lose.',
    ],
    button: { label: 'Send a question', href: `${SITE_URL}/dashboard/our-family` },
    note: 'Not sure what to ask? The question library has chapters like Growing Up, Holidays, Around the Table, and The Stories We Always Retell.',
  });
}

export function day14(name: string | null): Letter {
  return founderLetter({
    subject: 'From your phone to your shelf',
    preheader: 'Your photos, laid out your way, printed as a hardcover book.',
    eyebrow: 'DAY FOURTEEN',
    heading: 'From your phone to your shelf.',
    greeting: name ? `${name},` : 'Hello,',
    paragraphs: [
      'there is something different about holding a photo in your hands rather than seeing it on a screen. It feels more real. More permanent.',
      'That is why we built Memory Books. You pick the photos from your family library, lay them out how you want, add your own words, and we print it as a hardcover book and post it to your door.',
      'It takes about 20 minutes to make. No templates, no restrictions. Your memories, your design.',
    ],
    button: { label: 'Create your book', href: `${SITE_URL}/dashboard/books` },
    note: 'We also do canvas and acrylic prints, for the photo that belongs on a wall rather than a phone.',
  });
}

export function day21(name: string | null): Letter {
  return founderLetter({
    subject: 'Before the memories fade',
    preheader: 'Nobody decides to forget. It just happens slowly.',
    eyebrow: 'DAY TWENTY-ONE',
    heading: 'Before the memories fade.',
    greeting: name ? `${name},` : 'Hello,',
    paragraphs: [
      'phones break. Cloud storage fills up. Hard drives fail. But it is not the files that are irreplaceable. It is the stories behind them.',
      'The sound of your nan’s laugh. The way your dad told that one story every Christmas. The photo your mum keeps in her purse.',
      'Nobody wakes up and decides to forget. It just happens slowly. And by the time you notice, it is too late.',
      'Your family feed is where those memories live: not scattered across phones and group chats, but in one private place where everyone can find them. The more your family adds, the richer it gets. It starts with one question.',
    ],
    button: { label: 'Open Ancestorii', href: `${SITE_URL}/dashboard/our-family` },
    note: 'Reply to this email if anything is getting in the way. I read every single one myself.',
  });
}

const DRIP_STEPS: Array<{ day: number; step: string; letter: (name: string | null) => Letter }> = [
  { day: 3, step: 'day_3', letter: day3 },
  { day: 7, step: 'day_7', letter: day7 },
  { day: 14, step: 'day_14', letter: day14 },
  { day: 21, step: 'day_21', letter: day21 },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function processDripStep(drip: (typeof DRIP_STEPS)[number]): Promise<number> {
  // The accounts created `day` days ago, and the day before that as well: a run that failed
  // (Resend down, the cron missed) would otherwise lose that step for good. onboarding_emails_log
  // keeps the second day from sending it twice. Everything is UTC, like the 09:00 UTC cron.
  const dates = new Set<string>();
  for (const back of [drip.day, drip.day + 1]) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - back);
    dates.add(d.toISOString().split('T')[0]);
  }

  const matched: { id: string; email: string; name: string | null }[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error(`onboarding-drip: listUsers failed for ${drip.step}:`, error.message);
      return 0;
    }
    const users = data?.users ?? [];
    if (users.length === 0) break;
    for (const u of users) {
      if (!u.created_at || !u.email) continue;
      if (dates.has(u.created_at.split('T')[0])) {
        matched.push({ id: u.id, email: u.email, name: u.user_metadata?.full_name ?? null });
      }
    }
    if (users.length < perPage) break;
    page++;
  }

  if (matched.length === 0) return 0;

  const { data: profileRows } = await admin
    .from('Profiles')
    .select('id, full_name')
    .in('id', matched.map((u) => u.id));
  const nameById = new Map<string, string>();
  for (const row of profileRows ?? []) if (row.full_name) nameById.set(row.id, row.full_name);

  let sentCount = 0;
  for (const user of matched) {
    const { data: existing } = await admin
      .from('onboarding_emails_log')
      .select('id')
      .eq('user_id', user.id)
      .eq('step', drip.step)
      .maybeSingle();
    if (existing) continue;

    const name = firstName(nameById.get(user.id) ?? user.name);
    const result = await send({
      to: user.email,
      from: FROM_TEAM,
      letter: drip.letter(name),
      idempotencyKey: `drip-${drip.step}-${user.id}`,
      tag: `drip-${drip.step}`,
    });

    if (result.ok) {
      await admin.from('onboarding_emails_log').insert({ user_id: user.id, step: drip.step, sent_at: new Date().toISOString() });
      sentCount++;
    } else {
      console.error(`onboarding-drip: Resend refused (${result.status}) for ${user.id} ${drip.step}: ${result.message}`);
    }
    await sleep(600);
  }
  return sentCount;
}

Deno.serve(async (req: Request) => {
  const denied = unauthorized(req);
  if (denied) return denied;

  let payload: { mode?: string; step?: string } = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  if (payload.mode === 'preview') {
    const step = DRIP_STEPS.find((d) => d.step === payload.step) ?? DRIP_STEPS[0];
    return preview(step.letter('Jordan'));
  }

  try {
    const results: Record<string, number> = {};
    for (const drip of DRIP_STEPS) results[drip.step] = await processDripStep(drip);
    console.log('onboarding-drip:', JSON.stringify(results));
    return json({ success: true, results });
  } catch (error) {
    console.error('onboarding-drip error:', error);
    return json({ error: String(error) }, 500);
  }
});
