-- ═══════════════════════════════════════════════════════════════════════════
-- CONTENTHUB SIDEKICK (dtpxqxwhehzyrtmrhiio) — CREATOR HUB
--
-- The three tables behind the Talent tab. They already exist in the V2
-- project; this is the same shape, so the two databases stay comparable and a
-- row exported from one means the same thing in the other.
--
-- Run the whole file at once in the Supabase SQL Editor. It is idempotent.
--
-- Order matters: security/rls.sql revokes anon's grants and sets default
-- privileges, so run this AFTER rls.sql. The grants at the bottom put back
-- exactly what the app needs and nothing more.
-- ═══════════════════════════════════════════════════════════════════════════

-- Everything a creator search found and a human then checked. Follower and
-- engagement figures are deliberately nullable and are never written by the
-- model — a person opens the profile, types what they see, and checked_at
-- records when. A number with no date is a number nobody should trust.
create table if not exists public.creators (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null,
  handle        text,
  name          text,
  platform      text,
  profile_url   text,
  niche         text,
  city          text,
  why           text,
  followers     bigint,
  avg_views     bigint,
  engagement    numeric,
  notes         text,
  checked_at    date,          -- written as YYYY-MM-DD; a date, not a moment
  created_at    timestamptz default now()
);

-- One shortlist, usually per campaign, optionally tied to a client.
create table if not exists public.creator_lists (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null,
  name          text,
  client_id     uuid,
  created_at    timestamptz default now()
);

-- The join, carrying the outreach state. No workspace_id of its own: it
-- inherits tenancy from its list, which is what the policy below enforces.
create table if not exists public.creator_list_members (
  list_id       uuid not null references public.creator_lists(id) on delete cascade,
  creator_id    uuid not null references public.creators(id)      on delete cascade,
  status        text default 'prospecto',
  added_at      timestamptz default now(),
  primary key (list_id, creator_id)
);

-- The app upserts on (list_id, creator_id); the composite primary key above is
-- what makes that conflict target valid.

create index if not exists creators_ws_idx      on public.creators (workspace_id, created_at desc);
create index if not exists creator_lists_ws_idx on public.creator_lists (workspace_id, created_at desc);
create index if not exists clm_list_idx         on public.creator_list_members (list_id);

-- A creator found twice by two searches is one creator.
create unique index if not exists creators_ws_url_idx
  on public.creators (workspace_id, profile_url) where profile_url is not null;


-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────────
alter table public.creators enable row level security;
drop policy if exists cr_all on public.creators;
create policy cr_all on public.creators
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.creator_lists enable row level security;
drop policy if exists cl_all on public.creator_lists;
create policy cl_all on public.creator_lists
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.creator_list_members enable row level security;
drop policy if exists clm_all on public.creator_list_members;
create policy clm_all on public.creator_list_members
  for all to authenticated
  using (exists (
    select 1 from public.creator_lists l
    where l.id = creator_list_members.list_id
      and l.workspace_id in (select public.user_workspace_ids())
  ))
  with check (exists (
    select 1 from public.creator_lists l
    where l.id = creator_list_members.list_id
      and l.workspace_id in (select public.user_workspace_ids())
  ));

grant select, insert, update, delete on public.creators             to authenticated;
grant select, insert, update, delete on public.creator_lists        to authenticated;
grant select, insert, update, delete on public.creator_list_members to authenticated;


-- ── VERIFY ─────────────────────────────────────────────────────────────────
-- All three must read rls = true.
select c.relname as table_name, c.relrowsecurity as rls, count(p.polname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relname in ('creators','creator_lists','creator_list_members')
group by c.relname, c.relrowsecurity
order by c.relname;
