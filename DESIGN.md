---
name: Ancestorii
description: A private family memory platform — clean, modern, high-contrast web UI where warmth comes from words and photographs, never from the palette.
colors:
  background: "#FFFFFF"
  ink: "#1A1A1A"
  ink-secondary: "#333333"
  gold: "#C8A557"
  gold-deep: "#A9842E"
  secondary: "#4F60D4"
  like: "#D2483F"
  comment: "#1D4E89"
  hairline: "#E6E6E6"
  surface-periwinkle: "#ECEEFC"
  surface-cool: "#F4F6FB"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.375rem, 2.5vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.gold-deep}"
    textColor: "{colors.ink}"
  button-emphasis:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "13px 27px"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  nav-link-active:
    textColor: "{colors.gold-deep}"
    typography: "{typography.label}"
  button-periwinkle:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
    typography: "{typography.label}"
  panel-highlight:
    backgroundColor: "{colors.surface-periwinkle}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Ancestorii

## 1. Overview

**Creative North Star: "The Bright Gallery"**

The interface is a bright, white-grounded gallery — but a gallery with rooms, not a single blank plane. White dominates and grounds everything; the family's photographs, voices, and stories are what hang on the walls, and they supply all the *warmth* — the literal expression of the brand's first principle, *warmth in the words, not the walls*. The room is calm, generously spaced, and confidently lit. Where a page needs depth, structure, or a place to group things, sections and panels step back onto clean, pale, **cool** tinted surfaces — the modern-SaaS layering of a product like Lattice — so the eye reads zones and hierarchy instead of one flat sheet. It earns trust by being crisp and modern, never by being soft.

Colour is disciplined. Gold (`#C8A557` / `#A9842E`) is the thin frame around the art — a small, deliberate accent on buttons, active states, links, hairlines, and icons, and its rarity is the point; gold never becomes a large fill or wash. Periwinkle (`#4F60D4`) is the confident cool second voice, for secondary CTAs, chips, illustration, and chart accents. Depth comes from pale cool tints on *surfaces* (`#ECEEFC`, `#F4F6FB`), never from warmth. That cool-versus-warm line is the whole game: a pale **cool** tint reads modern and is welcome; the same lightness turned **warm** — cream, parchment, sepia — is the "heirloom" cliché this system exists to reject, and stays banned. No dark mode, ever.

Type carries the two voices of the brand. Playfair Display (bold) is the engraved plaque — the wordmark, the page title, the hero question, the one line of a story we want to land with weight. DM Sans is the gallery signage — quiet, legible, everywhere else. Contrast is high by doctrine: near-black ink on white, no washed-out mid greys anywhere. Motion is a fresh web decision: responsive and restrained, ease-out, honouring reduced motion; we do not port the mobile app's timings, its periwinkle/green washes, or any heirloom treatment.

**Key Characteristics:**
- White grounds and dominates; pale **cool** tints (`#ECEEFC`, `#F4F6FB`) create depth and zones on surfaces. No dark mode; no warm/cream/sepia tints.
- Gold (`#C8A557` / `#A9842E`) is the rare primary accent — never a fill larger than a control. Periwinkle (`#4F60D4`) is the cool secondary/structural accent.
- High-contrast neutrals: `#1A1A1A` primary text, `#333333`-or-darker secondary. No muddy mid greys.
- Two typefaces only: Playfair Display (bold) for display; DM Sans for everything else.
- Warmth comes from copy and real family photography, never from the palette.

## 2. Colors

A high-contrast palette on a white-dominant ground, layered with pale cool tints for depth: near-black ink, two disciplined golds as the primary accent, a cool periwinkle secondary, clean cool surface tints, and two colours reserved strictly for social affordances.

