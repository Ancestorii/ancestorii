// app/api/family-invite-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ancestorii.com';

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

    // 2. Parse request — optional { regenerate: true } to revoke + create new
    const body = await req.json().catch(() => ({}));
    const regenerate = body?.regenerate === true;

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
        { error: 'You must be a family owner or admin to manage invite links' },
        { status: 403 }
      );
    }

    const familyId = membership.family_id;

    // 4. If regenerating, deactivate the current active link first
    if (regenerate) {
      await admin
        .from('family_invite_links')
        .update({ is_active: false })
        .eq('family_id', familyId)
        .eq('is_active', true);
    }

    // 5. Check for existing active link
    const { data: existingLink } = await admin
      .from('family_invite_links')
      .select('token, created_at')
      .eq('family_id', familyId)
      .eq('is_active', true)
      .maybeSingle();

    if (existingLink) {
      return NextResponse.json({
        url: `${SITE_URL}/join/${existingLink.token}`,
        token: existingLink.token,
        created_at: existingLink.created_at,
        is_new: false,
      });
    }

    // 6. No active link — create one
    const { data: newLink, error: insertError } = await admin
      .from('family_invite_links')
      .insert({
        family_id: familyId,
        created_by: user.id,
      })
      .select('token, created_at')
      .single();

    if (insertError || !newLink) {
      console.error('Invite link insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invite link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: `${SITE_URL}/join/${newLink.token}`,
      token: newLink.token,
      created_at: newLink.created_at,
      is_new: true,
    });
  } catch (err: any) {
    console.error('Family invite link API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}