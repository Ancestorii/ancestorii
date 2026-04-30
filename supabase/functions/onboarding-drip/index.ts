// supabase/functions/onboarding-drip/index.ts
// ─────────────────────────────────────────────
// Cron-triggered Edge Function (runs once daily)
// Sends onboarding emails at Day 3, 7, 14, 21 after signup
// ─────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─────────────────────────────────────────────
// Drip schedule: which email to send on which day
// ─────────────────────────────────────────────
const DRIP_STEPS = [
  { day: 3, step: "day_3", subject: "Who comes to mind?", template: emailDay3 },
  { day: 7, step: "day_7", subject: "Got a photo on your phone?", template: emailDay7 },
  { day: 14, step: "day_14", subject: "From your phone to your shelf", template: emailDay14 },
  { day: 21, step: "day_21", subject: "Before the memories fade", template: emailDay21 },
];

Deno.serve(async (req) => {
  // Allow both POST (cron) and GET (manual test)
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const results: Record<string, number> = {};

    for (const drip of DRIP_STEPS) {
      const sent = await processDripStep(drip);
      results[drip.step] = sent;
    }

    console.log("Drip results:", JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Drip function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ─────────────────────────────────────────────
// Process a single drip step
// ─────────────────────────────────────────────
async function processDripStep(drip: typeof DRIP_STEPS[number]): Promise<number> {
  // Calculate the target signup date (users who signed up exactly `drip.day` days ago)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - drip.day);
  const dateStr = targetDate.toISOString().split("T")[0]; // e.g. "2026-04-19"

  // Find users who signed up on that date
  const { data: users, error: usersError } = await supabase
    .from("Profiles")
    .select("id, full_name, email")
    .gte("created_at", `${dateStr}T00:00:00.000Z`)
    .lt("created_at", `${dateStr}T23:59:59.999Z`);

  if (usersError) {
    console.error(`Error fetching users for ${drip.step}:`, usersError);
    return 0;
  }

  if (!users || users.length === 0) return 0;

  let sentCount = 0;

  for (const user of users) {
    // Check if this email was already sent to this user
    const { data: existing } = await supabase
      .from("onboarding_emails_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("step", drip.step)
      .maybeSingle();

    if (existing) continue; // Already sent, skip

    // Resolve email if not on the profiles table
    let email = user.email;
    let name = user.full_name;

    if (!email) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id);
      email = authUser?.email ?? null;
      if (!name) name = authUser?.user_metadata?.full_name ?? null;
    }

    if (!email) continue; // No email, skip

    const firstName = name ? name.split(" ")[0] : "there";

    // Send the email
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dante from Ancestorii <support@ancestorii.com>",
        to: [email],
        subject: drip.subject,
        html: drip.template(firstName),
      }),
    });

    if (res.ok) {
      // Log that we sent it
      await supabase.from("onboarding_emails_log").insert({
        user_id: user.id,
        step: drip.step,
        sent_at: new Date().toISOString(),
      });
      sentCount++;
      console.log(`Sent ${drip.step} to ${email}`);
    } else {
      const err = await res.json();
      console.error(`Failed to send ${drip.step} to ${email}:`, err);
    }
  }

  return sentCount;
}

