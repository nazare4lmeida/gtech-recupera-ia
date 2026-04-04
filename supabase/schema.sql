-- =========================================================
-- Painel escolar + trilhas acadêmicas
-- Execução: cole este arquivo no SQL Editor do Supabase.
-- Observação: as policies abaixo são permissivas para facilitar
-- o uso do frontend direto com a anon key. Antes de expor o projeto
-- publicamente, endureça as regras de acesso conforme sua realidade.
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists school_classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course text not null check (course in ('ia-generativa', 'ia-soft-skills')),
  shift text not null check (shift in ('Manhã', 'Tarde', 'Noite')),
  period_label text not null,
  capacity integer not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists school_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('student', 'admin')),
  course text not null check (course in ('ia-generativa', 'ia-soft-skills')),
  classroom_id uuid references school_classrooms(id) on delete set null,
  attendance_pct integer not null default 0,
  course_pct integer not null default 0,
  project_score integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists school_subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course text not null check (course in ('ia-generativa', 'ia-soft-skills')),
  workload_hours integer not null default 30,
  teacher_name text not null,
  classroom_id uuid references school_classrooms(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists school_assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assessment_type text not null check (assessment_type in ('regular', 'recovery')),
  subject_id uuid not null references school_subjects(id) on delete cascade,
  classroom_id uuid references school_classrooms(id) on delete set null,
  max_score numeric(6,2) not null default 10,
  weight numeric(6,2) not null default 1,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists school_grade_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references school_profiles(id) on delete cascade,
  subject_id uuid not null references school_subjects(id) on delete cascade,
  assessment_id uuid not null references school_assessments(id) on delete cascade,
  score numeric(6,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists school_attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references school_profiles(id) on delete cascade,
  subject_id uuid not null references school_subjects(id) on delete cascade,
  status text not null check (status in ('presente', 'falta', 'atraso', 'justificada')),
  class_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists school_quiz_results (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_email text not null,
  course text not null check (course in ('ia-generativa', 'ia-soft-skills')),
  score integer not null,
  max_score integer not null,
  passed boolean not null,
  category_scores jsonb not null default '{}'::jsonb,
  ts bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists school_recovery_results (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_email text not null,
  course text not null check (course in ('ia-generativa', 'ia-soft-skills')),
  score integer not null,
  best_score integer,
  passed boolean not null,
  ts bigint not null,
  created_at timestamptz not null default now(),
  constraint school_recovery_results_unique unique (student_email, course)
);

create table if not exists school_presence_results (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_email text not null,
  course text not null check (course in ('ia-generativa', 'ia-soft-skills')),
  score integer not null,
  max_score integer not null,
  passed boolean not null,
  previous_pct integer not null default 0,
  challenge_pct integer not null default 0,
  presenca_pct integer not null default 0,
  prompt_text text,
  ts bigint not null,
  created_at timestamptz not null default now(),
  constraint school_presence_results_unique unique (student_email, course)
);

alter table school_classrooms enable row level security;
alter table school_profiles enable row level security;
alter table school_subjects enable row level security;
alter table school_assessments enable row level security;
alter table school_grade_records enable row level security;
alter table school_attendance_records enable row level security;
alter table school_quiz_results enable row level security;
alter table school_recovery_results enable row level security;
alter table school_presence_results enable row level security;

drop policy if exists school_classrooms_all on school_classrooms;
create policy school_classrooms_all on school_classrooms for all using (true) with check (true);

drop policy if exists school_profiles_all on school_profiles;
create policy school_profiles_all on school_profiles for all using (true) with check (true);

drop policy if exists school_subjects_all on school_subjects;
create policy school_subjects_all on school_subjects for all using (true) with check (true);

drop policy if exists school_assessments_all on school_assessments;
create policy school_assessments_all on school_assessments for all using (true) with check (true);

drop policy if exists school_grade_records_all on school_grade_records;
create policy school_grade_records_all on school_grade_records for all using (true) with check (true);

drop policy if exists school_attendance_records_all on school_attendance_records;
create policy school_attendance_records_all on school_attendance_records for all using (true) with check (true);

drop policy if exists school_quiz_results_all on school_quiz_results;
create policy school_quiz_results_all on school_quiz_results for all using (true) with check (true);

drop policy if exists school_recovery_results_all on school_recovery_results;
create policy school_recovery_results_all on school_recovery_results for all using (true) with check (true);

drop policy if exists school_presence_results_all on school_presence_results;
create policy school_presence_results_all on school_presence_results for all using (true) with check (true);

create index if not exists idx_school_profiles_email on school_profiles(email);
create index if not exists idx_school_profiles_classroom on school_profiles(classroom_id);
create index if not exists idx_school_subjects_course on school_subjects(course);
create index if not exists idx_school_quiz_results_email_course on school_quiz_results(student_email, course);
create index if not exists idx_school_grade_records_student on school_grade_records(student_id);
create index if not exists idx_school_attendance_records_student on school_attendance_records(student_id);
