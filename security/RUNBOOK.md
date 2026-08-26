# Closing the ContentHub exposure

Covers both databases. Do the steps in this order — the order is the point.

State before this runbook, measured rather than assumed:

| | V2 (`shvbed…`) | Sidekick (`dtpxqx…`) |
|---|---|---|
| Tables with RLS | 0 | 0 |
| Readable by a stranger | 6 clients, 45 cards, 11 profiles, 182 legacy rows | 78 profiles, 29 workspaces, 29 clients, 97 cards |
| Writable by a stranger | yes (`HTTP 204` on an anonymous `PATCH`) | yes |
| Tenants sharing the database | 1 | **29** |

Sidekick is the worse of the two: 29 unrelated agencies, each able to read and
edit the others' pipelines.

What is **not** exposed, having checked: no `service_role` key and no
`ANTHROPIC_API_KEY` appears anywhere in either repo or their histories. The
only key in the source is the `anon` key, which is meant to be public. RLS is
the control that was missing behind it, and step 3 is what supplies it.

---

## 1. Rotate the REVO Labs password — do this first, it takes two minutes

`Revo2026!` for `humberto@revolabsmedia.com` sat in `README.md` in a **public**
repository across **182 commits**, and in `src/App.jsx` in at least one. Anyone
who cloned the repo has it. Assume it is known.

In the Supabase dashboard for the V2 project → **Authentication → Users** →
find the user → **Reset password**. Set the new one yourself; put it in the
team's password manager, not in a file.

Rotating is what ends the exposure. Deleting the line from the README does
not — the history keeps it, and rewriting 182 commits of public history is not
worth doing when rotation already settles it. The line is now gone from
`README.md` anyway, so nobody copies it again.

While you are in there: check **Authentication → Users** for accounts you do
not recognise. Anyone could have signed up and read everything.

## 2. Deploy the error-visibility change — before any RLS, not after

`src/lib/supabase.jsx` in both apps has been changed so a failed request stops
being indistinguishable from an empty one. Reads still return `[]`, so no
caller changes shape, but every failure is now logged as
`[supabase] select agency_videos failed: 401 …` and recorded in
`sbLastError()`. `sbUpdate`, `sbDelete`, `sbUpsert` and `addNote` now return
`{ok, error}` instead of discarding the result entirely.

This has to ship **first**. With RLS on and this change absent, a wrong policy
looks exactly like "my pipeline is empty" and there is nothing in the console
to tell you otherwise. That is the single most likely way this goes wrong.

Push it, let Vercel build, confirm both apps still work as they do today. The
change is additive — nothing yet depends on the new return values.

## 3. Enable RLS — V2 first, then Sidekick

**V2 before Sidekick**, even though Sidekick's leak is worse. V2 has one
workspace and nine known users sitting next to you: if a policy is wrong you
hear about it in minutes and you can roll back in seconds. Sidekick has 29
agencies who would simply find the app broken. Prove the policy set on the
database you can watch.

For each repo, in the Supabase SQL Editor for that project:

1. Run `security/rls.sql` whole. It is idempotent.
2. Read the table it prints at the end. Every row must show `rls = true`.
3. Run the verifier from the repo root:

   ```bash
   ./security/verify-exposure.sh
   ```

   It must print `PASS`. Before the fix it prints `FAIL` with a row count next
   to each leaking table, so you can see the change take effect.

4. Then exercise the app as a real user, which is the part the verifier cannot
   do. Sign out and back in first — a stale JWT reads as "no rows" and will
   send you chasing a policy bug that isn't there.

   - the dashboard lists every client
   - open a client: the pipeline shows its cards
   - move a card between stages, reload, it stayed
   - open the review room, add a note, it appears
   - Settings → Usuarios lists the team **with names**, not uuids
   - keep the browser console open throughout; any `[supabase] … failed` line
     names the table and the policy to look at

Wait a day between the two databases if you can. Sidekick's file is the same
shape, so V2 passing is real evidence it will hold.

**If it goes wrong:** run `security/rls-rollback.sql`. It reopens the database
and buys you an hour. It is not a fix — correct the policy and run `rls.sql`
again.

## 4. Afterwards

- V2's legacy V1 tables (`clients`, `employees`, `videos`, `cards`, `targets`,
  182 rows) are locked with RLS on and no policy. Nothing in `src/` reads
  them. If they are genuinely dead, drop them — but take a backup first, and
  do it in a separate change from this one.
- Adding a table from here on means adding its policy in the same commit. The
  `alter default privileges` line in `rls.sql` means a new table is at least
  not anon-readable by default, but it is not a substitute for a policy.
- `setup.sql` in both repos describes a schema neither app uses any more.
  `security/rls.sql` is now the most accurate record of which tables exist.
  Worth fixing, separately.
