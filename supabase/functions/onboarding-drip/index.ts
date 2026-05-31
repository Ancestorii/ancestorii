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
  { day: 3, step: "day_3", subject: "Who would you ask?", template: emailDay3 },
  { day: 7, step: "day_7", subject: "One question. One memory.", template: emailDay7 },
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
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - drip.day);
  const dateStr = targetDate.toISOString().split("T")[0];

  const matchedUsers: { id: string; email: string; name: string | null }[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      console.error(`Error fetching auth users for ${drip.step}:`, error);
      return 0;
    }

    const users = data?.users ?? [];
    if (users.length === 0) break;

    for (const u of users) {
      if (!u.created_at || !u.email) continue;
      const createdDate = u.created_at.split("T")[0];
      if (createdDate === dateStr) {
        matchedUsers.push({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name ?? null,
        });
      }
    }

    if (users.length < perPage) break;
    page++;
  }

  if (matchedUsers.length === 0) return 0;

  const userIds = matchedUsers.map((u) => u.id);
  const { data: profileRows } = await supabase
    .from("Profiles")
    .select("id, full_name")
    .in("id", userIds);

  const nameByUserId = new Map<string, string>();
  for (const row of profileRows ?? []) {
    if (row.full_name) nameByUserId.set(row.id, row.full_name);
  }

  let sentCount = 0;

  for (const user of matchedUsers) {
    const { data: existing } = await supabase
      .from("onboarding_emails_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("step", drip.step)
      .maybeSingle();

    if (existing) continue;

    const fullName = nameByUserId.get(user.id) ?? user.name;
    const firstName = fullName ? fullName.split(" ")[0] : "there";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dante from Ancestorii <support@ancestorii.com>",
        to: [user.email],
        subject: drip.subject,
        html: drip.template(firstName),
      }),
    });

    if (res.ok) {
      await supabase.from("onboarding_emails_log").insert({
        user_id: user.id,
        step: drip.step,
        sent_at: new Date().toISOString(),
      });
      sentCount++;
      console.log(`Sent ${drip.step} to ${user.email}`);
    } else {
      const err = await res.json();
      console.error(`Failed to send ${drip.step} to ${user.email}:`, err);
    }
  }

  return sentCount;
}

// ═════════════════════════════════════════════
// EMAIL VISUAL LAYER
// ═════════════════════════════════════════════

