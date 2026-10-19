-- Ancestorii: joining a family keeps everything, shares follow their family, authorship is
-- the signed-in user, and a deleted member's files stay with the family. 19 Oct 2026.
--
-- This file is a RECORD of what was applied by hand through the Supabase MCP (execute_sql).
-- It is not a migration and is not meant to be re-run blindly. Each step was inspected
-- before (pg_get_functiondef, pg_policies, pg_constraint, pg_trigger, information_schema)
-- and proven after; the proofs are quoted under each step. Reverts are at the end.
--
-- Builds on supabase/sql/2026-10-19-voice-notes-rewards.sql.

-- ============================================================================
-- Step 1. Joining a family moves the joiner's whole one-person library.
--
-- accept-invite and join-via-link moved only memories, media, comments, reactions and
-- voice notes, removed the joiner's solo membership and then deleted the solo family. Every
-- other family table references families with NO ACTION, so with albums, timelines, loved
-- ones, library photos, books, canvases, prints, capsules or questions left behind that
-- delete failed (the routes ignored the error) and the joiner, no longer a member, lost
-- sight of all of it (50 of 179 solo families had such content). Library folders would
-- even have cascaded away and taken their photos (library_media.folder_id is CASCADE).
--
-- join_family_merging_solo does the whole join in one transaction: one-family check,
-- membership, subscription, every family-scoped table moved, solo membership and family
-- deleted. If anything still points at the old family the delete raises and NOTHING is
-- kept, so a joiner is never left half moved or holding two memberships. Not moved, so
-- they go with the old family as before: pending invites and invite links (an admin invite
-- made by a solo owner must not become an admin seat in the family joined), memory share
-- links (a share code signs new users into its family), and the rewards rows (the joined
-- family re-earns every tier from the merged memories through the family_memories trigger).
-- Callable by the service role only (the two Next routes use it).
-- ============================================================================
begin;

CREATE OR REPLACE FUNCTION public.join_family_merging_solo(p_user_id uuid, p_target_family_id uuid, p_role text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  -- Every table that holds a family's content by family_id, memories first (their update
  -- trigger re-evaluates the rewards of both families).
  v_tables constant text[] := array[
    'family_memories', 'family_memory_media', 'family_memory_comments', 'family_memory_reactions',
    'family_memory_voice_notes', 'library_folders', 'library_media', 'albums', 'timelines',
    'family_members', 'family_relationships', 'family_tree', 'memory_capsules', 'memory_books',
    'memory_canvases', 'acrylic_prints', 'sent_prompts', 'story_assistance_log'
  ];
  v_old   uuid;
  v_table text;
  v_n     integer;
  v_moved jsonb := '{}'::jsonb;
begin
  if p_user_id is null or p_target_family_id is null then
    raise exception 'join_family_merging_solo: a user and a family are required';
  end if;
  if p_role is null or p_role not in ('owner', 'admin', 'member') then
    raise exception 'join_family_merging_solo: invalid role %', p_role;
  end if;
  if not exists (select 1 from public.families where id = p_target_family_id) then
    raise exception 'join_family_merging_solo: unknown family';
  end if;

  -- One join at a time per user, so a double click can't merge twice.
  perform pg_advisory_xact_lock(hashtextextended('join_family:' || p_user_id::text, 0));

  if exists (select 1 from public.family_memberships where user_id = p_user_id and family_id = p_target_family_id) then
    return jsonb_build_object('already_member', true);
  end if;

  -- One-family rule: any other family they are in must be theirs alone.
  if exists (
    select 1 from public.family_memberships m
    where m.user_id = p_user_id and m.family_id <> p_target_family_id
      and exists (select 1 from public.family_memberships o where o.family_id = m.family_id and o.user_id <> p_user_id)
  ) then
    raise exception 'already_in_family';
  end if;

  insert into public.family_memberships (family_id, user_id, role)
  values (p_target_family_id, p_user_id, p_role)
  on conflict (family_id, user_id) do update set role = excluded.role;

  update public.subscriptions set family_id = p_target_family_id where user_id = p_user_id;

  for v_old in
    select family_id from public.family_memberships where user_id = p_user_id and family_id <> p_target_family_id
  loop
    foreach v_table in array v_tables loop
      execute format('update public.%I set family_id = $1 where family_id = $2', v_table)
        using p_target_family_id, v_old;
      get diagnostics v_n = row_count;
      if v_n > 0 then
        v_moved := v_moved || jsonb_build_object(v_table, coalesce((v_moved ->> v_table)::int, 0) + v_n);
      end if;
    end loop;

    delete from public.family_memberships where family_id = v_old and user_id = p_user_id;
    -- Raises if anything still points at the old family: the whole join then rolls back.
    delete from public.families where id = v_old;
  end loop;

  return jsonb_build_object('already_member', false, 'moved', v_moved);
