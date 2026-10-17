// supabase/functions/_shared/letter.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE ONE SHELL EVERY ANCESTORII EMAIL IS DRAWN IN.
//
// Pure TypeScript with no Deno or Node API, so the same file renders the
// Edge Function emails (bundled from ../_shared) and the Next.js API route
// emails (imported from src/lib/email.ts). A change here reaches every
// letter on the next deploy.
//
// THE LOOK IS THE SITE'S: white ground, ink #0A0A0F, pink #FF2D87 for the
// accent, logo blue #2B4BFF for links, and one dark band for the facts that
// matter. Plus Jakarta Sans where the client will load it (Apple Mail, iOS)
// and the system sans everywhere else. Tables and inline styles, because
// Outlook's renderer understands nothing else. No gold anywhere.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://www.ancestorii.com';
export const SUPPORT = 'support@ancestorii.com';

export const INK = '#0A0A0F';
export const INK2 = '#45454F';
export const INK3 = '#7A7A85';
export const PINK = '#FF2D87';
export const BLUE = '#2B4BFF';
export const ORANGE = '#FF7A1A';
export const AQUA = '#12D3AC';
export const GROUND = '#F4F5F9';
export const CARD = '#FFFFFF';
export const SOFT = '#F7F7FA';
export const LINE = '#E7E7EC';
export const DARK_ACCENT = '#FF8FBF';

export const FONT = "'Plus Jakarta Sans',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";

/** The logo mark, served from the site. Rendered at 25x40 from a 76x120 PNG. */
export const MARK_URL = `${SITE_URL}/email/mark.png`;

export type Fact = { label: string; value: string; breakable?: boolean };

export type Letter = {
  /** The subject and the <title>. */
  subject: string;
  /** The line inbox previews show under the subject. */
  preheader: string;
  /** Small pink capitals above the heading. */
  eyebrow: string;
  heading: string;
  /** Paragraphs and blocks, already HTML (built with p(), steps(), box(), quote()). */
  bodyHtml: string;
  /** The same content as plain text paragraphs. */
  bodyText: string;
  button?: { label: string; href: string };
  /** Text after the button, in the quieter grey. */
  note?: string;
  /** A signature under the body: the founder's letters carry one. */
  signature?: { name: string; title: string };
  /** The dark band: two or three facts about what this email is about. */
  facts?: Fact[];
  /** The last sentence, under the card: why this arrived. */
  reason: string;
  /** A link for the letters a person can turn off. Transactional ones leave it off. */
  unsubscribe?: string;
};

/** User-controlled text going into an HTML document says what it says, never runs. */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** "Jordan" from "Jordan Smith", or null when there is nothing usable. */
export function firstName(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return null;
  const first = trimmed.split(/\s+/)[0];
  return first.length > 40 ? null : first;
}

/** Hard wrap at 76 columns for the plain text part. */
export function wrap(text: string, width = 76): string {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ` ${word}`;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out.join('\n');
}

/* == Body blocks =========================================================== */

/** A paragraph in the body. Pass HTML you have already escaped. */
export function p(html: string, muted = false): string {
  return `<p style="margin:0 0 16px 0; font-family:${FONT}; font-size:16px; line-height:26px; color:${muted ? INK2 : INK};">${html}</p>`;
}

/** A short, bolder line, for the sentence the letter turns on. */
export function lead(html: string): string {
  return `<p style="margin:0 0 18px 0; font-family:${FONT}; font-size:18px; line-height:28px; font-weight:700; letter-spacing:-0.2px; color:${INK};">${html}</p>`;
}

/** A framed box for the fact that matters most in the letter. */
export function box(label: string, html: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%; margin:4px 0 20px 0; border:1px solid ${LINE}; border-radius:14px; background-color:${SOFT};">
<tr><td style="padding:16px 18px; font-family:${FONT};">
<div style="font-size:11px; font-weight:700; letter-spacing:1.6px; color:${PINK}; line-height:16px;">${esc(label)}</div>
<div style="margin-top:6px; font-size:15px; line-height:24px; color:${INK};">${html}</div>
</td></tr></table>`;
}

/** A quotation: the question that was asked, the comment that was left. */
export function quote(text: string, by?: string): string {
  const who = by
    ? `<div style="margin-top:10px; font-size:13px; font-weight:700; letter-spacing:0.4px; color:${INK3};">${esc(by)}</div>`
    : '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%; margin:4px 0 20px 0;">
<tr>
<td width="4" style="width:4px; background-color:${PINK}; border-radius:4px; font-size:0; line-height:0;">&nbsp;</td>
<td style="padding:2px 0 2px 18px; font-family:${FONT}; font-size:17px; line-height:27px; color:${INK}; font-style:italic;">&ldquo;${esc(text)}&rdquo;${who}</td>
</tr></table>`;
}

