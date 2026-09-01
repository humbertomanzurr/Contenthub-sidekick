-- ═══════════════════════════════════════════════════════════════════════════
-- CONTENTHUB SIDEKICK — EMERGENCY ROLLBACK for security/rls.sql
--
-- This reopens the database to anyone holding the anon key, across all 29
-- agencies. It buys time; it is not a fix. Correct the wrong policy in
-- rls.sql and run that again as soon as you can.
--
-- Check the cheaper explanation first: an expired session sends a stale JWT,
-- which reads as "no rows" rather than as an error. Sign out and back in.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.workspaces        disable row level security;
alter table public.workspace_members disable row level security;
alter table public.profiles          disable row level security;
alter table public.agency_clients    disable row level security;
alter table public.agency_videos     disable row level security;
alter table public.agency_targets    disable row level security;
alter table public.agency_card_notes disable row level security;
alter table public.creator_videos    disable row level security;
alter table public.creator_goals     disable row level security;
alter table public.campaigns         disable row level security;

select c.relname, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;
