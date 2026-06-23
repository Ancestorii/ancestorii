// supabase/functions/invite-sent-confirmation/index.ts
// Triggered by Database Webhook on public.family_invites INSERT
// Sends a branded confirmation email to the INVITER via Resend API

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

    if (!record || !record.invited_by || !record.email) {
      return new Response(JSON.stringify({ error: 'Missing invite data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get inviter's profile
    const { data: inviter } = await supabase
      .from('Profiles')
      .select('full_name, email')
      .eq('id', record.invited_by)
      .single();

    if (!inviter?.email) {
      console.log('No email found for inviter:', record.invited_by);
      return new Response(JSON.stringify({ skipped: true, reason: 'no_inviter_email' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get family name
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', record.family_id)
      .single();

    const familyName = family?.name || 'your family';
    const inviterName = inviter.full_name || 'there';
    const inviteeEmail = record.email;

    // Send confirmation email to the inviter
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ancestorii <support@ancestorii.com>',
        to: [inviter.email],
        subject: `Your invite to ${inviteeEmail} has been sent`,
        html: generateConfirmationEmail(inviterName, inviteeEmail, familyName),
        text: generatePlainText(inviterName, inviteeEmail, familyName),
      }),
    });

    const data = await res.json();
    console.log('Resend response:', JSON.stringify(data));

    return new Response(JSON.stringify({ sent: true, resend: data }), {
      status: res.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending invite confirmation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─────────────────────────────────────────────
// Plain text version (improves deliverability)
// ─────────────────────────────────────────────
function generatePlainText(
  name: string,
  inviteeEmail: string,
  familyName: string
): string {
  return `Hi ${name},

Your invite has been sent to ${inviteeEmail}. Once they accept, they'll be part of ${familyName} on Ancestorii — able to view, contribute, and help preserve your family's memories together.

Their invite link is valid for 7 days. If they don't see it, remind them to check their spam folder.

Every family has a story worth keeping.

— The Ancestorii Team
ancestorii.com`;
}

// ─────────────────────────────────────────────
// Branded HTML Email Template
// ─────────────────────────────────────────────
function generateConfirmationEmail(
  name: string,
  inviteeEmail: string,
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
  <title>Invite Sent</title>
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
                Your invite is on its way.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Nice one, ${name}. We've sent an invitation to <strong style="color:#16120c;">${inviteeEmail}</strong> to join <strong style="color:#16120c;">${familyName}</strong> on Ancestorii.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Once they accept, they'll be able to explore your family library, add their own photos, memories, and stories — and help you build something that lasts.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                Their invite link is valid for 7 days. If they haven't received it, let them know to check their spam folder — or you can resend from your dashboard.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://ancestorii.com/dashboard/our-family" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Back to Your Library
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