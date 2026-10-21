// supabase/functions/prompt-answered-email/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// "They answered": the note the SENDER of a question gets when it is answered.
//
// Called by the "prompt-answered-email" database trigger (AFTER UPDATE on
// public.sent_prompts). Fires only on the transition to status 'answered'.
// Deploys with verify_jwt off and checks the shared `x-webhook-secret`.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  esc,
  firstName,
  FROM_TEAM,
  json,
  p,
  preview,
  quote,
  send,
  SERVICE_ROLE_KEY,
  SITE_URL,
  SUPABASE_URL,
  unauthorized,
  wrap,
  type Letter,
} from '../_shared/email.ts';

export function letter(senderName: string | null, recipientName: string, question: string, memoryUrl: string): Letter {
  const greeting = senderName ? `${senderName},` : 'Hello,';
  const first = `${recipientName} answered your question. The memory is waiting for you.`;
  const second = 'They took the time to write it down. That matters more than you think. Go and read what they remembered.';

  return {
    subject: `${recipientName} answered your question`,
    preheader: question ? `"${question}"` : `${recipientName} wrote a memory for you.`,
    eyebrow: 'A NEW MEMORY',
    heading: `${recipientName} answered.`,
    bodyHtml: [
      p(`${esc(greeting)} <strong>${esc(recipientName)}</strong> answered your question. The memory is waiting for you.`),
      question ? quote(question, 'You asked') : '',
      p(esc(second)),
    ].join(''),
    bodyText: [wrap(`${greeting} ${first}`), '', question ? `You asked: "${question}"` : '', '', wrap(second)].join('\n'),
    button: { label: 'Read their memory', href: memoryUrl },
    note: 'This is what Ancestorii is for.',
    signature: { name: 'Dante', title: 'Founder, Ancestorii' },
    reason: `You are receiving this because you sent ${recipientName} a question on Ancestorii.`,
  };
}

Deno.serve(async (req: Request) => {
  const denied = unauthorized(req);
  if (denied) return denied;

  let payload: {
    record?: Record<string, unknown>;
    old_record?: Record<string, unknown>;
    mode?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  if (payload.mode === 'preview') {
    return preview(letter('Jordan', 'Nan', 'What is your earliest childhood memory?', `${SITE_URL}/dashboard/our-family`));
  }

  const record = payload.record;
  if (!record?.id) return json({ error: 'no_record' }, 400);

  if (record.status !== 'answered' || payload.old_record?.status === 'answered') {
    return json({ skipped: true, reason: 'not_answered_transition' });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const senderId = String(record.sender_id ?? '');
  if (!senderId) return json({ skipped: true, reason: 'no_sender' });

  const { data } = await admin.auth.admin.getUserById(senderId);
  const senderUser = data?.user;
  if (!senderUser?.email) return json({ skipped: true, reason: 'no_sender_email' });

  const { data: senderProfile } = await admin.from('Profiles').select('full_name').eq('id', senderId).maybeSingle();
  const senderName = firstName(senderProfile?.full_name ?? senderUser.user_metadata?.full_name ?? null);

  const recipientName = String(record.recipient_name ?? '').trim() || 'Someone';

  let question = String(record.custom_question ?? '').trim();
  if (!question && record.prompt_id) {
    const { data: prompt } = await admin.from('memory_prompts').select('question').eq('id', record.prompt_id).maybeSingle();
    question = prompt?.question ?? '';
  }

  const memoryUrl = record.response_memory_id
    ? `${SITE_URL}/dashboard/memories/${record.response_memory_id}`
    : `${SITE_URL}/dashboard/our-family`;

  const result = await send({
    to: senderUser.email,
    from: FROM_TEAM,
    letter: letter(senderName, recipientName, question, memoryUrl),
    idempotencyKey: `answered-${record.id}`,
    tag: 'prompt-answered',
  });

  if (!result.ok) {
    console.error(`prompt-answered-email: Resend refused (${result.status}): ${result.message}`);
    return json({ sent: false, status: result.status, detail: result.message }, 500);
  }

  console.log(`prompt-answered-email: sent to ${senderUser.email} (resend id ${result.id ?? '?'})`);
  return json({ sent: true, id: result.id });
});
