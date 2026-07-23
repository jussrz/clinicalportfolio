# Clinical Portfolio — Group 5

An online clinical rotation portfolio (React + Vite) for the University of Southern
Mindanao College of Medicine. Every data-entry page reads and writes directly to
Supabase, so the group's case logs, reflections, and notes are shared and live —
anyone with the deployed URL sees the same real data, including faculty.

## How the data works

There's no local-only storage for real content. Two small hooks cover every page:

- **`useSupabaseRecord(table, id)`** (`src/lib/useSupabaseRecord.js`) — for
  single-row "settings" tables (`group_metadata`, `case_presentation`,
  `clinical_skills`, `feedback_action_plan`, `group_reflections`). Debounces
  field edits (~700ms) into one `.update()` call, subscribes to realtime
  UPDATEs from other clients, and exposes a `saveState` (`idle` / `saving` /
  `saved` / `error`) shown inline via `<SaveStatus>`.
- **`useSupabaseTable(table)`** (`src/lib/useSupabaseTable.js`) — for list
  tables (`case_log_entries`, `case_reflections`, `individual_contributions`).
  Fetches all rows, subscribes to realtime `*` changes, and exposes
  `insert` / `update` / `remove`, each refetching on success.
- **`useDepartmentNotes(slug, sections)`** (`src/lib/useDepartmentNotes.js`) —
  a variant of the record hook for `department_notes`, which is keyed by
  `(department, section)` instead of a single `id`, so it upserts rather than
  updates (a section's row may not exist yet the first time it's edited).

Every read/error state renders through `<LoadState>` (loading / error /
content) so a dropped connection or an RLS misconfiguration shows a message
instead of silently blank pages.

**Rotation Overview is the one exception** — it's static reference content
(objectives, schedule, assigned topics — set by the program, not typed live
by students). No database involved; edit `src/data/rotationOverview.js`
directly.

## Database schema

All tables, RLS policies, and the realtime publication are defined in
[`supabase/schema.sql`](supabase/schema.sql) — run it once in the Supabase
SQL Editor. It's written to be safe to re-run (`create table if not exists`,
`drop policy if exists` before each `create policy`, etc.).

There's no login: RLS grants open read/write to the `anon` role on every
table, since this is a small trusted group. `case_reflections.reflection_no`
is assigned server-side from a Postgres sequence (not computed client-side as
`max + 1`) so two people adding a reflection at the same moment can't collide
on the same number.

## One-time Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run everything in [`supabase/schema.sql`](supabase/schema.sql).
3. Project Settings → API Keys → copy the **Project URL** and the **publishable key** (starts `sb_publishable_...`; do *not* use the secret or service_role keys here — those bypass Row Level Security and must never ship in this frontend).
4. Copy `.env.example` to `.env.local` and fill in those two values.

## Local development

```bash
npm install
npm run dev
```

## Deploying (Vercel)

1. Import this repo into Vercel as a new project (Vite is auto-detected).
2. Project Settings → Environment Variables → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Production, Preview, and Development).
3. Deploy. `vercel.json` already handles the SPA rewrite so deep links like `/departments/surgery` work on direct load/refresh.
4. Share the deployed URL — everyone (group members and faculty) sees the same live content.

## Confidentiality

Per the assignment requirements: use patient codes only, never patient names, hospital numbers, addresses, contact details, or photos. The confidentiality statement is on the Home page, and a reminder banner appears on every page involving patient data entry.
