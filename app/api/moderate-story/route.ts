import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';


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

Be reasonable. A story mentioning a church wedding, a Christmas tradition, or a family member's career in politics is fine — those are genuine memories. Flag only content where the PRIMARY PURPOSE is religious messaging, political advocacy, hate, spam, or promotion rather than sharing a family memory.

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

    const { story_id } = await req.json();

    if (!story_id) {
      return NextResponse.json({ error: 'Missing story_id' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Fetch the story
    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, body, author_id, author_name, slug')
      .eq('id', story_id)
      .single();

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

    // Strip HTML from body for moderation
    const plainBody = story.body
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Call Claude API for moderation
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      // Fail open — publish anyway if AI is unavailable
      await admin
        .from('stories')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', story_id);

      return NextResponse.json({ moderation_result: 'approved' });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
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
    });

    if (!response.ok) {
      console.error('Moderation API error:', response.status);
      // Fail open — publish if AI is down
      await admin
        .from('stories')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', story_id);

      return NextResponse.json({ moderation_result: 'approved' });
    }

    const data = await response.json();
    const rawText = data.content
      ?.filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('') || '';

    let result: { pass: boolean; category?: string; reason?: string };
    try {
      result = JSON.parse(rawText.trim());
    } catch {
      console.error('Failed to parse moderation response:', rawText);
      // Fail open on parse error
      await admin
        .from('stories')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', story_id);

      return NextResponse.json({ moderation_result: 'approved' });
    }

    // Log the review
    await admin.from('moderation_reviews').insert({
      story_id: story.id,
      source: 'ai',
      passed: result.pass,
      category: result.category || null,
      reason: result.reason || null,
    });

    if (result.pass) {
      // Approved — publish immediately
      await admin
        .from('stories')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', story_id);

      return NextResponse.json({ moderation_result: 'approved' });
    }

    // Flagged — set to pending_review with reason
    await admin
      .from('stories')
      .update({
        status: 'pending_review',
        moderation_reason: result.reason || 'Flagged by AI moderation',
        moderation_category: result.category || 'unknown',
      })
      .eq('id', story_id);

    // Send admin notification email
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Ancestorii <support@ancestorii.com>',
          to: [process.env.ADMIN_EMAIL || 'support@ancestorii.com'],
          subject: `[Moderation] Story flagged: ${story.title}`,
          html: `
            <h2>A story has been flagged for review</h2>
            <p><strong>Title:</strong> ${story.title}</p>
            <p><strong>Author:</strong> ${story.author_name}</p>
            <p><strong>Category:</strong> ${result.category}</p>
            <p><strong>Reason:</strong> ${result.reason}</p>
            <hr />
            <p><strong>Story body:</strong></p>
            <p>${story.body}</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('Failed to send moderation email:', emailErr);
    }

    // Email the story author — under review notification
    try {
      const { data: { user: authorUser } } = await admin.auth.admin.getUserById(story.author_id);
      const authorEmail = authorUser?.email;

      if (authorEmail) {
        const authorFirstName = story.author_name?.split(' ')[0] || 'there';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Ancestorii <support@ancestorii.com>',
            to: [authorEmail],
            subject: `Your story is being reviewed — ${story.title}`,
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
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Thank you for sharing your story <strong>"${story.title}"</strong> on Our Stories.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Every story published to Our Stories is reviewed before it goes live to make sure it meets our community standards. Your story has been flagged for a manual review.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Please allow up to 24 hours for our team to review it. You will receive an email once a decision has been made.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Your private library is not affected in any way. This only applies to the public feed.</p>
          <p style="font-size:15px;color:#3d3830;line-height:1.75;margin:0;font-style:italic;">Thank you for your patience.</p>
          <p style="font-size:16px;color:#3d3830;margin:32px 0 4px 0;">— The Ancestorii Team</p>
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
    } catch (authorEmailErr) {
      console.error('Failed to send author review email:', authorEmailErr);
    }

    return NextResponse.json({
      moderation_result: 'flagged',
      reason: result.reason,
    });
  } catch (err: any) {
    console.error('Moderation error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}