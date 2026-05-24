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
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Ancestorii <support@ancestorii.com>',
          to: [process.env.ADMIN_EMAIL || 'support@ancestorii.com'],
          subject: `[Report] Story reported: ${story.title}`,
          html: `
            <h2>A story has been reported by a community member</h2>
            <p><strong>Story:</strong> ${story.title}</p>
            <p><strong>Author:</strong> ${story.author_name}</p>
            <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
            <p><a href="https://www.ancestorii.com/stories/${story_id}">View story</a></p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('Failed to send report email:', emailErr);
    }

    // Email the reporter — thank you
    try {
      const { data: { user: reporterUser } } = await admin.auth.admin.getUserById(user.id);
      const reporterEmail = reporterUser?.email;

      if (reporterEmail) {
        const reporterName = reporterUser?.user_metadata?.full_name?.split(' ')[0] || 'there';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Ancestorii <support@ancestorii.com>',
            to: [reporterEmail],
            subject: 'Thank you for your report — Ancestorii',
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
          <p style="font-size:24px;font-style:italic;color:#16120c;margin:0 0 32px 0;line-height:1.4;">Hi ${reporterName},</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Thank you for taking the time to report a story on Our Stories. We take every report seriously.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Our team will review the story and take appropriate action. Our Stories is a shared space for genuine family memories, and reports like yours help us keep it that way.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">You do not need to do anything else. We will handle it from here.</p>
          <p style="font-size:15px;color:#3d3830;line-height:1.75;margin:0;font-style:italic;">Thank you for helping us protect this space.</p>
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