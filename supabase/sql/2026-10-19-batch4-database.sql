-- Ancestorii: database follow-ups (verification run, batch 4), 19 Oct 2026.
--
-- This file is a RECORD of what was applied by hand through the Supabase MCP (execute_sql),
-- in the order it ran. It is not a migration and is not meant to be re-run blindly. Every
-- step was inspected before (pg_get_functiondef, pg_policies, pg_constraint, pg_trigger) and
-- proven after with a read-only query; the proofs are quoted in the batch 4 DB report.
-- Reverts for each step are given as comments at the end.
--
-- Builds on supabase/sql/2026-10-18-performance-and-security.sql (batch 1).

-- ============================================================================
-- Step 1. create_memory_book_with_pages, create_memory_canvas and create_acrylic_print are
-- SECURITY DEFINER and inserted whatever p_user_id the browser sent, so any signed-in user
-- could create products under another user's id. Each now reads auth.uid(), raises 42501
-- when there is no signed-in user, and ignores p_user_id. The signatures are unchanged so
-- the three rpc() callers (CreateBookDrawer, CreateCanvasDrawer, CreateAcrylicDrawer, all
-- passing p_user_id: user.id) keep compiling. No service-role caller exists in app/, src/
-- or supabase/functions. Bodies are otherwise identical to the 18 Oct definitions (the
-- comments lost two non-ASCII characters and an em dash, nothing else).
-- Proof: a call as postgres (auth.uid() is null) raised
--   ERROR 42501: You must be signed in to create a memory canvas.
-- and no row was written; pg_get_functiondef shows VALUES (v_uid, ...) in all three.
-- ============================================================================
begin;

