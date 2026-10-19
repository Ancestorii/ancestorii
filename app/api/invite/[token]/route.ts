import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Service role client: this endpoint is public (no auth),
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

    // The token column is a uuid: anything else is "not found" without a database round trip.
    if (!UUID_RE.test(token)) {
      return NextResponse.json({ error: 'Invite not found', valid: false }, { status: 404 });
    }

    const admin = getAdminClient();

    // Look up the invite with family and inviter details
    const { data: invite, error } = await admin
      .from('family_invites')
      .select('id, email, role, expires_at, accepted_at, family_id, invited_by')
      .eq('token', token)
      .maybeSingle();

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

    // Family name and inviter name, side by side
    const [{ data: family }, { data: inviter }] = await Promise.all([
      admin.from('families').select('name').eq('id', invite.family_id).maybeSingle(),
      admin.from('Profiles').select('full_name').eq('id', invite.invited_by).maybeSingle(),
    ]);

    return NextResponse.json({
      valid: true,
      email: invite.email,
      role: invite.role,
      familyName: family?.name || 'a family',
      inviterName: inviter?.full_name || 'Someone',
    });
  } catch (err) {
    console.error('Invite lookup error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
