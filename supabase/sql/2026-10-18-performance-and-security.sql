-- Ancestorii: performance and security pass on the live Supabase project, 18 Oct 2026.
--
-- This file is a RECORD of what was applied by hand through the Supabase MCP (execute_sql),
-- in the order it ran. It is not a migration and is not meant to be re-run: the policy block
-- in step 1 is not idempotent (running it twice would wrap auth.uid() a second time).
-- Every step was verified before and after against simulated users (see the run report).
-- Reverts for each step are given as comments at the end.

-- ============================================================================
-- Step 1. auth_rls_initplan: 116 policies called auth.uid() / auth.email() per row.
-- Rewrites each policy expression in place so the call is (select auth.uid()) and is
-- evaluated once per query. Applied in one transaction; the DO block raises (and rolls
-- back) unless exactly 116 policies are altered.
-- Verified: pg_policies shows 0 bare auth.*() calls and 116 wrapped; every one of the 273
-- policies equals its original once the wrapper is reversed; row counts under RLS for three
-- real users and anon are identical before and after.
-- ============================================================================
begin;
do $$
declare
  r record;
  q text;
  w text;
  stmt text;
  n int := 0;
begin
  for r in
    select tablename, policyname, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (coalesce(qual, '') ~ 'auth\.(uid|email|jwt|role)\(\)'
        or coalesce(with_check, '') ~ 'auth\.(uid|email|jwt|role)\(\)')
    order by tablename, policyname
  loop
    q := r.qual;
    w := r.with_check;
    if q is not null then
      q := replace(q, 'auth.uid()', '(select auth.uid())');
      q := replace(q, 'auth.email()', '(select auth.email())');
      q := replace(q, 'auth.jwt()', '(select auth.jwt())');
      q := replace(q, 'auth.role()', '(select auth.role())');
    end if;
    if w is not null then
      w := replace(w, 'auth.uid()', '(select auth.uid())');
      w := replace(w, 'auth.email()', '(select auth.email())');
      w := replace(w, 'auth.jwt()', '(select auth.jwt())');
      w := replace(w, 'auth.role()', '(select auth.role())');
    end if;
    stmt := format('alter policy %I on public.%I', r.policyname, r.tablename);
    if q is not null and r.cmd <> 'INSERT' then
      stmt := stmt || ' using (' || q || ')';
    end if;
    if w is not null and r.cmd not in ('SELECT', 'DELETE') then
      stmt := stmt || ' with check (' || w || ')';
    end if;
    execute stmt;
    n := n + 1;
  end loop;
  if n <> 116 then
    raise exception 'expected 116 policies to alter, altered % (rolled back)', n;
  end if;
end $$;
commit;

-- ============================================================================
-- Step 2. Table for the "Confirm my email" flow (requested by the coordinator).
-- supabase/functions/send-verification-email inserts {user_id, token} (token is
-- crypto.randomUUID()); app/api/verify-email/route.ts marks used_at with the service role.
-- RLS on, no policies: only the service role touches it from both sides.
-- ============================================================================
create table public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token uuid not null unique,
  created_at timestamptz not null default now(),
  used_at timestamptz
);
alter table public.email_verifications enable row level security;

