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
-- Rates are inline so they can be corrected without touching stored rows.
-- Claude Opus 5 at the time of writing: $5 per Mtok in, $25 per Mtok out.
-- Web search is billed per request on top; set it here once confirmed.
create or replace view public.ai_cost_by_feature as
select
  feature,
  count(*)                                        as calls,
  sum(input_tokens)                               as input_tokens,
  sum(output_tokens)                              as output_tokens,
  sum(web_searches)                               as web_searches,
  round((sum(input_tokens)  * 5.0  / 1000000)::numeric, 4) as input_usd,
  round((sum(output_tokens) * 25.0 / 1000000)::numeric, 4) as output_usd,
  round(((sum(input_tokens) * 5.0 + sum(output_tokens) * 25.0) / 1000000)::numeric, 4) as token_usd,
  round((((sum(input_tokens) * 5.0 + sum(output_tokens) * 25.0) / 1000000) / greatest(count(*),1))::numeric, 4) as token_usd_per_call
from public.ai_usage
where ok
group by feature
order by token_usd desc;

grant select on public.ai_cost_by_feature to authenticated;

-- ── VERIFY ─────────────────────────────────────────────────────────────────
select 'ai_usage' as object, count(*) as rows from public.ai_usage;
