-- ============================================================================
-- Voice-note auto-conversion: storage trigger -> convert-voice-on-upload
-- ----------------------------------------------------------------------------
-- In-code wiring (pg_net). When a new audio file lands in one of the five voice
-- buckets, invoke the converter edge function. Audio-only, skips already-M4A/AAC,
-- never deletes originals. The two dead tables (album_voice_notes,
-- capsule_media_voice_notes) are intentionally untouched.
--
-- DEPLOY PREREQUISITES (run once, see PR notes):
--   1. select vault.create_secret('<RANDOM>', 'VOICE_CONVERT_SECRET', '...');
--   2. supabase secrets set VOICE_CONVERT_SECRET='<same RANDOM>'
--   3. CLOUDCONVERT_API_KEY must be set on the project (shared by all functions).
-- ============================================================================

-- (1) Owner-copy helper ------------------------------------------------------
-- album/capsule/timeline READ policies gate on storage.objects.owner. A file
-- written by the service role has a NULL owner, which would make the converted
-- file unreadable to family members. Copy the original's owner onto the
-- converted object. SECURITY DEFINER: the storage schema is not exposed to
-- PostgREST and is not writable by the api roles.
create or replace function public.copy_storage_object_owner(
  p_bucket text,
  p_src    text,
  p_dst    text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update storage.objects d
     set owner    = s.owner,
         owner_id = s.owner_id
    from storage.objects s
   where s.bucket_id = p_bucket and s.name = p_src
     and d.bucket_id = p_bucket and d.name = p_dst;
end;
$$;

revoke all on function public.copy_storage_object_owner(text, text, text)
  from public, anon, authenticated;
grant execute on function public.copy_storage_object_owner(text, text, text)
  to service_role;

-- (2) Trigger function -------------------------------------------------------
-- Fires the converter for a freshly-uploaded audio file. Skips non-audio (these
-- buckets also hold photos/videos) and anything already M4A/AAC (app uploads +
-- our own converted output -> also prevents any conversion loop).
-- Auth uses a vault-stored shared secret because the cron pattern's
-- supabase.service_role_key GUC is NOT available in an end-user request context,
-- which is where a storage trigger runs.
create or replace function public.invoke_voice_note_conversion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mime   text := lower(coalesce(new.metadata->>'mimetype', ''));
  v_secret text;
begin
  -- not audio -> skip. Trust a concrete mime; use the extension list only when
  -- the mime is absent, and exclude video-ambiguous extensions (.webm/.3gp, which
  -- these buckets also hold as video). A genuine Safari audio/webm recording still
  -- passes via the audio/% branch because its mime is audio/webm.
  if (v_mime <> '' and v_mime not like 'audio/%')
     or (v_mime = '' and new.name !~* '\.(weba|ogg|oga|opus|mp3|mpeg|wav|wave|flac|aif|aiff|amr|caf|wma)$') then
    return new;
  end if;

  -- already AAC/M4A -> nothing to do
  if v_mime in ('audio/mp4', 'audio/aac', 'audio/x-m4a', 'audio/m4a')
     or new.name ~* '\.(m4a|aac)$' then
    return new;
  end if;

  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where name = 'VOICE_CONVERT_SECRET'
   limit 1;

  if v_secret is null then
    raise warning 'VOICE_CONVERT_SECRET missing in vault; skipping conversion for %', new.name;
    return new;
  end if;

  perform net.http_post(
    url     := 'https://wekebqaooixjngznycnm.supabase.co/functions/v1/convert-voice-on-upload',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-voice-convert-secret', v_secret
    ),
    body    := jsonb_build_object(
      'bucket',   new.bucket_id,
      'name',     new.name,
      'mimetype', v_mime
    )
  );

  return new;
end;
$$;

-- Defence in depth: the trigger still fires regardless of EXECUTE grants, so
-- this only removes the (unusable) direct-call surface on a SECURITY DEFINER fn.
revoke all on function public.invoke_voice_note_conversion()
  from public, anon, authenticated;

