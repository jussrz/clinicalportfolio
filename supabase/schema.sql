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
-- case_reflections — Selected Case Reflections: a group case-discussion
-- writeup for one case picked from the Case Log Census (matches the
-- school's official "Selected Case Reflection" format). Department,
-- Clinical Area, Patient Code, Age/Sex, and Student/s Involved are never
-- stored here — they're read live off the linked case_log_entries row via
-- case_log_entry_id, so there's exactly one source of truth for them.
-- reflection_no is assigned server-side from a sequence (not computed as
-- max(reflection_no)+1 on the client) so two people adding a reflection at
-- nearly the same moment can never collide on the same number.
-- ---------------------------------------------------------------------
create sequence if not exists case_reflections_no_seq;

create table if not exists case_reflections (
  id uuid primary key default gen_random_uuid(),
  reflection_no int not null default nextval('case_reflections_no_seq'),
  case_log_entry_id uuid not null references case_log_entries(id) on delete cascade,
  brief_summary text not null default '',
  pertinent_positives text not null default '',
  pertinent_negatives text not null default '',
  pe_findings text not null default '',
  problem_list text[] not null default '{}',
  differential_diagnoses text[] not null default '{}',
  workup text not null default '',
  management_priorities text not null default '',
  referral_considerations text not null default '',
  group_learning_points text[] not null default '{}',
  group_did_well text not null default '',
  group_challenges text not null default '',
  group_improvements text not null default '',
  created_at timestamptz not null default now()
);

-- Idempotent — also covers the case where this table already existed
-- (created before this sequence default was added) and just needs the
-- default wired up.
alter table case_reflections alter column reflection_no set default nextval('case_reflections_no_seq');

-- Idempotent — covers tables created under the older per-student
-- "Student Reflection" essay format (name/year-level/group/rotation/dates
-- header + 4 free-text prompts), before this became a group case writeup
-- keyed to one Case Log Census entry.
alter table case_reflections drop column if exists student_name;
alter table case_reflections drop column if exists year_level_section;
alter table case_reflections drop column if exists group_name;
alter table case_reflections drop column if exists rotation_block;
alter table case_reflections drop column if exists inclusive_dates;
alter table case_reflections drop column if exists common_cases;
alter table case_reflections drop column if exists skills_practiced;
alter table case_reflections drop column if exists clinical_lesson;
alter table case_reflections drop column if exists improvement_area;

alter table case_reflections add column if not exists case_log_entry_id uuid references case_log_entries(id) on delete cascade;
alter table case_reflections alter column case_log_entry_id set not null;
alter table case_reflections add column if not exists brief_summary text not null default '';
alter table case_reflections add column if not exists pertinent_positives text not null default '';
alter table case_reflections add column if not exists pertinent_negatives text not null default '';
alter table case_reflections add column if not exists pe_findings text not null default '';
alter table case_reflections add column if not exists problem_list text[] not null default '{}';
alter table case_reflections add column if not exists differential_diagnoses text[] not null default '{}';
alter table case_reflections add column if not exists workup text not null default '';
alter table case_reflections add column if not exists management_priorities text not null default '';
alter table case_reflections add column if not exists referral_considerations text not null default '';
alter table case_reflections add column if not exists group_learning_points text[] not null default '{}';
alter table case_reflections add column if not exists group_did_well text not null default '';
alter table case_reflections add column if not exists group_challenges text not null default '';
alter table case_reflections add column if not exists group_improvements text not null default '';

-- ---------------------------------------------------------------------
-- individual_contributions — one row per roster student. The cases they
-- contributed to aren't stored here — they're read live off case_log_entries
-- via student_assigned (matched against this row's student_name), same
-- single-source-of-truth pattern as case_reflections above. The
-- year_level_section/common_cases/skills_observed/lesson_learned/
-- area_to_improve columns back the "Add Reflection" Student Reflection form.
-- ---------------------------------------------------------------------
create table if not exists individual_contributions (
  id uuid primary key default gen_random_uuid(),
  student_name text,
  created_at timestamptz not null default now()
);

alter table individual_contributions drop column if exists contribution_summary;
alter table individual_contributions add column if not exists year_level_section text not null default '';
alter table individual_contributions add column if not exists common_cases text not null default '';
alter table individual_contributions add column if not exists skills_observed text not null default '';
alter table individual_contributions add column if not exists lesson_learned text not null default '';
alter table individual_contributions add column if not exists area_to_improve text not null default '';
alter table individual_contributions add column if not exists photo_url text;

-- ---------------------------------------------------------------------
-- avatars storage bucket — public bucket for profile photos, referenced by
-- individual_contributions.photo_url. Public read (the portfolio is a
-- public showcase); anon can insert/update/delete objects in this bucket so
-- a student can upload their own photo from the client, same soft
-- identity-label trust model as every table's RLS above (not real auth).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars anon insert" on storage.objects;
create policy "avatars anon insert" on storage.objects for insert with check (bucket_id = 'avatars');
drop policy if exists "avatars anon update" on storage.objects;
create policy "avatars anon update" on storage.objects for update using (bucket_id = 'avatars') with check (bucket_id = 'avatars');
drop policy if exists "avatars anon delete" on storage.objects;
create policy "avatars anon delete" on storage.objects for delete using (bucket_id = 'avatars');

-- ---------------------------------------------------------------------
-- signed-case-logs storage bucket — public bucket for scanned copies of the
-- faculty/preceptor-signed Case Log Census PDF (hand-signed after export,
-- then scanned and uploaded here). No table needed — storage.objects.list()
-- already gives filename/size/created_at, same as avatars. Public read (the
-- portfolio is a public showcase); anon can insert/update/delete, same soft
-- trust model as every other table/bucket above (not real auth).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('signed-case-logs', 'signed-case-logs', true)
on conflict (id) do nothing;

drop policy if exists "signed-case-logs public read" on storage.objects;
create policy "signed-case-logs public read" on storage.objects for select using (bucket_id = 'signed-case-logs');
drop policy if exists "signed-case-logs anon insert" on storage.objects;
create policy "signed-case-logs anon insert" on storage.objects for insert with check (bucket_id = 'signed-case-logs');
drop policy if exists "signed-case-logs anon update" on storage.objects;
create policy "signed-case-logs anon update" on storage.objects for update using (bucket_id = 'signed-case-logs') with check (bucket_id = 'signed-case-logs');
drop policy if exists "signed-case-logs anon delete" on storage.objects;
create policy "signed-case-logs anon delete" on storage.objects for delete using (bucket_id = 'signed-case-logs');

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
-- case_presentation, clinical_skills, feedback_action_plan,
-- group_reflections — formerly single shared rows, now answered
-- separately per department and stored in department_notes instead (same
-- table DepartmentPage.jsx's own objectives/conditions/etc. fields use),
-- under prompt keys namespaced per page (e.g. 'case_presentation.qna_questions')
-- so they don't collide with each other or with DepartmentPage's own
-- section keys. Drop the old singleton tables — safe, nothing worth
-- preserving was stored in them.
-- ---------------------------------------------------------------------
drop table if exists case_presentation cascade;
drop table if exists clinical_skills cascade;
drop table if exists feedback_action_plan cascade;
drop table if exists group_reflections cascade;

-- ---------------------------------------------------------------------
-- rotation_overview — single row. Objectives/schedule/topics/goals set by
-- the clinical rotation program; one column per department objectives
-- field (obj_<slug, hyphens as underscores>), slugs matching
-- src/data/departments.js: pediatrics, family-community-medicine,
-- internal-medicine, surgery, obstetrics-gynecology.
-- ---------------------------------------------------------------------
create table if not exists rotation_overview (
  id int primary key default 1,
  general_objectives text not null default '',
  obj_pediatrics text not null default '[Insert Pediatrics rotation-specific objectives here]',
  obj_family_community_medicine text not null default '[Insert Family & Community Medicine rotation-specific objectives here]',
  obj_internal_medicine text not null default '[Insert Internal Medicine rotation-specific objectives here]',
  obj_surgery text not null default '[Insert Surgery rotation-specific objectives here]',
  obj_obstetrics_gynecology text not null default '[Insert Obstetrics & Gynecology rotation-specific objectives here]',
  schedule text not null default '[Insert clinical rotation schedule or timeline here]',
  case_topics text not null default '[Insert assigned case topics per rotation cycle here]',
  learning_goals text not null default '[Insert group learning goals here]',
  updated_at timestamptz not null default now(),
  constraint rotation_overview_single_row check (id = 1)
);
insert into rotation_overview (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_rotation_overview_updated_at on rotation_overview;
create trigger trg_rotation_overview_updated_at
  before update on rotation_overview
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
    'individual_contributions', 'department_notes', 'rotation_overview'
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
