import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_ID = process.env.ADMIN_USER_ID!;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const { feature_type } = await req.json();

    if (!feature_type) {
      return NextResponse.json({ error: 'Missing feature_type' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { error: deleteError } = await admin
      .from('featured_stories')
      .delete()
      .eq('feature_type', feature_type);

    if (deleteError) {
      console.error('Failed to unfeature:', deleteError);
      return NextResponse.json({ error: 'Failed to unfeature story' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unfeature error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}