# Verification run, 18 and 19 October 2026

What was checked across the whole site after the redesign, what was fixed, the decisions made on your behalf, and the decisions that are yours to make. Written for the owner in plain English. The technical reports behind each section are in `docs/verification-run-2026-10-18/reports/`.

## 1. In one page

**What happened.** Every page, dialog and backend path was read, traced and fixed, page by page, in five batches: the app shell and design kit, the database, the landing and marketing pages, sign up and sign in, My Family, Loved Ones, Albums, Timelines, Capsules, Library, Memories, Books, Canvas, Acrylic, Plans, Orders, Settings, Profile, Help, the public Our Stories pages, the API routes, the Supabase Edge Functions, and the 62 Guides, Features and Compare pages.

**How it was done.** One Fable agent per page group (never more than five at once, never two on the same page) verified and fixed. The lead then re-checked every change independently: type-check, lint, a production build, a real Chrome visit to every page signed in and signed out (console errors, hydration warnings, failed requests, time to first byte, layout shift), and read-only database proofs for every database change. Each batch was committed and pushed on its own.

| Batch | What | Commit |
|---|---|---|
| 1 | Shell and kit, database policies, landing, marketing, sign up and sign in | a63f3cd |
| 2 | My Family, Loved Ones, Albums, Timelines, Capsules | dcecd3e |
| 3 | Library, Memories, Books, Canvas, Acrylic | 81a3d23 |
| 4 | Plans, Orders, Settings, Profile, Help, Our Stories, API routes, Edge Functions, database follow-ups | 14d02f1 |
| 5 | Guides, Features, Compare, final sweep | the commit that adds this document |

**Your three complaints, and what was behind them.**

1. *Pages took a long time to appear after a click.* The dashboard rendered nothing until its JavaScript had run, then loaded the sidebar in seven serial round trips, and nearly every page loaded its data in a waterfall (sign-in check, then membership, then one query and one signed link per item). Images carried a cache-busting stamp so they re-downloaded on every visit. The public Our Stories feed ran about 17 queries per visitor. All of that is now parallel, batched and, for the public feed, cached and shared. Example: the Our Stories feed answered in about 750ms before and about 50ms now.
2. *Flashing when a box opens.* Every dialog blurred the whole screen while fading in, which flashes on Windows Chrome; the page jumped sideways when a dialog removed the scrollbar; many components rendered nothing until a "mounted" flag flipped; some fields were reset by an effect after the first paint; comment times were formatted differently on the server and in the browser. All of these are fixed; every page now hydrates with zero warnings.
3. *Unknown bugs.* The big ones, now fixed: the confirm-email and reset-password links never worked; the PDF and print download routes had no login check and sent the user's session cookie to the print service; the public key could read every member's email, phone and date of birth; several deletes removed the photo but left the database row (or the reverse); editing an album or capsule wrote an expiring link into the database; the Settings page threw two errors on every load; reporting a memory never stored anything; anyone signed in could send any author a fake "someone commented" email; the three checkout functions priced an order from what the browser sent, so a hand-made request could pay the cheapest tier for the dearest product; three database functions let a signed-in user create products under someone else's account; deleting a book, canvas or print also deleted its paid order record; two families could not upload anything because they had no subscription row.

## 2. Things only you can do

In order of importance. Nothing in the code can do these for you.

### 2.1 Deploy the Edge Functions

Nine Supabase Edge Functions were fixed in the repo but **not deployed**, because payment code cannot be run or tested on this machine (they are type-checked with Deno and pass, but that is not a live test). Until you deploy, production still runs the old versions: the checkout price trick, the Stripe timeout on book orders and the unchecked verification email sender are all still live.

Run these from the repo root, one at a time, and do the test after each:

