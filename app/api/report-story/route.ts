import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, internalNote, p, esc, wrap } from '@/lib/email';

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

    const { story_id, reason } = await req.json();

    if (!story_id) {
      return NextResponse.json({ error: 'Missing story_id' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Check story exists
    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, author_name, author_id')
      .eq('id', story_id)
      .eq('status', 'published')
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Prevent self-reporting
    if (story.author_id === user.id) {
      return NextResponse.json({ error: 'Cannot report your own story' }, { status: 400 });
    }

    // Check if user already reported this story
    const { data: existing } = await admin
      .from('moderation_reviews')
      .select('id')
      .eq('story_id', story_id)
      .eq('source', 'community_report')
      .eq('reviewed_by', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You have already reported this story' }, { status: 409 });
    }

    // Insert the report
    await admin.from('moderation_reviews').insert({
      story_id: story.id,
      source: 'community_report',
      passed: false,
      category: 'community_report',
      reason: reason || 'Reported by community member',
      reviewed_by: user.id,
    });

    // Email admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'support@ancestorii.com',
        letter: internalNote(
          'A story has been reported',
          [
            ['Story', String(story.title ?? '')],
            ['Author', String(story.author_name ?? '')],
            ['Reason', reason || 'No reason provided'],
          ],
          p(`<a href="https://www.ancestorii.com/stories/${story_id}" style="color:#2B4BFF;">View the story</a>`),
        ),
        tag: 'report',
      });
    } catch (emailErr) {
      console.error('Failed to send report email:', emailErr);
    }

    // Email the reporter: thank you
    try {
      const { data: { user: reporterUser } } = await admin.auth.admin.getUserById(user.id);
      const reporterEmail = reporterUser?.email;

      if (reporterEmail) {
        const reporterName = reporterUser?.user_metadata?.full_name?.split(' ')[0] || 'there';

        await sendEmail({
          to: reporterEmail,
          letter: {
            subject: 'Thank you for your report',
            preheader: 'We will review the story and take it from here.',
            eyebrow: 'REPORT RECEIVED',
            heading: 'Thank you for your report.',
            bodyHtml: [
              p(`Hi ${esc(reporterName)}. Thank you for taking the time to report a story on Our Stories. We take every report seriously.`),
              p('Our team will review the story and take the right action. Our Stories is a shared space for genuine family memories, and reports like yours help us keep it that way.'),
              p('You do not need to do anything else. We will handle it from here.', true),
            ].join(''),
            bodyText: [
              wrap(`Hi ${reporterName}. Thank you for taking the time to report a story on Our Stories. We take every report seriously.`),
              '',
              wrap('Our team will review the story and take the right action. Our Stories is a shared space for genuine family memories, and reports like yours help us keep it that way.'),
              '',
              wrap('You do not need to do anything else. We will handle it from here.'),
            ].join('\n'),
            note: 'Thank you for helping us protect this space.',
            reason: 'You are receiving this because you reported a story on Our Stories.',
          },
          idempotencyKey: `report-thanks-${story_id}-${user.id}`,
          tag: 'report',
        });
      }
    } catch (reporterEmailErr) {
      console.error('Failed to send reporter thank-you email:', reporterEmailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Report error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}