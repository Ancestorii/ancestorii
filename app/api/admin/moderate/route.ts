import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_USER_ID } from '@/lib/adminUser';
import { sendEmail, p, esc, box, wrap } from '@/lib/email';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Stories awaiting review. Read with the service role because the stories
// RLS policy only exposes non-published rows to their own author.
export async function GET() {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  const { data, error } = await getAdminClient()
    .from('stories')
    .select('id, title, slug, status, author_name, category, moderation_reason, moderation_category, created_at')
    .in('status', ['pending_review', 'rejected'])
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stories: data ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { story_id, action } = body ?? {};

    if (!story_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing story_id or invalid action (approve|reject)' }, { status: 400 });
    }

    if (typeof story_id !== 'string' || !UUID_RE.test(story_id)) {
      return NextResponse.json({ error: 'Invalid story_id' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, body, status, author_id, author_name, slug, moderation_reason, moderation_category')
      .eq('id', story_id)
      .maybeSingle();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Get author email
    const { data: { user: authorUser } } = await admin.auth.admin.getUserById(story.author_id);
    const authorEmail = authorUser?.email;
    const authorFirstName = story.author_name?.split(' ')[0] || 'there';

    if (action === 'approve') {
      const { error: approveError } = await admin
        .from('stories')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          moderation_reason: null,
          moderation_category: null,
        })
        .eq('id', story_id);

      if (approveError) {
        console.error('Approve update error:', approveError);
        return NextResponse.json({ error: 'Could not publish the story' }, { status: 500 });
      }

      await admin.from('moderation_reviews').insert({
        story_id: story.id,
        source: 'manual',
        passed: true,
        reason: 'Manually approved by admin',
        reviewed_by: user.id,
      });

      if (authorEmail) {
        try {
          await sendEmail({
            to: authorEmail,
            letter: {
              subject: `Your story is now live: ${story.title}`,
              preheader: 'Reviewed and published on Our Stories.',
              eyebrow: 'NOW LIVE',
              heading: 'Your story is live.',
              bodyHtml: [
                p(`Hi ${esc(authorFirstName)}. Good news: your story <strong>&ldquo;${esc(story.title)}&rdquo;</strong> has been reviewed and is now live on Our Stories.`),
                p('Other families can now read it, react to it and be moved by it. Thank you for sharing it with the community.'),
              ].join(''),
              bodyText: [
                wrap(`Hi ${authorFirstName}. Good news: your story "${story.title}" has been reviewed and is now live on Our Stories.`),
                '',
                wrap('Other families can now read it, react to it and be moved by it. Thank you for sharing it with the community.'),
              ].join('\n'),
              button: { label: 'View your story', href: `https://www.ancestorii.com/stories/${story.slug}` },
              note: 'Every memory shared is a memory kept.',
              facts: [
                { label: 'STORY', value: String(story.title ?? '') },
                { label: 'STATUS', value: 'Live on Our Stories' },
              ],
              reason: 'You are receiving this because you published a story to Our Stories on Ancestorii.',
            },
            idempotencyKey: `moderation-approved-${story.id}`,
            tag: 'moderation',
          });
        } catch (e) {
          console.error('Failed to send approval email:', e);
        }
      }

      return NextResponse.json({ success: true, action: 'approved' });
    }

    if (action === 'reject') {
      // Already rejected (a second click): the strike was counted the first time.
      if (story.status === 'rejected') {
        return NextResponse.json({ success: true, action: 'rejected', already: true });
      }

      // Count existing strikes
      const { data: strikes } = await admin
        .from('moderation_strikes')
        .select('strike_number')
        .eq('user_id', story.author_id)
        .order('strike_number', { ascending: false })
        .limit(1);

      const currentStrikes = strikes?.[0]?.strike_number || 0;
      const newStrikeNumber = currentStrikes + 1;

      let actionTaken: 'warning' | 'suspension' | 'ban';
      let suspendedUntil: string | null = null;

      if (newStrikeNumber === 1) {
        actionTaken = 'warning';
      } else if (newStrikeNumber === 2) {
        actionTaken = 'suspension';
        const until = new Date();
        until.setDate(until.getDate() + 7);
        suspendedUntil = until.toISOString();
      } else {
        actionTaken = 'ban';
      }

      // Update story status first: a strike is only recorded against a story that is rejected
      const { error: rejectError } = await admin
        .from('stories')
        .update({ status: 'rejected' })
        .eq('id', story_id);

      if (rejectError) {
        console.error('Reject update error:', rejectError);
        return NextResponse.json({ error: 'Could not reject the story' }, { status: 500 });
      }

      // Record the strike
      await admin.from('moderation_strikes').insert({
        user_id: story.author_id,
        story_id: story.id,
        strike_number: newStrikeNumber,
        action_taken: actionTaken,
        suspended_until: suspendedUntil,
      });

      // Log the review
      await admin.from('moderation_reviews').insert({
        story_id: story.id,
        source: 'manual',
        passed: false,
        category: story.moderation_category || 'rejected',
        reason: story.moderation_reason || 'Rejected by admin',
        reviewed_by: user.id,
      });

      // Build email based on strike number
      let strikeMessage = '';
      if (newStrikeNumber === 1) {
        strikeMessage = 'This is your first strike. Everyone makes mistakes, and no further action has been taken. Please read our community standards before publishing again.';
      } else if (newStrikeNumber === 2) {
        strikeMessage = 'This is your second strike. As a result, you have been suspended from publishing to Our Stories for seven days. You can continue to use your private library as normal.';
      } else {
        strikeMessage = 'This is your third strike. You have been permanently banned from publishing, commenting or interacting with Our Stories. Your private library is not affected. My Family is yours and we do not go near it.';
      }

      if (authorEmail) {
        try {
          await sendEmail({
            to: authorEmail,
            letter: {
              subject: `Your story has been removed: ${story.title}`,
              preheader: 'It did not meet the community standards for Our Stories.',
              eyebrow: 'OUR STORIES',
              heading: 'Your story has been removed.',
              bodyHtml: [
                p(`Hi ${esc(authorFirstName)}. Your story <strong>&ldquo;${esc(story.title)}&rdquo;</strong> has been reviewed and, unfortunately, does not meet our community standards for Our Stories.`),
                box('REASON', esc(story.moderation_reason || 'Does not meet community standards.')),
                p(esc(strikeMessage)),
                p('If you believe this was a mistake, reply to this email and we will take another look.'),
                p('Our Stories is a space for genuine family memories. We appreciate your understanding.', true),
              ].join(''),
              bodyText: [
                wrap(`Hi ${authorFirstName}. Your story "${story.title}" has been reviewed and, unfortunately, does not meet our community standards for Our Stories.`),
                '',
                `Reason: ${story.moderation_reason || 'Does not meet community standards.'}`,
                '',
                wrap(strikeMessage),
                '',
                wrap('If you believe this was a mistake, reply to this email and we will take another look.'),
                '',
                wrap('Our Stories is a space for genuine family memories. We appreciate your understanding.'),
              ].join('\n'),
              facts: [
                { label: 'STORY', value: String(story.title ?? '') },
                { label: 'STRIKE', value: `${newStrikeNumber} of 3` },
              ],
              reason: 'You are receiving this because you published a story to Our Stories on Ancestorii.',
            },
            idempotencyKey: `moderation-rejected-${story.id}-${newStrikeNumber}`,
            tag: 'moderation',
          });
        } catch (e) {
          console.error('Failed to send rejection email:', e);
        }
      }

      return NextResponse.json({
        success: true,
        action: 'rejected',
        strike_number: newStrikeNumber,
        action_taken: actionTaken,
      });
    }
  } catch (err) {
    console.error('Admin moderate error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}