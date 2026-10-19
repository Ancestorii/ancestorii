// app/api/join/[token]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Service role client: this endpoint is public (no auth),
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

    // The token column is a uuid: anything else is "not found" without a database round trip.
    if (!UUID_RE.test(token)) {
      return NextResponse.json({ error: 'Invite link not found', valid: false }, { status: 404 });
    }

    const admin = getAdminClient();

    // 1. Look up the invite link
    const { data: link, error } = await admin
      .from('family_invite_links')
      .select('id, family_id, created_by, is_active')
      .eq('token', token)
      .maybeSingle();

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

    // 3. Family name and the link creator's name, side by side
    const [{ data: family }, { data: creator }] = await Promise.all([
      admin.from('families').select('name').eq('id', link.family_id).maybeSingle(),
      admin.from('Profiles').select('full_name').eq('id', link.created_by).maybeSingle(),
    ]);

    return NextResponse.json({
      valid: true,
      familyName: family?.name || 'a family',
      creatorName: creator?.full_name || 'Someone',
    });
  } catch (err) {
    console.error('Join link lookup error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
