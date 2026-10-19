import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, internalNote, p, esc, box, wrap } from '@/lib/email';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// One short model call plus two emails: ask the platform for a minute, give up on the model call
// well before that.
export const maxDuration = 60;
const AI_TIMEOUT_MS = 30_000;
// The moderator reads up to this much of the body: enough to judge any story, bounded in cost.
const MAX_BODY_CHARS = 20_000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ModerationResult = { pass: boolean; category?: string; reason?: string };

// The prompt asks for bare JSON, but a model can still wrap it in fences or a sentence.
function parseModeration(raw: string): ModerationResult | null {
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!parsed || typeof parsed.pass !== 'boolean') return null;
    return parsed as ModerationResult;
  } catch {
    return null;
  }
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const MODERATION_PROMPT = `You are a content moderator for Ancestorii, a family memory preservation platform. Users publish stories to a shared public feed called "Our Stories". Your job is to review each story and determine if it meets our community standards.

A story PASSES if it is a genuine family memory, anecdote, tribute, recipe, tradition, or personal reflection about family life.

A story FAILS if it contains ANY of the following:
- Religious content of any kind (sermons, scripture, proselytising, religious commentary)
- Political content of any kind (political opinions, endorsements, campaign material, political commentary)
- Hate speech, harassment, or discriminatory language
- Spam or repetitive/meaningless content
- Self-promotion or commercial content (advertising, product plugs, business promotion, affiliate links)
- Content that is clearly not a genuine family memory (fiction, AI-generated filler, jokes, memes, news commentary, essays unrelated to family)

Be reasonable. A story mentioning a church wedding, a Christmas tradition, or a family member's career in politics is fine. Those are genuine memories. Flag only content where the PRIMARY PURPOSE is religious messaging, political advocacy, hate, spam, or promotion rather than sharing a family memory.

Respond with ONLY a JSON object, no markdown, no backticks, no preamble:
{"pass": true}
OR
{"pass": false, "category": "one of: religious | political | hate_speech | harassment | discrimination | spam | self_promotion | commercial | not_a_memory", "reason": "Brief explanation of why this was flagged, 1-2 sentences max"}`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const story_id = body?.story_id;

    if (!story_id) {
      return NextResponse.json({ error: 'Missing story_id' }, { status: 400 });
    }

    if (typeof story_id !== 'string' || !UUID_RE.test(story_id)) {
      return NextResponse.json({ error: 'Invalid story_id' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Fetch the story
    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, body, status, author_id, author_name, slug, moderation_category')
      .eq('id', story_id)
      .maybeSingle();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Verify the requesting user owns this story
    if (story.author_id !== user.id) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    // Check if user is banned from Our Stories
    const { data: existingStrikes } = await admin
      .from('moderation_strikes')
      .select('strike_number, action_taken, suspended_until')
      .eq('user_id', user.id)
      .order('strike_number', { ascending: false })
      .limit(1);

    const latestStrike = existingStrikes?.[0];

    if (latestStrike?.action_taken === 'ban') {
      return NextResponse.json({
        error: 'You are permanently banned from publishing to Our Stories.',
        moderation_result: 'banned',
      }, { status: 403 });
    }

    if (
      latestStrike?.action_taken === 'suspension' &&
      latestStrike.suspended_until &&
      new Date(latestStrike.suspended_until) > new Date()
    ) {
      const until = new Date(latestStrike.suspended_until).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      return NextResponse.json({
        error: `You are suspended from Our Stories until ${until}.`,
        moderation_result: 'suspended',
      }, { status: 403 });
    }

    // The one way a story goes live from here. A failed update must never read as "approved".
    const publish = async () => {
      const { error: publishError } = await admin
        .from('stories')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', story_id);

      if (publishError) {
        console.error('Publish update error:', publishError);
        return NextResponse.json(
          { error: 'Could not publish your story. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ moderation_result: 'approved' });
    };

    // A story a person has already rejected does not get a second chance from the model: the
    // author can edit and resubmit, but it waits for another look by a person.
    const resubmitted = story.status === 'rejected';

    let result: ModerationResult;

    if (resubmitted) {
      result = {
        pass: false,
        category: story.moderation_category || 'resubmitted',
        reason: 'Resubmitted after a rejection: needs another look by a person.',
      };
    } else {
      // Strip HTML from body for moderation
      const plainBody = story.body
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_BODY_CHARS);

      // Call Claude API for moderation
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('ANTHROPIC_API_KEY is not set');
        // Fail open: publish anyway if AI is unavailable
        return publish();
      }

      let response: Response | null = null;
      try {
        response = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 150,
            system: MODERATION_PROMPT,
            messages: [{
              role: 'user',
              content: `Review this story:\n\nTitle: ${story.title}\n\nBody: ${plainBody}`,
            }],
          }),
          signal: AbortSignal.timeout(AI_TIMEOUT_MS),
        });
      } catch (fetchErr) {
        console.error('Moderation API request failed:', fetchErr);
      }

      if (!response || !response.ok) {
        console.error('Moderation API error:', response?.status ?? 'no response');
        // Fail open: publish if AI is down
        return publish();
      }

      const data = await response.json();
      const rawText = data.content
        ?.filter((block: { type?: string; text?: string }) => block.type === 'text')
        .map((block: { type?: string; text?: string }) => block.text)
        .join('') || '';

      const parsed = parseModeration(rawText);
      if (!parsed) {
        console.error('Failed to parse moderation response:', rawText);
        // Fail open on parse error
        return publish();
      }
      result = parsed;

      // Log the review
      await admin.from('moderation_reviews').insert({
        story_id: story.id,
        source: 'ai',
        passed: result.pass,
        category: result.category || null,
        reason: result.reason || null,
      });
    }

    if (result.pass) {
      // Approved: publish immediately
      return publish();
    }

    // Flagged: set to pending_review with reason
    const { error: holdError } = await admin
      .from('stories')
      .update({
        status: 'pending_review',
        moderation_reason: result.reason || 'Flagged by AI moderation',
        moderation_category: result.category || 'unknown',
      })
      .eq('id', story_id);

    if (holdError) {
      console.error('Moderation hold update error:', holdError);
      return NextResponse.json(
        { error: 'Could not submit your story. Please try again.' },
        { status: 500 }
      );
    }

    // Send admin notification email
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'support@ancestorii.com',
        letter: internalNote(
          'Story flagged for review',
          [
            ['Title', String(story.title ?? '')],
            ['Author', String(story.author_name ?? '')],
            ['Category', String(result.category ?? '')],
            ['Reason', String(result.reason ?? '')],
          ],
          box('STORY BODY', esc(String(story.body ?? '')).replace(/\n/g, '<br />')),
        ),
        // A 10-minute bucket: a double submit is sent once, a resubmission days later still alerts
        idempotencyKey: `moderation-flagged-${story_id}-${Math.floor(Date.now() / 600_000)}`,
        tag: 'moderation',
      });
    } catch (emailErr) {
      console.error('Failed to send moderation email:', emailErr);
    }

    // Email the story author, under review notification
    try {
      const { data: { user: authorUser } } = await admin.auth.admin.getUserById(story.author_id);
      const authorEmail = authorUser?.email;

      if (authorEmail) {
        const authorFirstName = story.author_name?.split(' ')[0] || 'there';

        await sendEmail({
          to: authorEmail,
          letter: {
            subject: `Your story is being reviewed: ${story.title}`,
            preheader: 'A quick check before it goes live. Your private library is not affected.',
            eyebrow: 'UNDER REVIEW',
            heading: 'Your story is being reviewed.',
            bodyHtml: [
              p(`Hi ${esc(authorFirstName)}. Thank you for sharing your story <strong>&ldquo;${esc(story.title)}&rdquo;</strong> on Our Stories.`),
              p('Every story published to Our Stories is checked to make sure it meets our community standards, and yours has been set aside for a closer look by a person.'),
              p('Please allow up to 24 hours. You will get an email as soon as a decision has been made.'),
              p('Your private library is not affected in any way. This only applies to the public feed.', true),
            ].join(''),
            bodyText: [
              wrap(`Hi ${authorFirstName}. Thank you for sharing your story "${story.title}" on Our Stories.`),
              '',
              wrap('Every story published to Our Stories is checked to make sure it meets our community standards, and yours has been set aside for a closer look by a person.'),
              '',
              wrap('Please allow up to 24 hours. You will get an email as soon as a decision has been made.'),
              '',
              wrap('Your private library is not affected in any way. This only applies to the public feed.'),
            ].join('\n'),
            facts: [
              { label: 'STORY', value: String(story.title ?? '') },
              { label: 'STATUS', value: 'Under review' },
            ],
            reason: 'You are receiving this because you published a story to Our Stories on Ancestorii.',
          },
          idempotencyKey: `moderation-review-${story_id}-${Math.floor(Date.now() / 600_000)}`,
          tag: 'moderation',
        });
      }
    } catch (authorEmailErr) {
      console.error('Failed to send author review email:', authorEmailErr);
    }

    return NextResponse.json({
      moderation_result: 'flagged',
      reason: result.reason,
    });
  } catch (err) {
    console.error('Moderation error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}