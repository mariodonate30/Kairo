-- Kairo — Test inicial (baseline al registrarse)
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)
--
-- Cuestionario que el alumno responde una sola vez, justo tras registrarse.
-- Recoge el estado de partida (autoestima, mentalidad, ansiedad ante exámenes,
-- presión social, comparación en redes y hábitos de estudio) para poder:
--   1. Correlacionar ese perfil con los datos diarios de la app.
--   2. Comparar pre/post si el mismo test se repite al final del estudio.
-- Las respuestas se guardan como JSONB { question_key: valor }. El mapeo de cada
-- pregunta con las hipótesis del TDR vive en src/utils/initialTest.js.

-- ============================================================
-- 1. Tabla initial_test
-- Una fila por usuario (UNIQUE user_id). Es inmutable: no hay policy de update,
-- para que el baseline no se pueda "retocar" a posteriori.
-- ============================================================
create table if not exists public.initial_test (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  responses jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.initial_test enable row level security;

create index if not exists initial_test_user_id_idx
  on public.initial_test (user_id);

-- ============================================================
-- 2. Políticas RLS
-- Cada usuario ve y crea solo su propio test; los admins pueden leerlos todos
-- (para el panel de datos agregados y anonimizados). Solo los admins borran.
-- ============================================================

drop policy if exists "initial_test_select" on public.initial_test;
create policy "initial_test_select"
  on public.initial_test for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "initial_test_insert" on public.initial_test;
create policy "initial_test_insert"
  on public.initial_test for insert
  with check (auth.uid() = user_id);

-- Sin policy de update: el test inicial es inmutable una vez enviado.

drop policy if exists "initial_test_delete" on public.initial_test;
create policy "initial_test_delete"
  on public.initial_test for delete
  using (public.is_admin());
