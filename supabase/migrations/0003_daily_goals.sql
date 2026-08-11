-- Kairo — Fase 3: Objetivos diarios
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla daily_goals
-- Cada fila es un objetivo (hasta 3 por día). El límite de 3 se aplica
-- en la app; aquí solo restringimos sort_order al rango 1-3.
-- ============================================================
create table if not exists public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  goal_text text not null check (char_length(trim(goal_text)) > 0),
  completed boolean not null default false,
  sort_order int not null default 1 check (sort_order between 1 and 3),
  created_at timestamptz not null default now()
);

alter table public.daily_goals enable row level security;

create index if not exists daily_goals_user_id_date_idx
  on public.daily_goals (user_id, date);

-- ============================================================
-- 2. Políticas RLS
-- Cada usuario gestiona solo sus propios objetivos; los admins pueden leerlos
-- (para el panel de datos agregados). A diferencia del check-in, los objetivos
-- se pueden editar y borrar durante el día, así que sí permitimos update/delete.
-- ============================================================

drop policy if exists "daily_goals_select" on public.daily_goals;
create policy "daily_goals_select"
  on public.daily_goals for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "daily_goals_insert" on public.daily_goals;
create policy "daily_goals_insert"
  on public.daily_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_goals_update" on public.daily_goals;
create policy "daily_goals_update"
  on public.daily_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "daily_goals_delete" on public.daily_goals;
create policy "daily_goals_delete"
  on public.daily_goals for delete
  using (auth.uid() = user_id);