end;
$function$;

revoke execute on function public.join_family_merging_solo(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.join_family_merging_solo(uuid, uuid, text) to service_role;

commit;

-- ============================================================================
-- Step 2. create_memory_share reuses a live share only when it belongs to the memory's
-- current family. It reused any live share of the memory, so a share minted while the
-- memory lived in another family (before a join) kept being handed out and signed new
-- users into that other family. Body otherwise identical to the live definition.
-- ============================================================================
begin;

CREATE OR REPLACE FUNCTION public.create_memory_share(p_memory_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid      uuid := auth.uid();
  v_family   uuid;
  v_code     text;
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_i        int;
  v_attempts int := 0;
begin
  if v_uid is null then
    raise exception 'create_memory_share: not authenticated';
  end if;

  -- The memory must exist; resolve its family.
  select family_id into v_family from public.family_memories where id = p_memory_id;
  if v_family is null then
    raise exception 'create_memory_share: unknown memory';
  end if;

  -- Caller must be a member of that family (no cross-family sharing).
  if not exists (
    select 1 from public.family_memberships
    where family_id = v_family and user_id = v_uid
  ) then
    raise exception 'create_memory_share: not a member of this family';
  end if;

  -- Reuse a still-live share for this memory so the link is stable, but only one bound to
  -- the memory's current family (a share made before the memory moved family must not
  -- keep signing people into the old one).
  select short_code into v_code
  from public.memory_shares
  where memory_id = p_memory_id and family_id = v_family and expires_at > now()
  order by created_at desc
  limit 1;
  if v_code is not null then
    return v_code;
  end if;

  -- Mint a fresh 8-char code from the no-look-alike alphabet, collision-checked.
  loop
    v_attempts := v_attempts + 1;
    v_code := '';
    for v_i in 1..8 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    exit when not exists (
      select 1 from public.memory_shares where upper(short_code) = upper(v_code)
    );
    if v_attempts >= 25 then
      raise exception 'create_memory_share: could not mint a unique code after % attempts', v_attempts;
    end if;
  end loop;

  insert into public.memory_shares (memory_id, family_id, short_code, created_by)
  values (p_memory_id, v_family, v_code, v_uid);

  return v_code;
end;
$function$;

commit;

-- ============================================================================
-- Step 3. A memory, photo, comment, reaction or voice note can only be written as the
-- signed-in user. Each insert policy checked the family only, so any member could post as
-- another member (their name and photo shown; only they could delete it). Every insert in
-- the web and app repos already sends author_id / user_id = the signed-in user; service-role
-- paths (routes, Edge Functions) bypass RLS and are unaffected.
-- ============================================================================
begin;

alter policy family_insert on public.family_memories
  with check ((family_id in (select get_my_family_ids())) and author_id = (select auth.uid()));
alter policy family_insert on public.family_memory_media
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid()));
alter policy family_insert on public.family_memory_comments
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid()));
alter policy family_insert on public.family_memory_reactions
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid()));
alter policy family_insert on public.family_memory_voice_notes
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid()));

commit;

