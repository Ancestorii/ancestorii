import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, p, esc, quote, wrap } from '@/lib/email';

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

    const { story_id, type, comment_content } = await req.json();

    if (!story_id || !type) {
      return NextResponse.json({ error: 'Missing story_id or type' }, { status: 400 });
    }

    const validTypes = ['story_like', 'story_comment', 'story_share'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Fetch the story to get the author
    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, slug, author_id, author_name')
      .eq('id', story_id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Don't notify yourself
    if (story.author_id === user.id) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Get actor name
    const { data: actorProfile } = await admin
      .from('Profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const actorName = actorProfile?.full_name || user.user_metadata?.full_name || 'Someone';

    // Create in-app notification
    await admin.from('notifications').insert({
      user_id: story.author_id,
      type,
      actor_id: user.id,
      actor_name: actorName,
      story_id: story.id,
    });

    // Send email only for comments
    if (type === 'story_comment') {
      try {
        const { data: { user: authorUser } } = await admin.auth.admin.getUserById(story.author_id);
        const authorEmail = authorUser?.email;

        if (authorEmail) {
          const authorFirstName = story.author_name?.split(' ')[0] || 'there';
          const storyUrl = `https://www.ancestorii.com/stories/${story.slug}`;
          const previewText = comment_content
            ? (comment_content.length > 120 ? comment_content.slice(0, 120).trim() + '…' : comment_content)
            : null;

          await sendEmail({
            to: authorEmail,
            letter: {
              subject: `${actorName} commented on your story: ${story.title}`,
              preheader: previewText ? `"${previewText}"` : `${actorName} left a comment.`,
              eyebrow: 'NEW COMMENT',
              heading: `${actorName} commented on your story.`,
              bodyHtml: [
                p(`Hi ${esc(authorFirstName)}. <strong>${esc(actorName)}</strong> left a comment on your story <strong>&ldquo;${esc(story.title)}&rdquo;</strong>.`),
                previewText ? quote(previewText, actorName) : '',
                p('Your story is starting a conversation. Head over to see what they said and join in.'),
              ].join(''),
              bodyText: [
                wrap(`Hi ${authorFirstName}. ${actorName} left a comment on your story "${story.title}".`),
                '',
                previewText ? `"${previewText}"` : '',
                '',
                wrap('Your story is starting a conversation. Head over to see what they said and join in.'),
              ].join('\n'),
              button: { label: 'View the comment', href: storyUrl },
              note: 'Every comment is proof your story matters.',
              reason: 'You are receiving this because someone commented on your story on Our Stories.',
            },
            tag: 'story-comment',
          });
        }
      } catch (emailErr) {
        console.error('Failed to send comment email:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Notification error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}