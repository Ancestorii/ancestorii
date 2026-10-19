import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_USER_ID } from '@/lib/adminUser';
import { sendEmail, p, esc, wrap } from '@/lib/email';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const body = await req.json().catch(() => ({}));
    const { story_id, feature_type } = body ?? {};

    if (!story_id || !feature_type) {
      return NextResponse.json({ error: 'Missing story_id or feature_type' }, { status: 400 });
    }

    if (typeof story_id !== 'string' || !UUID_RE.test(story_id)) {
      return NextResponse.json({ error: 'Invalid story_id' }, { status: 400 });
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
      .maybeSingle();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found or not published' }, { status: 404 });
    }

    // One story per slot (unique_feature_type): replace whatever holds it in a single statement,
    // so a failure can never leave the slot empty.
    const { error: upsertError } = await admin
      .from('featured_stories')
      .upsert(
        {
          story_id: story.id,
          feature_type,
          featured_by: user.id,
          featured_at: new Date().toISOString(),
        },
        { onConflict: 'feature_type' }
      );

    if (upsertError) {
      console.error('Failed to feature story:', upsertError);
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

        await sendEmail({
          to: authorEmail,
          letter: {
            subject: `Your story has been chosen as ${featureLabel}`,
            preheader: `"${story.title}" is featured at the top of Our Stories.`,
            eyebrow: 'FEATURED',
            heading: `Chosen as ${featureLabel}.`,
            bodyHtml: [
              p(`Hi ${esc(authorFirstName)}. We have some wonderful news.`),
              p(`Your story <strong>&ldquo;${esc(story.title)}&rdquo;</strong> has been chosen as our <strong>${esc(featureLabel)}</strong> on Our Stories.`),
              p('It now sits at the top of the feed for the whole community to discover. Thank you for sharing something so meaningful.'),
            ].join(''),
            bodyText: [
              `Hi ${authorFirstName}. We have some wonderful news.`,
              '',
              wrap(`Your story "${story.title}" has been chosen as our ${featureLabel} on Our Stories.`),
              '',
              wrap('It now sits at the top of the feed for the whole community to discover. Thank you for sharing something so meaningful.'),
            ].join('\n'),
            button: { label: 'View your story', href: storyUrl },
            note: 'Keep writing. Your stories matter.',
            facts: [
              { label: 'STORY', value: String(story.title ?? '') },
              { label: 'FEATURED AS', value: featureLabel },
            ],
            reason: 'You are receiving this because you published a story to Our Stories on Ancestorii.',
          },
          idempotencyKey: `featured-${story.id}-${feature_type}`,
          tag: 'featured',
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
  } catch (err) {
    console.error('Feature story error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