CREATE OR REPLACE FUNCTION public.create_memory_book_with_pages(p_user_id uuid, p_title text, p_tier_key text, p_book_size text DEFAULT 'a4_portrait'::text, p_cover_asset_id uuid DEFAULT NULL::uuid, p_description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  -- The caller's verified id. p_user_id is kept only so existing rpc() calls still compile:
  -- a SECURITY DEFINER function must never trust a user id passed in from the browser.
  v_uid                uuid := auth.uid();
  v_book_id            uuid;
  v_total_page_limit   integer;
  v_content_page_limit integer;
  v_tier_name          text;
  v_price_gbp          numeric(10,2);
  v_page_number        integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to create a memory book.' USING ERRCODE = '42501';
  END IF;

  p_book_size := lower(trim(p_book_size));
  p_tier_key  := lower(trim(p_tier_key));

  IF p_book_size NOT IN (
    'a4_portrait', 'a4_landscape',
    'a5_portrait', 'a5_landscape',
    'square_8',    'square_11'
  ) THEN
    RAISE EXCEPTION 'Invalid book_size: %', p_book_size;
  END IF;

  IF p_tier_key = 'chapter' THEN
    v_tier_name          := 'A Chapter';
    v_total_page_limit   := 24;
    v_content_page_limit := 22;
    v_price_gbp          := 44.99;
  ELSIF p_tier_key = 'story' THEN
    v_tier_name          := 'A Story';
    v_total_page_limit   := 36;
    v_content_page_limit := 34;
    v_price_gbp          := 54.99;
  ELSIF p_tier_key = 'legacy' THEN
    v_tier_name          := 'A Legacy';
    v_total_page_limit   := 48;
    v_content_page_limit := 46;
    v_price_gbp          := 64.99;
  ELSE
    RAISE EXCEPTION 'Invalid tier_key: %', p_tier_key;
  END IF;

  INSERT INTO public.memory_books (
    user_id, title, description, status, cover_asset_id,
    book_size, tier_key, tier_name,
    total_page_limit, content_page_limit, price_gbp
  )
  VALUES (
    v_uid,
    COALESCE(NULLIF(TRIM(p_title), ''), 'Untitled Memory Book'),
    p_description, 'draft', p_cover_asset_id,
    p_book_size, p_tier_key, v_tier_name,
    v_total_page_limit, v_content_page_limit, v_price_gbp
  )
  RETURNING id INTO v_book_id;

  FOR v_page_number IN 1..v_content_page_limit LOOP
    INSERT INTO public.memory_book_pages (
      book_id, page_number, layout_type
    )
    VALUES (
      v_book_id, v_page_number, 'portrait_layout'
    );
  END LOOP;

  RETURN v_book_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_memory_canvas(p_user_id uuid, p_title text, p_tier_key text, p_orientation text DEFAULT 'landscape'::text, p_layout_type text DEFAULT 'solo'::text, p_description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  -- The caller's verified id. p_user_id is kept only so existing rpc() calls still compile:
  -- a SECURITY DEFINER function must never trust a user id passed in from the browser.
  v_uid             uuid := auth.uid();
  v_canvas_id       uuid;
  v_tier_name       text;
  v_price_gbp       numeric(10,2);
  v_canvas_size     text;
  v_prodigi_sku     text;
  v_export_width    integer;
  v_export_height   integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to create a memory canvas.' USING ERRCODE = '42501';
  END IF;

  -- Normalise inputs
  p_tier_key    := lower(trim(p_tier_key));
  p_orientation := lower(trim(p_orientation));
  p_layout_type := lower(trim(p_layout_type));

  -- Validate orientation
  IF p_orientation NOT IN ('landscape', 'portrait') THEN
    RAISE EXCEPTION 'Invalid orientation: %', p_orientation;
  END IF;

  -- -------------------------------------------------------
  -- Resolve tier: name, price, canvas_size, SKU
  -- -------------------------------------------------------
  IF p_tier_key = 'moment' THEN
    v_tier_name   := 'The Moment';
    v_price_gbp   := 99.99;
    v_canvas_size := '16x36';
    v_prodigi_sku := 'GLOBAL-CAN-16X36';

    -- 16x36 inches at 300 DPI
    IF p_orientation = 'landscape' THEN
      v_export_width  := 10800;  -- 36 x 300
      v_export_height := 4800;   -- 16 x 300
    ELSE
      v_export_width  := 4800;   -- 16 x 300
      v_export_height := 10800;  -- 36 x 300
    END IF;

  ELSIF p_tier_key = 'heirloom' THEN
    v_tier_name   := 'The Heirloom';
    v_price_gbp   := 129.99;
    v_canvas_size := '20x32';
    v_prodigi_sku := 'GLOBAL-CAN-20X32';

    -- 20x32 inches at 300 DPI
    IF p_orientation = 'landscape' THEN
      v_export_width  := 9600;   -- 32 x 300
      v_export_height := 6000;   -- 20 x 300
    ELSE
      v_export_width  := 6000;   -- 20 x 300
      v_export_height := 9600;   -- 32 x 300
    END IF;

  ELSIF p_tier_key = 'heritage' THEN
    v_tier_name   := 'The Heritage';
    v_price_gbp   := 169.99;
    v_canvas_size := '24x72';
    v_prodigi_sku := 'GLOBAL-CAN-24X72';

    -- 24x72 inches at 300 DPI
    IF p_orientation = 'landscape' THEN
      v_export_width  := 21600;  -- 72 x 300
      v_export_height := 7200;   -- 24 x 300
    ELSE
      v_export_width  := 7200;   -- 24 x 300
      v_export_height := 21600;  -- 72 x 300
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid tier_key: %. Must be moment, heirloom, or heritage.', p_tier_key;
  END IF;

  -- -------------------------------------------------------
  -- Insert the canvas
  -- -------------------------------------------------------
  INSERT INTO public.memory_canvases (
    user_id, title, description, status,
    tier_key, tier_name, price_gbp,
    canvas_size, orientation, layout_type,
    wrap_type, prodigi_sku,
    export_width_px, export_height_px
  )
  VALUES (
    v_uid,
    COALESCE(NULLIF(TRIM(p_title), ''), 'Untitled Memory Canvas'),
    p_description,
    'draft',
    p_tier_key, v_tier_name, v_price_gbp,
    v_canvas_size, p_orientation, p_layout_type,
    'imagewrap', v_prodigi_sku,
    v_export_width, v_export_height
  )
  RETURNING id INTO v_canvas_id;

  RETURN v_canvas_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_acrylic_print(p_user_id uuid, p_title text, p_tier_key text, p_orientation text DEFAULT 'landscape'::text, p_layout_type text DEFAULT 'solo'::text, p_description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  -- The caller's verified id. p_user_id is kept only so existing rpc() calls still compile:
  -- a SECURITY DEFINER function must never trust a user id passed in from the browser.
  v_uid             uuid := auth.uid();
  v_acrylic_id      uuid;
  v_tier_name       text;
  v_price_gbp       numeric(10,2);
  v_acrylic_size    text;
  v_prodigi_sku     text;
  v_export_width    integer;
  v_export_height   integer;
  v_orientation     text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to create an acrylic print.' USING ERRCODE = '42501';
  END IF;

  -- Normalise inputs
  p_tier_key    := lower(trim(p_tier_key));
  p_orientation := lower(trim(p_orientation));
  p_layout_type := lower(trim(p_layout_type));

  -- -------------------------------------------------------
  -- Resolve tier: name, price, size, SKU, dimensions
  -- -------------------------------------------------------
  IF p_tier_key = 'portrait' THEN
    v_tier_name    := 'The Portrait';
    v_price_gbp    := 99.99;
    v_acrylic_size := '16x24';
    v_prodigi_sku  := 'GLOBAL-MOU-ACRY-16X24';

    -- Validate orientation (no square for rectangles)
    IF p_orientation NOT IN ('landscape', 'portrait') THEN
      RAISE EXCEPTION 'Invalid orientation for The Portrait: %. Must be landscape or portrait.', p_orientation;
    END IF;
    v_orientation := p_orientation;

    -- 16x24 inches at 300 DPI
    IF v_orientation = 'landscape' THEN
      v_export_width  := 7200;   -- 24 x 300
      v_export_height := 4800;   -- 16 x 300
    ELSE
      v_export_width  := 4800;   -- 16 x 300
      v_export_height := 7200;   -- 24 x 300
    END IF;

  ELSIF p_tier_key = 'centrepiece' THEN
    v_tier_name    := 'The Centrepiece';
    v_price_gbp    := 149.99;
    v_acrylic_size := '24x24';
    v_prodigi_sku  := 'GLOBAL-MOU-ACRY-24X24';

    -- Square: orientation is always 'square', ignore input
    v_orientation   := 'square';
    v_export_width  := 7200;   -- 24 x 300
    v_export_height := 7200;   -- 24 x 300

  ELSIF p_tier_key = 'masterpiece' THEN
    v_tier_name    := 'The Masterpiece';
    v_price_gbp    := 199.99;
    v_acrylic_size := '24x36';
    v_prodigi_sku  := 'GLOBAL-MOU-ACRY-24X36';

    -- Validate orientation (no square for rectangles)
    IF p_orientation NOT IN ('landscape', 'portrait') THEN
      RAISE EXCEPTION 'Invalid orientation for The Masterpiece: %. Must be landscape or portrait.', p_orientation;
    END IF;
    v_orientation := p_orientation;

    -- 24x36 inches at 300 DPI
    IF v_orientation = 'landscape' THEN
      v_export_width  := 10800;  -- 36 x 300
      v_export_height := 7200;   -- 24 x 300
    ELSE
      v_export_width  := 7200;   -- 24 x 300
      v_export_height := 10800;  -- 36 x 300
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid tier_key: %. Must be portrait, centrepiece, or masterpiece.', p_tier_key;
  END IF;

  -- -------------------------------------------------------
  -- Insert the acrylic print
  -- -------------------------------------------------------
  INSERT INTO public.acrylic_prints (
    user_id, title, description, status,
    tier_key, tier_name, price_gbp,
    acrylic_size, orientation, layout_type,
    prodigi_sku,
    export_width_px, export_height_px
  )
  VALUES (
    v_uid,
    COALESCE(NULLIF(TRIM(p_title), ''), 'Untitled Acrylic Print'),
    p_description,
    'draft',
    p_tier_key, v_tier_name, v_price_gbp,
    v_acrylic_size, v_orientation, p_layout_type,
    v_prodigi_sku,
    v_export_width, v_export_height
  )
  RETURNING id INTO v_acrylic_id;

  RETURN v_acrylic_id;
END;
$function$;

commit;

-- ============================================================================
-- Step 2. family_memories UPDATE policy "family_update" let any family member rewrite
-- anyone's memory (USING family_id IN get_my_family_ids(), no WITH CHECK). Every update in
-- app/, src/ and supabase/functions was checked: the only browser update is the author's own
-- editor (app/dashboard/memories/[id]/edit, the server page refuses non-authors); the moves
-- in accept-invite, join-via-link and the voice converter use the service role, which
-- bypasses RLS. Non-authors change nothing, so both halves are now author-only (family
-- check kept).
-- ============================================================================
begin;
alter policy family_update on public.family_memories
  using ((author_id = (select auth.uid())) and (family_id in (select get_my_family_ids())))
  with check ((author_id = (select auth.uid())) and (family_id in (select get_my_family_ids())));
commit;

-- ============================================================================
-- Step 3. orders.book_id, canvas_orders.canvas_id and acrylic_orders.acrylic_id were
-- ON DELETE CASCADE: deleting a product deleted its paid order rows. Lead decision: RESTRICT.
-- The delete now fails from the browser and deleteWithOwnerCheck shows its message. All three
-- columns are NOT NULL and already indexed (idx_orders_book_id, idx_canvas_orders_canvas_id,
-- idx_acrylic_orders_acrylic_id). No other table references the order tables.
-- ============================================================================
begin;
alter table public.orders
  drop constraint orders_book_id_fkey,
  add constraint orders_book_id_fkey foreign key (book_id) references public.memory_books(id) on delete restrict;
alter table public.canvas_orders
  drop constraint canvas_orders_canvas_id_fkey,
  add constraint canvas_orders_canvas_id_fkey foreign key (canvas_id) references public.memory_canvases(id) on delete restrict;
alter table public.acrylic_orders
  drop constraint acrylic_orders_acrylic_id_fkey,
  add constraint acrylic_orders_acrylic_id_fkey foreign key (acrylic_id) references public.acrylic_prints(id) on delete restrict;
commit;

-- ============================================================================
-- Step 4. sent_prompts.parent_memory_id was NO ACTION, so deleting a memory that had been
-- used to send a prompt failed. The column is nullable; 0 rows currently point at a memory.
-- ============================================================================
begin;
alter table public.sent_prompts
  drop constraint sent_prompts_parent_memory_id_fkey,
  add constraint sent_prompts_parent_memory_id_fkey foreign key (parent_memory_id) references public.family_memories(id) on delete set null;
commit;

-- ============================================================================
-- Step 5. enforce_storage_quota() was attached twice to storage.objects (storage_quota_trigger
-- with no WHEN, and trg_enforce_storage_quota WHEN new.name ~ '^[0-9a-fA-F-]+/'). Kept the
-- guarded one: storage_prefix_check already rejects any non-service-role upload whose prefix
-- is not the caller's uuid, so the two were equivalent for users and both skip the service
-- role. Proof: exactly one trigger on storage.objects now calls enforce_storage_quota.
-- ============================================================================
drop trigger storage_quota_trigger on storage.objects;

-- ============================================================================
-- Step 6 and 7. Plan limits.
-- Lead decision: a family with no live subscription is on the Free plan (plans.name = 'Free',
-- the same key handle_new_user and usePlanLimits use). get_user_plan_limits and
-- get_file_limits returned no row for such a family: the storage trigger then raised
-- 'No active plan found' (two real families could not upload: one with no subscriptions row,
-- one whose Free row is status 'canceled'), and the album, timeline and capsule triggers
-- RETURNed NEW (no cap at all). Both functions now fall back to the Free row; the triggers
-- raise if no plan row comes back at all and treat a NULL cap as "no cap" (both plan rows
-- store NULL for albums, timelines and capsules). The existing definitions of "subscribed"
-- are unchanged. get_effective_max_loved_ones already returns a number for everyone, so it
-- was left alone (see the report for the owner decision it raises).
-- Every family pick (get_user_plan_limits, get_file_limits, has_active_subscription and the
-- four triggers) used "WHERE user_id = ... LIMIT 1" with no ORDER BY; it is now
-- ORDER BY (role = 'owner') DESC, joined_at ASC (family_memberships has role and joined_at;
-- roles in use are owner and member; no user has two memberships today).
-- Proof: get_user_plan_limits and get_file_limits now return the Free row (1 GB, 20 MB,
-- 300 s video) for ea5ef2dd (no row) and f7335a49 (canceled row), the Premium row for
-- f5d224ef, and the Free row for the QA account.
-- ============================================================================
begin;

CREATE OR REPLACE FUNCTION public.get_user_plan_limits(uid uuid)
 RETURNS TABLE(max_storage bigint, max_timelines integer, max_albums integer, max_capsules integer, max_upload_size bigint, max_video_length integer, perks jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- The user's family: the one they own first, then the one joined earliest.
  WITH fam AS (
    SELECT fm.family_id
    FROM public.family_memberships fm
    WHERE fm.user_id = uid
    ORDER BY (fm.role = 'owner') DESC, fm.joined_at ASC
    LIMIT 1
  ),
  -- The family's live subscription, if it has one.
  sub AS (
    SELECT p.max_storage, p.max_timelines, p.max_albums, p.max_capsules, p.max_upload_size, p.max_video_length, p.perks
    FROM public.subscriptions s
    JOIN public.plans p ON p.id = s.plan_id
    WHERE s.family_id = (SELECT family_id FROM fam)
      AND s.status = 'active'
      AND s.cancel_at_period_end = false
      AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
    ORDER BY p.max_storage DESC NULLS LAST
    LIMIT 1
  )
  SELECT * FROM sub
  UNION ALL
  -- No live subscription (no row, cancelled, lapsed): the family is on the Free plan.
  SELECT p.max_storage, p.max_timelines, p.max_albums, p.max_capsules, p.max_upload_size, p.max_video_length, p.perks
  FROM public.plans p
  WHERE p.name = 'Free' AND NOT EXISTS (SELECT 1 FROM sub)
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_file_limits(uid uuid)
 RETURNS TABLE(max_storage bigint, max_upload_size bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- The user's family: the one they own first, then the one joined earliest.
  WITH fam AS (
    SELECT fm.family_id
    FROM public.family_memberships fm
    WHERE fm.user_id = uid
    ORDER BY (fm.role = 'owner') DESC, fm.joined_at ASC
    LIMIT 1
  ),
  sub AS (
    SELECT p.max_storage, p.max_upload_size
    FROM public.subscriptions s
    JOIN public.plans p ON p.id = s.plan_id
    WHERE s.family_id = (SELECT family_id FROM fam)
      AND s.status IN ('active', 'trialing')
    ORDER BY p.max_storage DESC NULLS LAST
    LIMIT 1
  )
  SELECT * FROM sub
  UNION ALL
  -- No active subscription: the family is on the Free plan.
  SELECT p.max_storage, p.max_upload_size
  FROM public.plans p
  WHERE p.name = 'Free' AND NOT EXISTS (SELECT 1 FROM sub)
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.has_active_subscription(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.family_id = (
      -- The user's family: the one they own first, then the one joined earliest.
      SELECT fm.family_id
      FROM public.family_memberships fm
      WHERE fm.user_id = uid
      ORDER BY (fm.role = 'owner') DESC, fm.joined_at ASC
      LIMIT 1
    )
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  );
$function$;

CREATE OR REPLACE FUNCTION public.enforce_album_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_limit int;
  v_count int;
  v_family_id uuid;
BEGIN
  -- get_user_plan_limits always returns a row (the Free plan when the family has no live
  -- subscription). A NULL cap means this plan puts no cap on albums.
  SELECT max_albums INTO v_limit
  FROM public.get_user_plan_limits(NEW.user_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No plan found for this family.';
  END IF;

  IF v_limit IS NULL THEN
    RETURN NEW;
  END IF;

  -- The user's family: the one they own first, then the one joined earliest.
  SELECT fm.family_id INTO v_family_id
  FROM public.family_memberships fm
  WHERE fm.user_id = NEW.user_id
  ORDER BY (fm.role = 'owner') DESC, fm.joined_at ASC
  LIMIT 1;

  SELECT COUNT(*) INTO v_count
  FROM public.albums
  WHERE family_id = v_family_id;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Album limit reached. Upgrade your plan to create more.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_timeline_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_limit int;
  v_count int;
  v_family_id uuid;
BEGIN
  -- get_user_plan_limits always returns a row (the Free plan when the family has no live
  -- subscription). A NULL cap means this plan puts no cap on timelines.
  SELECT max_timelines INTO v_limit
  FROM public.get_user_plan_limits(NEW.owner_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No plan found for this family.';
  END IF;

  IF v_limit IS NULL THEN
    RETURN NEW;
  END IF;

  -- The user's family: the one they own first, then the one joined earliest.
  SELECT fm.family_id INTO v_family_id
  FROM public.family_memberships fm
  WHERE fm.user_id = NEW.owner_id
  ORDER BY (fm.role = 'owner') DESC, fm.joined_at ASC
  LIMIT 1;

  SELECT COUNT(*) INTO v_count
  FROM public.timelines
  WHERE family_id = v_family_id;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Timeline limit reached. Upgrade your plan to create more.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_capsule_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_limit int;
  v_count int;
  v_family_id uuid;
BEGIN
  -- get_user_plan_limits always returns a row (the Free plan when the family has no live
  -- subscription). A NULL cap means this plan puts no cap on capsules.
  SELECT max_capsules INTO v_limit
  FROM public.get_user_plan_limits(NEW.user_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No plan found for this family.';
  END IF;

  IF v_limit IS NULL THEN
    RETURN NEW;
  END IF;

  -- The user's family: the one they own first, then the one joined earliest.
  SELECT fm.family_id INTO v_family_id
  FROM public.family_memberships fm
  WHERE fm.user_id = NEW.user_id
  ORDER BY (fm.role = 'owner') DESC, fm.joined_at ASC
  LIMIT 1;

  SELECT COUNT(*) INTO v_count
  FROM public.memory_capsules
  WHERE family_id = v_family_id;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Capsule limit reached. Upgrade your plan to create more.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_loved_one_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_limit int;
  v_count int;
  v_family_id uuid;
BEGIN
  v_limit := public.get_effective_max_loved_ones(NEW.owner_id);

  -- The user's family: the one they own first, then the one joined earliest.
  SELECT fm.family_id INTO v_family_id
  FROM public.family_memberships fm
  WHERE fm.user_id = NEW.owner_id
  ORDER BY (fm.role = 'owner') DESC, fm.joined_at ASC
  LIMIT 1;

  SELECT COUNT(*) INTO v_count
  FROM public.family_members
  WHERE family_id = v_family_id;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Loved one limit reached (% of %)', v_count, v_limit;
  END IF;

  RETURN NEW;
END;
$function$;

commit;

-- ============================================================================
-- Step 8. public.profile_cards (created by the lead on 18 Oct) is a plain view owned by
-- postgres (bypassrls) with security_invoker=false, and the default grants gave anon and
-- authenticated INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER on it. A simple view
-- is auto-updatable, so PATCH /rest/v1/profile_cards?id=eq.<anyone> would have rewritten any
-- profile's name, bio or avatar with the Profiles row policies bypassed. Only
-- src/lib/stories/publicFeed.ts reads the view; nothing writes to it.
-- Proof: before, "set local role anon; update public.profile_cards set bio = bio where false"
-- was accepted; after, it fails with "permission denied for view profile_cards", and
-- information_schema.table_privileges lists SELECT only for anon and authenticated.
-- ============================================================================
revoke insert, update, delete, truncate, references, trigger on table public.profile_cards from anon, authenticated;

-- ============================================================================
-- Reverts (not run). Each block undoes the step with the same number.
-- ============================================================================
-- Step 1 revert: in each of the three functions, remove the v_uid declaration and the
-- "IF v_uid IS NULL" block, and put p_user_id back as the first value of the INSERT
-- (VALUES (p_user_id, ...)). Everything else in the bodies is the 18 Oct text.
-- Step 2 revert (ALTER POLICY cannot drop a WITH CHECK, so drop and recreate):
-- drop policy family_update on public.family_memories;
-- create policy family_update on public.family_memories for update to authenticated
--   using (family_id in (select get_my_family_ids()));
-- Step 3 revert:
-- alter table public.orders drop constraint orders_book_id_fkey,
--   add constraint orders_book_id_fkey foreign key (book_id) references public.memory_books(id) on delete cascade;
-- alter table public.canvas_orders drop constraint canvas_orders_canvas_id_fkey,
--   add constraint canvas_orders_canvas_id_fkey foreign key (canvas_id) references public.memory_canvases(id) on delete cascade;
-- alter table public.acrylic_orders drop constraint acrylic_orders_acrylic_id_fkey,
--   add constraint acrylic_orders_acrylic_id_fkey foreign key (acrylic_id) references public.acrylic_prints(id) on delete cascade;
-- Step 4 revert:
-- alter table public.sent_prompts drop constraint sent_prompts_parent_memory_id_fkey,
--   add constraint sent_prompts_parent_memory_id_fkey foreign key (parent_memory_id) references public.family_memories(id);
-- Step 5 revert:
-- create trigger storage_quota_trigger before insert on storage.objects for each row execute function public.enforce_storage_quota();
-- Step 6 and 7 revert: the three SQL functions as they were on 18 Oct:
-- create or replace function public.get_user_plan_limits(uid uuid)
--  returns table(max_storage bigint, max_timelines integer, max_albums integer, max_capsules integer, max_upload_size bigint, max_video_length integer, perks jsonb)
--  language sql stable security definer set search_path to 'public' as $f$
--   select p.max_storage, p.max_timelines, p.max_albums, p.max_capsules, p.max_upload_size, p.max_video_length, p.perks
--   from public.subscriptions s join public.plans p on p.id = s.plan_id
--   where s.family_id = (select fm.family_id from public.family_memberships fm where fm.user_id = uid limit 1)
--     and s.status = 'active' and s.cancel_at_period_end = false
--     and (s.current_period_end is null or s.current_period_end > now())
--   order by p.max_storage desc nulls last limit 1; $f$;
-- create or replace function public.get_file_limits(uid uuid)
--  returns table(max_storage bigint, max_upload_size bigint)
--  language sql stable security definer set search_path to 'public' as $f$
--   select p.max_storage, p.max_upload_size
--   from public.subscriptions s join public.plans p on p.id = s.plan_id
--   where s.family_id = (select fm.family_id from public.family_memberships fm where fm.user_id = uid limit 1)
--     and s.status in ('active', 'trialing')
--   order by p.max_storage desc nulls last limit 1; $f$;
-- create or replace function public.has_active_subscription(uid uuid)
--  returns boolean language sql stable security definer set search_path to 'public' as $f$
--   select exists (select 1 from public.subscriptions s
--     where s.family_id = (select fm.family_id from public.family_memberships fm where fm.user_id = uid limit 1)
--       and s.status = 'active' and (s.current_period_end is null or s.current_period_end > now())); $f$;
-- The four triggers: remove the "IF NOT FOUND THEN RAISE" block from enforce_album_limit,
-- enforce_timeline_limit and enforce_capsule_limit, and change every family pick back to
-- "WHERE fm.user_id = ... LIMIT 1" with no ORDER BY (enforce_loved_one_limit only had the
-- ordering change).
-- Step 8 revert (not recommended; it reopens the write path):
-- grant insert, update, delete, truncate, references, trigger on table public.profile_cards to anon, authenticated;

-- ============================================================================
-- Lead steps, applied after the DB agent finished (19 Oct 2026), each proven with a read-only
-- query straight after.
-- ============================================================================
begin;

-- L1. The Orders page offers Delete on an unpaid (abandoned) order, but the three order tables
-- had SELECT and INSERT policies only, so every attempt removed nothing. Users may now delete
-- their own unpaid orders that consumed no reward code (a redeemed code is tied to the order
-- row and is released by the checkout.session.expired webhook, never by a user delete).
create policy "Users can delete own unpaid orders" on public.orders
  for delete to authenticated
  using (user_id = (select auth.uid()) and payment_status <> 'paid' and reward_code is null);
create policy "Users can delete own unpaid canvas orders" on public.canvas_orders
  for delete to authenticated
  using (user_id = (select auth.uid()) and payment_status <> 'paid' and reward_code is null);
create policy "Users can delete own unpaid acrylic orders" on public.acrylic_orders
  for delete to authenticated
  using (user_id = (select auth.uid()) and payment_status <> 'paid' and reward_code is null);

-- L2. One notification_preferences row per user (21 rows, no duplicates at the time). The
-- Settings page inserts on first save and updates by id afterwards; send-push reads the row
-- with maybeSingle, which a duplicate would break. The plain index from batch 1 is redundant
-- once the unique index exists.
alter table public.notification_preferences
  add constraint notification_preferences_user_id_key unique (user_id);
drop index if exists public.idx_notification_preferences_user_id;

-- L3. The prompt-answered-email function was called on every UPDATE of sent_prompts, including
-- the hourly nudge cron stamping nudged_at, and answered "skipped" each time. It now fires only
-- when status changes. (<WEBHOOK_SECRET> as in supabase/sql/webhook-triggers.sql.)
drop trigger if exists "prompt-answered-email" on public.sent_prompts;
create trigger "prompt-answered-email" after update of status on public.sent_prompts for each row
  when (old.status is distinct from new.status)
  execute function supabase_functions.http_request('https://wekebqaooixjngznycnm.supabase.co/functions/v1/prompt-answered-email', 'POST', '{"Content-type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}', '{}', '10000');

commit;

-- Lead step reverts:
-- drop policy "Users can delete own unpaid orders" on public.orders;
-- drop policy "Users can delete own unpaid canvas orders" on public.canvas_orders;
-- drop policy "Users can delete own unpaid acrylic orders" on public.acrylic_orders;
-- alter table public.notification_preferences drop constraint notification_preferences_user_id_key;
-- create index idx_notification_preferences_user_id on public.notification_preferences (user_id);
-- (L3) recreate the trigger as "after update on public.sent_prompts for each row" with no WHEN clause.
