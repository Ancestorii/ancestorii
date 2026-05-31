// supabase/functions/re-engagement-nudges/index.ts
// ─────────────────────────────────────────────
// Cron-triggered Edge Function (runs once daily)
// Three nudges that keep the engagement loop turning:
//   1. Skipped share — day 2 after signup, no prompts sent
//   2. Lonely feed — day 7, family has ≤1 memory
//   3. Unanswered prompt — day 3 after prompt sent, still pending
// ─────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://ancestorii.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const results: Record<string, number> = {};

    results.skipped_share = await processSkippedShare();
    results.lonely_feed = await processLonelyFeed();
    results.unanswered_prompts = await processUnansweredPrompts();

    console.log("Re-engagement results:", JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Re-engagement error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ─────────────────────────────────────────────
// 1. SKIPPED SHARE — Day 2 after signup
// User wrote first memory but never sent a question
// ─────────────────────────────────────────────
async function processSkippedShare(): Promise<number> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 2);
  const dateStr = targetDate.toISOString().split("T")[0];

  const matchedUsers: { id: string; email: string }[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) { console.error("Error fetching users for skipped_share:", error); return 0; }
    const users = data?.users ?? [];
    if (users.length === 0) break;

    for (const u of users) {
      if (!u.created_at || !u.email) continue;
      if (u.created_at.split("T")[0] === dateStr) {
        matchedUsers.push({ id: u.id, email: u.email });
      }
    }

    if (users.length < perPage) break;
    page++;
  }

  if (matchedUsers.length === 0) return 0;

  let sentCount = 0;

  for (const user of matchedUsers) {
    // Must have completed onboarding
    const { data: profile } = await supabase
      .from("Profiles")
      .select("onboarding_complete, full_name")
      .eq("id", user.id)
      .single();

    if (!profile?.onboarding_complete) continue;

    // Must have zero sent prompts
    const { count: promptCount } = await supabase
      .from("sent_prompts")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user.id);

    if ((promptCount || 0) > 0) continue;

    // Dedup
    const { data: existing } = await supabase
      .from("onboarding_emails_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("step", "nudge_share")
      .maybeSingle();

    if (existing) continue;

    const firstName = profile.full_name?.split(" ")[0] || "there";

    const res = await sendEmail(
      user.email,
      "Bring your family in",
      emailSkippedShare(firstName)
    );

    if (res) {
      await supabase.from("onboarding_emails_log").insert({
        user_id: user.id,
        step: "nudge_share",
        sent_at: new Date().toISOString(),
      });
      sentCount++;
      console.log(`Sent nudge_share to ${user.email}`);
    }
  }

  return sentCount;
}

// ─────────────────────────────────────────────
// 2. LONELY FEED — Day 7 after signup
// Family has ≤1 memory, feed hasn't grown
// ─────────────────────────────────────────────
async function processLonelyFeed(): Promise<number> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 7);
  const dateStr = targetDate.toISOString().split("T")[0];

  const matchedUsers: { id: string; email: string }[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) { console.error("Error fetching users for lonely_feed:", error); return 0; }
    const users = data?.users ?? [];
    if (users.length === 0) break;

    for (const u of users) {
      if (!u.created_at || !u.email) continue;
      if (u.created_at.split("T")[0] === dateStr) {
        matchedUsers.push({ id: u.id, email: u.email });
      }
    }

    if (users.length < perPage) break;
    page++;
  }

  if (matchedUsers.length === 0) return 0;

  let sentCount = 0;

  for (const user of matchedUsers) {
    // Dedup first (cheapest check)
    const { data: existing } = await supabase
      .from("onboarding_emails_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("step", "nudge_lonely_feed")
      .maybeSingle();

    if (existing) continue;

    // Get family
    const { data: membership } = await supabase
      .from("family_memberships")
      .select("family_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!membership) continue;

    // Count root memories
    const { count: memoryCount } = await supabase
      .from("family_memories")
      .select("*", { count: "exact", head: true })
      .eq("family_id", membership.family_id)
      .is("parent_memory_id", null);

    if ((memoryCount || 0) > 1) continue; // Feed has grown, skip

    // Get name
    const { data: profile } = await supabase
      .from("Profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const firstName = profile?.full_name?.split(" ")[0] || "there";

    const res = await sendEmail(
      user.email,
      "Your family feed is waiting",
      emailLonelyFeed(firstName)
    );

    if (res) {
      await supabase.from("onboarding_emails_log").insert({
        user_id: user.id,
        step: "nudge_lonely_feed",
        sent_at: new Date().toISOString(),
      });
      sentCount++;
      console.log(`Sent nudge_lonely_feed to ${user.email}`);
    }
  }

  return sentCount;
}

// ─────────────────────────────────────────────
// 3. UNANSWERED PROMPT — Day 3 after prompt sent
// Recipient hasn't answered, send them a reminder
// ─────────────────────────────────────────────
async function processUnansweredPrompts(): Promise<number> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 3);
  const dateStr = targetDate.toISOString().split("T")[0];

  const { data: pendingPrompts, error } = await supabase
    .from("sent_prompts")
    .select("id, sender_id, recipient_name, recipient_email, prompt_id, custom_question, token, expires_at")
    .eq("status", "sent")
    .gte("sent_at", `${dateStr}T00:00:00Z`)
    .lt("sent_at", `${dateStr}T23:59:59Z`);

  if (error || !pendingPrompts || pendingPrompts.length === 0) return 0;

  let sentCount = 0;

  for (const prompt of pendingPrompts) {
    if (!prompt.recipient_email) continue;

    // Skip expired
    if (prompt.expires_at && new Date(prompt.expires_at) < new Date()) continue;

    // Dedup: one reminder per prompt
    const { data: existing } = await supabase
      .from("onboarding_emails_log")
      .select("id")
      .eq("user_id", prompt.sender_id)
      .eq("step", `nudge_unanswered_${prompt.id}`)
      .maybeSingle();

    if (existing) continue;

    // Get question text
    let question = prompt.custom_question || "";
    if (prompt.prompt_id && !question) {
      const { data: promptData } = await supabase
        .from("memory_prompts")
        .select("question")
        .eq("id", prompt.prompt_id)
        .single();
      question = promptData?.question || "Share a memory with your family";
    }

    // Get sender name
    const { data: senderProfile } = await supabase
      .from("Profiles")
      .select("full_name")
      .eq("id", prompt.sender_id)
      .single();
    const senderName = senderProfile?.full_name || "Someone in your family";
    const senderFirstName = senderName.split(" ")[0];

    const answerUrl = `${SITE_URL}/answer/${prompt.token}`;
    const recipientFirstName = prompt.recipient_name?.split(" ")[0] || "there";

    const res = await sendEmail(
      prompt.recipient_email,
      `${senderFirstName} is still hoping to hear from you`,
      emailUnansweredPrompt(recipientFirstName, senderName, question, answerUrl)
    );

    if (res) {
      await supabase.from("onboarding_emails_log").insert({
        user_id: prompt.sender_id,
        step: `nudge_unanswered_${prompt.id}`,
        sent_at: new Date().toISOString(),
      });
      sentCount++;
      console.log(`Sent nudge_unanswered to ${prompt.recipient_email} for prompt ${prompt.id}`);
    }
  }

  return sentCount;
}

