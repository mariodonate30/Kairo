-- Kairo — Calendario de tareas
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla tasks
-- Cada fila es una tarea con fecha de entrega, tipo "planner" de Notion.
-- El usuario la crea desde la vista de calendario (semanal o mensual).
-- ============================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  subject text,
  due_date date not null default current_date,
  priority text not null default 'media' check (priority in ('baja', 'media', 'alta')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create index if not exists tasks_user_id_due_date_idx
  on public.tasks (user_id, due_date);

-- ============================================================
-- 2. Políticas RLS
-- Cada usuario gestiona solo sus propias tareas; los admins pueden leerlas
-- (para datos agregados). Se pueden editar y borrar libremente.
-- ============================================================

drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select"
  on public.tasks for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tasks_insert" on public.tasks;
create policy "tasks_insert"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "tasks_update" on public.tasks;
create policy "tasks_update"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_delete" on public.tasks;
create policy "tasks_delete"
  on public.tasks for delete
  using (auth.uid() = user_id);
