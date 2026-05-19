// app/api/join-via-link/route.ts

import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    // 1. Authenticated client — verify who's calling
    const supabase = await getServerClient();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const admin = getAdminClient();
    const userId = auth.user.id;

    // 2. Look up the invite link
    const { data: link } = await admin
      .from('family_invite_links')
      .select('id, family_id, is_active')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (!link) {
      return NextResponse.json(
        { error: 'Invalid or deactivated invite link' },
        { status: 400 }
      );
    }

    const targetFamilyId = link.family_id;

    // 3. One-family rule — check current membership
    const { data: currentMembership } = await admin
      .from('family_memberships')
      .select('family_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (currentMembership) {
      // Already in the target family — nothing to do
      if (currentMembership.family_id === targetFamilyId) {
        return NextResponse.json({
          success: true,
          family_id: targetFamilyId,
          already_member: true,
        });
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

    // 4. Find the auto-created solo family from handle_new_user
    const { data: soloMembership } = await admin
      .from('family_memberships')
      .select('family_id')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .maybeSingle();

    // 5. Join the target family as member
    const { error: joinError } = await admin
      .from('family_memberships')
      .upsert(
        { family_id: targetFamilyId, user_id: userId, role: 'member' },
        { onConflict: 'family_id,user_id' }
      );

    if (joinError) {
      console.error('Join family error:', joinError);
      return NextResponse.json(
        { error: 'Failed to join family' },
        { status: 500 }
      );
    }

    // 6. Point subscription to the joined family
    await admin
      .from('subscriptions')
      .update({ family_id: targetFamilyId })
      .eq('user_id', userId);

    // 7. Clean up the solo family (if it's different from the one we just joined)
    if (soloMembership && soloMembership.family_id !== targetFamilyId) {
      // Remove solo membership
      await admin
        .from('family_memberships')
        .delete()
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Delete the empty solo family
      await admin
        .from('families')
        .delete()
        .eq('id', soloMembership.family_id);
    }

    return NextResponse.json({
      success: true,
      family_id: targetFamilyId,
      already_member: false,
    });
  } catch (err: any) {
    console.error('Join via link error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}