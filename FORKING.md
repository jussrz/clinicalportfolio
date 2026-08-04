# Forking this for a new group

This app is built **single-tenant, on purpose**: every Supabase table is a
singleton row (`id = 1`) or an ungrouped list, RLS is wide open to `anon`,
and there's no login. That's a deliberate tradeoff, not a placeholder for a
future multi-tenant rebuild.

**Non-goals** — do not add any of these when onboarding a new client:
- No `group_id` column on any table.
- No shared Supabase project across clients.
- No subdomain/tenant routing.
- No real auth (Supabase Auth, magic links, etc.).

Instead: **every client is a full clone** — its own repo, its own Supabase
project, its own Vercel deployment and domain. This is what actually makes
"every group's portfolio looks different" easy — they're not skins on a
shared app, they're separate sites that happen to share a codebase at the
time you forked them.

## Checklist

1. **Clone the repo** as the new client's repo (or use this repo as a
   template repo on GitHub).

2. **Create a new Supabase project**, then run
   [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor. The
   script self-seeds everything it needs — the `group_metadata` row, every
   other singleton row (`case_presentation`, `clinical_skills`,
   `feedback_action_plan`, `group_reflections`, `rotation_overview`), and
   the `case_reflections_no_seq` sequence all get created by the script's
   own `insert ... on conflict do nothing` lines. There is no separate
   seed step.

3. **Copy `.env.example` to `.env.local`** and fill in the new project's
   `VITE_SUPABASE_URL` and publishable/anon key (never the service_role
   key — see the warning in `README.md`).

4. **Edit `src/data/group.js`** for the new client's identity:
   - `GROUP_NAME`
   - `GROUP_MEMBERS` (the roster used by the "type your surname" identity
     picker in Studio)
   - `SCHOOL_NAME` / `SCHOOL_NAME_SHORT` / `ROTATION_LABEL` — these three
     feed every PDF letterhead, the Studio sidebar footer, and both Home
     pages, so this is the one place a new client's school/rotation text
     needs to change.

5. **Edit `src/data/departments.js` and `src/data/options.js`** if the new
   group's departments or clinical-area dropdown options differ from the
   default five (Pediatrics, Internal Medicine, OB-Gyne, Family & Community
   Medicine, Surgery). Department hero images and the shared
   `HOME_HERO_IMAGE` also live in `departments.js`.

6. **Swap the color palette** in `src/index.css`'s `@theme` block (the
   `--color-brand-*` and `--color-ink-*` custom properties, currently ~20
   lines near the top of the file). This is a Tailwind v4 project — there's
   no separate `tailwind.config.js` — so this one block is the entire
   palette. No component hardcodes a client-specific color outside it.

7. **Update `index.html`'s `<title>`** and `public/favicon.svg` if the
   client wants distinct browser-tab branding.

8. **Deploy as a new, separate Vercel project** pointed at its own domain,
   following the "Deploying (Vercel)" steps in `README.md` — set that
   project's own `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` in Vercel's
   dashboard, not committed to the repo.

## What you should *not* need to touch

`src/lib/useSupabaseTable.js`, `useSupabaseRecord.js`,
`useDepartmentNotes.js`, `useCaseStudies.js`, `useCaseStats.js`,
`useEditableFields.js`, and `useCurrentMember.js` are all generic and
table/column-driven, with no client-specific assumptions baked in. If a
fork requires editing one of these, something client-specific leaked into
shared code — worth fixing at the source rather than patching per client.
