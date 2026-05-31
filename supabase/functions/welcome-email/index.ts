// supabase/functions/welcome-email/index.ts
// ─────────────────────────────────────────────
// Triggered by Database Webhook on public.Profiles INSERT
// Sends a branded welcome email via Resend API
// ─────────────────────────────────────────────

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

    // Look up from auth.users if email or name is missing
    if (!email || !name) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(record.id);

      if (!email && user?.email) {
        email = user.email;
      }
      if (!name) {
        name =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          null;
      }
    }

    if (!email) {
      console.log("No email found for user:", record.id);
      return new Response(
        JSON.stringify({ skipped: true, reason: "no_email" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Send welcome email via Resend ---
    const firstName = name ? name.split(" ")[0] : "there";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dante from Ancestorii <support@ancestorii.com>",
        to: [email],
        subject: "Welcome to Ancestorii",
        html: generateWelcomeEmail(firstName),
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

// ═════════════════════════════════════════════
// EMAIL TEMPLATE
// ═════════════════════════════════════════════

function generateWelcomeEmail(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Welcome to Ancestorii</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e6; font-family:Georgia, 'Times New Roman', serif; color:#3d3830; -webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6;">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">

        <!-- Inner card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#fdfaf5;">

          <!-- Letterhead -->
          <tr>
            <td style="background-color:#16120c; padding:36px 40px 32px 40px; text-align:center;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:10px; letter-spacing:5px; color:#7a6a4f; text-transform:uppercase; margin:0 0 14px 0;">
                A letter from
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:9px; color:#c8a557; text-transform:uppercase; margin:0;">
                Ancestorii
              </p>
            </td>
          </tr>

          <!-- Gold seam -->
          <tr>
            <td style="background-color:#c8a557; height:2px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:48px 40px 36px 40px;">

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-style:italic; color:#16120c; margin:0 0 32px 0; line-height:1.4;">
                Welcome, ${name}.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 22px 0;">
                Thank you for joining Ancestorii &mdash; a place where your family&rsquo;s stories, voices, and memories live together, privately and permanently.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 32px 0;">
                You&rsquo;ve just created your family library. Here&rsquo;s what you can do with it:
              </p>

              <!-- Step 1 — Write your first memory -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">1.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    <strong style="color:#16120c; font-weight:600;">Write your first memory</strong> &mdash; a moment, a person, a feeling you don&rsquo;t want to lose. That&rsquo;s the first entry in your family&rsquo;s private feed.
                  </td>
                </tr>
              </table>

              <!-- Step 2 — Ask your family a question -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">2.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    <strong style="color:#16120c; font-weight:600;">Ask your family a question</strong> &mdash; pick from dozens of prompts and send one to someone you love. When they answer, their memory appears alongside yours.
                  </td>
                </tr>
              </table>

              <!-- Step 3 — Share a story with the world -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">3.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    <strong style="color:#16120c; font-weight:600;">Share a story with the world</strong> &mdash; when you&rsquo;re ready, publish on Our Stories, our public feed where families share the moments that shaped them.
                  </td>
                </tr>
              </table>

              <!-- Step 4 — Turn memories into something real -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:38px;">
                <tr>
                  <td width="40" valign="top" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-style:italic; color:#c8a557; line-height:1.5; padding-top:1px;">4.</td>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.75;">
                    <strong style="color:#16120c; font-weight:600;">Turn memories into something you can hold</strong> &mdash; create Memory Books, canvas prints, and acrylic prints from your photos, designed by you and delivered to your door.
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#16120c;">
                    <a href="https://ancestorii.com/login"
                       target="_blank"
                       style="display:inline-block; padding:18px 42px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#c8a557; text-decoration:none;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Closing -->
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; line-height:1.8; margin:0 0 0 0;">
                Ancestorii isn&rsquo;t something you use alone. It&rsquo;s built for families to contribute together &mdash; everyone adds their perspective, and the collection grows richer over time.
              </p>

              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#3d3830; line-height:1.75; margin:22px 0 0 0; font-style:italic;">
                Every family has a story worth keeping. Yours starts now.
              </p>

              <!-- Signature -->
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#3d3830; margin:32px 0 4px 0;">
                &mdash; Dante
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:13px; color:#9a9388; margin:0; font-style:italic;">
                Founder, Ancestorii
              </p>

              <!-- P.S. -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
                <tr>
                  <td style="border-top:1px solid #ebe4d5; padding-top:22px;">
                    <p style="font-family:Georgia, 'Times New Roman', serif; font-size:14px; color:#7a7368; line-height:1.7; margin:0; font-style:italic;">
                      <span style="font-style:normal; color:#ab8232; letter-spacing:2px; font-size:12px;">P.S.</span>&nbsp;&nbsp;Reply to this email any time. I read every one myself.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px 40px; text-align:center; border-top:1px solid #ebe4d5;">
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:11px; color:#a39c91; margin:0 0 6px 0; letter-spacing:2px; line-height:1.6; text-transform:uppercase;">
                Ancestorii Ltd &middot; London
              </p>
              <p style="font-family:Georgia, 'Times New Roman', serif; font-size:12px; color:#a39c91; margin:0; line-height:1.6;">
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