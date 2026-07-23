-- Clinical Portfolio (Group 5) — relational schema.
-- Run this once in the Supabase project's SQL Editor.
-- Replaces the earlier single-JSONB-blob approach (portfolio_data) with real
-- per-entity tables so pages can do normal Supabase client CRUD.
--
-- No auth: this is a small trusted group, so RLS policies below grant open
-- read/write to the anon role on every table. "Sanitize inputs" per the
-- brief is handled by (a) the Supabase JS client always parameterizing
-- values — no raw SQL string building, so no injection surface — and
-- (b) React escaping all rendered text by default (no dangerouslySetInnerHTML
-- anywhere in this app).

-- ---------------------------------------------------------------------
-- Helper: a tiny trigger to keep updated_at fresh on UPDATE, reused below.
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- group_metadata — single row. Populates Home + Case Log Census header.
-- ---------------------------------------------------------------------
create table if not exists group_metadata (
  id int primary key default 1,
  group_name text not null default '',
  rotation_block text not null default '',
  inclusive_date_start date,
  inclusive_date_end date,
  faculty_signature text not null default '',
  faculty_sign_date text not null default '',
  updated_at timestamptz not null default now(),
  constraint group_metadata_single_row check (id = 1)
);
insert into group_metadata (id) values (1) on conflict (id) do nothing;

-- Idempotent — covers the case where this table already existed with the
-- old single free-text `inclusive_dates` column, now split into a proper
-- start/end date range.
alter table group_metadata add column if not exists inclusive_date_start date;
alter table group_metadata add column if not exists inclusive_date_end date;
alter table group_metadata drop column if exists inclusive_dates;

