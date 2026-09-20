-- Kairo — Encuesta final + interruptor de activación
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)
--
-- La encuesta final se responde una sola vez, al terminar el estudio. Va
-- emparejada con el test inicial por user_id, de modo que se puede ver la
-- evolución de cada alumno (inicial → final) sin mezclar personas.
-- Permanece OCULTA hasta que un admin la activa mediante app_settings.

-- ============================================================
-- 1. Tabla final_test  (misma estructura que initial_test)
-- Inmutable: sin policy de update. Una fila por usuario.
-- ============================================================
create table if not exists public.final_test (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  responses jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.final_test enable row level security;

create index if not exists final_test_user_id_idx
  on public.final_test (user_id);

drop policy if exists "final_test_select" on public.final_test;
create policy "final_test_select"
  on public.final_test for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "final_test_insert" on public.final_test;
create policy "final_test_insert"
  on public.final_test for insert
  with check (auth.uid() = user_id);

drop policy if exists "final_test_delete" on public.final_test;
create policy "final_test_delete"
  on public.final_test for delete
  using (public.is_admin());

-- ============================================================
-- 2. Tabla app_settings  (configuración global de la app)
-- Pares clave/valor. La clave 'final_test_active' controla si la encuesta
-- final está visible y es obligatoria para los alumnos.
-- Legible por cualquier usuario autenticado; solo los admins la modifican.
-- ============================================================
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_select" on public.app_settings;
create policy "app_settings_select"
  on public.app_settings for select
  to authenticated
  using (true);

drop policy if exists "app_settings_insert" on public.app_settings;
create policy "app_settings_insert"
  on public.app_settings for insert
  with check (public.is_admin());

drop policy if exists "app_settings_update" on public.app_settings;
create policy "app_settings_update"
  on public.app_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Valor inicial: encuesta final DESACTIVADA. No se sobrescribe si ya existe.
insert into public.app_settings (key, value)
values ('final_test_active', 'false'::jsonb)
on conflict (key) do nothing;