-- ============================================================================
-- Step 4. A deleted member's files stay readable to the family that keeps their content.
--
-- delete-account (an Edge Function in the app repo) hands a leaver's memories, photos,
-- voice notes, library and album items to a successor, but the files keep the leaver as
-- owner (library, album, timeline and loved-ones buckets are read by owner) or under the
-- leaver's id in the path (memory-media is read through shares_family_with on that id).
-- Once the account is gone neither check passes, so the family's photos and voice notes
-- stop loading. The storage policies themselves belong to supabase_storage_admin and
-- cannot be changed from here, so:
--   - family_former_members records, at account deletion, each family that lives on
--     without them; shares_family_with also accepts a former member of one of my families
--     (only deleted accounts are recorded, and they can never upload again);
--   - the same BEFORE DELETE trigger on auth.users gives every file a family row still uses
--     to that row's user (as applied here, also to the family's earliest-joined remaining
--     member when the row still named the leaver; Step 5e narrows that to rows with no user,
--     because rows naming the leaver, timelines and loved ones included, are deleted by the
--     same cascade), so the owner-based policies pass and the new owner can also delete it.
--     A file matches its row by path, ignoring extensions, so a video's .poster.jpg and a
--     voice note's original .webm go with it.
-- The trigger never blocks a deletion: any error becomes a warning (the old behaviour).
-- Before: 195 files had a deleted owner (151 in the family buckets, 44 in user-media) and 0
-- of them were used by a live row (all leftovers of families that were torn down), so
-- nothing needs backfilling.
-- ============================================================================
begin;

create table if not exists public.family_former_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id   uuid not null,
  left_at   timestamptz not null default now(),
  primary key (family_id, user_id)
);
create index if not exists family_former_members_user_id_idx on public.family_former_members (user_id);
alter table public.family_former_members enable row level security;
revoke all on public.family_former_members from anon, authenticated;

