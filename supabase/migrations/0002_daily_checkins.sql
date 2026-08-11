-- Kairo — Fase 2: Check-in diario
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla daily_checkins
-- ============================================================
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  mood int not null check (mood between 1 and 5),
  sleep_hours numeric(3, 1) not null check (sleep_hours >= 0 and sleep_hours <= 24),
  sleep_quality int not null check (sleep_quality between 1 and 5),
  nutrition int not null check (nutrition between 1 and 5),
  water_glasses int not null default 0 check (water_glasses >= 0),
  stress int not null check (stress between 1 and 5),
  studied boolean not null default false,
  study_minutes int check (study_minutes >= 0),
  exercised boolean not null default false,
  exercise_type text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_checkins enable row level security;

create index if not exists daily_checkins_user_id_date_idx
  on public.daily_checkins (user_id, date);

-- ============================================================
-- 2. Políticas RLS
-- Cada usuario ve y escribe solo sus propios check-ins; los admins ven todos.
-- ============================================================

drop policy if exists "daily_checkins_select" on public.daily_checkins;
create policy "daily_checkins_select"
  on public.daily_checkins for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "daily_checkins_insert" on public.daily_checkins;
create policy "daily_checkins_insert"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

-- No se permite update: el check-in de un día ya guardado es inmutable
-- (evita que se "corrija" a posteriori un dato de investigación).

drop policy if exists "daily_checkins_delete" on public.daily_checkins;
create policy "daily_checkins_delete"
  on public.daily_checkins for delete
  using (public.is_admin());
