import { createClient } from '@supabase/supabase-js';
import { getServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type MembershipRow = { family_id: string; role: string; joined_at: string };

export async function POST(req: Request) {
  try {
    // Authenticated client: to verify who's calling
    const supabase = await getServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    // family_invites.token is a uuid: anything else cannot match and would only raise a cast error.
    if (!UUID_RE.test(token)) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
    }

    // Service role client: bypasses RLS for membership operations
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const userId = auth.user.id;
    const userEmail = auth.user.email;

    // 1. Look up the invite
    const { data: invite } = await admin
      .from('family_invites')
      .select('id, family_id, role, email')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
    }

    // 2. Verify the invite email matches this user
    if (invite.email && invite.email.toLowerCase() !== userEmail?.toLowerCase()) {
      return NextResponse.json({ error: 'This invite is for a different email' }, { status: 403 });
    }

    // 2b. One-family rule. Every membership is read as a list: .maybeSingle() errors when a
    // user has two rows, and that error used to read as "no membership" and skip the check.
    const { data: membershipRows } = await admin
      .from('family_memberships')
      .select('family_id, role, joined_at')
      .eq('user_id', userId)
      .order('joined_at', { ascending: true });

    const memberships = (membershipRows ?? []) as MembershipRow[];

    // Already in the invited family (a second click on the link): mark accepted and return.
    if (memberships.some((m) => m.family_id === invite.family_id)) {
      await admin
        .from('family_invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id);
      return NextResponse.json({ success: true, family_id: invite.family_id, already_member: true });
    }

    // In a different family: allowed only if that is their solo auto-created one.
    for (const m of memberships) {
      const { count } = await admin
        .from('family_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', m.family_id);

      if ((count || 0) > 1) {
        return NextResponse.json(
          { error: 'You already belong to a family library and cannot join another.' },
          { status: 409 }
        );
      }
    }

    // 3. The auto-created solo family from handle_new_user (the one they own)
    const soloMembership = memberships.find((m) => m.role === 'owner') ?? null;

    // 4. Join the inviter's family. A failure here must not mark the invite as used.
    const { error: joinError } = await admin
      .from('family_memberships')
      .upsert(
        { family_id: invite.family_id, user_id: userId, role: invite.role },
        { onConflict: 'family_id,user_id' }
      );

    if (joinError) {
      console.error('Accept invite: join error', joinError);
      return NextResponse.json(
        { error: 'We could not add you to this family. Please try again.' },
        { status: 500 }
      );
    }

    // 5. Mark invite as accepted
    await admin
      .from('family_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    // 6. Point subscription to the joined family
    await admin
      .from('subscriptions')
      .update({ family_id: invite.family_id })
      .eq('user_id', userId);

    // 7. Clean up the solo family (if it's different from the one we just joined)
    if (soloMembership && soloMembership.family_id !== invite.family_id) {
      // Move any memories from solo family to the joined family
      await admin
        .from('family_memories')
        .update({ family_id: invite.family_id })
        .eq('family_id', soloMembership.family_id)
        .eq('author_id', userId);

      // Move any media references too
      await admin
        .from('family_memory_media')
        .update({ family_id: invite.family_id })
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Move any comments
      await admin
        .from('family_memory_comments')
        .update({ family_id: invite.family_id })
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Move any reactions
      await admin
        .from('family_memory_reactions')
        .update({ family_id: invite.family_id })
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Remove solo membership
      await admin
        .from('family_memberships')
        .delete()
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Delete the now-empty solo family
      await admin
        .from('families')
        .delete()
        .eq('id', soloMembership.family_id);
    }

    return NextResponse.json({ success: true, family_id: invite.family_id });
  } catch (err) {
    console.error('Accept invite error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
