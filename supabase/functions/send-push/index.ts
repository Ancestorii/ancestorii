// supabase/functions/send-push/index.ts
// Triggered by a Database Webhook on `notifications` INSERT.
//
// For each new notification row, look up the recipient's Expo push token(s) and send a
// push that mirrors the in-app bell's copy for that type. Push reuses the rows the app
// already writes: there is no event logic here, only delivery.
//
// Story-layer types (story_like / story_comment / story_share) are web-only and are
// never pushed to the mobile app. A failed push never throws: emails/other paths and
// the row itself are unaffected.
//
// AUTHENTICATION. Postgres has no user JWT and the gateway rejects the legacy
// service-role JWT, so this deploys with verify_jwt off and requires the shared
// `x-webhook-secret` (the same WEBHOOK_SECRET the email functions use).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// The types the mobile app surfaces (mirror of APP_NOTIFICATION_TYPES in
// lib/notifications.ts). Anything else (e.g. story_*) is skipped.
const PUSHABLE_TYPES = new Set([
  'memory_reaction',
  'memory_comment',
  'memory_addition',
  'prompt_answered',
  'prompt_received',
  'album_created',
  'family_member_joined',
]);

// Push body copy: short and warm (banners truncate), with a gentle nudge to open the
// app where it helps. Keeps the curly-quoted memory title where one is present.
function buildBody(type: string, actorName: string | null, memoryTitle: string | null): string {
  const who = actorName || 'Someone';
  const title = memoryTitle ? `“${memoryTitle}”` : null;
  switch (type) {
    case 'memory_reaction':
      return `${who} liked your memory${title ? ` ${title}` : ''}`;
    case 'memory_comment':
      return title
        ? `${who} just commented on your memory ${title}`
        : `${who} just commented on your recent memory`;
    case 'memory_addition':
      return `${who} just added a new memory${title ? `: ${title}` : ''}. Come and take a look`;
    case 'prompt_answered':
      return `${who} answered your question${title ? `: ${title}` : ''}`;
    case 'prompt_received':
      return `${who} asked you a question. Log in to answer`;
    case 'family_member_joined':
      return `${who} just joined your family. Log in to welcome them`;
    case 'album_created':
      return `${who} created a new album`;
    default:
      return 'You have a new notification';
  }
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function secretMatches(given: string, expected: string): boolean {
  if (!expected) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!secretMatches(req.headers.get('x-webhook-secret') ?? '', WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // deno-lint-ignore no-explicit-any
  let payload: { record?: Record<string, any> };
  try {
    payload = await req.json();
  } catch {
    // Not valid JSON: return 200 so the webhook doesn't retry a poison body.
    return json({ skipped: true, reason: 'invalid_json' });
  }

  try {
    const record = payload?.record;

    if (!record || !record.user_id || !record.type) {
      return json({ skipped: true, reason: 'missing_record' });
    }

    // Only push types the mobile app renders, never web-only story notifications.
    if (!PUSHABLE_TYPES.has(record.type)) {
      return json({ skipped: true, reason: 'non_app_type', type: record.type });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Recipient opt-out gate. Push is skipped ONLY when a notification_preferences row
    // exists AND in_app === false. A missing row (or null) counts as opted in, matching
    // the column's default of true. If the read itself fails, log and proceed (fail
    // open): a transient read error must never silence the whole fanout.
    const { data: pref, error: prefError } = await supabase
      .from('notification_preferences')
      .select('in_app')
      .eq('user_id', record.user_id)
      .maybeSingle();
    if (prefError) {
      console.error('send-push: preferences read failed (fail open):', prefError);
    } else if (pref && pref.in_app === false) {
      return json({ skipped: true, reason: 'opted_out', userId: record.user_id });
    }

    // Recipient's device token(s). Service role bypasses RLS for the lookup.
    const { data: tokenRows } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', record.user_id);

    const tokens = (tokenRows || [])
      .map((r: { expo_push_token: string }) => r.expo_push_token)
      .filter(Boolean);

    if (tokens.length === 0) {
      return json({ skipped: true, reason: 'no_tokens', userId: record.user_id });
    }

    // Same memory-title enrichment the bell uses, only for the types that render a title.
    const TITLE_TYPES = new Set(['memory_reaction', 'memory_comment', 'memory_addition', 'prompt_answered']);
    let memoryTitle: string | null = null;
    if (TITLE_TYPES.has(record.type) && record.target_type === 'family_memory' && record.target_id) {
      const { data: mem } = await supabase
        .from('family_memories')
        .select('title')
        .eq('id', record.target_id)
        .maybeSingle();
      memoryTitle = mem?.title ?? null;
    }

    const body = buildBody(record.type, record.actor_name ?? null, memoryTitle);
    const data = {
      type: record.type,
      target_id: record.target_id ?? null,
      target_type: record.target_type ?? null,
      // The account this notification is FOR. The app checks it before applying a tapped
      // deep link, so a notification delivered to one user on a shared device can never be
      // routed under a different user who later signs in.
      user_id: record.user_id,
    };

    const messages = tokens.map((to: string) => ({
      to,
      title: 'Ancestorii',
      body,
      data,
      sound: 'default',
      priority: 'high',
      channelId: 'default',
    }));

    // Send in batches of 100 (Expo's per-request cap). Expo returns HTTP 200 even when an
    // individual message fails, so inspect each push ticket: count only 'ok', and
    // collect tokens Expo reports as DeviceNotRegistered so we can prune them.
    let pushed = 0;
    const deadTokens: string[] = [];
    try {
      for (let i = 0; i < messages.length; i += 100) {
        const batch = messages.slice(i, i + 100);
        const res = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
          },
          body: JSON.stringify(batch),
        });
        if (!res.ok) {
          console.error('send-push: Expo API non-OK', res.status, await res.text());
          continue;
        }
        const respBody = await res.json().catch(() => null);
        const tickets = Array.isArray(respBody?.data) ? respBody.data : [];
        batch.forEach((msg: { to: string }, idx: number) => {
          const ticket = tickets[idx];
          if (ticket?.status === 'ok') pushed += 1;
          else if (ticket?.details?.error === 'DeviceNotRegistered') deadTokens.push(msg.to);
        });
      }
    } catch (sendErr) {
      console.error('send-push: Expo send failed (non-fatal):', sendErr);
    }

    // Prune tokens Expo reports as permanently invalid. Best-effort; never throws.
    if (deadTokens.length > 0) {
      try {
        await supabase.from('push_tokens').delete().in('expo_push_token', deadTokens);
      } catch (pruneErr) {
        console.error('send-push: token prune failed (non-fatal):', pruneErr);
      }
    }

    console.log(`send-push: type=${record.type} tokens=${tokens.length} pushed=${pushed} pruned=${deadTokens.length}`);
    return json({ pushed, pruned: deadTokens.length, tokens: tokens.length, type: record.type });
  } catch (error) {
    console.error('send-push error:', error);
    return json({ error: String(error) }, 500);
  }
});
