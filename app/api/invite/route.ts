import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ancestorii.com';

// Admin client for inserting invites (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();

    // 1. Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse request
    const { email, role = 'member' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // 3. Get user's family (must be owner or admin)
    const admin = getAdminClient();

    const { data: membership, error: memError } = await admin
      .from('family_memberships')
      .select('family_id, role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .single();

    if (memError || !membership) {
      return NextResponse.json(
        { error: 'You must be a family owner or admin to send invites' },
        { status: 403 }
      );
    }

    // 4. Get family name for the email
    const { data: family } = await admin
      .from('families')
      .select('name')
      .eq('id', membership.family_id)
      .single();

    const familyName = family?.name || 'a family';

    // 5. Get inviter's name
    const { data: profile } = await admin
      .from('Profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const inviterName = profile?.full_name || 'Someone';

    // 6. Check for existing pending invite to same email for same family
    const { data: existingInvite } = await admin
      .from('family_invites')
      .select('id')
      .eq('family_id', membership.family_id)
      .eq('email', email.toLowerCase())
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invite has already been sent to this email' },
        { status: 409 }
      );
    }

    // 7. Check if this person is already a family member
    const { data: existingUser } = await admin
      .from('Profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      const { data: existingMember } = await admin
        .from('family_memberships')
        .select('id')
        .eq('family_id', membership.family_id)
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingMember) {
        return NextResponse.json(
          { error: 'This person is already a member of your family' },
          { status: 409 }
        );
      }
    }

    // 8. Create the invite
    const { data: invite, error: inviteError } = await admin
      .from('family_invites')
      .insert({
        family_id: membership.family_id,
        email: email.toLowerCase(),
        invited_by: user.id,
        role,
      })
      .select('token')
      .single();

    if (inviteError || !invite) {
      console.error('Invite insert error:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // 9. Send invite email via Resend
    const inviteUrl = `${SITE_URL}/invite/${invite.token}`;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ancestorii <support@ancestorii.com>',
        to: [email.toLowerCase()],
        subject: `${inviterName} invited you to join ${familyName} on Ancestorii`,
        html: generateInviteEmail(inviterName, familyName, inviteUrl),
      }),
    });

    if (!emailRes.ok) {
      const emailErr = await emailRes.json();
      console.error('Resend error:', emailErr);
      // Invite is created even if email fails — they can resend
    }

    return NextResponse.json({ success: true, token: invite.token });
  } catch (err: any) {
    console.error('Invite API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// Branded Invite Email Template
// ─────────────────────────────────────────────
function generateInviteEmail(
  inviterName: string,
  familyName: string,
  inviteUrl: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>You're invited to Ancestorii</title>
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
                You've been invited.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                ${inviterName} has invited you to join <strong style="color:#16120c;">${familyName}</strong> on Ancestorii — a private place to preserve the stories, photos, and memories that make your family who they are.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 38px 0;">
                Once you join, you'll be able to see and contribute to your family's shared library — photos, timelines, albums, and memory books that belong to all of you.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="${inviteUrl}" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Accept Invitation
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
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:10px 0 0 0; line-height:1.6;">
                This invite expires in 7 days.
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