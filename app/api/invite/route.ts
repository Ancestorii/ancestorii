import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, p, esc, wrap, type Letter } from '@/lib/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ancestorii.com';

// Same shape the drawer checks before it sends
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const role = body?.role ?? 'member';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // 3. Get user's family (must be owner or admin). The drawer sends no family id, so the
    // family they own comes first, then the one they joined earliest: one row, deterministic,
    // and no PGRST116 for anyone who is in two families.
    const admin = getAdminClient();

    const { data: membership, error: memError } = await admin
      .from('family_memberships')
      .select('family_id, role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .order('role', { ascending: false })
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (memError || !membership) {
      return NextResponse.json(
        { error: 'You must be a family owner or admin to send invites' },
        { status: 403 }
      );
    }

    // 4. to 7. Four independent lookups, side by side: family name, inviter's name, a pending
    // invite to the same address, and whether this person already has an account.
    const [{ data: family }, { data: profile }, { data: existingInvite }, { data: existingUser }] =
      await Promise.all([
        admin.from('families').select('name').eq('id', membership.family_id).maybeSingle(),
        admin.from('Profiles').select('full_name').eq('id', user.id).maybeSingle(),
        admin
          .from('family_invites')
          .select('id')
          .eq('family_id', membership.family_id)
          .eq('email', email)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .limit(1)
          .maybeSingle(),
        admin.from('Profiles').select('id').eq('email', email).limit(1).maybeSingle(),
      ]);

    const familyName = family?.name || 'a family';
    const inviterName = profile?.full_name || 'Someone';

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invite has already been sent to this email' },
        { status: 409 }
      );
    }

    if (existingUser) {
      const { data: theirMemberships } = await admin
        .from('family_memberships')
        .select('family_id')
        .eq('user_id', existingUser.id);

      const theirs = theirMemberships ?? [];

      // Already in the sender's family
      if (theirs.some((m) => m.family_id === membership.family_id)) {
        return NextResponse.json(
          { error: 'This person is already a member of your family' },
          { status: 409 }
        );
      }

      // In a different family, check if it's a real family (not just their auto-created solo one)
      for (const m of theirs) {
        const { count } = await admin
          .from('family_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('family_id', m.family_id);

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
        email,
        invited_by: user.id,
        role,
      })
      .select('id, token')
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
      to: email,
      letter: inviteLetter(inviterName, familyName, inviteUrl),
      idempotencyKey: `invite-${invite.token}`,
      tag: 'invite',
    });

    if (!emailRes.ok) {
      console.error('Resend error:', emailRes.status, emailRes.message);
      // Nobody can use an invite that was never delivered, and leaving it pending would answer
      // every retry with "already been sent" for 7 days. Remove it so they can simply try again.
      await admin.from('family_invites').delete().eq('id', invite.id);
      return NextResponse.json(
        { error: 'We could not send the invitation email. Please try again in a moment.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, token: invite.token });
  } catch (err) {
    console.error('Invite API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
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
