-- Kairo — Fase 6: Encuestas semanales
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla survey_questions
-- Preguntas de la encuesta semanal. Son fijas (las mismas cada semana) para
-- poder medir la evolución. Los admins pueden crear/editar/desactivar preguntas.
-- ============================================================
create table if not exists public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null check (char_length(trim(question_text)) > 0),
  category text not null check (
    category in ('stress', 'social', 'motivation', 'study_habits', 'wellbeing')
  ),
  scale_min int not null default 1,
  scale_max int not null default 5,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  check (scale_max > scale_min)
);

alter table public.survey_questions enable row level security;

create index if not exists survey_questions_active_idx
  on public.survey_questions (active, sort_order);

-- ============================================================
-- 2. Tabla weekly_surveys
-- Una fila por usuario y semana. Las respuestas se guardan como JSONB con la
-- forma { question_id: valor }. Una encuesta por semana (UNIQUE user_id, week_start).
-- ============================================================
create table if not exists public.weekly_surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  responses jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_surveys enable row level security;

create index if not exists weekly_surveys_user_id_week_idx
  on public.weekly_surveys (user_id, week_start);

-- ============================================================
-- 3. Políticas RLS — survey_questions
-- Legibles por cualquier usuario autenticado; solo los admins pueden
-- crear, editar o borrar preguntas.
-- ============================================================

drop policy if exists "survey_questions_select" on public.survey_questions;
create policy "survey_questions_select"
  on public.survey_questions for select
  to authenticated
  using (true);

drop policy if exists "survey_questions_insert" on public.survey_questions;
create policy "survey_questions_insert"
  on public.survey_questions for insert
  with check (public.is_admin());

drop policy if exists "survey_questions_update" on public.survey_questions;
create policy "survey_questions_update"
  on public.survey_questions for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "survey_questions_delete" on public.survey_questions;
create policy "survey_questions_delete"
  on public.survey_questions for delete
  using (public.is_admin());

-- ============================================================
-- 4. Políticas RLS — weekly_surveys
-- Cada usuario gestiona solo sus propias respuestas; los admins pueden leerlas
-- todas (para el panel de datos agregados y anonimizados).
-- ============================================================

drop policy if exists "weekly_surveys_select" on public.weekly_surveys;
create policy "weekly_surveys_select"
  on public.weekly_surveys for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "weekly_surveys_insert" on public.weekly_surveys;
create policy "weekly_surveys_insert"
  on public.weekly_surveys for insert
  with check (auth.uid() = user_id);

drop policy if exists "weekly_surveys_update" on public.weekly_surveys;
create policy "weekly_surveys_update"
  on public.weekly_surveys for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "weekly_surveys_delete" on public.weekly_surveys;
create policy "weekly_surveys_delete"
  on public.weekly_surveys for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. Preguntas iniciales
-- 13 preguntas repartidas en las 5 categorías. Todas se responden en una
-- escala 1-5 de acuerdo (1 = Nada de acuerdo, 5 = Totalmente de acuerdo).
-- El insert solo se ejecuta si la tabla está vacía, para poder re-ejecutar
-- la migración sin duplicar preguntas.
-- ============================================================
insert into public.survey_questions (question_text, category, sort_order)
select v.question_text, v.category, v.sort_order
from (values
  -- Estrés académico
  ('He sentido estrés por los exámenes, entregas o notas.', 'stress', 10),
  ('Me ha costado desconectar de las tareas del instituto.', 'stress', 20),
  ('He notado síntomas de agobio (dolor de cabeza, nervios, no dormir bien) por el estudio.', 'stress', 30),
  -- Relaciones sociales
  ('Me he sentido apoyado/a por mis amigos y mi familia.', 'social', 40),
  ('He pasado tiempo de calidad con otras personas esta semana.', 'social', 50),
  ('Me he sentido a gusto y aceptado/a en mi entorno social.', 'social', 60),
  -- Motivación
  ('Me he sentido motivado/a para asistir a clase y estudiar.', 'motivation', 70),
  ('He tenido claros mis objetivos personales o académicos.', 'motivation', 80),
  -- Hábitos de estudio
  ('He organizado mi tiempo de estudio de forma eficaz.', 'study_habits', 90),
  ('He evitado dejar las tareas para el último momento.', 'study_habits', 100),
  ('He conseguido concentrarme al estudiar sin distraerme con el móvil.', 'study_habits', 110),
  -- Bienestar general
  ('En general, me he sentido bien conmigo mismo/a.', 'wellbeing', 120),
  ('He descansado y he tenido energía para el día a día.', 'wellbeing', 130)
) as v(question_text, category, sort_order)
where not exists (select 1 from public.survey_questions);
