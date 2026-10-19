import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_USER_ID } from '@/lib/adminUser';

// The same slots feature-story knows (its FEATURE_LABELS keys)
const VALID_FEATURE_TYPES = [
  'story_of_the_week',
  'best_family',
  'best_food_and_recipes',
  'best_childhood',
  'best_love',
  'best_life_lessons',
  'best_traditions',
  'best_travel',
];

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

    const body = await req.json().catch(() => ({}));
    const feature_type = body?.feature_type;

    if (!feature_type) {
      return NextResponse.json({ error: 'Missing feature_type' }, { status: 400 });
    }

    if (!VALID_FEATURE_TYPES.includes(feature_type)) {
      return NextResponse.json({ error: 'Invalid feature_type' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Idempotent: an empty slot is already the state asked for.
    const { data: removed, error: deleteError } = await admin
      .from('featured_stories')
      .delete()
      .eq('feature_type', feature_type)
      .select('id');

    if (deleteError) {
      console.error('Failed to unfeature:', deleteError);
      return NextResponse.json({ error: 'Failed to unfeature story' }, { status: 500 });
    }

    return NextResponse.json({ success: true, removed: (removed ?? []).length });
  } catch (err) {
    console.error('Unfeature error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
