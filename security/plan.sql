-- ═══════════════════════════════════════════════════════════════════════════
-- CONTENTHUB SIDEKICK — the plan column
--
-- Additive and safe: it adds one nullable column and backfills nothing. Every
-- existing account keeps behaving exactly as it does now, because planOf()
-- treats "no plan set" as Agency. Only accounts that sign up after this get a
-- plan written, and only from the tier they picked on the landing page.
--
-- Run it in the Supabase SQL Editor for the Sidekick project.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists plan text;

-- Only the three tiers, so a typo can never quietly become a plan nobody has
-- defined limits for.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check
      check (plan is null or plan in ('free','business','agency'));
  end if;
end $$;

comment on column public.profiles.plan is
  'free | business | agency. NULL means an account created before plans existed; the app treats NULL as agency so nothing is capped retroactively.';

-- ── VERIFY ─────────────────────────────────────────────────────────────────
select plan, count(*) from public.profiles group by plan order by count desc;

-- ── NOTE ───────────────────────────────────────────────────────────────────
-- This is a client-side ceiling today. The app refuses to create an 11th card
-- or a 2nd client, but nothing stops a crafted request to PostgREST from doing
-- it anyway. That is fine for an unpriced pilot and NOT fine once money is
-- involved -- real enforcement belongs in an RLS policy, which needs
-- security/rls.sql to be running first.
