-- ════════════════════════════════════════════════════════════════════════════
-- Family reward code redemption (web print checkout)
--
-- Sits beside the existing reward ladder (evaluate_family_rewards /
-- fulfil_earned_reward_claims, which MINT reward_codes). This migration adds the
-- REDEMPTION side that the print checkouts call:
--   • validate_reward_code   — read-only preview (exists / family / issued / unexpired)
--   • redeem_reward_code      — atomic single-use consume, tied to an order ref
--   • release_reward_code     — compensating un-redeem if the checkout aborts later
--   • expire_stale_reward_codes — sweep stale 'issued' codes to 'expired'
-- plus order columns that record what was actually charged + which code was used.
--
-- IN SCOPE: discount_pct (10/25/40/50) and free_product (memory_book_chapter /
-- any_print_standard) codes. OUT OF SCOPE: the t500 premium-year grant — its flags
-- (family_reward_progress.premium_grant_pending / premium_years_owed) are untouched
-- here. A free_product code's 100%-off applies to the item only; shipping is always
-- charged at checkout, so a redeemed order never has a £0 total.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Order columns: record the real amounts + the redeemed code ─────────────
-- `orders` (book) had no shipping_method; canvas_orders / acrylic_orders already do.
alter table public.orders          add column if not exists shipping_method text;
alter table public.orders          add column if not exists shipping_amount numeric;
alter table public.orders          add column if not exists amount_charged  numeric;
alter table public.orders          add column if not exists reward_code     text;

alter table public.canvas_orders   add column if not exists shipping_amount numeric;
alter table public.canvas_orders   add column if not exists amount_charged  numeric;
alter table public.canvas_orders   add column if not exists reward_code     text;

alter table public.acrylic_orders  add column if not exists shipping_amount numeric;
alter table public.acrylic_orders  add column if not exists amount_charged  numeric;
alter table public.acrylic_orders  add column if not exists reward_code     text;