CREATE OR REPLACE FUNCTION public.shares_family_with(target_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM family_memberships a
    JOIN family_memberships b ON a.family_id = b.family_id
    WHERE a.user_id = auth.uid()
    AND b.user_id = target_user_id
  )
  -- Or they were in one of my families when their account was deleted: their memory-media
  -- files stay under their id and the family keeps the memories that use them.
  OR EXISTS (
    SELECT 1 FROM family_memberships a
    JOIN family_former_members f ON f.family_id = a.family_id
    WHERE a.user_id = auth.uid()
    AND f.user_id = target_user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.hand_over_departing_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  begin
    -- Families that live on without them.
    insert into public.family_former_members (family_id, user_id)
    select m.family_id, old.id
    from public.family_memberships m
    where m.user_id = old.id
      and exists (select 1 from public.family_memberships o where o.family_id = m.family_id and o.user_id <> old.id)
    on conflict (family_id, user_id) do nothing;

    -- Every file a family row still uses, with the user who should own it now.
    with refs (bucket, path, row_user, family_id) as (
      select 'memory-media', file_path, user_id, family_id from public.family_memory_media
      union all select 'memory-media', video_path, author_id, family_id from public.family_memories where video_path is not null
      union all select 'memory-media', file_path, user_id, family_id from public.family_memory_voice_notes
      union all select 'memory-media', voice_note_path, user_id, family_id from public.family_memory_comments where voice_note_path is not null
      union all select 'library-media', file_path, user_id, family_id from public.library_media
      union all select 'album-media', a.cover_image, a.user_id, a.family_id from public.albums a where a.cover_image is not null
      union all select 'album-media', am.file_path, am.user_id, a.family_id
        from public.album_media am join public.albums a on a.id = am.album_id
      union all select 'album-media', v.file_path, v.user_id, a.family_id
        from public.album_media_voice_notes v join public.album_media am on am.id = v.media_id join public.albums a on a.id = am.album_id
      union all select 'timeline-media', t.cover_path, t.owner_id, t.family_id from public.timelines t where t.cover_path is not null
      union all select 'timeline-media', tm.file_path, t.owner_id, t.family_id
        from public.timeline_event_media tm join public.timeline_events e on e.id = tm.event_id join public.timelines t on t.id = e.timeline_id
      union all select 'timeline-media', v.file_path, v.user_id, t.family_id
        from public.timeline_event_media_voice_notes v join public.timeline_event_media tm on tm.id = v.media_id
        join public.timeline_events e on e.id = tm.event_id join public.timelines t on t.id = e.timeline_id
      union all select 'user-media', x.path, f.owner_id, f.family_id
        from public.family_members f
        cross join lateral (values (f.avatar_url), (f.early_years_image), (f.important_moments_image),
                                   (f.special_memories_image), (f.who_they_are_image)) as x(path)
    ),
    heirs as (
      select distinct on (r.bucket, r.path) r.bucket, r.path,
        coalesce(
          case when r.row_user <> old.id then r.row_user end,
          (select o.user_id from public.family_memberships o
            where o.family_id = r.family_id and o.user_id <> old.id
            order by o.joined_at limit 1)
        ) as heir
      from refs r
      where r.path is not null and r.path not like 'http%'
    )
    update storage.objects s
       set owner = h.heir, owner_id = h.heir::text
      from heirs h
     where s.owner = old.id
       and s.bucket_id = h.bucket
       and h.heir is not null
       and regexp_replace(s.name, '\.[^/]*$', '') = regexp_replace(h.path, '\.[^/]*$', '');
  exception when others then
    -- Never block an account deletion over this; the worst case is the old behaviour.
    raise warning 'hand_over_departing_user(%): % (%)', old.id, sqlerrm, sqlstate;
  end;
  return old;
end;
$function$;

revoke execute on function public.hand_over_departing_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_deleting on auth.users;
create trigger on_auth_user_deleting
  before delete on auth.users
  for each row execute function public.hand_over_departing_user();

commit;

-- ============================================================================
-- Step 5. Follow-ups from the read-only verification of steps 1 to 4.
--  5a. join_family_merging_solo copies the old family's former members into the family
--      joined before deleting the old one. Without it the cascade took them, and after a
--      survivor of a deletion joined another family the deleted member's memory-media files
--      (read through shares_family_with on the path id) stopped loading again.
--  5b. family_memory_media's update policy checked the family only, so any member could
--      re-attribute or repoint another member's photo. Now own rows only, kept in a memory of
--      the same family. The only client update (the app's onboarding display_order) is on the
--      user's own rows.
--  5c. Comments showed the author_name and author_avatar_url the client sent. A trigger now
--      fills both from the commenter's profile on every insert and every signed-in update (the
--      same "Family Member" fallback and profile_image_url-then-avatar_url photo both apps
--      use); a service-role update (delete-account handing comments to a successor) keeps the
--      name the comment was written under. creator_update gets a WITH CHECK so a comment can't
--      be moved to another family, memory or user.
--  5d. Photos, comments, reactions and voice notes must belong to their memory's family
--      (they could be attached to another family's memory and count towards its rewards), and
--      family_reward_stats only counts same-family photos and voice notes.
--  5e. hand_over_departing_user hands a file to the family's earliest-joined remaining member
--      only when its row has no user; a row still naming the leaver is deleted by the same
--      cascade (or blocks the deletion), so giving its file away only left an orphan.
-- ============================================================================
begin;

CREATE OR REPLACE FUNCTION public.join_family_merging_solo(p_user_id uuid, p_target_family_id uuid, p_role text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  -- Every table that holds a family's content by family_id, memories first (their update
  -- trigger re-evaluates the rewards of both families).
  v_tables constant text[] := array[
    'family_memories', 'family_memory_media', 'family_memory_comments', 'family_memory_reactions',
    'family_memory_voice_notes', 'library_folders', 'library_media', 'albums', 'timelines',
    'family_members', 'family_relationships', 'family_tree', 'memory_capsules', 'memory_books',
    'memory_canvases', 'acrylic_prints', 'sent_prompts', 'story_assistance_log'
  ];
  v_old   uuid;
  v_table text;
  v_n     integer;
  v_moved jsonb := '{}'::jsonb;
begin
  if p_user_id is null or p_target_family_id is null then
    raise exception 'join_family_merging_solo: a user and a family are required';
  end if;
  if p_role is null or p_role not in ('owner', 'admin', 'member') then
    raise exception 'join_family_merging_solo: invalid role %', p_role;
  end if;
  if not exists (select 1 from public.families where id = p_target_family_id) then
    raise exception 'join_family_merging_solo: unknown family';
  end if;

  -- One join at a time per user, so a double click can't merge twice.
  perform pg_advisory_xact_lock(hashtextextended('join_family:' || p_user_id::text, 0));

  if exists (select 1 from public.family_memberships where user_id = p_user_id and family_id = p_target_family_id) then
    return jsonb_build_object('already_member', true);
  end if;

  -- One-family rule: any other family they are in must be theirs alone.
  if exists (
    select 1 from public.family_memberships m
    where m.user_id = p_user_id and m.family_id <> p_target_family_id
      and exists (select 1 from public.family_memberships o where o.family_id = m.family_id and o.user_id <> p_user_id)
  ) then
    raise exception 'already_in_family';
  end if;

  insert into public.family_memberships (family_id, user_id, role)
  values (p_target_family_id, p_user_id, p_role)
  on conflict (family_id, user_id) do update set role = excluded.role;

  update public.subscriptions set family_id = p_target_family_id where user_id = p_user_id;

  for v_old in
    select family_id from public.family_memberships where user_id = p_user_id and family_id <> p_target_family_id
  loop
    foreach v_table in array v_tables loop
      execute format('update public.%I set family_id = $1 where family_id = $2', v_table)
        using p_target_family_id, v_old;
      get diagnostics v_n = row_count;
      if v_n > 0 then
        v_moved := v_moved || jsonb_build_object(v_table, coalesce((v_moved ->> v_table)::int, 0) + v_n);
      end if;
    end loop;

    -- Someone who deleted their account while in the old family stays a former member of the
    -- family joined: their memory-media files, now used there, are read through that row.
    insert into public.family_former_members (family_id, user_id, left_at)
    select p_target_family_id, f.user_id, f.left_at from public.family_former_members f where f.family_id = v_old
    on conflict (family_id, user_id) do nothing;

    delete from public.family_memberships where family_id = v_old and user_id = p_user_id;
    -- Raises if anything still points at the old family: the whole join then rolls back.
    delete from public.families where id = v_old;
  end loop;

  return jsonb_build_object('already_member', false, 'moved', v_moved);
end;
$function$;

alter policy family_update on public.family_memory_media
  using ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid()))
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid())
    and exists (select 1 from public.family_memories m
                where m.id = family_memory_media.memory_id and m.family_id = family_memory_media.family_id));

