import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_USER_ID } from '@/lib/adminUser';

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

    if (!user || user.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const { story_id, action } = await req.json();

    if (!story_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing story_id or invalid action (approve|reject)' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: story, error: storyError } = await admin
      .from('stories')
      .select('id, title, body, author_id, author_name, slug, moderation_reason, moderation_category')
      .eq('id', story_id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Get author email
    const { data: { user: authorUser } } = await admin.auth.admin.getUserById(story.author_id);
    const authorEmail = authorUser?.email;
    const authorFirstName = story.author_name?.split(' ')[0] || 'there';

    if (action === 'approve') {
      await admin
        .from('stories')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          moderation_reason: null,
          moderation_category: null,
        })
        .eq('id', story_id);

      await admin.from('moderation_reviews').insert({
        story_id: story.id,
        source: 'manual',
        passed: true,
        reason: 'Manually approved by admin',
        reviewed_by: user.id,
      });

      if (authorEmail) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Ancestorii <support@ancestorii.com>',
              to: [authorEmail],
              subject: `Your story is now live — ${story.title}`,
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
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Great news — your story <strong>"${story.title}"</strong> has been reviewed and is now live on Our Stories.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Other families can now read, react to, and be inspired by your memory. Thank you for sharing it with the community.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
            <tr>
              <td align="center" style="background-color:#16120c;">
                <a href="https://www.ancestorii.com/stories/${story.slug}" target="_blank" style="display:inline-block;padding:18px 42px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#c8a557;text-decoration:none;">View Your Story</a>
              </td>
            </tr>
          </table>
          <p style="font-size:15px;color:#3d3830;line-height:1.75;margin:0;font-style:italic;">Every memory shared is a memory preserved.</p>
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
        } catch (e) {
          console.error('Failed to send approval email:', e);
        }
      }

      return NextResponse.json({ success: true, action: 'approved' });
    }

    if (action === 'reject') {
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

      // Record the strike
      await admin.from('moderation_strikes').insert({
        user_id: story.author_id,
        story_id: story.id,
        strike_number: newStrikeNumber,
        action_taken: actionTaken,
        suspended_until: suspendedUntil,
      });

      // Update story status
      await admin
        .from('stories')
        .update({ status: 'rejected' })
        .eq('id', story_id);

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
        strikeMessage = `<p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">This is your first strike. Everyone makes mistakes — no further action has been taken. Please review our community standards before publishing again.</p>`;
      } else if (newStrikeNumber === 2) {
        strikeMessage = `<p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">This is your second strike. As a result, you have been suspended from publishing to Our Stories for seven days. You can continue to use your private library as normal.</p>`;
      } else {
        strikeMessage = `<p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">This is your third strike. You have been permanently banned from publishing, commenting, or interacting with Our Stories. Your private library is not affected — My Family is yours and we do not go near it.</p>`;
      }

      if (authorEmail) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Ancestorii <support@ancestorii.com>',
              to: [authorEmail],
              subject: `Your story has been removed — ${story.title}`,
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
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">Your story <strong>"${story.title}"</strong> has been reviewed and unfortunately does not meet our community standards for Our Stories.</p>
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;"><strong>Reason:</strong> ${story.moderation_reason || 'Does not meet community standards.'}</p>
          ${strikeMessage}
          <p style="font-size:16px;color:#3d3830;line-height:1.8;margin:0 0 22px 0;">If you believe this was a mistake, you can reply to this email and we will take another look.</p>
          <p style="font-size:15px;color:#3d3830;line-height:1.75;margin:0;font-style:italic;">Our Stories is a space for genuine family memories. We appreciate your understanding.</p>
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
  } catch (err: any) {
    console.error('Admin moderate error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}