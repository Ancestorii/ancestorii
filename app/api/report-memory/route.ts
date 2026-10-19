import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, internalNote } from '@/lib/email';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const body = await req.json().catch(() => ({}));
    const memory_id = body?.memory_id;
    // Free text from the report dialog: kept to a sensible length for the email
    const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 1000) : '';

    if (!memory_id) {
      return NextResponse.json({ error: 'Missing memory_id' }, { status: 400 });
    }

    if (typeof memory_id !== 'string' || !UUID_RE.test(memory_id)) {
      return NextResponse.json({ error: 'Invalid memory_id' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: memory, error: memErr } = await admin
      .from('family_memories')
      .select('id, title, author_id, family_id')
      .eq('id', memory_id)
      .maybeSingle();

    if (memErr || !memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // Verify reporter is in the same family
    const { data: membership } = await admin
      .from('family_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('family_id', memory.family_id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not a family member' }, { status: 403 });
    }

    if (memory.author_id === user.id) {
      return NextResponse.json({ error: 'Cannot report your own memory' }, { status: 400 });
    }

    // The report is recorded in audit_log (who, what action, which table, which row). It used to
    // go into moderation_reviews, whose story_id points at stories, so a memory id was rejected
    // on every report: nothing was ever stored and the duplicate check could never fire.
    const { data: existing } = await admin
      .from('audit_log')
      .select('id')
      .eq('user_id', user.id)
      .eq('action', 'memory_report')
      .eq('target_table', 'family_memories')
      .eq('target_id', memory.id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already reported' }, { status: 409 });
    }

    const { error: logError } = await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'memory_report',
      target_table: 'family_memories',
      target_id: memory.id,
    });

    if (logError) {
      console.error('Memory report insert error:', logError);
      return NextResponse.json(
        { error: 'We could not send your report. Please try again.' },
        { status: 500 }
      );
    }

    // Email admin. The reason only lives here: audit_log has no text column.
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'support@ancestorii.com',
        letter: internalNote('A family memory has been reported', [
          ['Memory', String(memory.title ?? '')],
          ['Memory ID', String(memory.id)],
          ['Reason', reason || 'No reason provided'],
          ['Family ID', String(memory.family_id ?? '')],
          ['Reported by', user.id],
        ]),
        tag: 'report',
      });
    } catch (emailErr) {
      console.error('Failed to send report email:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Memory report error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
