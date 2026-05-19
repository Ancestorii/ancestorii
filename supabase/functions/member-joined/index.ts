// supabase/functions/member-joined/index.ts
// Triggered by Database Webhook on family_memberships INSERT
// Sends:
//   1. Welcome email to the new member who just joined
//   2. Notification email to all existing family members
//
// Skips solo family creation (member count = 1) so it only fires
// when someone joins an existing family via invite or share link.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');

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

    if (!record || !record.user_id || !record.family_id) {
      return new Response(JSON.stringify({ error: 'Missing membership data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const newUserId = record.user_id;
    const familyId = record.family_id;

    // Count family members — skip if this is a solo family creation
    const { count } = await supabase
      .from('family_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId);

    if ((count || 0) <= 1) {
      return new Response(JSON.stringify({ skipped: true, reason: 'solo_family_creation' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get new member's profile
    const { data: newMember } = await supabase
      .from('Profiles')
      .select('full_name, email')
      .eq('id', newUserId)
      .single();

    if (!newMember?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_new_member_email' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newMemberName = newMember.full_name || 'there';
    const newMemberEmail = newMember.email;

    // Get family name
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', familyId)
      .single();

    const familyName = family?.name || 'your family';

    // Get all OTHER family members (excluding the new joiner)
    const { data: otherMemberships } = await supabase
      .from('family_memberships')
      .select('user_id')
      .eq('family_id', familyId)
      .neq('user_id', newUserId);

    const otherMemberIds = (otherMemberships || []).map((m) => m.user_id);

    let otherEmails: string[] = [];
    if (otherMemberIds.length > 0) {
      const { data: otherProfiles } = await supabase
        .from('Profiles')
        .select('email')
        .in('id', otherMemberIds);

      otherEmails = (otherProfiles || [])
        .map((p) => p.email)
        .filter(Boolean) as string[];
    }

    // ── EMAIL 1: Welcome the new member ──
    const welcomePromise = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ancestorii <support@ancestorii.com>',
        to: [newMemberEmail],
        subject: `Welcome to ${familyName} on Ancestorii`,
        html: generateWelcomeEmail(newMemberName, familyName),
        text: generateWelcomePlainText(newMemberName, familyName),
      }),
    });

    // ── EMAIL 2: Notify existing members ──
    const notifyPromises = otherEmails.map((email) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Ancestorii <support@ancestorii.com>',
          to: [email],
          subject: `${newMember.full_name || 'Someone new'} just joined ${familyName}`,
          html: generateNotifyEmail(newMember.full_name || 'A new family member', familyName),
          text: generateNotifyPlainText(newMember.full_name || 'A new family member', familyName),
        }),
      })
    );

    const results = await Promise.allSettled([welcomePromise, ...notifyPromises]);
    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`Member joined: sent ${sent}, failed ${failed} for family=${familyId}`);

    return new Response(
      JSON.stringify({ sent, failed, familyId, newUserId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in member-joined:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─────────────────────────────────────────────
// EMAIL 1: Welcome email to the new member
// ─────────────────────────────────────────────
function generateWelcomePlainText(name: string, familyName: string): string {
  return `Welcome to ${familyName}, ${name}!

You're now part of ${familyName} on Ancestorii — a private space where your family preserves the stories, photos, and memories that matter most.

You can start exploring right away: browse what's already there, add your own photos and stories, and help build something that lasts.

Head to your family library:
https://ancestorii.com/dashboard/home

Every family has a story worth keeping.

— The Ancestorii Team
ancestorii.com`;
}

function generateWelcomeEmail(name: string, familyName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Welcome to ${familyName}</title>
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
                You're in.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Welcome to <strong style="color:#16120c;">${familyName}</strong>, ${name}. You're now part of a private space where your family preserves the stories, photos, and memories that matter most.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                Start exploring — browse what's already there, add your own photos and stories, and help build something that lasts for generations.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://ancestorii.com/dashboard/home" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Explore Your Library
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

// ─────────────────────────────────────────────
// EMAIL 2: Notify existing members
// ─────────────────────────────────────────────
function generateNotifyPlainText(newMemberName: string, familyName: string): string {
  return `Your family is growing!

${newMemberName} just joined ${familyName} on Ancestorii. They can now browse, contribute, and help preserve your family's memories.

Head to your library to see who's there:
https://ancestorii.com/dashboard/family

Every family has a story worth keeping.

— The Ancestorii Team
ancestorii.com`;
}

function generateNotifyEmail(newMemberName: string, familyName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>New member joined ${familyName}</title>
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
                Your family is growing.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                <strong style="color:#16120c;">${newMemberName}</strong> just joined <strong style="color:#16120c;">${familyName}</strong> on Ancestorii. They can now browse your family library, add their own photos and stories, and help preserve what matters most.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                The more people contributing, the richer your family's story becomes.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://ancestorii.com/dashboard/family" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      See Your Family
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