CREATE OR REPLACE FUNCTION public.family_memory_comments_author()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Every insert, and every update made signed in, shows the commenter's own profile. A
  -- service-role update (delete-account handing comments on) keeps the name it was written under.
  if tg_op = 'INSERT' or auth.uid() is not null then
    select coalesce(nullif(trim(p.full_name), ''), 'Family Member'),
           coalesce(nullif(p.profile_image_url, ''), nullif(p.avatar_url, ''))
      into new.author_name, new.author_avatar_url
      from public."Profiles" p
     where p.id = new.user_id;
    if new.author_name is null then
      new.author_name := 'Family Member';
    end if;
  end if;
  return new;
end;
$function$;

revoke execute on function public.family_memory_comments_author() from public, anon, authenticated;

drop trigger if exists family_memory_comments_author on public.family_memory_comments;
create trigger family_memory_comments_author
  before insert or update on public.family_memory_comments
  for each row execute function public.family_memory_comments_author();

alter policy creator_update on public.family_memory_comments
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid())
    and exists (select 1 from public.family_memories m
                where m.id = family_memory_comments.memory_id and m.family_id = family_memory_comments.family_id));

alter policy family_insert on public.family_memory_media
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid())
    and exists (select 1 from public.family_memories m
                where m.id = family_memory_media.memory_id and m.family_id = family_memory_media.family_id));
alter policy family_insert on public.family_memory_comments
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid())
    and exists (select 1 from public.family_memories m
                where m.id = family_memory_comments.memory_id and m.family_id = family_memory_comments.family_id));
alter policy family_insert on public.family_memory_reactions
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid())
    and exists (select 1 from public.family_memories m
                where m.id = family_memory_reactions.memory_id and m.family_id = family_memory_reactions.family_id));
alter policy family_insert on public.family_memory_voice_notes
  with check ((family_id in (select get_my_family_ids())) and user_id = (select auth.uid())
    and exists (select 1 from public.family_memories m
                where m.id = family_memory_voice_notes.memory_id and m.family_id = family_memory_voice_notes.family_id));