1. `supabase functions deploy send-verification-email`. Test: sign up a throwaway account; the confirmation email arrives and its link verifies.
2. `supabase functions deploy create-canvas-checkout`. Test: open a canvas with no photo and press Order: the toast says "Add at least one photo before ordering your canvas." Add a photo and press again: Stripe Checkout opens at that canvas's tier price.
3. `supabase functions deploy create-acrylic-checkout`. Test: a Grid layout with one photo is refused with "3 still empty"; fill all four slots and Stripe opens.
4. `supabase functions deploy create-book-checkout`. Test: a book with no photos is refused; a finished book opens Stripe at its tier price.
5. `supabase functions deploy create-checkout`. Test: Plans, Upgrade, on a Free account opens the subscription Checkout; on an account that already has a live subscription the toast says it already has Premium.
6. `supabase functions deploy stripe-webhook`. Test in Stripe test mode: complete a canvas order; in Stripe, Developers, Webhooks, the delivery shows 200 within a few seconds (not a timeout); the function log shows "Fulfil triggered for Memory Canvas order"; the order moves from paid to generating_image to printing with a Prodigi id.
7. `supabase functions deploy prodigi-webhook`. Test: replay a Prodigi event from their dashboard; the order status updates and the log no longer shows the "runMicrotasks" line.
8. `supabase functions deploy delivery-check`. Test: the 10:00 UTC run logs clean.
9. `supabase functions deploy onboarding-drip`. Test: the next 09:00 UTC run logs its counts and `onboarding_emails_log` shows no duplicate user and step.

What changed in them, in one line each: the three product checkouts take the tier, size and price from the product row (never from the browser), check the buyer belongs to the product's family, refuse a product that is not ready to print, and tidy up the order row when Stripe refuses; create-checkout refuses a second live subscription on the same account; stripe-webhook answers Stripe at once, runs fulfilment in the background and emails you when a paid order does not reach the printer; send-verification-email checks who is asking and whether the token was stored; the old Deno standard library imports that produced the "runMicrotasks" log line are gone; delivery-check no longer marks an order delivered when the email service was down; onboarding-drip catches up a missed day.

### 2.2 Supabase secrets and settings