### Primary
- **Signal Gold** (`#C8A557`): the brand accent. Used on primary buttons, active/selected states, links, icons, and thin lines. Small, deliberate elements only — never a section background, hero fill, or wash.
- **Deep Gold** (`#A9842E`): the working partner to Signal Gold. Used for hover/pressed states, gold text small enough to need extra contrast on white, borders, and hairlines. Darker so it holds contrast where Signal Gold would thin out.

### Secondary
- **Periwinkle** (`#4F60D4`): the cool, confident second colour, for secondary CTAs, chips, illustration, chart accents, and highlight moments. Distinct from gold (the primary brand accent) and from the reserved like/comment colours. Carries **white text** at button size (5.3:1 on white); reserve ink text for large periwinkle type only.

### Surface Tints (cool, pale — surfaces only)
- **Periwinkle Wash** (`#ECEEFC`): section and panel backgrounds, highlight cards — the tinted zones that give a page depth. `#1A1A1A` text clears AA on it comfortably (~15:1).
- **Cool Neutral Wash** (`#F4F6FB`): alternating section zones and subtle grouping — the quietest step off pure white.
- Tints are for **surfaces only** — never text, and never behind gold in a way that muddies it. Always pale enough that ink text stays AA.

### Neutral
- **Ink** (`#1A1A1A`): primary text, and the fill for high-emphasis dark buttons. Near-black, never pure `#000`.
- **Ink Secondary** (`#333333`): secondary text, meta, captions. `#333333` **or darker** — never a low-contrast washed grey.
- **White** (`#FFFFFF`): the dominant ground of the whole system. Sections and panels may step onto pale cool tints (see Surface Tints) for depth, but white still leads and every page reads as white-grounded.
- **Hairline** (`#E6E6E6`, proposed): clean neutral for dividers, input strokes, and subtle fills where a gold hairline would be too loud. A clean light neutral, never a muddy mid grey, and never a grey *background behind content*. (Open value — adjust freely; it is not one of the locked brand colours.)

### Functional (never decorative)
- **Like Red** (`#D2483F`): the like / heart affordance **only**. Appears nowhere else — not a palette colour, not decoration, not any other UI.
- **Comment Blue** (`#1D4E89`): the comment affordance **only**. Same rule — this colour exists for one job.

### Named Rules
**The Frame, Not The Wall Rule.** Gold frames; it never paints. Gold is permitted on controls and lines (buttons, active states, links, hairlines, icons) and forbidden as any fill larger than a control or as a background wash. Large surfaces *may* still carry colour — but only as a **pale cool tint** (`#ECEEFC` / `#F4F6FB`), never as gold. If a gold area is bigger than a button, it is wrong.

**The Cool-Not-Warm Rule.** Pale surface tints must be **cool** (periwinkle/blue family). A pale cool tint reads modern and is welcome; the same lightness turned warm — cream, parchment, sepia — is the heirloom look and is banned. Same lightness, opposite feel: cool passes, warm fails. This is the line that lets depth exist safely.

**The Gold-Leads Rule.** Gold is the primary brand accent; periwinkle (`#4F60D4`) is the secondary, structural voice. When both could apply, gold carries the primary action and brand moments and periwinkle supports. Never let periwinkle out-shout gold on a brand surface.

**The Two Golds Rule.** `#C8A557` and `#A9842E` are the only golds. No lighter, washed, or brown/sepia golds; no gold gradients that muddy toward brown. There is no third gold.

**The Reserved Colour Rule.** `#D2483F` means *like*. `#1D4E89` means *comment*. Neither appears anywhere else, ever.

## 3. Typography

**Display Font:** Playfair Display (Bold / Bold Italic), with Georgia, serif fallback.
**Body Font:** DM Sans (400 / 500 / 600), with system-ui, sans-serif fallback.

**Character:** A high-contrast serif paired with a clean geometric-humanist sans — a genuine contrast-axis pairing, so the two never blur into each other. Playfair supplies the moments of weight and voice; DM Sans supplies the quiet, legible connective tissue. Both faces carry over from the mobile app, kept for the web UI.

