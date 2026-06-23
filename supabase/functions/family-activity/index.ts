// supabase/functions/family-activity/index.ts
// Triggered by Database Webhooks on INSERT for "big" content:
//   - family_members    (loved ones)     → owner_id
//   - timelines                          → owner_id
//   - albums                             → user_id
//   - memory_capsules   (time capsules)  → user_id
//   - memory_books                       → user_id
//   - memory_canvases                    → user_id
//   - acrylic_prints                     → user_id
//
// Sends a branded notification email to all family members EXCEPT the creator.
// Does NOT trigger on granular content (photos, voice notes, comments, etc.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');

// ─────────────────────────────────────────────
// Map table names to human-readable descriptions
// ─────────────────────────────────────────────
interface ActivityInfo {
  action: string;       // e.g. "created a new timeline"
  headline: string;     // italic heading in the email
}

function getActivityInfo(table: string, record: any): ActivityInfo {
  switch (table) {
    case 'family_members':
      return {
        action: `added a new loved one${record.name ? ` — ${record.name}` : ''}`,
        headline: 'Someone new has been added to your family.',
      };
    case 'timelines':
      return {
        action: `created a new timeline${record.title ? ` — "${record.title}"` : ''}`,
        headline: 'A new timeline has been started.',
      };
    case 'albums':
      return {
        action: `created a new album${record.title ? ` — "${record.title}"` : ''}`,
        headline: 'A new album has been created.',
      };
    case 'memory_capsules':
      return {
        action: `created a new time capsule${record.title ? ` — "${record.title}"` : ''}`,
        headline: 'A time capsule has been sealed.',
      };
    case 'memory_books':
      return {
        action: `started a new Memory Book${record.title ? ` — "${record.title}"` : ''}`,
        headline: 'A new Memory Book is being crafted.',
      };
    case 'memory_canvases':
      return {
        action: `created a new canvas${record.title ? ` — "${record.title}"` : ''}`,
        headline: 'A new canvas has been created.',
      };
    case 'acrylic_prints':
      return {
        action: `created a new acrylic print${record.title ? ` — "${record.title}"` : ''}`,
        headline: 'A new acrylic print has been created.',
      };
    default:
      return {
        action: 'added something new to the library',
        headline: 'Something new has been added.',
      };
  }
}

// ─────────────────────────────────────────────
// Resolve the creator's user ID from the record
// Tables use either owner_id or user_id
// ─────────────────────────────────────────────
function getCreatorId(table: string, record: any): string | null {
  // Tables that use owner_id: family_members, timelines
  if (table === 'family_members' || table === 'timelines') {
    return record.owner_id || null;
  }
  // Everything else uses user_id: albums, memory_capsules, memory_books,
  // memory_canvases, acrylic_prints
  return record.user_id || null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (WEBHOOK_SECRET) {
    const authHeader = req.headers.get('x-webhook-secret');
    if (authHeader !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const payload = await req.json();
    const record = payload.record;
    const table = payload.table;

    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const creatorId = getCreatorId(table, record);
    if (!creatorId) {
      console.log('Could not determine creator from record:', table, JSON.stringify(record));
      return new Response(JSON.stringify({ skipped: true, reason: 'no_creator_id' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get creator's profile
    const { data: creator } = await supabase
      .from('Profiles')
      .select('full_name')
      .eq('id', creatorId)
      .single();

    const creatorName = creator?.full_name || 'A family member';

    // Resolve family_id — should be on the record (auto-stamped by triggers)
    // Fallback: look up via creator's membership
    let familyId = record.family_id || null;

    if (!familyId) {
      const { data: membership } = await supabase
        .from('family_memberships')
        .select('family_id')
        .eq('user_id', creatorId)
        .single();
      familyId = membership?.family_id || null;
    }

    if (!familyId) {
      console.log('Could not determine family_id for record in', table);
      return new Response(JSON.stringify({ skipped: true, reason: 'no_family_id' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get family name
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', familyId)
      .single();

    const familyName = family?.name || 'your family';

    // Get all family members EXCEPT the creator
    const { data: memberships } = await supabase
      .from('family_memberships')
      .select('user_id')
      .eq('family_id', familyId)
      .neq('user_id', creatorId);

    if (!memberships || memberships.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_other_members' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get emails for all other members
    const memberIds = memberships.map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from('Profiles')
      .select('email')
      .in('id', memberIds);

    const recipientEmails = (profiles || [])
      .map((p) => p.email)
      .filter(Boolean) as string[];

    if (recipientEmails.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_recipient_emails' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const activity = getActivityInfo(table, record);

    // Send one email per recipient
    const emailPromises = recipientEmails.map((email) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Ancestorii <support@ancestorii.com>',
          to: [email],
          subject: `${creatorName} ${activity.action} in ${familyName}`,
          html: generateActivityEmail(creatorName, activity, familyName),
          text: generatePlainText(creatorName, activity, familyName),
        }),
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`Activity notification: sent ${sent}, failed ${failed} for table=${table}`);

    return new Response(
      JSON.stringify({ sent, failed, table, familyId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending activity notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─────────────────────────────────────────────
// Plain text version
// ─────────────────────────────────────────────
function generatePlainText(
  creatorName: string,
  activity: ActivityInfo,
  familyName: string
): string {
  return `New activity in ${familyName}

${creatorName} just ${activity.action}.

Head to your family library to see what's new:
https://ancestorii.com/dashboard/our-family

Every family has a story worth keeping.

— The Ancestorii Team
ancestorii.com`;
}

// ─────────────────────────────────────────────
// Branded HTML Email Template
// ─────────────────────────────────────────────
function generateActivityEmail(
  creatorName: string,
  activity: ActivityInfo,
  familyName: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>New activity in ${familyName}</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">

          <!-- Letterhead -->
          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">
                A letter from
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">
                Ancestorii
              </p>
            </td>
          </tr>

          <!-- Gold seam -->
          <tr>
            <td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px 36px 40px;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">
                ${activity.headline}
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                <strong style="color:#16120c;">${creatorName}</strong> just ${activity.action} in <strong style="color:#16120c;">${familyName}</strong>.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                Head over to your family library to see what's new — and add your own memories while you're there.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://ancestorii.com/dashboard/our-family" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      View Your Library
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#3d3830; line-height:1.75; margin:0; font-style:italic;">
                Every family has a story worth keeping.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:32px 0 4px 0;">
                — The Ancestorii Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">
                Ancestorii Ltd &middot; London
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;">
                <a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}