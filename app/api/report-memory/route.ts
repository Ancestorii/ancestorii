import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, internalNote } from '@/lib/email';

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
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { memory_id, reason } = await req.json();
    if (!memory_id) {
      return NextResponse.json({ error: 'Missing memory_id' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: memory, error: memErr } = await admin
      .from('family_memories')
      .select('id, title, author_id, family_id')
      .eq('id', memory_id)
      .single();

    if (memErr || !memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // Verify reporter is in the same family
    const { data: membership } = await admin
      .from('family_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('family_id', memory.family_id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not a family member' }, { status: 403 });
    }

    if (memory.author_id === user.id) {
      return NextResponse.json({ error: 'Cannot report your own memory' }, { status: 400 });
    }

    // Duplicate check
    const { data: existing } = await admin
      .from('moderation_reviews')
      .select('id')
      .eq('story_id', memory_id)
      .eq('category', 'memory_report')
      .eq('reviewed_by', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already reported' }, { status: 409 });
    }

    await admin.from('moderation_reviews').insert({
      story_id: memory_id,
      source: 'community_report',
      passed: false,
      category: 'memory_report',
      reason: reason || 'Reported by family member',
      reviewed_by: user.id,
    });

    // Email admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'support@ancestorii.com',
        letter: internalNote('A family memory has been reported', [
          ['Memory', String(memory.title ?? '')],
          ['Reason', reason || 'No reason provided'],
          ['Family ID', String(memory.family_id ?? '')],
        ]),
        tag: 'report',
      });
    } catch (emailErr) {
      console.error('Failed to send report email:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Memory report error:', err);
    return NextResponse.json({ error: err?.message || 'Something went wrong' }, { status: 500 });
  }
}