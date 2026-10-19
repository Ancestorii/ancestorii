-- The database triggers and cron jobs that call the Edge Functions. Applied by hand with the
-- SQL editor (there is deliberately no migration: the migration history and the live schema
-- differ, see the project notes), last on 18 October 2026.
--
-- Postgres has no user JWT, and the Edge Functions gateway rejects the legacy service-role JWT,
-- so every call carries the shared secret in x-webhook-secret and the functions deploy with
-- verify_jwt off (supabase/config.toml). <WEBHOOK_SECRET> is the WEBHOOK_SECRET function secret
-- (`supabase secrets list`); paste the value before running.

-- The founder's welcome letter, once per account.
drop trigger if exists "welcome-email-on-signup" on public."Profiles";
create trigger "welcome-email-on-signup" after insert on public."Profiles" for each row
  execute function supabase_functions.http_request('https://wekebqaooixjngznycnm.supabase.co/functions/v1/welcome-email', 'POST', '{"Content-type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}', '{}', '10000');

-- "You're in" to the joiner and "your family is growing" to the rest.
drop trigger if exists "member-joined" on public.family_memberships;
create trigger "member-joined" after insert on public.family_memberships for each row
  execute function supabase_functions.http_request('https://wekebqaooixjngznycnm.supabase.co/functions/v1/member-joined', 'POST', '{"Content-type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}', '{}', '20000');

-- The sender hears when a question is answered (the function acts only on the transition to answered).
drop trigger if exists "prompt-answered-email" on public.sent_prompts;
create trigger "prompt-answered-email" after update of status on public.sent_prompts for each row
  when (old.status is distinct from new.status)
  execute function supabase_functions.http_request('https://wekebqaooixjngznycnm.supabase.co/functions/v1/prompt-answered-email', 'POST', '{"Content-type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}', '{}', '10000');

-- Push notifications for the mobile app.
drop trigger if exists "send-push" on public.notifications;
create trigger "send-push" after insert on public.notifications for each row
  execute function supabase_functions.http_request('https://wekebqaooixjngznycnm.supabase.co/functions/v1/send-push', 'POST', '{"Content-type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}', '{}', '10000');

-- "Your invite is on its way" to the inviter.
drop trigger if exists "invite-sent-confirmation" on public.family_invites;
create trigger "invite-sent-confirmation" after insert on public.family_invites for each row
  execute function supabase_functions.http_request('https://wekebqaooixjngznycnm.supabase.co/functions/v1/invite-sent-confirmation', 'POST', '{"Content-type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}', '{}', '10000');

-- "Something new in your family": only on new things, never on comments, hearts or added
-- perspectives (the function skips a memory with a parent, and the onboarding sample).
do $$
declare t text;
begin
  foreach t in array array['family_memories','family_members','timelines','albums','memory_capsules','memory_books','memory_canvases','acrylic_prints'] loop
    execute format('drop trigger if exists "family-activity" on public.%I', t);
    execute format($f$create trigger "family-activity" after insert on public.%I for each row execute function supabase_functions.http_request('https://wekebqaooixjngznycnm.supabase.co/functions/v1/family-activity', 'POST', '{"Content-type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}', '{}', '60000')$f$, t);
  end loop;
end $$;

-- The two daily jobs (pg_cron job ids 2 and 3).
select cron.alter_job(2, command := $cmd$
  select net.http_post(
    url := 'https://wekebqaooixjngznycnm.supabase.co/functions/v1/onboarding-drip',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', '<WEBHOOK_SECRET>'),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$cmd$);

select cron.alter_job(3, command := $cmd$
  select net.http_post(
    url := 'https://wekebqaooixjngznycnm.supabase.co/functions/v1/delivery-check',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', '<WEBHOOK_SECRET>'),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$cmd$);