drop trigger if exists trg_group_metadata_updated_at on group_metadata;
create trigger trg_group_metadata_updated_at
  before update on group_metadata
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- case_log_entries — Group Case Log Census rows.
-- ---------------------------------------------------------------------
create table if not exists case_log_entries (
  id uuid primary key default gen_random_uuid(),
  date_seen date,
  department text,
  clinical_area text,
  patient_code text,
  age_sex text,
  chief_complaint text,
  working_diagnosis text,
  student_role text,
  student_role_detail text,
  student_assigned text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- case_reflections — Selected Case Reflections, one row per student's
-- reflection (matches the school's official "Student Reflection" form).
-- reflection_no is assigned server-side from a sequence (not computed as
-- max(reflection_no)+1 on the client) so two people adding a reflection at
-- nearly the same moment can never collide on the same number.
-- ---------------------------------------------------------------------
create sequence if not exists case_reflections_no_seq;

create table if not exists case_reflections (
  id uuid primary key default gen_random_uuid(),
  reflection_no int not null default nextval('case_reflections_no_seq'),
  case_log_entry_id uuid references case_log_entries(id) on delete cascade,
  student_name text not null default '',
  year_level_section text not null default '',
  group_name text not null default '',
  rotation_block text not null default '',
  inclusive_dates text not null default '',
  common_cases text not null default '',
  skills_practiced text not null default '',
  clinical_lesson text not null default '',
  improvement_area text not null default '',
  created_at timestamptz not null default now()
);

-- Idempotent — also covers the case where this table already existed
-- (created before this sequence default was added) and just needs the
-- default wired up.
alter table case_reflections alter column reflection_no set default nextval('case_reflections_no_seq');

-- Idempotent — covers tables created before a reflection was required to
-- originate from a specific Case Log Census row. A reflection only exists to
-- discuss its case, so removing the case removes the reflection with it.
alter table case_reflections add column if not exists case_log_entry_id uuid references case_log_entries(id) on delete cascade;

-- ---------------------------------------------------------------------
-- individual_contributions
-- ---------------------------------------------------------------------
create table if not exists individual_contributions (
  id uuid primary key default gen_random_uuid(),
  student_name text,
  contribution_summary text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- department_notes — keyed by department + section, one row per section.
-- Departments: pediatrics, family-community-medicine, internal-medicine,
-- surgery, obstetrics-gynecology (slugs match src/data/departments.js).
-- Sections: objectives, cases, conditions, skills, learning_points, reflection
-- ---------------------------------------------------------------------
create table if not exists department_notes (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  section text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (department, section)
);

drop trigger if exists trg_department_notes_updated_at on department_notes;
create trigger trg_department_notes_updated_at
  before update on department_notes
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- case_presentation — single row.
-- ---------------------------------------------------------------------
create table if not exists case_presentation (
  id int primary key default 1,
  qna_questions text not null default '',
  strong_parts text not null default '',
  needs_improvement text not null default '',
  corrections_learned text not null default '',
  next_improvements text not null default '',
  updated_at timestamptz not null default now(),
  constraint case_presentation_single_row check (id = 1)
);
insert into case_presentation (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_case_presentation_updated_at on case_presentation;
create trigger trg_case_presentation_updated_at
  before update on case_presentation
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- clinical_skills — single row.
-- ---------------------------------------------------------------------
create table if not exists clinical_skills (
  id int primary key default 1,
  confident_skills text not null default '',
  skills_to_practice text not null default '',
  improvement_plan text not null default '',
  updated_at timestamptz not null default now(),
  constraint clinical_skills_single_row check (id = 1)
);
insert into clinical_skills (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_clinical_skills_updated_at on clinical_skills;
create trigger trg_clinical_skills_updated_at
  before update on clinical_skills
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- feedback_action_plan — single row.
-- ---------------------------------------------------------------------
create table if not exists feedback_action_plan (
  id int primary key default 1,
  reflection text not null default '',
  updated_at timestamptz not null default now(),
  constraint feedback_action_plan_single_row check (id = 1)
);
insert into feedback_action_plan (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_feedback_action_plan_updated_at on feedback_action_plan;
create trigger trg_feedback_action_plan_updated_at
  before update on feedback_action_plan
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- group_reflections — single row, one column per prompt.
-- ---------------------------------------------------------------------
create table if not exists group_reflections (
  id int primary key default 1,
  meaningful_experience text not null default '',
  patients_caregivers text not null default '',
  healthcare_team text not null default '',
  workflows text not null default '',
  clinical_reasoning text not null default '',
  challenges text not null default '',
  task_management text not null default '',
  improvements text not null default '',
  updated_at timestamptz not null default now(),
  constraint group_reflections_single_row check (id = 1)
);
insert into group_reflections (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_group_reflections_updated_at on group_reflections;
create trigger trg_group_reflections_updated_at
  before update on group_reflections
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security — open read/write for anon (small trusted group,
-- per the brief). Every table gets the same four permissive policies.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'group_metadata', 'case_log_entries', 'case_reflections',
    'individual_contributions', 'department_notes', 'case_presentation',
    'clinical_skills', 'feedback_action_plan', 'group_reflections'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "anon select" on %I', t);
    execute format('create policy "anon select" on %I for select using (true)', t);
    execute format('drop policy if exists "anon insert" on %I', t);
    execute format('create policy "anon insert" on %I for insert with check (true)', t);
    execute format('drop policy if exists "anon update" on %I', t);
    execute format('create policy "anon update" on %I for update using (true) with check (true)', t);
    execute format('drop policy if exists "anon delete" on %I', t);
    execute format('create policy "anon delete" on %I for delete using (true)', t);
    execute format('grant select, insert, update, delete on %I to anon', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Realtime — broadcast full row payloads and add the list-style tables
-- (the ones views subscribe to for live multi-user updates) to the
-- realtime publication.
-- ---------------------------------------------------------------------
alter table case_log_entries replica identity full;
alter table case_reflections replica identity full;
alter table individual_contributions replica identity full;
alter table department_notes replica identity full;
alter table group_metadata replica identity full;

-- Plain `alter publication ... add table` errors if the table is already a
-- member (no IF NOT EXISTS support), which breaks re-running this script —
-- so check membership first, same guarded pattern as the RLS loop above.
do $$
declare
  t text;
begin
  foreach t in array array[
    'case_log_entries', 'case_reflections', 'individual_contributions',
    'department_notes', 'group_metadata'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Old architecture cleanup (optional): the earlier single-JSONB-blob
-- table + merge function are no longer used by the app. Safe to drop
-- once you've confirmed the new tables above are working end-to-end.
-- ---------------------------------------------------------------------
-- drop function if exists merge_portfolio_data(jsonb);
-- drop table if exists portfolio_data;
