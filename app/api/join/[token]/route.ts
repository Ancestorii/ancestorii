// app/api/join/[token]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — this endpoint is public (no auth),
// so we need admin access to read the link
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // 1. Look up the invite link
    const { data: link, error } = await admin
      .from('family_invite_links')
      .select('id, family_id, created_by, is_active')
      .eq('token', token)
      .single();

    if (error || !link) {
      return NextResponse.json(
        { error: 'Invite link not found', valid: false },
        { status: 404 }
      );
    }

    // 2. Check if link is still active
    if (!link.is_active) {
      return NextResponse.json(
        { error: 'This invite link is no longer active', valid: false },
        { status: 410 }
      );
    }

    // 3. Get family name
    const { data: family } = await admin
      .from('families')
      .select('name')
      .eq('id', link.family_id)
      .single();

    // 4. Get link creator's name
    const { data: creator } = await admin
      .from('Profiles')
      .select('full_name')
      .eq('id', link.created_by)
      .single();

    return NextResponse.json({
      valid: true,
      familyName: family?.name || 'a family',
      creatorName: creator?.full_name || 'Someone',
    });
  } catch (err: any) {
    console.error('Join link lookup error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}