### Hierarchy
- **Display** (Playfair Bold, `clamp(2.5rem, 6vw, 4.5rem)`, line-height 1.05): wordmark, hero questions, the single biggest statement on a page. `text-wrap: balance`.
- **Headline** (Playfair Bold, `clamp(2rem, 4vw, 3rem)`, line-height 1.1): page titles. `text-wrap: balance`.
- **Title** (Playfair Bold, `clamp(1.375rem, 2.5vw, 1.75rem)`, line-height 1.2): section headings and "story moment" emphasis pulled out of running text.
- **Body** (DM Sans 400, `1rem`, line-height 1.6): all running text, UI copy, inputs. Cap measure at 65–75ch; `text-wrap: pretty` on long prose.
- **Label** (DM Sans 600, `0.875rem`, line-height 1.4, sentence case): buttons, nav, labels, meta, chips. Not uppercase, no wide tracking.

### Named Rules
**The Two Voices Rule.** Playfair for the things that carry weight or voice; DM Sans for everything functional. No third typeface in the web UI. Inter is removed from UI surfaces — but it stays untouched in the print / PDF pipeline (see Do's and Don'ts).

**The Sentence-Case Rule.** Labels and buttons are sentence case. No all-caps tracked eyebrows above sections; that scaffolding is banned.

## 4. Elevation

Flat by default. Depth is carried by the white ground plus a single hairline (`#E6E6E6`, or a gold-deep hairline for accented containers), not by shadow. Shadows are reserved for things that genuinely float above the page — dropdowns, dialogs, popovers, toasts — and stay soft and neutral. No heavy or dark drop shadows, no coloured "glow", and specifically no gold glow (a gold glow muddies the exact way the palette forbids).

### Shadow Vocabulary
- **Overlay Soft** (`box-shadow: 0 8px 28px rgba(26, 26, 26, 0.10)`): dropdowns, popovers, menus lifting off the page.
- **Modal Lift** (`box-shadow: 0 16px 48px rgba(26, 26, 26, 0.14)`): dialogs and sheets over a scrim.

### Named Rules
**The Flat-Gallery Rule.** Content sits flat on the white wall, separated by hairlines. A surface earns a shadow only by floating (overlay/modal). If a resting card has a drop shadow, remove it and use a hairline. Audit test: if it looks like a 2014 Material card, the shadow is wrong.

## 5. Components

### Buttons
- **Shape:** gently rounded (10px radius, `{rounded.md}`).
- **Primary:** Signal Gold fill (`#C8A557`) with Ink text (`#1A1A1A`) — ink on gold, never white on gold (white washes out below AA). Padding `14px 28px`, DM Sans 600.
- **Hover / Focus:** background shifts to Deep Gold (`#A9842E`), ink text held; focus shows a visible ring, not just a colour change. Transition ~150ms ease-out.
- **Emphasis (dark):** Ink fill (`#1A1A1A`) with white text — the maximal-contrast action for dense app UI where a gold button would repeat too often and lose its rarity. Use one gold *or* one dark primary per view, not a row of both.
- **Secondary / Ghost:** white background, ink text, 1px Deep Gold (`#A9842E`) hairline border; hover fills with the faintest gold tint (≤6% `#C8A557`) or shifts the border to full gold. Never a thick coloured side-stripe.

### Cards / Containers
- **Corner Style:** 14px radius (`{rounded.lg}`).
- **Background:** white (`#FFFFFF`) — always. No tinted or grey card backgrounds.
- **Shadow Strategy:** none at rest (see Elevation). Separation via a `#E6E6E6` hairline border.
- **Internal Padding:** 24px (`{spacing.lg}`).
- **Nesting:** never nest a card inside a card.