-- ============================================================================
-- Step 3. duplicate_index (9 findings): drop every copy but one. Kept the index whose name
-- follows idx_<table>_<column>, or the one that backs a constraint (family_relationship_no_dup,
-- subscriptions_user_id_key). unindexed_foreign_keys (56 findings): one btree index per FK.
-- Skipped 7 FKs on tables with 0 rows that nothing in app/, src/ or supabase/functions reads:
-- album_event_links, audit_log, comments, event_tags, family_links, tags, updates.
-- Applied in one transaction.
-- ============================================================================
begin;
drop index public.idx_fm_owner;                      -- duplicate of idx_family_members_owner
drop index public.idx_fr_a;                          -- duplicate of idx_family_rel_member_a
drop index public.idx_fr_b;                          -- duplicate of idx_family_rel_member_b
drop index public.idx_fr_role;                       -- duplicate of idx_family_rel_role
drop index public.family_relation_unique;            -- duplicate of family_relationship_no_dup (constraint)
drop index public.rel_unique_idx;                    -- duplicate of family_relationship_no_dup (constraint)
drop index public.subscriptions_user_id_unique;      -- duplicate of subscriptions_user_id_key (constraint)
drop index public.subscriptions_user_unique;         -- duplicate of subscriptions_user_id_key (constraint)
drop index public.idx_timeline_tags_lovedone;        -- duplicate of idx_timeline_loved_ones_loved_one
drop index public.idx_timeline_tags_timeline;        -- duplicate of idx_timeline_loved_ones_timeline
drop index public.timeline_tags_family_member_idx;   -- duplicate of idx_timeline_tags_member
create index if not exists idx_profiles_plan_id on public."Profiles"(plan_id);
create index if not exists idx_album_media_library_media_id on public.album_media(library_media_id);
create index if not exists idx_album_media_comments_media_id on public.album_media_comments(media_id);
create index if not exists idx_album_media_comments_user_id on public.album_media_comments(user_id);
create index if not exists idx_album_media_voice_notes_media_id on public.album_media_voice_notes(media_id);
create index if not exists idx_album_media_voice_notes_user_id on public.album_media_voice_notes(user_id);
create index if not exists idx_capsule_media_library_media_id on public.capsule_media(library_media_id);
create index if not exists idx_families_created_by on public.families(created_by);
create index if not exists idx_family_invite_links_created_by on public.family_invite_links(created_by);
create index if not exists idx_family_invites_family_id on public.family_invites(family_id);
create index if not exists idx_family_invites_invited_by on public.family_invites(invited_by);
create index if not exists idx_family_memories_author_id on public.family_memories(author_id);
create index if not exists idx_family_memories_prompt_id on public.family_memories(prompt_id);
create index if not exists idx_family_memory_comments_family_id on public.family_memory_comments(family_id);
create index if not exists idx_family_memory_comments_parent_id on public.family_memory_comments(parent_id);
create index if not exists idx_family_memory_comments_user_id on public.family_memory_comments(user_id);
create index if not exists idx_family_memory_media_family_id on public.family_memory_media(family_id);
create index if not exists idx_family_memory_media_user_id on public.family_memory_media(user_id);
create index if not exists idx_family_memory_reactions_family_id on public.family_memory_reactions(family_id);
create index if not exists idx_family_memory_reactions_user_id on public.family_memory_reactions(user_id);
create index if not exists idx_family_memory_voice_notes_family_id on public.family_memory_voice_notes(family_id);
create index if not exists idx_family_memory_voice_notes_user_id on public.family_memory_voice_notes(user_id);
create index if not exists idx_family_relationships_owner_id on public.family_relationships(owner_id);
create index if not exists idx_family_reward_claims_tier_key on public.family_reward_claims(tier_key);
create index if not exists idx_family_reward_progress_highest_tier_key on public.family_reward_progress(highest_tier_key);
create index if not exists idx_featured_stories_story_id on public.featured_stories(story_id);
create index if not exists idx_library_media_user_id on public.library_media(user_id);
create index if not exists idx_memory_books_back_cover_asset_id on public.memory_books(back_cover_asset_id);
create index if not exists idx_memory_books_cover_asset_id on public.memory_books(cover_asset_id);
create index if not exists idx_memory_prompts_chapter_id on public.memory_prompts(chapter_id);
create index if not exists idx_memory_shares_family_id on public.memory_shares(family_id);
create index if not exists idx_moderation_reviews_reviewed_by on public.moderation_reviews(reviewed_by);
create index if not exists idx_moderation_strikes_story_id on public.moderation_strikes(story_id);
create index if not exists idx_notification_preferences_user_id on public.notification_preferences(user_id);
create index if not exists idx_notifications_actor_id on public.notifications(actor_id);
create index if not exists idx_notifications_story_id on public.notifications(story_id);
create index if not exists idx_sent_prompts_family_id on public.sent_prompts(family_id);
create index if not exists idx_sent_prompts_invite_id on public.sent_prompts(invite_id);
create index if not exists idx_sent_prompts_parent_memory_id on public.sent_prompts(parent_memory_id);
create index if not exists idx_sent_prompts_prompt_id on public.sent_prompts(prompt_id);
create index if not exists idx_sent_prompts_response_memory_id on public.sent_prompts(response_memory_id);
create index if not exists idx_sent_prompts_sender_id on public.sent_prompts(sender_id);
create index if not exists idx_story_comments_user_id on public.story_comments(user_id);
create index if not exists idx_story_shares_user_id on public.story_shares(user_id);
create index if not exists idx_timeline_event_media_library_media_id on public.timeline_event_media(library_media_id);
create index if not exists idx_timeline_event_media_comments_event_id on public.timeline_event_media_comments(event_id);
create index if not exists idx_timeline_event_media_voice_notes_event_id on public.timeline_event_media_voice_notes(event_id);
commit;

-- ============================================================================
-- Step 4. multiple_permissive_policies: drop exact duplicates only (the kept policy is a
-- superset in every case; no policy logic was rewritten). Security advisor items: revoke the
-- two SECURITY DEFINER functions nothing anonymous needs; pin set_updated_at's search_path.
-- Applied in one transaction.
-- Profiles: kept profiles_insert_own and profiles_update_own (authenticated, auth.uid() = id,
--   identical expressions; the dropped ones were TO public, which only adds roles with no uid).
-- family_links: kept the family_links_* set (TO public, and family_links_select is the superset).
-- plans: "Only admins can modify plans" was USING (false), which permits nothing.
-- ============================================================================
begin;
drop policy "Users can insert own profile" on public."Profiles";      -- duplicate of profiles_insert_own
drop policy "profile_insert_from_auth" on public."Profiles";          -- duplicate of profiles_insert_own
drop policy "Users can update own profile" on public."Profiles";      -- duplicate of profiles_update_own
drop policy "profile_update" on public."Profiles";                    -- duplicate of profiles_update_own
drop policy "Users can delete own family links" on public.family_links;   -- duplicate of family_links_delete
drop policy "Users can insert own family links" on public.family_links;   -- duplicate of family_links_insert
drop policy "Users can update own family links" on public.family_links;   -- duplicate of family_links_update
drop policy "Users can view own family links" on public.family_links;     -- subset of family_links_select
drop policy "Only admins can modify plans" on public.plans;               -- USING (false): a no-op
revoke execute on function public.assign_default_library_folder() from anon, public;  -- trigger function, nothing anonymous inserts library_media
revoke execute on function public.shares_family_with(uuid) from anon, public;         -- no caller in app, functions or policies; keyed on auth.uid()
alter function public.set_updated_at() set search_path = public;                      -- only sets NEW.updated_at = now()
commit;

