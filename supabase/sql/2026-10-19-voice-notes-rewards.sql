-- Ancestorii: memory voice notes count towards the family rewards ladder, 19 Oct 2026.
--
-- This file is a RECORD of what was applied by hand through the Supabase MCP (execute_sql).
-- It is not a migration and is not meant to be re-run blindly. Inspected before with
-- pg_get_functiondef, pg_trigger and pg_proc.proacl; proven after with the read-only queries
-- and the rolled-back test quoted below. The revert is given as comments at the end.
--
-- Why: family_reward_stats counts a memory as genuine when its body is long enough, or it has
-- a photo, a video, or family_memories.voice_note_path. Voice notes are family_memory_voice_notes
-- rows (the app has always saved them there, and the web editor now does too, so the memory
-- page can play them), and that table had no rewards trigger, so a short memory whose only
-- extra is a voice note never counted. voice_note_path is kept in the check for any old row.
--
-- The delete trigger skips a family that no longer exists: deleting a family cascades its voice
-- notes, and evaluate_family_rewards would then upsert family_reward_progress for the deleted
-- family, hit its foreign key and fail the whole delete. The insert trigger reuses
-- trg_fmm_rewards_ins (a new row's family always exists). A family_id update (the join routes
-- moving a joiner's notes) needs no trigger: the stats look voice notes up by memory_id, and
-- the family_memories update trigger already re-evaluates both families when the memories move.
--
-- Proof after applying:
--   pg_get_functiondef(family_reward_stats) contains the family_memory_voice_notes exists check;
--   pg_trigger lists family_memory_voice_notes_rewards_ins and _rewards_del;
--   trg_fmvn_rewards_del proacl = {postgres=X/postgres,service_role=X/postgres} (as trg_fmm_*);
--   family_reward_stats over all 181 families gave the same md5 before and after
--   (bc152256a786d0b7da2ccebd1f474780: no voice note rows exist yet, so nothing moved);
--   a DO block that raised at the end (so everything rolled back) reported
--     short memory before voice=0 | with voice: stats=1 progress=1 |
--     after voice delete: stats=0 progress=0 |
--     family cascade delete OK, voice rows left=0 family rows left=0
--   and afterwards no test family, memory or voice row and no queued net request remained.
begin;

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
        or exists (select 1 from public.family_memory_media m where m.memory_id = fm.id)
        or exists (select 1 from public.family_memory_voice_notes v where v.memory_id = fm.id)
      )
  )
  select count(*)::int, count(distinct author_id)::int, min(created_at)
  from genuine;
$function$;

CREATE OR REPLACE FUNCTION public.trg_fmvn_rewards_del()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_family uuid;
begin
  -- A family being deleted takes its voice notes with it: skip it (see the file header).
  for v_family in
    select distinct o.family_id from old_rows o
    where o.family_id is not null
      and exists (select 1 from public.families f where f.id = o.family_id)
  loop
    perform public.evaluate_family_rewards(v_family);
  end loop;
  return null;
end; $function$;

revoke execute on function public.trg_fmvn_rewards_del() from public, anon, authenticated;
grant execute on function public.trg_fmvn_rewards_del() to service_role;

drop trigger if exists family_memory_voice_notes_rewards_ins on public.family_memory_voice_notes;
create trigger family_memory_voice_notes_rewards_ins
  after insert on public.family_memory_voice_notes
  referencing new table as new_rows
  for each statement execute function public.trg_fmm_rewards_ins();

drop trigger if exists family_memory_voice_notes_rewards_del on public.family_memory_voice_notes;
create trigger family_memory_voice_notes_rewards_del
  after delete on public.family_memory_voice_notes
  referencing old table as old_rows
  for each statement execute function public.trg_fmvn_rewards_del();

commit;

-- ============================================================================
-- Revert (restores the 19 Oct definitions before this file):
-- drop trigger if exists family_memory_voice_notes_rewards_ins on public.family_memory_voice_notes;
-- drop trigger if exists family_memory_voice_notes_rewards_del on public.family_memory_voice_notes;
-- drop function if exists public.trg_fmvn_rewards_del();
-- and re-create family_reward_stats without the line
--   or exists (select 1 from public.family_memory_voice_notes v where v.memory_id = fm.id)
-- ============================================================================
