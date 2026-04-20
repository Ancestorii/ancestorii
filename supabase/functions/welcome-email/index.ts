// supabase/functions/welcome-email/index.ts
// Triggered by Database Webhook on public.Profiles INSERT
// Sends a branded welcome email via Resend API

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET"); // optional extra security

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Optional: verify webhook secret header
  if (WEBHOOK_SECRET) {
    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
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

    // --- Resolve email and name ---
    let email = record.email;
    let name = record.full_name;

    // If email missing from Profiles, look it up from auth.users
    if (!email) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(record.id);

      if (user?.email) {
        email = user.email;
      }
      if (!name && user?.user_metadata?.full_name) {
        name = user.user_metadata.full_name;
      }
    }

    if (!email) {
      console.log("No email found for user:", record.id);
      return new Response(JSON.stringify({ skipped: true, reason: "no_email" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // --- Send welcome email via Resend ---
    const firstName = name ? name.split(" ")[0] : null;
    const greeting = firstName || "there";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ancestorii <support@ancestorii.com>",
        to: [email],
        subject: "Welcome to Ancestorii",
        html: generateWelcomeEmail(greeting),
      }),
    });

    const data = await res.json();
    console.log("Resend response:", JSON.stringify(data));

    return new Response(JSON.stringify({ sent: true, resend: data }), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ─────────────────────────────────────────────
// Branded HTML Email Template
// ─────────────────────────────────────────────
function generateWelcomeEmail(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Ancestorii</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Inner card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#fdfaf5; border-radius:2px;">

          <!-- Header bar -->
          <tr>
            <td style="background-color:#16120c; padding:28px 40px; text-align:center;">
              <span style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; letter-spacing:3px; color:#ab8232; text-transform:uppercase;">
                Ancestorii
              </span>
            </td>
          </tr>

          <!-- Gold accent line -->
          <tr>
            <td style="background-color:#ab8232; height:2px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:44px 40px 20px 40px;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; color:#16120c; margin:0 0 24px 0; line-height:1.3;">
                Welcome, ${name}.
              </p>

              <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
                Thank you for joining Ancestorii — a place to preserve the stories, photos, and memories that make your family who they are.
              </p>

              <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7; margin:0 0 18px 0;">
                Here are a few things you can do to get started:
              </p>

              <!-- Step 1 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia, serif; font-size:18px; color:#ab8232; padding-top:1px;">1.</td>
                  <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7;">
                    <strong style="color:#16120c;">Add your loved ones</strong> — create profiles for the people whose stories matter most.
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia, serif; font-size:18px; color:#ab8232; padding-top:1px;">2.</td>
                  <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7;">
                    <strong style="color:#16120c;">Upload photos &amp; memories</strong> — build albums, timelines, and memory capsules.
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia, serif; font-size:18px; color:#ab8232; padding-top:1px;">3.</td>
                  <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#3d3830; line-height:1.7;">
                    <strong style="color:#16120c;">Create a Memory Book</strong> — turn your favourite photos into a beautifully printed book, delivered to your door.
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c; border-radius:2px;">
                    <a href="https://ancestorii.com/dashboard"
                       target="_blank"
                       style="display:inline-block; padding:14px 36px; font-family:Arial, Helvetica, sans-serif; font-size:14px; letter-spacing:1.5px; text-transform:uppercase; color:#fdfaf5; text-decoration:none;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-top:1px solid #e5e0d5;">&nbsp;</td>
                </tr>
              </table>

              <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0 0 6px 0;">
                Every family has a story worth keeping.
              </p>
              <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#8a8378; line-height:1.7; margin:0;">
                — The Ancestorii Team
              </p>
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
        <!-- /Inner card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}