-- ═══════════════════════════════════════════════════════════════════════════
-- CONTENTHUB SIDEKICK — AI usage log
--
-- Every /api/chat call gets a row. This exists so pricing can be set from
-- measurement rather than estimate: right now the only number anybody has for
-- a Creator Hub search is a guess, and a guess is a poor basis for a price.
--
-- Deliberately stores RAW counts, not money. Rates change; a stored dollar
-- figure silently becomes wrong and there is no way to recompute it. Tokens
-- and search counts stay true forever, and cost is derived at read time from
-- whatever the rates are that day.
--
-- Run in the Supabase SQL Editor for the Sidekick project.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.ai_usage (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  feature       text,                    -- script | shoot | creators | campaign
  model         text,
  input_tokens  integer default 0,
  output_tokens integer default 0,
  cache_read    integer default 0,
  web_searches  integer default 0,       -- billable, separate from attempts
  ms            integer default 0,
  ok            boolean default true,
  created_at    timestamptz default now()
);

create index if not exists ai_usage_user_idx    on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_feature_idx on public.ai_usage (feature, created_at desc);

-- The endpoint writes these rows from the server with the anon key, so anon
-- needs insert and nothing else. Nobody should be able to read another
-- person's usage, or edit their own.
alter table public.ai_usage enable row level security;

drop policy if exists usage_insert on public.ai_usage;
create policy usage_insert on public.ai_usage
  for insert to anon, authenticated
  with check (true);

drop policy if exists usage_select_own on public.ai_usage;
create policy usage_select_own on public.ai_usage
  for select to authenticated
  using (user_id = auth.uid());

grant insert on public.ai_usage to anon, authenticated;
grant select on public.ai_usage to authenticated;

-- ── WHAT A FEATURE COSTS ───────────────────────────────────────────────────
-- Rates live in one CTE, so correcting a price is a one-line edit and every
-- row ever stored re-prices itself.
--
-- CONFIRM THESE AGAINST YOUR OWN INVOICE before setting a price on top of
-- them. They are published list rates, not necessarily what you are billed.
--   Claude Opus 5   $5.00 / Mtok in · $0.50 / Mtok cache read · $25.00 / Mtok out
--   Web search      $10 per 1,000 requests  ->  $0.01 each
--
-- The web-search line is the one that matters here. A script chat makes none;
-- a talent search is mostly search. A view that omits it makes the cheap
-- feature and the expensive one look alike — the exact mistake this table
-- exists to prevent.
create or replace view public.ai_cost_by_feature as
with r as (
  select 5.00::numeric as in_mtok, 0.50::numeric as cache_mtok,
        25.00::numeric as out_mtok, 0.01::numeric as per_search
)
select
  u.feature,
  count(*)                                                          as calls,
  sum(u.web_searches)                                               as searches,
  round(avg(u.ms))                                                  as avg_ms,
  round((sum(u.input_tokens)  * r.in_mtok    / 1e6)::numeric, 4)    as input_usd,
  round((sum(u.cache_read)    * r.cache_mtok / 1e6)::numeric, 4)    as cache_usd,
  round((sum(u.output_tokens) * r.out_mtok   / 1e6)::numeric, 4)    as output_usd,
  round((sum(u.web_searches)  * r.per_search)::numeric, 4)          as search_usd,
  round(((sum(u.input_tokens) * r.in_mtok
        + sum(u.cache_read)   * r.cache_mtok
        + sum(u.output_tokens)* r.out_mtok) / 1e6
        + sum(u.web_searches) * r.per_search)::numeric, 4)          as total_usd,
  round((((sum(u.input_tokens) * r.in_mtok
         + sum(u.cache_read)   * r.cache_mtok
         + sum(u.output_tokens)* r.out_mtok) / 1e6
         + sum(u.web_searches) * r.per_search)
         / greatest(count(*),1))::numeric, 4)                       as usd_per_call
from public.ai_usage u cross join r
where u.ok
group by u.feature, r.in_mtok, r.cache_mtok, r.out_mtok, r.per_search
order by total_usd desc;

-- The average is the number that will mislead you. If a talent search costs
-- $0.07 typically and $0.55 at its worst, the price has to survive the worst
-- one — because the user who triggers it is the one who complains.
create or replace view public.ai_cost_per_call as
with r as (
  select 5.00::numeric as in_mtok, 0.50::numeric as cache_mtok,
        25.00::numeric as out_mtok, 0.01::numeric as per_search
)
select
  u.created_at, u.feature, u.model,
  u.input_tokens, u.cache_read, u.output_tokens, u.web_searches, u.ms,
  round(((u.input_tokens  * r.in_mtok
        + u.cache_read    * r.cache_mtok
        + u.output_tokens * r.out_mtok) / 1e6
        + u.web_searches  * r.per_search)::numeric, 4) as usd
from public.ai_usage u cross join r
where u.ok
order by u.created_at desc;

grant select on public.ai_cost_by_feature to authenticated;
grant select on public.ai_cost_per_call   to authenticated;

-- ── VERIFY ─────────────────────────────────────────────────────────────────
select 'ai_usage' as object, count(*) as rows from public.ai_usage;
