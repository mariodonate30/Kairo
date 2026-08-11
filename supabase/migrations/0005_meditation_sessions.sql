-- Kairo — Fase 5: Meditación
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla meditation_sessions
-- Cada fila es una sesión de meditación completada. A diferencia del enfoque,
-- aquí solo registramos sesiones que el usuario llega a terminar, así que no
-- guardamos duración real ni un flag de completada: cada registro es una
-- sesión completa de duration_minutes minutos.
-- ============================================================
create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  duration_minutes int not null check (duration_minutes between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.meditation_sessions enable row level security;

create index if not exists meditation_sessions_user_id_date_idx
  on public.meditation_sessions (user_id, date);

-- ============================================================
-- 2. Políticas RLS
-- Cada usuario gestiona solo sus propias sesiones; los admins pueden leerlas
-- (para el panel de datos agregados). Las sesiones son registros históricos:
-- se crean y se leen, pero no se editan ni se borran desde la app.
-- ============================================================

drop policy if exists "meditation_sessions_select" on public.meditation_sessions;
create policy "meditation_sessions_select"
  on public.meditation_sessions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "meditation_sessions_insert" on public.meditation_sessions;
create policy "meditation_sessions_insert"
  on public.meditation_sessions for insert
  with check (auth.uid() = user_id);
