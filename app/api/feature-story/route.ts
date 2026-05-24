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

const FEATURE_LABELS: Record<string, string> = {
  story_of_the_week: 'Story of the Week',
  best_family: 'Best Family Story',
  best_food_and_recipes: 'Best Food & Recipes Story',
  best_childhood: 'Best Childhood Story',
  best_love: 'Best Love Story',
  best_life_lessons: 'Best Life Lessons Story',
  best_traditions: 'Best Traditions Story',
  best_travel: 'Best Travel Story',
};

const VALID_FEATURE_TYPES = Object.keys(FEATURE_LABELS);

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const { story_id, feature_type } = await req.json();

    if (!story_id || !feature_type) {
      return NextResponse.json({ error: 'Missing story_id or feature_type' }, { status: 400 });
    }

    if (!VALID_FEATURE_TYPES.includes(feature_type)) {
      return NextResponse.json({ error: 'Invalid feature_type' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Verify story exists and is published
    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, author_id, author_name, slug')
      .eq('id', story_id)
      .eq('status', 'published')
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found or not published' }, { status: 404 });
    }

    // Delete existing featured story in this slot (if any)
    await admin
      .from('featured_stories')
      .delete()
      .eq('feature_type', feature_type);

    // Insert new featured story
    const { error: insertError } = await admin
      .from('featured_stories')
      .insert({
        story_id: story.id,
        feature_type,
        featured_by: user.id,
      });

    if (insertError) {
      console.error('Failed to feature story:', insertError);
      return NextResponse.json({ error: 'Failed to feature story' }, { status: 500 });
    }

    // Send notification email to the author
    const featureLabel = FEATURE_LABELS[feature_type];

    try {
      const { data: { user: authorUser } } = await admin.auth.admin.getUserById(story.author_id);
      const authorEmail = authorUser?.email;

      if (authorEmail) {
        const authorFirstName = story.author_name?.split(' ')[0] || 'there';
        const storyUrl = `https://www.ancestorii.com/stories/${story.slug}`;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Ancestorii <support@ancestorii.com>',
            to: [authorEmail],
            subject: `Your story has been chosen as ${featureLabel} ✦`,
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
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">We have some wonderful news.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Your story <strong>&ldquo;${story.title}&rdquo;</strong> has been chosen as our <strong>${featureLabel}</strong> on Our Stories.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Your memory is now featured at the top of the feed for the entire community to discover. Thank you for sharing something so meaningful.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
            <tr><td style="background-color:#16120c;padding:14px 28px;">
              <a href="${storyUrl}" style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#c8a557;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">View Your Story</a>
            </td></tr>
          </table>
          <p style="font-size:15px;color:#3d3830;line-height:1.75;margin:0;font-style:italic;">Keep writing. Your stories matter.</p>
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
      console.error('Failed to send featured story email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      feature_type,
      story_title: story.title,
    });
  } catch (err: any) {
    console.error('Feature story error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}