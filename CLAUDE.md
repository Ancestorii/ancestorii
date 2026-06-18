# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ancestorii is a Next.js platform where families privately capture loved ones, timelines, albums, and memories (the "My Family" feed) and share chosen stories publicly (the "Our Stories" feed), then turn them into physical heirlooms (printed Memory Books, Canvases, Acrylic Prints). Copy is British English throughout.

Customer-facing positioning: "a place where families capture and keep memories together." Do not use "family library" or "living library" language anywhere — it was retired from all copy. Product copy uses action verbs ("add a memory", "ask Mum a question"), not category nouns.

**Two feeds, two names (canonical):**
- **"Our Stories"** — the public community feed (SEO-indexed, anyone can read).
- **"My Family"** — the private feed; everything stays between invited members.
- `family feed` and `Our Memories` appearing in older code or comments refer to the same **My Family** feed. Standardise on "My Family" in new work.

## How to work in this repo (rules)

- **Surgical edits only.** Make the smallest change that satisfies the request. Do not refactor, rename, or "tidy" adjacent code unprompted.
- **Verify the DB before writing queries.** Confirm table/column shapes against the live schema (via the Supabase MCP server or by reading existing queries) before writing or editing any Supabase call. Do not invent columns.
- **Never touch Supabase logic during a purely visual change.** If a task is styling/layout only, leave queries, RLS assumptions, and data flow untouched.

## Design rules (hard)

- **No Cormorant Garamond anywhere on the public layer** (feed, sidebar, cards, footer) — it halates and reads fuzzy at the sizes used there.
- **No hyphens in copy.**
- **No greys anywhere.**
- **Fonts:** Playfair Display for serif headings; DM Sans for all UI chrome.

## Brand palette

The public app layer and the marketing layer use different palettes — keep them separate, do not bleed one into the other.

- **Public app layer:** pure white `#FFFFFF`, ink `#191512`, gold `#C8A557` / `#A9842E`.
- **Marketing layer:** navy `#0F2040`, gold `#D4AF37` / `#c8a557`, cream `#f5f1e6`.

Stack: Next.js 16 (App Router) · React 18 · TypeScript · Tailwind v4 · Supabase (Postgres + Auth + Storage + Edge Functions) · Stripe · Prodigi (print-on-demand) · Anthropic Claude (writing assistance) · Resend (email).

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build — uses --webpack, NOT turbopack (see gotcha below)
npm start        # serve production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

There is no test framework configured — do not assume `npm test` exists.

Supabase Edge Functions (in `supabase/functions/`) are deployed with the Supabase CLI (`supabase functions deploy <name>`), not by the Next build.

## Critical gotchas

- **`build` must stay on `--webpack`.** `@sparticuz/chromium` is registered as a `serverExternalPackages` / webpack external in `next.config.ts`. Switching the build to Turbopack breaks the Puppeteer print pipeline. Dev uses Turbopack; build uses Webpack — this asymmetry is intentional.
- **`ancestorii_full_schema.sql` is empty** — a placeholder, not the source of truth. The real schema lives in the remote Supabase project. Infer table shapes from the queries in code (or regenerate the dump).
- **The `Profiles` table is capitalized** (most other tables are snake_case lowercase).
- Edge Functions are **Deno**, not Node — they use `npm:` / `https://esm.sh` imports and are excluded from `tsconfig.json`. Don't apply Node/Next conventions there.

## Code layout

Two source roots with path aliases (`tsconfig.json`): `@/*` → `src/*`, `@app/*` → `app/*`.

- `app/` — App Router routes.
  - Root + marketing/SEO pages (`page.tsx`, `pricing`, `how-it-works`, `guides/*`, `compare`, `digital-legacy`, `memory-books`, …).
  - `app/dashboard/` — the authenticated app (see below).
  - `app/stories/` — public Stories community (own layout/nav; SEO-indexed).
  - `app/api/` — Route Handlers (AI assist, image convert, email validation, print export/fulfill, invites, story moderation/reporting).
  - `app/export/{book|canvas|acrylic}/[id]/` — server-rendered print layouts consumed by Puppeteer (not user-facing).
  - `app/{auth,login,signup,reset-password,invite,join,answer,onboarding}/` — auth & invitation flows.
- `src/lib/` — shared logic (Supabase clients, plan limits, navigation config, stories queries/mutations, image/PDF helpers).
- `src/components/` — shared React components (`ui/`, `dashboard/`, `stories/`, marketing sections).
- `src/types/` — shared types (memory-book, memory-canvas, acrylic-print, ambient `.d.ts`).

## Auth & Supabase clients

Three ways to talk to Supabase — pick by context:

- `getServerClient()` (`src/lib/supabase/server.ts`) — server components & server actions, cookie-bound, respects the signed-in user and RLS.
- `getBrowserClient()` (`src/lib/supabase/browser.ts`) — client components.
- **Service-role client** — `createClient(URL, SUPABASE_SERVICE_ROLE_KEY)` from `@supabase/supabase-js`, used only in trusted server contexts (API routes, export pages, webhooks) to **bypass RLS**. Never expose this to the browser.