-- ── 2. validate_reward_code — read-only preview ───────────────────────────────
-- SECURITY DEFINER: callers are the trusted service-role checkout functions and the
-- server-side /api/rewards/validate route, where auth.uid() is null. Membership is
-- therefore checked against an EXPLICIT p_user_id (NOT get_my_family_ids(), which
-- relies on auth.uid()). The caller is trusted to pass the real authenticated user id.
create or replace function public.validate_reward_code(p_code text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_code      text := upper(btrim(coalesce(p_code, '')));
  v_rec       public.reward_codes;
  v_is_member boolean;
begin
  if v_code = '' then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  select * into v_rec from public.reward_codes where code = v_code;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  select exists (
    select 1 from public.family_memberships
    where user_id = p_user_id and family_id = v_rec.family_id
  ) into v_is_member;

  if not v_is_member then
    return jsonb_build_object('ok', false, 'reason', 'wrong_family');
  end if;

  if v_rec.status <> 'issued' then
    return jsonb_build_object(
      'ok', false,
      'reason', case when v_rec.status = 'redeemed' then 'already_used' else v_rec.status end
    );
  end if;

  if v_rec.expires_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;

  return jsonb_build_object(
    'ok',           true,
    'reason',       'valid',
    'code',         v_rec.code,
    'kind',         v_rec.kind,
    'discount_pct', v_rec.discount_pct,
    'product_key',  v_rec.product_key,
    'family_id',    v_rec.family_id,
    'expires_at',   v_rec.expires_at
  );
end;
$$;


-- ── 3. redeem_reward_code — atomic single-use consume ─────────────────────────
create or replace function public.redeem_reward_code(p_code text, p_user_id uuid, p_order_ref text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_code      text := upper(btrim(coalesce(p_code, '')));
  v_rec       public.reward_codes;
  v_is_member boolean;
begin
  if v_code = '' then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  -- Stable pre-checks (existence + family) so we can return a precise reason. These are
  -- NOT the guard: the single conditional UPDATE below is what enforces single-use.
  select * into v_rec from public.reward_codes where code = v_code;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  select exists (
    select 1 from public.family_memberships
    where user_id = p_user_id and family_id = v_rec.family_id
  ) into v_is_member;

  if not v_is_member then
    return jsonb_build_object('ok', false, 'reason', 'wrong_family');
  end if;

  -- ── THE load-bearing guard: one conditional UPDATE, no separate SELECT ... FOR UPDATE.
  --    Only the row still 'issued' AND unexpired is claimed; it flips to 'redeemed' in the
  --    same statement. Under READ COMMITTED two callers racing the SAME code serialise on the
  --    row lock; the loser's recheck sees status <> 'issued' and matches zero rows. Race-safe,
  --    single-use. Do not split this into SELECT-then-UPDATE.
  update public.reward_codes
     set status             = 'redeemed',
         redeemed_at        = now(),
         redeemed_order_ref = p_order_ref,
         updated_at         = now()
   where code = v_code
     and status = 'issued'
     and expires_at > now()
  returning * into v_rec;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unavailable');
  end if;

  return jsonb_build_object(
    'ok',           true,
    'reason',       'redeemed',
    'code',         v_rec.code,
    'kind',         v_rec.kind,
    'discount_pct', v_rec.discount_pct,
    'product_key',  v_rec.product_key,
    'family_id',    v_rec.family_id
  );
end;
$$;


-- ── 4. release_reward_code — compensating un-redeem ───────────────────────────
-- Called only synchronously by the checkout function when minting the Stripe coupon
-- or creating the session FAILS after a successful redeem — before any webhook runs.
-- Scoped to the exact code + order ref, and only while still 'redeemed', so it can
-- never resurrect an expired/void/fulfilled code or one consumed by a different order.
create or replace function public.release_reward_code(p_code text, p_order_ref text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_n    integer;
begin
  update public.reward_codes
     set status             = 'issued',
         redeemed_at        = null,
         redeemed_order_ref = null,
         updated_at         = now()
   where code = v_code
     and status = 'redeemed'
     and redeemed_order_ref = p_order_ref;

  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'released', v_n > 0);
end;
$$;


-- ── 5. expire_stale_reward_codes — sweep ──────────────────────────────────────
-- Belt-and-braces only. The load-bearing expiry guard is `expires_at > now()` inside
-- redeem_reward_code; this just keeps statuses tidy for display / analytics.
create or replace function public.expire_stale_reward_codes()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_n integer;
begin
  update public.reward_codes
     set status = 'expired', updated_at = now()
   where status = 'issued' and expires_at <= now();

  get diagnostics v_n = row_count;
  if v_n > 0 then
    raise log 'expire_stale_reward_codes: expired % code(s)', v_n;
  end if;
  return v_n;
end;
$$;


-- ── 6. Grants — only the trusted service role may validate/redeem/release ─────
revoke all on function public.validate_reward_code(text, uuid)        from public;
revoke all on function public.redeem_reward_code(text, uuid, text)    from public;
revoke all on function public.release_reward_code(text, text)         from public;
revoke all on function public.expire_stale_reward_codes()             from public;

grant execute on function public.validate_reward_code(text, uuid)     to service_role;
grant execute on function public.redeem_reward_code(text, uuid, text) to service_role;
grant execute on function public.release_reward_code(text, text)      to service_role;
grant execute on function public.expire_stale_reward_codes()          to service_role;


-- ── 7. Schedule the expiry sweep (pg_cron) ────────────────────────────────────
do $$
begin
  if exists (select 1 from cron.job where jobname = 'expire-stale-reward-codes') then
    perform cron.unschedule('expire-stale-reward-codes');
  end if;
  perform cron.schedule(
    'expire-stale-reward-codes',
    '*/15 * * * *',
    'select public.expire_stale_reward_codes();'
  );
exception when undefined_table or undefined_function or insufficient_privilege then
  raise notice 'pg_cron unavailable — schedule public.expire_stale_reward_codes() manually';
end $$;
