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
    // 1. Authenticated client: verify who's calling
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

    // 3. One-family rule. Every membership is read as a list: .maybeSingle() errors when a
    // user has two rows, and that error used to read as "no membership" and skip the check.
    const { data: membershipRows } = await admin
      .from('family_memberships')
      .select('family_id, role')
      .eq('user_id', userId)
      .order('joined_at', { ascending: true });

    const memberships = (membershipRows ?? []) as { family_id: string; role: string }[];

    // Already in the target family, nothing to do
    if (memberships.some((m) => m.family_id === targetFamilyId)) {
      return NextResponse.json({
        success: true,
        family_id: targetFamilyId,
        already_member: true,
      });
    }

    // In a different family: allowed only if that is their solo auto-created one
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

    // 4. Join the target family as member, in one transaction (join_family_merging_solo, as
    //    accept-invite does): the membership, the subscription, and everything in their own
    //    one-person family moved across before that family is deleted. A failure changes nothing.
    const { error: joinError } = await admin.rpc('join_family_merging_solo', {
      p_user_id: userId,
      p_target_family_id: targetFamilyId,
      p_role: 'member',
    });

    if (joinError) {
      // Someone joined their family between the check above and the join.
      if (joinError.message?.includes('already_in_family')) {
        return NextResponse.json(
          { error: 'You already belong to a family library and cannot join another.' },
          { status: 409 }
        );
      }
      console.error('Join family error:', joinError);
      return NextResponse.json(
        { error: 'Failed to join family' },
        { status: 500 }
      );
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