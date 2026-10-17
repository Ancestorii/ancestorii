import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, p, esc, wrap, type Letter } from '@/lib/email';

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

    // 7. Check if this person already has an account
    const { data: existingUser } = await admin
      .from('Profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      const { data: existingMember } = await admin
        .from('family_memberships')
        .select('id, family_id')
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingMember) {
        // Already in the sender's family
        if (existingMember.family_id === membership.family_id) {
          return NextResponse.json(
            { error: 'This person is already a member of your family' },
            { status: 409 }
          );
        }

        // In a different family, check if it's a real family (not just their auto-created solo one)
        const { count } = await admin
          .from('family_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('family_id', existingMember.family_id);

        if ((count || 0) > 1) {
          return NextResponse.json(
            { error: 'This person already belongs to another family library.' },
            { status: 409 }
          );
        }
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

    const emailRes = await sendEmail({
      to: email.toLowerCase(),
      letter: inviteLetter(inviterName, familyName, inviteUrl),
      idempotencyKey: `invite-${invite.token}`,
      tag: 'invite',
    });

    if (!emailRes.ok) {
      console.error('Resend error:', emailRes.status, emailRes.message);
      // The invite is created even if the email fails. They can resend.
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
// The invitation letter (drawn in the shared shell, src/lib/email.ts)
// ─────────────────────────────────────────────
function inviteLetter(inviterName: string, familyName: string, inviteUrl: string): Letter {
  const first = `${inviterName} has invited you to join ${familyName} on Ancestorii: a private space where your family keeps its stories, photos and voices together, between the people who were invited.`;
  const second = 'Accept the invitation to see what is already there, add your own memories, and help build something that lasts.';
  const third = 'This link is valid for 7 days. If you were not expecting it, you can ignore this email.';
  return {
    subject: `${inviterName} invited you to join ${familyName} on Ancestorii`,
    preheader: `${inviterName} wants you in ${familyName}.`,
    eyebrow: "YOU'RE INVITED",
    heading: `Join ${familyName}.`,
    bodyHtml: [
      p(`<strong>${esc(inviterName)}</strong> has invited you to join <strong>${esc(familyName)}</strong> on Ancestorii: a private space where your family keeps its stories, photos and voices together, between the people who were invited.`),
      p(esc(second)),
      p(esc(third), true),
    ].join(''),
    bodyText: [wrap(first), '', wrap(second), '', wrap(third)].join('\n'),
    button: { label: 'Accept the invitation', href: inviteUrl },
    note: `If the button does not work, copy this link into your browser: ${inviteUrl}`,
    facts: [
      { label: 'INVITED BY', value: inviterName },
      { label: 'FAMILY', value: familyName },
      { label: 'LINK VALID FOR', value: '7 days' },
    ],
    reason: `You are receiving this because ${inviterName} entered your email address on Ancestorii.`,
  };
}
