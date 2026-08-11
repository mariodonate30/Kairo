-- Kairo — Fase 4: Temporizador de enfoque
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla focus_sessions
-- Cada fila es una sesión de estudio tipo Pomodoro. Guardamos la duración
-- planificada y la real (por si el usuario cancela antes de tiempo) y si la
-- sesión llegó a completarse. Solo registramos sesiones con algún minuto real
-- de enfoque; la app decide cuándo insertar.
-- ============================================================
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  planned_minutes int not null check (planned_minutes between 1 and 240),
  actual_minutes int not null check (actual_minutes >= 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.focus_sessions enable row level security;

create index if not exists focus_sessions_user_id_date_idx
  on public.focus_sessions (user_id, date);

-- ============================================================
-- 2. Políticas RLS
-- Cada usuario gestiona solo sus propias sesiones; los admins pueden leerlas
-- (para el panel de datos agregados). Las sesiones son registros históricos:
-- se crean y se leen, pero no se editan ni se borran desde la app.
-- ============================================================

drop policy if exists "focus_sessions_select" on public.focus_sessions;
create policy "focus_sessions_select"
  on public.focus_sessions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "focus_sessions_insert" on public.focus_sessions;
create policy "focus_sessions_insert"
  on public.focus_sessions for insert
  with check (auth.uid() = user_id);