### Inputs / Fields
- **Style:** white background, 1px `#E6E6E6` hairline, 10px radius, ink text, DM Sans 400.
- **Focus:** border shifts to Signal Gold (`#C8A557`) with a soft 2px gold focus ring; no heavy glow.
- **Placeholder:** must clear 4.5:1 on white — use `#666666` or darker, never a pale grey.
- **Error:** border and message in a clear red; do not reuse Like Red (`#D2483F`) — that colour is reserved for the like affordance.

### Navigation
- **Style:** DM Sans 600 labels, ink by default. Active/current item in Deep Gold (`#A9842E`) or ink with a gold underline; hover shifts toward gold. Never rely on colour alone — pair the active state with weight or an underline.
- **Mobile:** collapses to a sheet/drawer over the white ground; generous tap targets.

### Social Affordances (signature)
- **Like:** heart icon; filled/active state uses Like Red (`#D2483F`) exclusively. Count in DM Sans, ink.
- **Comment:** comment icon; active/link state uses Comment Blue (`#1D4E89`) exclusively.
- These two colours appear on these two affordances and nowhere else.

## 6. Do's and Don'ts

### Do:
- **Do** keep white dominant as the ground, and use pale **cool** tints (`#ECEEFC` / `#F4F6FB`) deliberately on sections, cards, and panels to build depth and zones — for structure, not everywhere.
- **Do** reach for periwinkle (`#4F60D4`) as the cool secondary accent (secondary CTAs, chips, illustration, chart accents); keep gold the primary.
- **Do** use gold only as a small accent (buttons, active states, links, hairlines, icons), and only the two locked values `#C8A557` and `#A9842E`.
- **Do** set primary text to `#1A1A1A` and secondary text to `#333333` or darker; keep body contrast high.
- **Do** put Ink text on gold buttons; reserve white text for the dark Ink button.
- **Do** let warmth come from copy and real family photography.
- **Do** honour `prefers-reduced-motion`, meet WCAG AA cleanly, and keep tap targets generous.

### Don't:
- **Don't** use any **warm** off-white, cream, parchment, or sepia ground or tint, or a dark-mode / `.dark` theme. **This is the #1 prohibition:** no literal "heirloom" styling — no cream/parchment grounds, muddy or washed-out gold, ornate filigree, or low-contrast sepia tones. Pale **cool** tints on surfaces are the exception and are encouraged (see Surface Tints); the cool-versus-warm line is what keeps depth from drifting into the heirloom look.
- **Don't** fill a section, hero, or any area larger than a control with gold, or use gold gradients that muddy toward brown/sepia. (Large surfaces may carry a pale *cool* tint instead — never gold.)
- **Don't** use `#D2483F` or `#1D4E89` anywhere except the like and comment affordances respectively.
- **Don't** ship muddy low-contrast mid greys for text; never place a *grey* background behind content. (Pale cool tints are not greys and are allowed as surfaces.)
- **Don't** look like a dated genealogy tool (Ancestry/MyHeritage clinical charts, records-database greys), a morbid memorial/funeral-home site, craft-store scrapbook kitsch (stickers, washi tape, novelty fonts), or a dark "Jarvis"/sci-fi dashboard with neon or black glass.
- **Don't** introduce a third typeface into the web UI, and **don't** touch Inter, colours, or layout logic in the **print / PDF / Prodigi pipeline** (Memory Books, Canvases, Acrylic Prints) — Inter's presence there is a functional dependency, not an anti-pattern, and is out of scope for all design work.
- **Don't** port the mobile app's motion timings or its **green** washes, or any warm/heirloom treatment, to the web. (The web periwinkle `#4F60D4` / `#ECEEFC` is a fresh, deliberate web token — not a port of the mobile washes.)

<!-- Migration note (not yet applied): app/globals.css currently ships the default shadcn slate/neutral OKLCH ramp and a full .dark theme. Both contradict this system and must be removed when code changes are authorised. Scope fence: design work is WEB APP UI ONLY — do not modify PDF/print, Prodigi fulfilment, email templates, or Supabase queries/RLS/auth/storage. -->
