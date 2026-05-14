import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — this endpoint is public (no auth),
// so we need admin access to read the invite
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

    // Look up the invite with family and inviter details
    const { data: invite, error } = await admin
      .from('family_invites')
      .select('id, email, role, expires_at, accepted_at, family_id, invited_by')
      .eq('token', token)
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: 'Invite not found', valid: false },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invite.accepted_at) {
      return NextResponse.json(
        { error: 'This invite has already been used', valid: false },
        { status: 410 }
      );
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired', valid: false },
        { status: 410 }
      );
    }

    // Get family name
    const { data: family } = await admin
      .from('families')
      .select('name')
      .eq('id', invite.family_id)
      .single();

    // Get inviter name
    const { data: inviter } = await admin
      .from('Profiles')
      .select('full_name')
      .eq('id', invite.invited_by)
      .single();

    return NextResponse.json({
      valid: true,
      email: invite.email,
      role: invite.role,
      familyName: family?.name || 'a family',
      inviterName: inviter?.full_name || 'Someone',
    });
  } catch (err: any) {
    console.error('Invite lookup error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}