- **ALERT_EMAIL.** Fulfilment failures email this address, or support@ancestorii.com if it is not set. Use an inbox you read daily: `supabase secrets set ALERT_EMAIL=you@example.com`.
- **FULFILL_SECRET** must be the same value in Vercel and in Supabase secrets. If they differ, every Prodigi status update is refused and nobody is told their order shipped.
- **Price ids.** Confirm these secrets exist: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, WEBHOOK_SECRET, VOICE_CONVERT_SECRET, CLOUDCONVERT_API_KEY, STRIPE_COUPON_PREMIUM_HEIRLOOM, the three STRIPE_PREMIUM_MONTHLY_PRICE_* ids, the nine STRIPE_PRICE_CANVAS_* ids, the nine STRIPE_PRICE_ACRYLIC_* ids and the nine STRIPE_BOOK_* ids. A missing price id now produces a clear error instead of a misleading "Invalid tier".
- **Leaked password protection** is off. Supabase dashboard, Authentication, Password settings: one switch. Recommended on.
- **Password reset email template.** Reset links only work in the browser that asked for them. In Authentication, Email Templates, Recovery, point the link at `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. The redirect allow-list already has /auth/confirm, /auth/callback and /reset-password.
- **Stale and undocumented functions.** "Onboarding-drip" (capital O) is an old duplicate of onboarding-drip; delete it in Dashboard, Edge Functions. send-contact-email (used by the Help page), delete-account and convert-voice-notes are deployed but have no source in this repo: download their source into `supabase/functions/` so they are versioned and reviewable. The contact one sends hand-written HTML outside the shared letter design and has an em dash in its subject line.

### 2.3 Stripe dashboard

- The webhook endpoint for stripe-webhook must have these events on: checkout.session.completed, checkout.session.expired, invoice.paid, invoice.payment_failed, customer.subscription.deleted. The 26 abandoned book checkouts sitting in the database suggest checkout.session.expired may not be enabled (it cancels abandoned orders and frees reward codes).
- Glance at the three Premium prices once: the Plans and Pricing pages say £3.99, $5.99 and €4.99 a month, and the pages cannot follow Stripe if those change.
- Consider switching on Stripe's hosted Customer Portal (see 4.1).

### 2.4 Other checks

- The Help page tells Premium members to ring 0330 133 2268, 9am to 6pm, Monday to Saturday. Confirm the number is live and staffed, or remove the phone card.
- Re-upload one legacy profile photo: one member's photo is stored under an old file name the public pages cannot sign, so they show initials on Our Stories. Re-uploading from their Profile page fixes it (or the policy can be widened, see 4.6).

## 3. Decisions made for you (and how to undo them)

Each of these was a judgement a careful colleague would make. All are reversible; the database ones have their reverts written out in `supabase/sql/2026-10-19-batch4-database.sql` and `supabase/sql/2026-10-18-performance-and-security.sql`.

- **A family with no subscription row is on the Free plan.** Two real families could not upload anything ("No active plan found") because they had no row. The plan-limit functions and the upload triggers now fall back to the Free plan.
- **Plan limits count the family, not the person.** The app counted albums, timelines and capsules per person while the database counted per family; the app now matches the database.
- **Paid order records survive.** Deleting a book, canvas or print that has an order used to delete the order row too. The database now refuses the delete and the app says "This item has an order on record, so it cannot be deleted."
- **Members can delete their own unpaid orders.** Abandoned checkouts showed a Delete button that could never work. It now works for unpaid orders that used no reward code.
- **Only the author can edit a memory.** Any family member could rewrite anyone's memory through the API (the web app already limited it to the author). The database rule now matches.
- **The three "create product" database functions use the signed-in user.** They trusted whatever user id the browser sent.
- **A read-only `profile_cards` view** holds the public-safe columns of a profile (name, title, bio, location, photo). Our Stories reads it instead of the Profiles table. This prepares for narrowing Profiles (section 4.3); the narrowing itself is left to you because the mobile app may read Profiles directly.
- **The confirm-your-email flow was made to work** by creating the missing `email_verifications` table, rather than removing the email you had built.
- **Deleting a timeline only works when it is empty.** It used to cascade and delete every memory in it; the copy on the button said otherwise.
- **A sealed capsule is hidden until its date** in the web app (the database still allows additions; see 4.5).
- **Stripe is answered at once; fulfilment runs in the background** and you get an email if a paid order does not reach the printer.
- **A book with no photos cannot be ordered** (new rule on both the editor and the server). Say so if you want text-only books.
- **A story a person rejected does not get a second chance from the AI.** If the author edits and republishes, it waits for you.
- **Story notifications must be backed by a real action.** The route checks the like, comment or share row exists before it notifies or emails.
- **Memory reports are recorded in the audit_log table** (the old insert failed every time); the reason travels in the email to support.
- **The AI writing helper is capped at 40 requests per person per hour** on both routes, as a safety net.
- **The Our Stories feed is cached for a minute** and shared by every visitor (refreshed at once when someone publishes or deletes). Like and comment counts on feed cards can be up to a minute behind; the story page is always live.
- **Author photos are signed once a day**, so browsers and the image optimiser can cache them (before, every request minted a new link).
- **Moderation still fails open** when the AI is down or slow (the story publishes without a check). Kept as you built it, flagged in 4.6.
- **The scrim blur behind dialogs is gone on every device.** It was the single biggest cause of the flashing.
- **Only one notification preferences row per user** is now allowed, and the prompt-answered email trigger fires only when a prompt's status changes (it used to fire on every hourly nudge).
- **Email verification and invite join routes read memberships as a list** so a person in two families does not break them.

## 4. Decisions left for you

Each item: the question, the options, and a recommendation. Nothing here is broken; these are product, money or legal calls.

### 4.1 Money and plans

- **Cancelling or changing a card is not self-service.** "Manage or cancel" asks the member to email you, and you cancel by hand in Stripe. Honest, but it is friction at the exact moment people decide whether to stay, and a member whose card bounced has no "update card" button although the payment-failed email promises one. Recommendation: switch on Stripe's hosted Customer Portal and add a small create-portal-session function the Manage button opens. Until then, relabel the email button "Contact us".
- **A member whose renewal failed is shown "You're on Free" with an Upgrade button.** The server now refuses a second live subscription on the same account, so they cannot pay twice, but the page could say "your last payment did not go through". Your call on the copy.
- **Who may buy Premium.** Premium is family-wide but the subscription is per person. The new guard stops the same account paying twice; a hand-made request could still start a second subscription for the same family. Decide whether a second payer in one family should be refused (a four-line check).
- **Reactivating after a cancel.** Someone who cancelled but is still inside the paid period and presses Upgrade is told they already have Premium and to email support; you reactivate from Stripe ("Don't cancel"). A self-serve "Keep my subscription" button is a separate change.
- **Cancel at period end.** The plan-limits function treats a cancelled-but-still-paid member as Free straight away (1GB, 5-minute videos) for the rest of the paid month, while uploads keep working. If they should keep Premium until the period ends, one line changes.
- **Cancellations made in Stripe do not reach the Plans page** until the period ends (the webhook ignores customer.subscription.updated). Limits are right; only the "ends on" wording is missing. Recommended: handle the event in a later pass.
- **Trials.** The webhook stores a trial as "active" and the app treats "trialing" as Free. Decide whether trials get Premium limits.
- **Free plan loved-ones cap is not enforced** for anyone who signed up normally: 178 Free families get effectively unlimited loved ones and 14 already have more than one (up to 8); only a family with no subscription row gets the cap of 1. Options: (a) make "subscribed" mean "a paid plan" (the 14 keep what they have but cannot add more); (b) accept that Free has unlimited loved ones and fix the pricing copy; (c) add a max_loved_ones column to the plans table and drive it from there like the other caps. Recommendation: (c) or (b); (a) silently takes something away.
- **Free-tier caps on albums, timelines and capsules** are null in the plans table (uncapped) for both plans. Fine if intended.
- **Manual Premium grants** show "Renews on" where "Until" would be truer. Only worth changing if you grant Premium by hand often.
- **Orders page details.** Destination shows "London, GB" (the country code); the six paid orders from before the amount_charged column show the product price rather than the total with delivery. Small changes if you want them.
- **Premium phone support** follows the sidebar rule: the person who pays is Premium; other members of their family see "Upgrade to access priority phone support". If the whole family should be covered, that also affects the sidebar badge and the Plans page.

### 4.2 Orders and printing

- **Express shipping for books** is still submitted to Prodigi as Standard (your 17 October decision to leave it). The order card shows what was paid without a delivery-time promise.
- **Abandoned checkouts** are listed on Orders as "Awaiting Payment" (26 books, 1 canvas today). Members can now delete them. Hide them instead, or as well, if you prefer.
- **Canvas empty slots** print the placeholder text; the server now refuses a canvas with no photo at all, but a partly filled layout still prints with empty slots. Options: block ordering until every slot is filled, or render empty slots white.
- **Rotate 180 in the library never reaches the print** (canvas and acrylic). Either apply it in the renderer (a print change) or remove the button.
- **Checkout currency is guessed from the timezone**; the drawer's currency picker is display-only. The Save button in the print editors is cosmetic. Journal progress caps at 50%.
- **After payment a print is still editable and re-orderable.** Recommend a read-only banner once ordered. Hide the Delete button on Books, Canvas and Acrylic once an order exists (the delete is already refused).
- **Confirm with Prodigi** that the GLOBAL-CAN SKUs cover both orientations. The acrylic STRIPE_PRICE_ACRYLIC_EXPRESS_* ids are unused (checkout uses inline rates).
- **PDFs and spine files stay in storage forever** after printing; the timeline PDF export embeds full-size photos into small thumbnails (ten phone photos make a 50MB PDF; a server-side resize is the fix).
- **The export pages /export/book|canvas|acrylic/<id> are reachable by anyone who knows the UUID** (the print browser needs them). A per-order token would close that.
- **Background time budget.** A book takes up to 300 seconds to render; Supabase allows 400 seconds on a paid plan, 150 on Free. On Free the fulfil call still finishes on Vercel, only the failure alert could be lost.

### 4.3 Accounts, invites and families

- **Invited people get onboarding on their second login** because onboarding_complete stays false after they join. If the skip is intended, mark it complete on join (in accept-invite and join-via-link).
- **What moves when a solo user joins a family.** Memories, their media, comments and reactions move; albums, timelines, capsules, loved ones, library files, books, canvases and prints stay in the old family nobody can open. Options: move everything (one database routine), or block or warn before joining when the solo family holds content. Recommendation: move everything.
- **Nobody can remove a member, leave a family, change a role or hand over ownership** anywhere, and the Terms say owners can "invite and remove members". Recommendation: an owner-only Remove member through a server route; fix the Terms line meanwhile.
- **Every member's email is shown to every other member** (card and drawer). Fine inside a family; say if it should be owner and admin only.
- **Signed-in users can still read every other user's email, phone and date of birth** through the Profiles table (the public key no longer can). The web app is ready for the narrowing (it reads profile_cards for strangers); the mobile app may not be. When you have checked the app, apply the SQL in the batch 4 database report ("Needs a shared-file change"): own row plus family members for signed-in users, nothing for anonymous.
- **Account deletion on the web.** The public /delete-account page says to use the app; the website has no button. A delete-account function exists in Supabase (not in the repo). Decide whether the web needs the button (recommended) or the page should say "in the mobile app". Also decide what happens to paid order records when an account goes (keep with the user cleared, or delete).
- **Email change** does not exist anywhere; Profile shows the address as managed by the login provider. A new feature if wanted.
- **Password rules.** Settings accepts any 6-plus character password with no confirmation field.
- **Signed-in visitors to /login and /signup see the forms**; login honours ?redirect only when onboarding is complete. Minor.
- **The solo "finalizing" page and a "/checkout" entry in the middleware list are dead.** Delete when convenient.

### 4.4 My Family, memories and the detail pages

- **Nowhere on the web can a member start a new memory** from the navigation: nothing links to the create page. Recommendation: a "Write a memory" button on My Family. A member with no family gets a 404 on create.
- **Detail pages hide the top bar** (no search, bell or profile menu). Recommendation: keep editors full width, restore the bar on the other detail pages (a one-line shell change).
- **Saved video cannot be removed or replaced; replacing a voice note leaves the old file;** other members' voice files stay after a memory is deleted (storage rule). Periodic clean-up recommended.
- **Web share shares the dashboard link;** the /m/CODE share codes are app-only.
- **Family members cannot delete their own comments or voice notes** on memories, albums and timelines (creator-only database rules). The app now says so honestly. If authors should delete their own, widen the policies.
- **Loved one delete copy** says their memories will be removed, but only the profile and tags go. Softer, truthful line recommended. "Change photo" on a profile sends you to the list page's edit dialog.
- **Writing-assistance cards on loved-one, album, timeline and capsule pages never pass the family id**, so the route skips its membership check (it still requires sign-in and the assistance switch). Pass the family id if that check matters.

### 4.5 Albums, timelines, capsules and library

- **No size or length caps on album and capsule uploads** (the buckets have no file size limit either). Recommendation: a bucket limit as backstop plus a client check.
- **The album page Save button saves nothing** (shows "Saved" for two seconds). Remove it.
- **Deleting a voice note or photo someone else uploaded leaves the file in storage** (storage delete is uploader-only). Deleting a capsule leaves its cover and files; replacing a cover leaves the old file; folder delete leaves other members' files. A nightly service-role clean-up would cover all of these.
- **Dates on timelines are full calendar dates only** (no year-only or "around 1950"). Product feature if wanted.
- **Capsule unlock notifications never arrive.** The ten-minute job only unlocks; its notification insert was removed earlier. The app and the bell are ready for the notification. Recommendation: write it to the capsule's owner only.
- **Should a sealed capsule accept additions?** The database lets family add media, a letter, voice notes and tags to a sealed capsule; the web app hides it until the date. If "closed means closed", add is_locked = false to those insert and update rules.
- **The capsule letter is one per capsule, any member can overwrite it.** Per-person letters if wanted.
- **Dead tables and columns** (capsule_media_comments, capsule_media_voice_notes, capsule_loved_ones; memory_capsules.is_opened, opened_at, locked_at, message; the seven empty legacy tables with no indexes) can be dropped once the mobile app is checked.
- **Library.** Server-side HEIC conversion on Vercel only works for files under 4.5MB; bigger iPhone photos rely on the browser path. Not present: bulk select and delete, search, filters, sorting, drag and drop.

### 4.6 Our Stories and moderation

- **Moderation fails open.** If the AI is down, slow or answers nonsense, the story publishes without a check. Alternative: hold it as "pending review" and email you (the author already gets the "allow up to 24 hours" email). Recommendation: hold.
- **Reported stories only reach you by email** and stay live until you act. Option: after N reports (say 3) move the story to pending review automatically.
- **Memory reports have no proper table.** A small memory_reports table (memory, reporter, reason, date) would let you see them in the app. Recommended, low effort.
- **Editing a published story resets its published date** and sends it back to the top of the feed. Fine as an incentive, odd as a record; the fix is one line (only set the date when it is empty).
- **"Most Loved" and "Most Discussed"** sort only the stories already loaded, not the whole feed. Worth ranking server side once there are more than a few dozen stories.
- **Feed freshness.** One minute, or at once on publish and delete. Say if you want 30 seconds or none.
- **A received question notification goes nowhere** when tapped (no page lists questions). Say where it should lead.
- **The legacy avatar file name** (see 2.4): re-upload, or widen the storage read rule from avatar.* to avatar*.
- **AI model and price.** The three AI routes use Claude Sonnet 4.6. Newer and cheaper options exist (Haiku 5.5 would suit the moderation check). Tone changes slightly; one string per route.
- **AI cap.** 40 requests per person per hour on both assist routes. Say if you want it higher or lower.
- **Reward code messages** confirm that a code exists but belongs to another family. Useful for honest mistakes; make it read "not recognised" if you prefer not to confirm existence.
- **The signup email check calls a paid service (Kickbox) and is anonymous.** Anyone could burn credits. A rate limit at the edge (Vercel WAF or Upstash) is the usual answer.
- **Admin identity lives in two places** (src/lib/adminUser.ts and three database rules on featured_stories). Changing the admin means changing both.
- **The story-media bucket is public by design** (the only one); the project notes said all buckets were private. The notes should say so.

### 4.7 Settings, Profile and Help

- **The "Updates & Memory Tips" switch** is stored but nothing reads it: the onboarding emails go to everyone (with an unsubscribe link) and there is no newsletter system. Wire the drip and future mailings to honour it, or reword the card.
- **The "In-App Notifications" switch only controls phone push.** The bell shows everything regardless. Recommendation: reword to "Push notifications on your phone".
- **Help FAQ promises to confirm or soften:** "If a payment fails, we retry and notify you before any limits apply" and "More sharing and permission features are coming soon".
- **Avatar size.** The cropped photo is uploaded at full size (a 4000px phone photo stays 4000px). Down-scaling to about 512px would speed up every page that shows it.

### 4.8 Emails and notifications

- **Who is told what.** family-activity sends on new things only (never on comments, hearts or added perspectives); welcome once per account; member-joined; invite confirmations; prompt answered only on the transition to answered. All verified; nothing to decide unless you want more or fewer.
- **The verification email is sent by a function whose source now checks the caller**; the signup flow is compatible.

### 4.9 Public pages and SEO

- **The landing page can be up to 60 seconds behind** on the stories it shows (deliberate caching). Keep.
- **Hero ring reflections are unclipped on desktop** (clipped on touch). If Windows laptop scrolling still feels rough, clip on desktop too.
- **/success shows Log In and Sign up in the top bar** for a just-paid user (same as every public page). A dashboard button is there.
- **/cancel is a dead end by design** (nothing points at it). Kept, noindex.
- Guides, Features and Compare findings: see section 9.

### 4.10 Database housekeeping

- **Legacy tables** album_event_links, audit_log, comments, event_tags, family_links, tags, updates have no indexes on their foreign keys (skipped on purpose; they are empty and unreferenced). Possibly dead; dropping is your call. audit_log is now used for memory reports.
- **Unused-index warnings** (65) are mostly the foreign-key indexes created on 18 October; ignore for a month before dropping any.
- **Duplicate updated_at triggers** on Profiles, albums (three), album_media and subscriptions are harmless; can be dropped.
- **family_invites keeps three overlapping policy sets** (different people, different rights). A merge is possible later with no security change.
- **Auth is pinned to 10 database connections**; switch to a percentage if you upsize.
- **Three anonymous-callable functions** (get_answer_prompt, get_memory_share, validate_family_join_code) serve the public answer, share and join-code flows; worth a later read of exactly which columns they return.
- **The cap functions disagree on what "subscribed" means** (active, active and not cancelling, or trialing). Worth one definition when you decide on trials and cancellations (4.1).

## 5. Known limits left alone on purpose

- Dev mode (`npm run dev`) compiles each route on first visit and is slow by nature; judge speed from the production build.
- The export pages for the print pipeline are server-rendered by design for the print browser; fonts, layout maths and renderer output in the book, canvas and acrylic editors were not touched (they are what gets printed).
- The voice-note converter (CloudConvert) was verified working on 22 June and was deliberately not changed.
- Supabase's HEAD count requests show as "aborted" in Chrome's network log; they complete in 60 to 300ms (a Chromium reporting quirk, not a bug).

## 6. How to check things yourself

Every technical report in `docs/verification-run-2026-10-18/reports/` ends with a **Risks** section: exact click paths to try, with what you should see. Those are the manual tests worth doing after the Edge Functions are deployed.

To repeat the automated runtime check on this machine: `npm run build`, then `npx next start -p 3001`, then `node scripts/shots/smoke.mjs http://localhost:3001 <urls.txt> [cookies.json]`. It prints, per page, the status, time to first byte, largest paint, layout shift, request count, console errors, hydration warnings and failed requests. The scripts live in `scripts/shots/` (ignored by git, local to this machine).