/** A numbered list: what to do first, what happens next. */
export function steps(items: Array<{ title: string; text: string }>): string {
  const rows = items
    .map(
      (it, i) => `<tr>
<td width="34" valign="top" style="width:34px; padding:0 0 14px 0; font-family:${FONT}; font-size:13px; font-weight:800; color:${PINK}; line-height:24px;">0${i + 1}</td>
<td valign="top" style="padding:0 0 14px 0; font-family:${FONT};">
<div style="font-size:16px; font-weight:700; color:${INK}; line-height:24px; letter-spacing:-0.2px;">${esc(it.title)}</div>
<div style="margin-top:2px; font-size:14px; line-height:22px; color:${INK2};">${esc(it.text)}</div>
</td></tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%; margin:0 0 8px 0;">${rows}</table>`;
}

/** Plain text for a steps() list. */
export function stepsText(items: Array<{ title: string; text: string }>): string {
  return items.map((it, i) => `0${i + 1}  ${it.title}\n    ${wrap(it.text, 72).replace(/\n/g, '\n    ')}`).join('\n\n');
}

/* == The shell ============================================================= */

/** The mark and the wordmark, as the site draws them. */
function logo(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="width:25px; padding:0;">
<img src="${MARK_URL}" width="25" height="40" alt="" style="display:block; width:25px; height:40px; border:0; outline:none; text-decoration:none;" />
</td>
<td valign="middle" style="padding:0 0 0 10px; font-family:${FONT}; font-size:21px; font-weight:800; letter-spacing:-0.6px; color:${INK}; line-height:40px;">Ancestorii</td>
</tr></table>`;
}

function factsBand(facts: Fact[]): string {
  const cells = facts
    .map(
      (f, i) => `<td class="fact" valign="top" style="font-family:${FONT}; ${i > 0 ? `padding-left:20px; border-left:1px solid rgba(255,255,255,0.16);` : ''}">
<div style="font-size:11px; font-weight:700; letter-spacing:1.6px; color:${DARK_ACCENT}; line-height:16px;">${esc(f.label)}</div>
<div style="margin-top:6px; font-size:15px; font-weight:700; color:#FFFFFF; line-height:22px;${f.breakable ? ' word-break:break-word; overflow-wrap:anywhere;' : ''}">${esc(f.value)}</div>
</td>`,
    )
    .join('');
  return `<tr><td class="pad" bgcolor="${INK}" style="background-color:${INK}; padding:24px 40px 26px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;"><tr>${cells}</tr></table>
</td></tr>`;
}

/** The black pill button the site uses, with its pink arrow. */
function button(b: { label: string; href: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:auto; margin:6px 0 0 0;">
<tr><td align="center" bgcolor="${INK}" style="background-color:${INK}; border-radius:999px;">
<a href="${esc(b.href)}" style="display:block; padding:15px 26px 15px 28px; font-family:${FONT}; font-size:15px; font-weight:700; color:#FFFFFF; text-decoration:none; line-height:20px;">${esc(b.label)} <span style="color:${DARK_ACCENT}; padding-left:6px;">&rarr;</span></a>
</td></tr></table>`;
}

function signature(s: { name: string; title: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0 0;"><tr>
<td style="font-family:${FONT};">
<div style="font-size:16px; font-weight:700; color:${INK}; line-height:24px;">${esc(s.name)}</div>
<div style="font-size:13px; color:${INK3}; line-height:20px;">${esc(s.title)}</div>
</td></tr></table>`;
}

/** The whole letter as HTML. */
export function html(l: Letter): string {
  const btn = l.button ? button(l.button) : '';
  const note = l.note
    ? `<p style="margin:${l.button ? '16px' : '0'} 0 0 0; font-family:${FONT}; font-size:14px; line-height:22px; color:${INK3};">${esc(l.note)}</p>`
    : '';
  const sig = l.signature ? signature(l.signature) : '';
  const unsubscribe = l.unsubscribe
    ? ` <a href="${esc(l.unsubscribe)}" style="color:${INK3}; text-decoration:underline;">Stop these emails</a>.`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${esc(l.subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
<!--[if mso]>
<style>table, td, div, p, a { font-family: Arial, Helvetica, sans-serif !important; }</style>
<![endif]-->
<style>
  @media only screen and (max-width: 620px) {
    .wrap { width: 100% !important; }
    .pad { padding-left: 22px !important; padding-right: 22px !important; }
    .fact { display: block !important; width: 100% !important; border-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.16) !important; padding-left: 0 !important; padding-top: 14px !important; margin-top: 14px !important; }
    .fact:first-child { border-top: 0 !important; padding-top: 0 !important; margin-top: 0 !important; }
    .h1 { font-size: 27px !important; line-height: 33px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:${GROUND}; -webkit-font-smoothing:antialiased;">
<span style="display:none; font-size:1px; color:${GROUND}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${esc(l.preheader)}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${GROUND};">
<tr><td align="center" style="padding:32px 12px 40px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="wrap" style="width:600px; max-width:600px; background-color:${CARD}; border-radius:22px; overflow:hidden; border:1px solid ${LINE};">

<tr><td bgcolor="${PINK}" style="height:5px; font-size:0; line-height:0; background-color:${PINK};">
<!--[if !mso]><!--><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;"><tr>
<td width="34%" style="height:5px; font-size:0; line-height:0; background-color:${PINK};">&nbsp;</td>
<td width="33%" style="height:5px; font-size:0; line-height:0; background-color:${BLUE};">&nbsp;</td>
<td width="33%" style="height:5px; font-size:0; line-height:0; background-color:${ORANGE};">&nbsp;</td>
</tr></table><!--<![endif]-->
</td></tr>

<tr><td class="pad" style="padding:30px 40px 0 40px;">${logo()}</td></tr>

<tr><td class="pad" style="padding:34px 40px 0 40px; font-family:${FONT};">
<div style="font-size:12px; font-weight:700; letter-spacing:1.8px; color:${PINK}; line-height:18px;">${esc(l.eyebrow)}</div>
<h1 class="h1" style="margin:14px 0 0 0; font-family:${FONT}; font-size:31px; line-height:37px; font-weight:800; letter-spacing:-1px; color:${INK};">${esc(l.heading)}</h1>
</td></tr>

<tr><td class="pad" style="padding:22px 40px 0 40px;">
${l.bodyHtml}
${btn}
${note}
${sig}
</td></tr>

<tr><td style="padding:34px 0 0 0; font-size:0; line-height:0;">&nbsp;</td></tr>
${l.facts && l.facts.length ? factsBand(l.facts) : `<tr><td style="border-top:1px solid ${LINE}; font-size:0; line-height:0;">&nbsp;</td></tr>`}

</table>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="wrap" style="width:600px; max-width:600px;">
<tr><td class="pad" align="center" style="padding:22px 40px 0 40px; font-family:${FONT};">
<p style="margin:0; font-size:12px; line-height:19px; color:${INK3};">${esc(l.reason)}${unsubscribe}</p>
<p style="margin:8px 0 0 0; font-size:12px; line-height:19px; color:${INK3};">Every family has a story worth keeping. <a href="${SITE_URL}" style="color:${INK3}; text-decoration:underline;">ancestorii.com</a> &middot; <a href="mailto:${SUPPORT}" style="color:${INK3}; text-decoration:underline;">${SUPPORT}</a></p>
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>`;
}

/** The plain text alternative. Not optional: some people only ever see this one. */
export function text(l: Letter): string {
  const facts = (l.facts ?? []).map((f) => `${f.label.padEnd(18)}${f.value}`).join('\n');
  return [
    'ANCESTORII',
    '',
    l.heading.toUpperCase(),
    '',
    l.bodyText,
    l.button ? `\n${l.button.label}: ${l.button.href}` : '',
    l.note ? `\n${wrap(l.note)}` : '',
    l.signature ? `\n${l.signature.name}\n${l.signature.title}` : '',
    facts ? `\n${facts}` : '',
    '',
    '· · ·',
    wrap(l.reason),
    l.unsubscribe ? `Stop these emails: ${l.unsubscribe}` : '',
    `Every family has a story worth keeping. ${SITE_URL} · ${SUPPORT}`,
    '',
  ]
    .filter((line) => line !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}