// ─────────────────────────────────────────────
// Shared email sender
// ─────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dante from Ancestorii <support@ancestorii.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(`Failed to send "${subject}" to ${to}:`, err);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Email send error for ${to}:`, err);
    return false;
  }
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

function questionBlock(question: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
    <tr>
      <td style="border-left:3px solid #c8a557; padding:16px 24px; background-color:#faf6ee;">
        <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#ab8232; margin:0 0 8px 0;">The question</p>
        <p style="font-family:Georgia, 'Times New Roman', serif; font-size:20px; font-style:italic; color:#16120c; line-height:1.5; margin:0;">&ldquo;${question}&rdquo;</p>
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
// NUDGE 1 — "Bring your family in"
// Day 2, wrote memory but never sent a question
// ─────────────────────────────────────────────
function emailSkippedShare(name: string): string {
  return wrapEmail(`
    ${greeting(name)}
    ${body("You wrote your first memory. It's there in your family feed, and it's beautiful.")}
    ${body("But right now, it's the only one.")}
    ${body("The whole point of Ancestorii is that your family adds their perspective too. The same moment, seen through different eyes. The stories only they can tell. The details you've already forgotten.")}
    ${body("Pick a question, send it to someone you love. They click the link, write their answer, and their memory appears alongside yours. No app to download, no account to set up.", 38)}
    ${ctaButton(`${SITE_URL}/login`, "Ask Someone a Question")}
    ${closingLine("One question is all it takes to turn a solo memory into a family one.")}
    ${signature()}
    ${postscript("Not sure who to ask? Start with the person who came to mind just now.")}
  `);
}

// ─────────────────────────────────────────────
// NUDGE 2 — "Your family feed is waiting"
// Day 7, family has ≤1 memory
// ─────────────────────────────────────────────
function emailLonelyFeed(name: string): string {
  return wrapEmail(`
    ${greeting(name)}
    ${body("It's been a week since you wrote your first memory. It's still there — the only entry in your family feed.")}
    ${body("One question can change that.")}
    ${body("Think about someone who shaped your life. Your mum. Your nan. Your uncle. What's a story only they can tell? A recipe they never wrote down? A trip they always talk about? Something they remember differently to everyone else?")}
    ${body("Send them a question. It takes them two minutes to answer. And what comes back might be something you never want to lose.", 38)}
    ${ctaButton(`${SITE_URL}/login`, "Send a Question")}
    ${closingLine("Your family feed is waiting for a second voice.")}
    ${signature()}
    ${postscript("Browse the question library if you need inspiration — chapters like Growing Up, Holidays, and The Stories We Always Retell.")}
  `);
}

// ─────────────────────────────────────────────
// NUDGE 3 — "{Name} is still hoping to hear from you"
// Day 3 after prompt sent, recipient hasn't answered
// ─────────────────────────────────────────────
function emailUnansweredPrompt(
  recipientFirstName: string,
  senderName: string,
  question: string,
  answerUrl: string
): string {
  return wrapEmail(`
    ${greeting(recipientFirstName)}
    ${body(`${senderName} asked you a question on Ancestorii a few days ago — and they're still hoping to hear your answer.`)}

    ${questionBlock(question)}

    ${body("It only takes a few minutes. Write what comes to mind — a few sentences is all it takes. There is no wrong answer. Just whatever you remember.", 38)}
    ${ctaButton(answerUrl, "Answer the Question")}
    ${closingLine("Some things are worth remembering. This is one of them.")}
    ${signature()}
    ${postscript("No account needed. Just click the link and write. The link expires in 30 days.")}
  `);
}