-- (3) Trigger ----------------------------------------------------------------
-- Scoped to the 5 voice buckets so it never fires for unrelated uploads.
drop trigger if exists trg_convert_voice_note on storage.objects;
create trigger trg_convert_voice_note
after insert on storage.objects
for each row
when (
  new.bucket_id in (
    'album-media', 'capsule-media', 'timeline-media', 'memory-media', 'story-media'
  )
)
execute function public.invoke_voice_note_conversion();

-- (4) Repoint safety net -----------------------------------------------------
-- Closes the rare race where the converter finished (and already copied the
-- owner onto the .m4a) BEFORE the client wrote the pointer row, so the storage
-- path returned "no-row". These BEFORE triggers fire when a pointer is written;
-- if the converted .m4a already exists they rewrite the path in place. They:
--   * modify NEW directly (no extra UPDATE -> no recursion);
--   * skip null and anything already .m4a/.aac (so the converter's own repoint,
--     which sets a .m4a value, is a no-op here);
--   * only ever REDIRECT to an existing converted file -- they never convert.
-- Whichever event lands last (storage object vs pointer row) ends up correct.
-- Two functions only because the pointer column name differs (file_path vs
-- voice_note_path); the bucket is passed per-trigger via TG_ARGV.

create or replace function public.redirect_filepath_to_m4a()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bucket text := tg_argv[0];
  v_dst    text;
begin
  if new.file_path is null or new.file_path ~* '\.(m4a|aac)$' then
    return new;
  end if;

  v_dst := case
             when new.file_path ~ '\.[^/.]+$'
               then regexp_replace(new.file_path, '\.[^/.]+$', '.m4a')
             else new.file_path || '.m4a'
           end;

  if exists (
    select 1 from storage.objects where bucket_id = v_bucket and name = v_dst
  ) then
    perform public.copy_storage_object_owner(v_bucket, new.file_path, v_dst);
    new.file_path := v_dst;
  end if;

  return new;
end;
$$;

create or replace function public.redirect_voicenotepath_to_m4a()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bucket text := tg_argv[0];
  v_dst    text;
begin
  if new.voice_note_path is null or new.voice_note_path ~* '\.(m4a|aac)$' then
    return new;
  end if;

  v_dst := case
             when new.voice_note_path ~ '\.[^/.]+$'
               then regexp_replace(new.voice_note_path, '\.[^/.]+$', '.m4a')
             else new.voice_note_path || '.m4a'
           end;

  if exists (
    select 1 from storage.objects where bucket_id = v_bucket and name = v_dst
  ) then
    perform public.copy_storage_object_owner(v_bucket, new.voice_note_path, v_dst);
    new.voice_note_path := v_dst;
  end if;

  return new;
end;
$$;

revoke all on function public.redirect_filepath_to_m4a() from public, anon, authenticated;
revoke all on function public.redirect_voicenotepath_to_m4a() from public, anon, authenticated;

-- file_path surfaces
drop trigger if exists trg_redirect_voice_m4a on public.album_media_voice_notes;
create trigger trg_redirect_voice_m4a
before insert or update of file_path on public.album_media_voice_notes
for each row execute function public.redirect_filepath_to_m4a('album-media');

drop trigger if exists trg_redirect_voice_m4a on public.capsule_voice_notes;
create trigger trg_redirect_voice_m4a
before insert or update of file_path on public.capsule_voice_notes
for each row execute function public.redirect_filepath_to_m4a('capsule-media');

drop trigger if exists trg_redirect_voice_m4a on public.timeline_event_media_voice_notes;
create trigger trg_redirect_voice_m4a
before insert or update of file_path on public.timeline_event_media_voice_notes
for each row execute function public.redirect_filepath_to_m4a('timeline-media');

-- voice_note_path surfaces (column lives on the parent row, usually set via UPDATE)
drop trigger if exists trg_redirect_voice_m4a on public.family_memories;
create trigger trg_redirect_voice_m4a
before insert or update of voice_note_path on public.family_memories
for each row execute function public.redirect_voicenotepath_to_m4a('memory-media');

drop trigger if exists trg_redirect_voice_m4a on public.stories;
create trigger trg_redirect_voice_m4a
before insert or update of voice_note_path on public.stories
for each row execute function public.redirect_voicenotepath_to_m4a('story-media');