CREATE OR REPLACE FUNCTION public.family_reward_stats(p_family_id uuid)
 RETURNS TABLE(qualifying_count integer, contributor_count integer, first_qualifying_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with genuine as (
    select fm.author_id, fm.created_at
    from public.family_memories fm
    where fm.family_id = p_family_id
      and (
           char_length(regexp_replace(fm.body, '\s', '', 'g')) >= public.reward_min_body_len()
        or fm.voice_note_path is not null
        or fm.video_path is not null
        or exists (select 1 from public.family_memory_media m where m.memory_id = fm.id and m.family_id = fm.family_id)
        or exists (select 1 from public.family_memory_voice_notes v where v.memory_id = fm.id and v.family_id = fm.family_id)
      )
  )
  select count(*)::int, count(distinct author_id)::int, min(created_at)
  from genuine;
$function$;

CREATE OR REPLACE FUNCTION public.hand_over_departing_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  begin
    -- Families that live on without them.
    insert into public.family_former_members (family_id, user_id)
    select m.family_id, old.id
    from public.family_memberships m
    where m.user_id = old.id
      and exists (select 1 from public.family_memberships o where o.family_id = m.family_id and o.user_id <> old.id)
    on conflict (family_id, user_id) do nothing;

    -- Every file a family row still uses, with the user who should own it now.
    with refs (bucket, path, row_user, family_id) as (
      select 'memory-media', file_path, user_id, family_id from public.family_memory_media
      union all select 'memory-media', video_path, author_id, family_id from public.family_memories where video_path is not null
      union all select 'memory-media', file_path, user_id, family_id from public.family_memory_voice_notes
      union all select 'memory-media', voice_note_path, user_id, family_id from public.family_memory_comments where voice_note_path is not null
      union all select 'library-media', file_path, user_id, family_id from public.library_media
      union all select 'album-media', a.cover_image, a.user_id, a.family_id from public.albums a where a.cover_image is not null
      union all select 'album-media', am.file_path, am.user_id, a.family_id
        from public.album_media am join public.albums a on a.id = am.album_id
      union all select 'album-media', v.file_path, v.user_id, a.family_id
        from public.album_media_voice_notes v join public.album_media am on am.id = v.media_id join public.albums a on a.id = am.album_id
      union all select 'timeline-media', t.cover_path, t.owner_id, t.family_id from public.timelines t where t.cover_path is not null
      union all select 'timeline-media', tm.file_path, t.owner_id, t.family_id
        from public.timeline_event_media tm join public.timeline_events e on e.id = tm.event_id join public.timelines t on t.id = e.timeline_id
      union all select 'timeline-media', v.file_path, v.user_id, t.family_id
        from public.timeline_event_media_voice_notes v join public.timeline_event_media tm on tm.id = v.media_id
        join public.timeline_events e on e.id = tm.event_id join public.timelines t on t.id = e.timeline_id
      union all select 'user-media', x.path, f.owner_id, f.family_id
        from public.family_members f
        cross join lateral (values (f.avatar_url), (f.early_years_image), (f.important_moments_image),
                                   (f.special_memories_image), (f.who_they_are_image)) as x(path)
    ),
    heirs as (
      -- A row's own user, or, for a row with no user, the family's earliest-joined remaining
      -- member. A row still naming the leaver goes with them (cascade) or blocks the deletion.
      select distinct on (r.bucket, r.path) r.bucket, r.path,
        case
          when r.row_user is null then
            (select o.user_id from public.family_memberships o
              where o.family_id = r.family_id and o.user_id <> old.id
              order by o.joined_at limit 1)
          when r.row_user <> old.id then r.row_user
        end as heir
      from refs r
      where r.path is not null and r.path not like 'http%'
    )
    update storage.objects s
       set owner = h.heir, owner_id = h.heir::text
      from heirs h
     where s.owner = old.id
       and s.bucket_id = h.bucket
       and h.heir is not null
       and regexp_replace(s.name, '\.[^/]*$', '') = regexp_replace(h.path, '\.[^/]*$', '');
  exception when others then
    -- Never block an account deletion over this; the worst case is the old behaviour.
    raise warning 'hand_over_departing_user(%): % (%)', old.id, sqlerrm, sqlstate;
  end;
  return old;
end;
$function$;

commit;

-- ============================================================================
-- Reverts:
-- Step 1: drop function if exists public.join_family_merging_solo(uuid, uuid, text);
--         (and restore the routes from git: the previous move-then-delete code)
-- Step 2: re-create create_memory_share without "and family_id = v_family" in the reuse select.
-- Step 3: alter policy family_insert on public.<each of the 5 tables>
--           with check ((family_id in (select get_my_family_ids())));
-- Step 4: drop trigger if exists on_auth_user_deleting on auth.users;
--         drop function if exists public.hand_over_departing_user();
--         re-create shares_family_with without the second EXISTS;
--         drop table if exists public.family_former_members;
-- ============================================================================