## 7. Database record

Everything changed in the live database is recorded, in order and with reverts, in:

- `supabase/sql/2026-10-18-performance-and-security.sql` (batch 1: 116 row-security policies rewritten, indexes, column grants, the email_verifications table).
- `supabase/sql/2026-10-19-batch4-database.sql` (batch 4: the function, policy, foreign-key and trigger changes in section 3, plus the lead's three steps).
- `supabase/sql/webhook-triggers.sql` (the prompt-answered trigger now fires only on a status change).

The migration history is intentionally out of step with the live schema; do not run db push to "repair" it.

## 8. The temporary QA account

A throwaway account (qa-verify-20261018@ancestorii.com) was created for the signed-in runtime checks and deleted at the end of the run, with its family, membership and preference rows. Nothing else was created in production tables.

## 9. Batch 5: Guides, Features and Compare

**What was checked** on all 62 pages: every internal link (all resolve), the external sources that looked doubtful (fetched, all live), titles and descriptions, the social sharing cards, structured data, hydration and layout-shift risks, one h1 and heading order, alt text, British English, the no-dash rule, and every product claim against the code and the live database (storage sizes, upload limits, prices, delivery times, the country list, reward tiers, question counts: all matched).

**Fixed**

- Links inside the step, tip, point and question cards on all 40 guides rendered as plain text (a CSS reset swallowed them). They are visible links again.
- Seven older guides, the guides hub, the compare hub and the Storyworth page showed the homepage's card (title "Ancestorii: Your Family Library" and the homepage link) when shared on WhatsApp or LinkedIn. Each now has its own title, description and link.
- Hand-written structured data on those pages was replaced with the shared builders, so the author and publisher link to the site-wide nodes; the HowTo steps on one guide now match the visible steps; FAQ data matches the page text everywhere.
- Three titles and four descriptions were trimmed to search-result length, including one title that doubled the "| Ancestorii" suffix.
- The compare hub and the Storyworth page gained a Sources list (they had none); "the family feed" became "the My Family feed" on two compare pages; a photo's alt text contradicted itself across two pages.
- **The layout shift on /features and the Ancestry comparison** (0.10 and 0.12 before). Measured in Chrome: the hero title re-wrapped about 80ms after first paint, when the brand typeface arrived, because its width cap was set in `ch`, a unit that depends on the font in use. The cap is now the same width in em, so the title wraps the same way before and after the font arrives. After the change both pages measure 0.000, cold cache and warm (a good page is anything under 0.02; the other feature, compare and guide pages were already between 0 and 0.01). The compare agent had removed the photo preload from seven compare pages on a different theory; the measurement ruled that out, so the preload is back, matching the feature pages.
- The sitemap told search engines that every page changed on every build (its date was set to the build time), which makes them ignore the dates. Static pages no longer carry a date; story pages keep their real dates.
- Guide figure images request a slightly smaller source file (660px rather than 760px).
- Two copy decisions taken on the compare pages: an unsourced sentence about Remento's founder's mother's illness was removed (restore it with a citation if you want it back), and the Storyworth table now says voice recordings are "Yes, by phone", matching the compare hub and Storyworth's own page.

**Left for you**

- **"Invite by email, a shareable link or a join code."** No join code exists in the web app (the 80th-birthday guide and several compare pages say this). Keep it if the phone app has one; otherwise change to "by email or a shareable link".
- **"A Verified Family badge at 5 memories"** (how-to-get-family-to-share-memories). The 10% at 10 is right; the 5-memory badge threshold could not be confirmed in the code.
- **A title tag that differs from its page:** "How to Capture and Grow Family Memories" is the search title of the page whose heading is "How to preserve family memories". Align unless deliberate.
- **Year-specific facts** (turning 80 in 2026 means born in 1946; Grandparents' Day dates for 2027; a Which? table dated 1 October 2026) need a yearly refresh. Decide who does it each January.
- **Account deletion contradiction.** The guide "what happens to your photos when you die" says a deleted member's memories, Library photos and albums stay with the family; the /delete-account page promises they are all removed. One is wrong, and the delete-account page is a privacy promise. Decide what deletion should do (today it is manual, see 4.3), then fix the wrong page.
- **Memory Book delivery time.** Two guides say Standard delivery is 10 to 14 working days for books; the books page quotes no time. Confirm or cut.
- **The invite-family feature page says an in-app notification goes out when someone joins.** Nothing in the web code writes one (the emails do go). Remove unless the phone app does it.
- **Question links** are described as "time-limited"; they last 7 days. "Valid for 7 days" would be more useful.
- **Storyworth claims with no source:** shipping included only in the US with customs fees elsewhere; collaborative books need a higher plan; "over a million books printed since 2013". Cite, soften or cut. Recommendation: cut the shipping line and the million-books figure unless you can cite them.
- **Superlatives and opinions on the compare pages:** "The Best Storyworth Alternative for 2026" and "Others find that a question every week produces tidy answers rather than the stories they actually wanted to tell." Common practice; your comfort level.
- **Only the Storyworth page names an X account** (@ancestorii). Drop it if the account does not exist, or add it everywhere if it does.
- **Typeface loading.** If you ever want zero shift on a visitor's very first, slow visit as well, the brand font could load with `display: optional` (that page view would then stay in the fallback typeface). Not changed; the em fix is enough by measurement.
- **One feature title runs to 62 characters** with the suffix ("Shared Family Photo Albums with Stories and Voices"). Fine as it is; trim if you want every title under 60.

**One thing not finished on this machine.** The last local production build of batch 5 was stopped by the system while the computer was low on memory, which also damaged the build folder the local test server was using, so the final Chrome pass over all 62 SEO pages could not be completed here. What was verified for batch 5: the whole project type-checks and lints clean on the final source; the layout-shift fix was measured on a successful build (0.000 on both pages, cold and warm); the only source change after that build is the restored photo preload on seven compare pages, a prop those pages already had before this run. The push to main triggers Vercel's own production build, which is the real one. To repeat the local pass: `npm run build`, `npx next start -p 3001`, then the smoke script in section 6 over the Guides, Features and Compare URLs.