// ─────────────────────────────────────────────
// Email wrapper — keeps the Ancestorii brand consistent
// ─────────────────────────────────────────────
function wrapEmail(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#fdfaf5; border-radius:2px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#16120c; padding:28px 40px; text-align:center;">
              <span style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; letter-spacing:3px; color:#ab8232; text-transform:uppercase;">
                Ancestorii
              </span>
            </td>
          </tr>

          <!-- Gold line -->
          <tr>
            <td style="background-color:#ab8232; height:2px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 20px 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 28px 40px; text-align:center; border-top:1px solid #e5e0d5;">
              <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#b0a99e; margin:0 0 4px 0;">
                Ancestorii Ltd &middot; London, United Kingdom
              </p>
              <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#b0a99e; margin:0;">
                <a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// DAY 3 — "Who comes to mind?"
// ─────────────────────────────────────────────
function emailDay3(name: string): string {
  return wrapEmail(`
    <p style="font-family:Georgia, serif; font-size:24px; color:#16120c; margin:0 0 24px 0; line-height:1.3;">
      Hey ${name}.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      When you think about the people who shaped your life, someone comes to mind first. You probably thought of them just now.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      That's where to start.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 28px 0;">
      Add them to Ancestorii — just their name and a photo. You're not committing to anything, you're just giving them a place.
    </p>

    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
      <tr>
        <td align="center" style="background-color:#16120c; border-radius:2px;">
          <a href="https://ancestorii.com/login"
             target="_blank"
             style="display:inline-block; padding:14px 36px; font-family:Arial, Helvetica, sans-serif; font-size:14px; letter-spacing:1.5px; text-transform:uppercase; color:#fdfaf5; text-decoration:none;">
            Add a Loved One
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="border-top:1px solid #e5e0d5;">&nbsp;</td></tr>
    </table>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0 0 6px 0;">
      The rest happens naturally from there.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0;">
      — Dante, Founder
    </p>
  `);
}

// ─────────────────────────────────────────────
// DAY 7 — "Got a photo on your phone?"
// ─────────────────────────────────────────────
function emailDay7(name: string): string {
  return wrapEmail(`
    <p style="font-family:Georgia, serif; font-size:24px; color:#16120c; margin:0 0 24px 0; line-height:1.3;">
      Hey ${name}.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      You've got photos on your phone right now of people you love. Probably hundreds.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      Pick one. Just one. The one that makes you feel something when you see it.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 28px 0;">
      Upload it to your library. Add a line about why it matters. That's a memory preserved — not just a file backed up, but a story attached to a moment.
    </p>

    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
      <tr>
        <td align="center" style="background-color:#16120c; border-radius:2px;">
          <a href="https://ancestorii.com/login"
             target="_blank"
             style="display:inline-block; padding:14px 36px; font-family:Arial, Helvetica, sans-serif; font-size:14px; letter-spacing:1.5px; text-transform:uppercase; color:#fdfaf5; text-decoration:none;">
            Upload a Memory
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="border-top:1px solid #e5e0d5;">&nbsp;</td></tr>
    </table>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0 0 6px 0;">
      One photo. One story. That's all it takes to start.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0;">
      — Dante, Founder
    </p>
  `);
}

// ─────────────────────────────────────────────
// DAY 14 — "From your phone to your shelf"
// ─────────────────────────────────────────────
function emailDay14(name: string): string {
  return wrapEmail(`
    <p style="font-family:Georgia, serif; font-size:24px; color:#16120c; margin:0 0 24px 0; line-height:1.3;">
      Hey ${name}.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      There's something different about holding a photo in your hands versus seeing it on a screen. It feels more real. More permanent.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      That's why we built Memory Books. You pick the photos, lay them out how you want, add your own words — and we print it as a hardcover book and post it to your door.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 28px 0;">
      It takes about 20 minutes to make. No templates, no restrictions. Your memories, your design.
    </p>

    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
      <tr>
        <td align="center" style="background-color:#16120c; border-radius:2px;">
          <a href="https://ancestorii.com/login"
             target="_blank"
             style="display:inline-block; padding:14px 36px; font-family:Arial, Helvetica, sans-serif; font-size:14px; letter-spacing:1.5px; text-transform:uppercase; color:#fdfaf5; text-decoration:none;">
            Create Your Book
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="border-top:1px solid #e5e0d5;">&nbsp;</td></tr>
    </table>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0 0 6px 0;">
      Something worth holding onto.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0;">
      — Dante, Founder
    </p>
  `);
}

// ─────────────────────────────────────────────
// DAY 21 — "Before the memories fade"
// ─────────────────────────────────────────────
function emailDay21(name: string): string {
  return wrapEmail(`
    <p style="font-family:Georgia, serif; font-size:24px; color:#16120c; margin:0 0 24px 0; line-height:1.3;">
      Hey ${name}.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      Phones break. Cloud storage fills up. Hard drives fail. But it's not the files that are irreplaceable — it's the stories behind them.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      The sound of your nan's laugh. The way your dad told that one story every Christmas. The photo your mum keeps in her purse.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
      Nobody wakes up and decides to forget. It just happens slowly. And by the time you notice, it's too late.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 28px 0;">
      Ancestorii is here whenever you're ready. No rush. But don't wait forever.
    </p>

    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
      <tr>
        <td align="center" style="background-color:#16120c; border-radius:2px;">
          <a href="https://ancestorii.com/login"
             target="_blank"
             style="display:inline-block; padding:14px 36px; font-family:Arial, Helvetica, sans-serif; font-size:14px; letter-spacing:1.5px; text-transform:uppercase; color:#fdfaf5; text-decoration:none;">
            Open Ancestorii
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="border-top:1px solid #e5e0d5;">&nbsp;</td></tr>
    </table>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0 0 6px 0;">
      Every family has a story worth keeping.
    </p>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0;">
      — Dante, Founder
    </p>
  `);
}