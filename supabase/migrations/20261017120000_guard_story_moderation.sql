-- Only moderation can publish a story.
--
-- The stories_auth_insert / stories_auth_update RLS policies only check author_id = auth.uid(),
-- so a signed-in author could insert a story as 'published', or switch a pending_review or
-- rejected story to 'published', straight through the API: skipping the automatic check and the
-- person's review, even while suspended or banned. This trigger closes that.
--
-- Requests made as a signed-in or anonymous user (database roles "authenticated" / "anon") can
-- only create drafts, and can never change a story's status, publish date or moderation fields.
-- /api/moderate-story and the admin routes use the service role, so they still publish, hold and
-- reject stories; the SQL editor and trusted SECURITY DEFINER functions are not limited either.
-- The app only ever inserts drafts and edits title, body, category, excerpt and voice note
-- (src/lib/stories/mutations.ts), so it is unaffected.
--
-- Applied by hand (Supabase SQL editor / MCP), like the other migration in this folder; written
-- to be safe to re-run.

create or replace function public.guard_story_moderation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'draft';
    new.published_at := null;
    new.moderation_reason := null;
    new.moderation_category := null;
  elsif new.status is distinct from old.status
     or new.published_at is distinct from old.published_at
     or new.moderation_reason is distinct from old.moderation_reason
     or new.moderation_category is distinct from old.moderation_category then
    raise exception 'Only moderation can change a story''s status' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_story_moderation on public.stories;
create trigger trg_guard_story_moderation
  before insert or update on public.stories
  for each row execute function public.guard_story_moderation();
