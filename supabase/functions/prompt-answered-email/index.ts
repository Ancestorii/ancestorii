// supabase/functions/prompt-answered-email/index.ts
// ─────────────────────────────────────────────
// Triggered by Database Webhook on public.sent_prompts UPDATE
// Sends email to the SENDER when their question has been answered
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
    const oldRecord = payload.old_record;

    if (!record || !record.id) {
      return new Response(JSON.stringify({ error: "No record in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Only fire when status transitions to 'answered' ──
    if (record.status !== "answered" || oldRecord?.status === "answered") {
      return new Response(
        JSON.stringify({ skipped: true, reason: "not_answered_transition" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Get sender email and name ──
    const {
      data: { user: senderUser },
    } = await supabase.auth.admin.getUserById(record.sender_id);

    if (!senderUser?.email) {
      console.log("No sender email found:", record.sender_id);
      return new Response(
        JSON.stringify({ skipped: true, reason: "no_sender_email" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: senderProfile } = await supabase
      .from("Profiles")
      .select("full_name")
      .eq("id", record.sender_id)
      .single();

    const senderFullName =
      senderProfile?.full_name ||
      senderUser.user_metadata?.full_name ||
      "there";
    const senderFirstName = senderFullName.split(" ")[0];

    const recipientName = record.recipient_name || "Someone";

    // ── Get the question text ──
    let question = record.custom_question || "";
    if (record.prompt_id && !question) {
      const { data: prompt } = await supabase
        .from("memory_prompts")
        .select("question")
        .eq("id", record.prompt_id)
        .single();
      question = prompt?.question || "";
    }

    // ── Build memory URL ──
    const memoryUrl = record.response_memory_id
      ? `${SITE_URL}/dashboard/memories/${record.response_memory_id}`
      : `${SITE_URL}/dashboard/our-family`;

    // ── Send email to sender ──
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ancestorii <support@ancestorii.com>",
        to: [senderUser.email],
        subject: `${recipientName} answered your question`,
        html: generateAnsweredEmail(
          senderFirstName,
          recipientName,
          question,
          memoryUrl
        ),
      }),
    });

    const data = await res.json();
    console.log(
      `Answered email sent to ${senderUser.email}:`,
      JSON.stringify(data)
    );

    return new Response(JSON.stringify({ sent: true, resend: data }), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending answered email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ═════════════════════════════════════════════
// EMAIL TEMPLATE
// ═════════════════════════════════════════════

function generateAnsweredEmail(
  senderFirstName: string,
  recipientName: string,
  question: string,
  memoryUrl: string
): string {
  return wrapEmail(`
    ${greeting(senderFirstName)}

    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 28px 0;">
      ${recipientName} answered your question. Their memory is waiting for you.
    </p>

    <!-- The question reminder -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
      <tr>
        <td style="border-left:3px solid #c8a557; padding:16px 24px; background-color:#faf6ee;">
          <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#ab8232; margin:0 0 8px 0;">
            You asked
          </p>
          <p style="font-family:Georgia, 'Times New Roman', serif; font-size:18px; font-style:italic; color:#16120c; line-height:1.5; margin:0;">
            &ldquo;${question}&rdquo;
          </p>
        </td>
      </tr>
    </table>

    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 32px 0;">
      They took the time to write it down. That matters more than you think. Go read what they remembered.
    </p>

    ${ctaButton(memoryUrl, "Read Their Memory")}

    ${closingLine("This is what Ancestorii is for.")}
    ${signature()}
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