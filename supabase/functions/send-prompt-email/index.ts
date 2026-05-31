// supabase/functions/send-prompt-email/index.ts
// ─────────────────────────────────────────────
// Triggered by Database Webhook on public.sent_prompts INSERT
// Sends a branded email to the recipient with the question + answer link
// ─────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://ancestorii.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record || !record.id) {
      return new Response(JSON.stringify({ error: "No record in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Skip if no recipient email
    if (!record.recipient_email) {
      console.log("No recipient email, skipping:", record.id);
      return new Response(JSON.stringify({ skipped: true, reason: "no_email" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Get the question text ──
    let question = record.custom_question || "";
    if (record.prompt_id && !question) {
      const { data: prompt } = await supabase
        .from("memory_prompts")
        .select("question")
        .eq("id", record.prompt_id)
        .single();
      question = prompt?.question || "Share a memory with your family";
    }

    // ── Get sender name ──
    const { data: senderProfile } = await supabase
      .from("Profiles")
      .select("full_name")
      .eq("id", record.sender_id)
      .single();
    const senderName = senderProfile?.full_name || "Someone in your family";
    const senderFirstName = senderName.split(" ")[0];

    // ── Get family name ──
    const { data: family } = await supabase
      .from("families")
      .select("name")
      .eq("id", record.family_id)
      .single();
    const familyName = family?.name || "your family library";

    // ── Build answer URL ──
    const answerUrl = `${SITE_URL}/answer/${record.token}`;
    const recipientName = record.recipient_name || "there";
    const recipientFirstName = recipientName.split(" ")[0];

    // ── Check if parent memory is attached ──
    const hasParentMemory = !!record.parent_memory_id;

    // ── Send email ──
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ancestorii <support@ancestorii.com>",
        to: [record.recipient_email],
        subject: `${senderFirstName} asked you a question`,
        html: generatePromptEmail(
          recipientFirstName,
          senderName,
          question,
          answerUrl,
          familyName,
          hasParentMemory
        ),
      }),
    });

    const data = await res.json();
    console.log(`Prompt email sent to ${record.recipient_email}:`, JSON.stringify(data));

    return new Response(JSON.stringify({ sent: true, resend: data }), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending prompt email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ═════════════════════════════════════════════
// EMAIL TEMPLATE
// ═════════════════════════════════════════════

function generatePromptEmail(
  recipientFirstName: string,
  senderName: string,
  question: string,
  answerUrl: string,
  familyName: string,
  hasParentMemory: boolean
): string {
  const parentLine = hasParentMemory
    ? `<p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#7a7368; line-height:1.75; margin:0 0 22px 0; font-style:italic;">
        They also shared their own memory with you — you'll see it when you open the link.
      </p>`
    : "";

  return wrapEmail(`
    ${greeting(recipientFirstName)}

    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 28px 0;">
      ${senderName} asked you a question on Ancestorii — and they'd love to hear your answer.
    </p>

    <!-- The question -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
      <tr>
        <td style="border-left:3px solid #c8a557; padding:16px 24px; background-color:#faf6ee;">
          <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#ab8232; margin:0 0 8px 0;">
            Their question
          </p>
          <p style="font-family:Georgia, 'Times New Roman', serif; font-size:20px; font-style:italic; color:#16120c; line-height:1.5; margin:0;">
            &ldquo;${question}&rdquo;
          </p>
        </td>
      </tr>
    </table>

    ${parentLine}

    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 32px 0;">
      It only takes a few minutes. Write what comes to mind — a few sentences is all it takes. Your answer will be saved in ${familyName} for your family to treasure.
    </p>

    ${ctaButton(answerUrl, "Answer the Question")}

    ${closingLine("Some things are worth remembering.")}
    ${signature()}
    ${postscript("No account needed — just click the link, write your answer, and you're done. The link expires in 30 days.")}
  `);
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