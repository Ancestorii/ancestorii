import { createClient } from '@supabase/supabase-js';
import { getServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Authenticated client — to verify who's calling
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  // Service role client — bypasses RLS for membership operations
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
    .single();

  if (!invite) {
    return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
  }

  // 2. Verify the invite email matches this user
  if (invite.email && invite.email.toLowerCase() !== userEmail?.toLowerCase()) {
    return NextResponse.json({ error: 'This invite is for a different email' }, { status: 403 });
  }

  // 2b. One-family rule — block if user is already in a real family
  const { data: currentMembership } = await admin
    .from('family_memberships')
    .select('family_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (currentMembership) {
    // Already in the invited family — just mark accepted and return
    if (currentMembership.family_id === invite.family_id) {
      await admin
        .from('family_invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id);
      return NextResponse.json({ success: true, family_id: invite.family_id });
    }

    // In a different family — check if it's a solo auto-created family
    const { count } = await admin
      .from('family_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', currentMembership.family_id);

    if ((count || 0) > 1) {
      return NextResponse.json(
        { error: 'You already belong to a family library and cannot join another.' },
        { status: 409 }
      );
    }
  }

  // 3. Find the auto-created solo family from handle_new_user
  const { data: soloMembership } = await admin
    .from('family_memberships')
    .select('family_id')
    .eq('user_id', userId)
    .eq('role', 'owner')
    .single();

  // 4. Join the inviter's family
  await admin
    .from('family_memberships')
    .upsert(
      { family_id: invite.family_id, user_id: userId, role: invite.role },
      { onConflict: 'family_id,user_id' }
    );

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
}