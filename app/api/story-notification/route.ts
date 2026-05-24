import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

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

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Ancestorii <support@ancestorii.com>',
              to: [authorEmail],
              subject: `${actorName} commented on your story — "${story.title}"`,
              html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f5f1e6;font-family:Georgia,'Times New Roman',serif;color:#3d3830;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr><td align="center" style="padding:48px 16px 56px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#fdfaf5;">
        <tr><td style="background-color:#16120c;padding:36px 40px 32px 40px;text-align:center;">
          <p style="font-size:10px;letter-spacing:5px;color:#7a6a4f;text-transform:uppercase;margin:0 0 14px 0;">A letter from</p>
          <p style="font-size:24px;letter-spacing:9px;color:#c8a557;text-transform:uppercase;margin:0;">Ancestorii</p>
        </td></tr>
        <tr><td style="background-color:#c8a557;height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:48px 40px 36px 40px;">
          <p style="font-size:24px;font-style:italic;color:#16120c;margin:0 0 32px 0;line-height:1.4;">Hi ${authorFirstName},</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;"><strong>${actorName}</strong> left a comment on your story <strong>&ldquo;${story.title}&rdquo;</strong>.</p>
          ${previewText ? `<div style="margin:0 0 22px 0;padding:16px 20px;background-color:#f5f1e6;border-left:3px solid #c8a557;font-size:15px;color:#3d3830;line-height:1.7;font-style:italic;">&ldquo;${previewText}&rdquo;</div>` : ''}
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Your story is sparking conversation. Head over to see what they said and join in.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
            <tr><td style="background-color:#16120c;padding:14px 28px;">
              <a href="${storyUrl}" style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#c8a557;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">View Comment</a>
            </td></tr>
          </table>
          <p style="font-size:15px;color:#3d3830;line-height:1.75;margin:0;font-style:italic;">Every comment is proof your story matters.</p>
          <p style="font-size:16px;color:#3d3830;margin:32px 0 4px 0;">&mdash; The Ancestorii Team</p>
        </td></tr>
        <tr><td style="padding:28px 40px 36px 40px;text-align:center;border-top:1px solid #ebe4d5;">
          <p style="font-size:11px;color:#a39c91;margin:0 0 6px 0;letter-spacing:2px;text-transform:uppercase;">Ancestorii Ltd &middot; London</p>
          <p style="font-size:12px;color:#a39c91;margin:0;"><a href="https://ancestorii.com" style="color:#ab8232;text-decoration:none;">ancestorii.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
            }),
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