function wrapEmail(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Ancestorii</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">
          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">A letter from</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">Ancestorii</p>
            </td>
          </tr>
          <tr><td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:48px 40px 36px 40px;">${bodyContent}</td></tr>
          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">Ancestorii Ltd &middot; London</p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;"><a href="https://ancestorii.com" style="color:#ab8232; text-decoration:none;">ancestorii.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function greeting(name: string): string {
  return `<p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">Hey ${name},</p>`;
}

function body(text: string, marginBottom = 22): string {
  return `<p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 ${marginBottom}px 0;">${text}</p>`;
}

function closingLine(text: string): string {
  return `<p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#3d3830; line-height:1.75; margin:0; font-style:italic;">${text}</p>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
    <tr>
      <td align="center" style="background-color:#16120c;">
        <a href="${href}" target="_blank" style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function signature(): string {
  return `<p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:32px 0 4px 0;">&mdash; Dante</p>
  <p style="font-family:Georgia, 'Times New Roman', serif; font-size:13px; color:#9a9388; margin:0; font-style:italic;">Founder, Ancestorii</p>`;
}

function postscript(content: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
    <tr>
      <td style="border-top:1px solid #ebe4d5; padding-top:22px;">
        <p style="font-family:Georgia, 'Times New Roman', serif; font-size:14px; color:#7a7368; line-height:1.7; margin:0; font-style:italic;">
          <span style="font-style:normal; color:#ab8232; letter-spacing:2px; font-size:12px;">P.S.</span>&nbsp;&nbsp;${content}
        </p>
      </td>
    </tr>
  </table>`;
}

// ─────────────────────────────────────────────
// DAY 3 — "Who would you ask?"
// ─────────────────────────────────────────────
function emailDay3(name: string): string {
  return wrapEmail(`
    ${greeting(name)}
    ${body("When you think about the people who shaped your life, someone comes to mind first. You probably thought of them just now.")}
    ${body("What would you ask them? What's the one story you've heard a dozen times but never actually saved? What's the memory only they can tell?")}
    ${body("Ancestorii has dozens of ready-made questions — things like <em>&ldquo;What is your earliest childhood memory?&rdquo;</em> and <em>&ldquo;What meal reminds you most of home?&rdquo;</em> Pick one, type their name and email, and send it. They don't even need an account.", 38)}
    ${ctaButton("https://ancestorii.com/login", "Ask Someone a Question")}
    ${closingLine("When they answer, their memory appears in your family feed alongside yours.")}
    ${signature()}
    ${postscript("If it feels strange to start, that's okay. It's supposed to feel like something.")}
  `);
}

// ─────────────────────────────────────────────
// DAY 7 — "One question. One memory."
// ─────────────────────────────────────────────
function emailDay7(name: string): string {
  return wrapEmail(`
    ${greeting(name)}
    ${body("You've written your first memory. That's the hardest part done.")}
    ${body("Now think about someone in your family — your mum, your nan, your uncle. What's a story only they can tell? A recipe they never wrote down? A trip they always talk about? Something they remember differently to everyone else?")}
    ${body("Send them a question. It takes them two minutes to answer. They click the link, write what comes to mind, and their memory appears in your family feed. No app to download, no account to set up.", 38)}
    ${ctaButton("https://ancestorii.com/login", "Send a Question")}
    ${closingLine("What comes back might be something you never want to lose.")}
    ${signature()}
    ${postscript("Not sure what to ask? Browse the question library — there are chapters like Growing Up, Holidays, Around the Table, and The Stories We Always Retell.")}
  `);
}

// ─────────────────────────────────────────────
// DAY 14 — "From your phone to your shelf"
// ─────────────────────────────────────────────
function emailDay14(name: string): string {
  return wrapEmail(`
    ${greeting(name)}
    ${body("There's something different about holding a photo in your hands versus seeing it on a screen. It feels more real. More permanent.")}
    ${body("That's why we built Memory Books. You pick the photos from your family library, lay them out how you want, add your own words — and we print it as a hardcover book and post it to your door.")}
    ${body("It takes about 20 minutes to make. No templates, no restrictions. Your memories, your design.", 38)}
    ${ctaButton("https://ancestorii.com/login", "Create Your Book")}
    ${closingLine("Something worth holding onto.")}
    ${signature()}
    ${postscript("We also do canvas prints and acrylic prints — if there's a photo that belongs on a wall, not a phone.")}
  `);
}

// ─────────────────────────────────────────────
// DAY 21 — "Before the memories fade"
// ─────────────────────────────────────────────
function emailDay21(name: string): string {
  return wrapEmail(`
    ${greeting(name)}
    ${body("Phones break. Cloud storage fills up. Hard drives fail. But it's not the files that are irreplaceable — it's the stories behind them.")}
    ${body("The sound of your nan's laugh. The way your dad told that one story every Christmas. The photo your mum keeps in her purse.")}
    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
      <em style="font-style:italic; color:#16120c;">Nobody wakes up and decides to forget.</em> It just happens slowly. And by the time you notice, it's too late.
    </p>
    ${body("Your family feed is where those memories live — not scattered across phones and group chats, but in one private place where everyone can find them. The more your family contributes, the richer it gets. But it starts with one question.", 38)}
    ${ctaButton("https://ancestorii.com/login", "Open Ancestorii")}
    ${closingLine("Every family has a story worth keeping.")}
    ${signature()}
    ${postscript("Reply to this email if anything's getting in the way. I read every single one myself.")}
  `);
}