import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, p, esc, quote, wrap } from '@/lib/email';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_TYPES = ['story_like', 'story_comment', 'story_share'] as const;
type NotificationType = (typeof VALID_TYPES)[number];

// The client calls this right after its own insert; the row only has to be this fresh.
const RECENT_MS = 10 * 60 * 1000;

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
    const story_id = body?.story_id;
    const type = body?.type;

    if (!story_id || !type) {
      return NextResponse.json({ error: 'Missing story_id or type' }, { status: 400 });
    }

    if (typeof story_id !== 'string' || !UUID_RE.test(story_id)) {
      return NextResponse.json({ error: 'Invalid story_id' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const kind = type as NotificationType;
    const admin = getAdminClient();

    // Fetch the story to get the author. Only a published story can be liked, commented on or
    // shared (RLS), so anything else has no real action behind it.
    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, slug, author_id, author_name, status')
      .eq('id', story_id)
      .maybeSingle();

    if (storyError || !story || story.status !== 'published') {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Don't notify yourself
    if (story.author_id === user.id) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // The action must really have happened. The body says "I liked this"; the row the caller
    // wrote under RLS is the proof, and the comment's text comes from that row, never from the
    // body. Without this anyone signed in could fill an author's inbox (and, for comments,
    // their email) with whatever they liked.
    const recentSince = new Date(Date.now() - RECENT_MS).toISOString();
    let commentContent: string | null = null;

    if (kind === 'story_like') {
      const { data: reaction } = await admin
        .from('story_reactions')
        .select('id')
        .eq('story_id', story.id)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (!reaction) {
        return NextResponse.json({ error: 'Nothing to notify' }, { status: 403 });
      }
    } else if (kind === 'story_comment') {
      const { data: comment } = await admin
        .from('story_comments')
        .select('content')
        .eq('story_id', story.id)
        .eq('user_id', user.id)
        .gte('created_at', recentSince)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!comment) {
        return NextResponse.json({ error: 'Nothing to notify' }, { status: 403 });
      }
      commentContent = typeof comment.content === 'string' ? comment.content : null;
    } else {
      const { data: share } = await admin
        .from('story_shares')
        .select('id')
        .eq('story_id', story.id)
        .eq('user_id', user.id)
        .gte('created_at', recentSince)
        .limit(1)
        .maybeSingle();
      if (!share) {
        return NextResponse.json({ error: 'Nothing to notify' }, { status: 403 });
      }
    }

    // One "liked" or "shared" notice per person per story: liking, unliking and liking again
    // (or copying the link twice) does not pile up. Every comment is its own notice.
    if (kind !== 'story_comment') {
      const { data: already } = await admin
        .from('notifications')
        .select('id')
        .eq('user_id', story.author_id)
        .eq('actor_id', user.id)
        .eq('story_id', story.id)
        .eq('type', kind)
        .limit(1)
        .maybeSingle();
      if (already) {
        return NextResponse.json({ success: true, skipped: true });
      }
    }

    // Get actor name
    const { data: actorProfile } = await admin
      .from('Profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const actorName = actorProfile?.full_name || user.user_metadata?.full_name || 'Someone';

    // Create in-app notification
    const { error: notifyError } = await admin.from('notifications').insert({
      user_id: story.author_id,
      type: kind,
      actor_id: user.id,
      actor_name: actorName,
      story_id: story.id,
    });

    if (notifyError) {
      console.error('Notification insert error:', notifyError);
    }

    // Send email only for comments
    if (kind === 'story_comment') {
      try {
        const { data: { user: authorUser } } = await admin.auth.admin.getUserById(story.author_id);
        const authorEmail = authorUser?.email;

        if (authorEmail) {
          const authorFirstName = story.author_name?.split(' ')[0] || 'there';
          const storyUrl = `https://www.ancestorii.com/stories/${story.slug}`;
          const previewText = commentContent
            ? (commentContent.length > 120 ? commentContent.slice(0, 120).trim() + '…' : commentContent)
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
  } catch (err) {
    console.error('Notification error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
