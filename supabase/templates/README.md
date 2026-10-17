# Auth email templates

Supabase Auth sends these itself: the password reset and the password-changed note, which the
product uses, and the email change, sign-up confirmation, magic link, invite and reauthentication
mails, which it does not currently use (the account email cannot be changed in the app yet, and
sign-ups are auto-confirmed). They render from the project's auth config, not from this repository,
so the copies here are the source of truth and the project holds a deployment of them.

They are drawn in the same shell as every other Ancestorii email (`supabase/functions/_shared/letter.ts`)
with GoTrue's placeholders left in place (`{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`,
`{{ .Token }}`, `{{ .SiteURL }}`). Segoe UI comes first in their font stack: GoTrue renders them with
Go's html/template, which strips HTML comments, so the Outlook-only font rule never reaches Outlook.

| File | Auth config key |
| --- | --- |
| `recovery.html` | `mailer_templates_recovery_content` |
| `confirmation.html` | `mailer_templates_confirmation_content` |
| `magic_link.html` | `mailer_templates_magic_link_content` |
| `email_change.html` | `mailer_templates_email_change_content` |
| `invite.html` | `mailer_templates_invite_content` |
| `reauthentication.html` | `mailer_templates_reauthentication_content` |
| `password_changed_notification.html` | `mailer_templates_password_changed_notification_content` |

Each has a matching `mailer_subjects_<name>` key. The password-changed note only goes out while
`mailer_notifications_password_changed_enabled` is true (it is; confirm it in the GET response).

## Deploying a change

Do not use `supabase config push`: it pushes the whole of `config.toml`, whose `[auth]` block holds
local-development values (`site_url = http://127.0.0.1:3000`) that would break production login.
Patch only the template and subject keys through the Management API, with the CLI's access token:

```
PATCH https://api.supabase.com/v1/projects/<ref>/config/auth
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
{ "mailer_templates_recovery_content": "<file contents>", "mailer_subjects_recovery": "..." }
```

Then `GET` the same endpoint and compare each returned string to its file byte for byte. The templates
were last deployed this way on 18 October 2026.