For security-sensitive checks use `supabase.auth.getUser()` (verifies the token), not `getSession()`.

Gating happens in two layers: `src/middleware.ts` protects `/dashboard`, `/app`, `/onboarding` (redirects to `/login`; public paths are an explicit allow-list), and `app/dashboard/layout.tsx` re-checks the session server-side before rendering `_layout.client.tsx` (the sidebar/nav shell).

## Database conventions

RLS is on. Deletes are governed by **creator-only** policies, so a blocked delete returns **0 rows silently** rather than erroring. Use `deleteWithOwnerCheck()` (`src/lib/deleteWithOwnerCheck.ts`) — it does `.delete().select()` and surfaces a friendly toast when nothing was deleted.

Content is **family-scoped**: users join `families` via `family_memberships`, and loved ones / timelines / capsules / albums / memories belong to a family. Plan limits come from the `get_user_plan_limits` RPC (see `src/lib/usePlanLimits.ts`).

Tables seen across the code (non-exhaustive): `Profiles`, `subscriptions`, `plans`, `families`, `family_memberships`, `albums`, `timelines`, `timeline_events`, `capsules`, `library_media`, `memory_books`, `memory_book_pages`, `memory_book_page_assets`, `memory_canvases`, `acrylic_prints`, `orders`, `canvas_orders`, `acrylic_orders`, `stories` (`story_media`/`story_reactions`/`story_comments`/`story_shares`), `notifications`, `story_assistance_log`.

**Storage buckets** are private; access media through signed URLs. Buckets: `library-media`, `album-media`, `memory-media`, `user-media`, `capsule-media`, `timeline-media`, `story-media`. The Supabase image host is allow-listed in `next.config.ts`.

## Payments & print fulfillment

**Stripe** drives both subscriptions (Free/Premium) and one-time print orders. Checkout Sessions are created by Edge Functions (`create-checkout`, `create-book-checkout`, `create-canvas-checkout`, `create-acrylic-checkout`). The `stripe-webhook` function (`verify_jwt = false`) is the hub: it branches on `session.metadata.type` (`subscription` | `book_order` | `canvas_order` | `acrylic_order`), is **idempotent** (checks `payment_status` before acting), updates order/product rows, sends a Resend confirmation email, then triggers fulfillment via `POST {SITE}/api/fulfill/...` with an `x-fulfill-secret` header.

**Print pipeline (Prodigi):**
1. `/export/{book|canvas|acrylic}/[id]` server-renders the print layout using the service-role client, signs media URLs, and signals completion via a `data-export-ready="true"` element.
2. `/api/fulfill/[id]` (server submission) and `/api/export/[id]` (user PDF download) launch **Puppeteer** (`puppeteer-core`) to load that page and `page.pdf()` it. In production (Vercel/Lambda) they connect to **Browserless** over WS (`BROWSERLESS_TOKEN`); locally they launch local Chrome via a per-OS executable path. These routes set `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, and a long `maxDuration`.
3. The PDF/image is uploaded to Storage and submitted to the **Prodigi v4 API** (`api.prodigi.com`, `X-API-Key: PRODIGI_API_KEY`). The `prodigi-webhook` function ingests shipment/status updates.

The Book/Canvas/Acrylic **editors** live under `app/dashboard/{books|canvas|acrylic}/[id]/_components/` (left panel + stage + right panel + renderer + named layout components + preview overlay). Layout-type strings stored in the DB (e.g. `classic_cover`/`full_bleed_cover`/`trio_cover`) drive **both** the editor and the export renderer — keep the two in sync when adding layouts.

## AI writing assistance

`/api/ai/assist` calls the Anthropic Messages API directly (model `claude-sonnet-4-6`) with a fixed warm, British-English, no-markdown system prompt. It is gated by `Profiles.writing_assistance_enabled` and family membership, dispatches on a closed set of `VALID_TYPES` (each maps to a prompt builder + token budget), and logs usage to `story_assistance_log`. `/api/story-assist-public` is the public-stories variant; `/api/moderate-story` handles AI moderation. When adding an assist surface, extend `VALID_TYPES`, `buildPrompt`, and `getMaxTokens` together.

## UI conventions

- Toasts: use `safeToast` (`@/lib/safeToast`), which dedupes identical messages within 2.5s — not `react-hot-toast` directly. The root `<Toaster>` is configured in `app/layout.tsx`.
- Marketing/3D uses Three.js + react-three-fiber + drei + postprocessing, plus GSAP, Framer Motion, and Lenis (smooth scroll, provided via `app/providers/LenisProvider`).
- Analytics pixels (GTM, Reddit, Meta, Spotify) are injected in the root layout; the Puppeteer export explicitly blocks those network requests so they don't pollute PDFs.

## Environment variables

App: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `ANTHROPIC_API_KEY`, `PRODIGI_API_KEY`, `FULFILL_SECRET`, `BROWSERLESS_TOKEN`.
Edge Functions also use: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.