-- ============================================================================
-- Step 5. The anon role (the public key in every browser) could read every column of every
-- Profiles row: 179 emails, 9 phone numbers, 14 dates of birth. Every anonymous read in the
-- code names its columns (stories feed, story page, landing, nav), so anon now gets only the
-- public identity columns. Signed-in users are unchanged (see the report for that decision).
-- ============================================================================
begin;
revoke select on table public."Profiles" from anon;
grant select (id, full_name, username, title, bio, location, profile_image_url, avatar_url) on table public."Profiles" to anon;
commit;

-- Step 6. Covering index for the new table's foreign key (the advisor asks for it).
create index if not exists idx_email_verifications_user_id on public.email_verifications(user_id);

-- ============================================================================
-- Reverts (not run). Each block undoes the step with the same number.
-- ============================================================================
-- Step 1 revert: reverse the wrapper (a mirror of the DO block above).
-- do $$ declare r record; q text; w text; stmt text; begin
--   for r in select tablename, policyname, cmd, qual, with_check from pg_policies
--     where schemaname = 'public' and (coalesce(qual,'') || coalesce(with_check,'')) ~ '\( SELECT auth\.' loop
--     q := regexp_replace(r.qual, '\( SELECT auth\.(uid|email)\(\) AS \w+\)', 'auth.\1()', 'g');
--     w := regexp_replace(r.with_check, '\( SELECT auth\.(uid|email)\(\) AS \w+\)', 'auth.\1()', 'g');
--     stmt := format('alter policy %I on public.%I', r.policyname, r.tablename);
--     if q is not null and r.cmd <> 'INSERT' then stmt := stmt || ' using (' || q || ')'; end if;
--     if w is not null and r.cmd not in ('SELECT','DELETE') then stmt := stmt || ' with check (' || w || ')'; end if;
--     execute stmt;
--   end loop; end $$;
-- Step 2 revert:
-- drop table public.email_verifications;
-- Step 3 revert (the dropped duplicates, exactly as they were; the new idx_* indexes can simply be dropped):
-- create index idx_fm_owner on public.family_members using btree (owner_id);
-- create index idx_fr_a on public.family_relationships using btree (member_a);
-- create index idx_fr_b on public.family_relationships using btree (member_b);
-- create index idx_fr_role on public.family_relationships using btree (role);
-- create unique index family_relation_unique on public.family_relationships using btree (member_a, member_b, role);
-- create unique index rel_unique_idx on public.family_relationships using btree (member_a, member_b, role);
-- create unique index subscriptions_user_id_unique on public.subscriptions using btree (user_id);
-- create unique index subscriptions_user_unique on public.subscriptions using btree (user_id);
-- create index idx_timeline_tags_lovedone on public.timeline_loved_ones using btree (loved_one_id);
-- create index idx_timeline_tags_timeline on public.timeline_loved_ones using btree (timeline_id);
-- create index timeline_tags_family_member_idx on public.timeline_tags using btree (family_member_id);
-- Step 4 revert (the dropped policies, with the step 1 wrapper applied):
-- create policy "Users can insert own profile" on public."Profiles" for insert to public with check ((select auth.uid()) = id);
-- create policy "profile_insert_from_auth" on public."Profiles" for insert to public with check ((select auth.uid()) = id);
-- create policy "Users can update own profile" on public."Profiles" for update to public using ((select auth.uid()) = id);
-- create policy "profile_update" on public."Profiles" for update to public using ((select auth.uid()) = id);
-- create policy "Users can delete own family links" on public.family_links for delete to authenticated using ((select auth.uid()) = user_id);
-- create policy "Users can insert own family links" on public.family_links for insert to authenticated with check ((select auth.uid()) = user_id);
-- create policy "Users can update own family links" on public.family_links for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- create policy "Users can view own family links" on public.family_links for select to authenticated using ((select auth.uid()) = user_id);
-- create policy "Only admins can modify plans" on public.plans for all to authenticated using (false);
-- grant execute on function public.assign_default_library_folder() to anon, public;
-- grant execute on function public.shares_family_with(uuid) to anon, public;
-- alter function public.set_updated_at() reset search_path;
-- Step 5 revert:
-- revoke select (id, full_name, username, title, bio, location, profile_image_url, avatar_url) on table public."Profiles" from anon;
-- grant select on table public."Profiles" to anon;
-- Step 6 revert:
-- drop index public.idx_email_verifications_user_id;
