-- ═══════════════════════════════════════════════════════════════════════════
-- CONTENTHUB SIDEKICK (dtpxqxwhehzyrtmrhiio) — ROW LEVEL SECURITY
--
-- This is the public product, so this is the worse of the two exposures. The
-- database currently holds 29 workspaces, 78 profiles, 29 clients and 97
-- cards belonging to different agencies, and every one of them is readable
-- and writable by anyone holding the anon key that ships in the JavaScript
-- bundle. Any signed-up agency can read every other agency's pipeline.
--
-- Run the whole file at once in the Supabase SQL Editor. It is idempotent.
-- To undo, run security/rls-rollback.sql.
--
-- Mirrors v2/security/rls.sql. The differences are real and deliberate:
-- Sidekick has no user-management screen, so profile writes are self-only
-- here; and it carries the solo-creator tables, which are scoped by user_id
-- rather than by workspace.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── HELPERS ────────────────────────────────────────────────────────────────
-- SECURITY DEFINER breaks the recursion a membership policy would otherwise
-- cause when it queries the membership table. search_path is pinned so the
-- elevated body can't be pointed at a shadowed table.

create or replace function public.user_workspace_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from workspace_members where user_id = auth.uid()
  union
  -- getWorkspaceMember() falls back to workspaces.owner_id for an owner with
  -- no members row, so the policies have to accept that path too.
  select id from workspaces where owner_id = auth.uid()
$$;

create or replace function public.is_workspace_admin(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = 'admin'
  ) or exists (
    select 1 from workspaces where id = ws and owner_id = auth.uid()
  )
$$;

create or replace function public.shares_workspace_with(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target = auth.uid() or exists (
    select 1 from workspace_members m
    where m.user_id = target
      and m.workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
  )
$$;

revoke all on function public.user_workspace_ids()        from anon;
revoke all on function public.is_workspace_admin(uuid)    from anon;
revoke all on function public.shares_workspace_with(uuid) from anon;


-- ── WORKSPACES ─────────────────────────────────────────────────────────────
alter table public.workspaces enable row level security;

drop policy if exists ws_select on public.workspaces;
create policy ws_select on public.workspaces
  for select to authenticated
  using (id in (select public.user_workspace_ids()));

-- createWorkspace() in lib/supabase.jsx — agency onboarding.
drop policy if exists ws_insert on public.workspaces;
create policy ws_insert on public.workspaces
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists ws_update on public.workspaces;
create policy ws_update on public.workspaces
  for update to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));


-- ── WORKSPACE_MEMBERS ──────────────────────────────────────────────────────
-- Write access here is equivalent to write access to everything, because
-- this table is what every other policy consults. Admin-only.
alter table public.workspace_members enable row level security;

drop policy if exists wm_select on public.workspace_members;
create policy wm_select on public.workspace_members
  for select to authenticated
  using (workspace_id in (select public.user_workspace_ids()));

-- createWorkspace() adds the owner as admin immediately after inserting the
-- workspace row, so is_workspace_admin() is already true via the owner branch.
drop policy if exists wm_insert on public.workspace_members;
create policy wm_insert on public.workspace_members
  for insert to authenticated
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists wm_update on public.workspace_members;
create policy wm_update on public.workspace_members
  for update to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists wm_delete on public.workspace_members;
create policy wm_delete on public.workspace_members
  for delete to authenticated
  using (public.is_workspace_admin(workspace_id));


-- ── PROFILES ───────────────────────────────────────────────────────────────
-- 78 rows, one per signed-up user, carrying name and email. Reads are limited
-- to yourself and your own teammates; writes to yourself only, because
-- nothing in this app edits anybody else's profile.
alter table public.profiles enable row level security;

drop policy if exists pr_select on public.profiles;
create policy pr_select on public.profiles
  for select to authenticated
  using (public.shares_workspace_with(id));

-- Landing.jsx:114 and App.jsx:57 create your own row on first sign-in.
drop policy if exists pr_insert on public.profiles;
create policy pr_insert on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- App.jsx:40/56 (account_type), Landing.jsx:120/142 and Business.jsx:917
-- (business_profile), createWorkspace() (workspace_id) — all self.
drop policy if exists pr_update on public.profiles;
create policy pr_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());


-- ── AGENCY PORTAL ──────────────────────────────────────────────────────────
-- All carry workspace_id and are already loaded filtered by it in
-- Agency.jsx. The policy restates what the query says.

alter table public.agency_clients enable row level security;
drop policy if exists ac_all on public.agency_clients;
create policy ac_all on public.agency_clients
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.agency_videos enable row level security;
drop policy if exists av_all on public.agency_videos;
create policy av_all on public.agency_videos
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.agency_targets enable row level security;
drop policy if exists at_all on public.agency_targets;
create policy at_all on public.agency_targets
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.agency_card_notes enable row level security;
drop policy if exists an_all on public.agency_card_notes;
create policy an_all on public.agency_card_notes
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));


-- ── BUSINESS PORTAL (solo, user-scoped) ────────────────────────────────────
-- These predate the agency tables and belong to one person each. If the
-- Business portal is deleted in the agency-first pivot, these tables go with
-- it — until then they need the same protection as everything else.

alter table public.creator_videos enable row level security;
drop policy if exists cv_all on public.creator_videos;
create policy cv_all on public.creator_videos
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.creator_goals enable row level security;
drop policy if exists cg_all on public.creator_goals;
create policy cg_all on public.creator_goals
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.campaigns enable row level security;
drop policy if exists cp_all on public.campaigns;
create policy cp_all on public.campaigns
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ── LOCK OUT THE ANONYMOUS ROLE ────────────────────────────────────────────
-- Belt and braces. RLS alone leaves a stranger's request returning an empty
-- list, which is correct but indistinguishable from a table that is simply
-- empty — and a table added later with no policy would be wide open again
-- without anyone noticing.
--
-- Revoking the grants makes an anonymous request fail outright instead, and
-- the DEFAULT PRIVILEGES line carries that forward to tables that don't
-- exist yet. Nothing in src/ touches the database before sign-in, so no
-- legitimate request is made as anon. Sign-in itself goes through
-- /auth/v1/, not PostgREST, and is unaffected.
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on sequences from anon;


-- ── VERIFY ─────────────────────────────────────────────────────────────────
-- Every row must read rls = true. Anything false is still exposed.
select c.relname as table_name,
       c.relrowsecurity as rls,
       count(p.polname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public' and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity, c.relname;
