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

    // 4. The auto-created solo family from handle_new_user (the one they own)
    const soloMembership = memberships.find((m) => m.role === 'owner') ?? null;

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
      // Bring their own memories along first (as accept-invite does): family_memories has no
      // cascade from families, so without this the delete below fails quietly and the memories
      // are stranded in a family they no longer belong to.
      await admin
        .from('family_memories')
        .update({ family_id: targetFamilyId })
        .eq('family_id', soloMembership.family_id)
        .eq('author_id', userId);

      await admin
        .from('family_memory_media')
        .update({ family_id: targetFamilyId })
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      await admin
        .from('family_memory_comments')
        .update({ family_id: targetFamilyId })
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      await admin
        .from('family_memory_reactions')
        .update({ family_id: targetFamilyId })
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Voice notes cascade from families, so the delete below would erase them
      const { error: voiceMoveError } = await admin
        .from('family_memory_voice_notes')
        .update({ family_id: targetFamilyId })
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Remove solo membership
      await admin
        .from('family_memberships')
        .delete()
        .eq('family_id', soloMembership.family_id)
        .eq('user_id', userId);

      // Delete the empty solo family. Not when the voice notes stayed behind: they would go
      // with it, where a failed move above only leaves rows that block the delete.
      if (voiceMoveError) {
        console.error('Join via link: voice notes not moved, solo family kept', voiceMoveError);
      } else {
        await admin
          .from('families')
          .delete()
          .eq('id', soloMembership.family_id);
      }
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