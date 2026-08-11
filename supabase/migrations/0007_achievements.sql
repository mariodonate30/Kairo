-- Kairo — Fase 8: Gamificación (logros)
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla achievements
-- Catálogo de logros disponibles. Es común a todos los usuarios y solo los
-- admins pueden modificarlo. Cada logro se identifica por una `key` estable
-- que también se usa en el código (src/utils/achievements.js).
-- ============================================================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text not null,
  icon text not null, -- emoji
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

-- ============================================================
-- 2. Tabla user_achievements
-- Un logro desbloqueado por un usuario. UNIQUE(user_id, achievement_id)
-- evita duplicados y permite usar upsert idempotente al desbloquear.
-- ============================================================
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create index if not exists user_achievements_user_id_idx
  on public.user_achievements (user_id);

-- ============================================================
-- 3. Políticas RLS — achievements
-- Legibles por cualquier usuario autenticado; solo los admins pueden
-- crear, editar o borrar logros del catálogo.
-- ============================================================

drop policy if exists "achievements_select" on public.achievements;
create policy "achievements_select"
  on public.achievements for select
  to authenticated
  using (true);

drop policy if exists "achievements_insert" on public.achievements;
create policy "achievements_insert"
  on public.achievements for insert
  with check (public.is_admin());

drop policy if exists "achievements_update" on public.achievements;
create policy "achievements_update"
  on public.achievements for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "achievements_delete" on public.achievements;
create policy "achievements_delete"
  on public.achievements for delete
  using (public.is_admin());

-- ============================================================
-- 4. Políticas RLS — user_achievements
-- Cada usuario ve y desbloquea solo sus propios logros; los admins pueden
-- leerlos todos (para el panel de datos agregados). No se permite update:
-- un logro, una vez desbloqueado, es inmutable.
-- ============================================================

drop policy if exists "user_achievements_select" on public.user_achievements;
create policy "user_achievements_select"
  on public.user_achievements for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_achievements_insert" on public.user_achievements;
create policy "user_achievements_insert"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_achievements_delete" on public.user_achievements;
create policy "user_achievements_delete"
  on public.user_achievements for delete
  using (public.is_admin());

-- ============================================================
-- 5. Catálogo inicial de logros
-- Debe mantenerse sincronizado con ACHIEVEMENTS en src/utils/achievements.js
-- (misma `key`). El insert solo se ejecuta si la tabla está vacía, para poder
-- re-ejecutar la migración sin duplicar filas. Si añades logros nuevos más
-- adelante, usa un insert con `on conflict (key) do nothing`.
-- ============================================================
insert into public.achievements (key, title, description, icon, sort_order)
select v.key, v.title, v.description, v.icon, v.sort_order
from (values
  ('first_checkin',     'Primer check-in',        'Has completado tu primer check-in diario.',            '🌱', 10),
  ('streak_3',          '3 días seguidos',        'Tres check-ins en días consecutivos.',                 '🔥', 20),
  ('streak_7',          '7 días seguidos',        'Una semana entera registrando tu día.',                '🔥', 30),
  ('streak_30',         '30 días seguidos',       'Un mes completo sin fallar un check-in.',              '🏆', 40),
  ('checkin_10',        '10 check-ins',           'Has registrado 10 check-ins en total.',                '✅', 50),
  ('first_survey',      'Primera encuesta',       'Has completado tu primera encuesta semanal.',          '📋', 60),
  ('survey_4',          'Un mes de encuestas',    'Cuatro encuestas semanales completadas.',              '🗓️', 70),
  ('first_focus',       'Primer enfoque',         'Has completado tu primera sesión de enfoque.',         '⏱️', 80),
  ('focus_10',          '10 sesiones de enfoque', 'Diez sesiones de enfoque a tus espaldas.',             '🎯', 90),
  ('focus_600',         '10 horas de enfoque',    'Has acumulado 600 minutos de enfoque.',                '🧠', 100),
  ('first_meditation',  'Primera meditación',     'Has completado tu primera sesión de meditación.',      '🧘', 110),
  ('meditation_10',     '10 meditaciones',        'Diez sesiones de meditación completadas.',             '☮️', 120),
  ('water_100',         '100 vasos de agua',      'Has registrado 100 vasos de agua en tus check-ins.',   '💧', 130),
  ('goals_perfect_day', 'Día redondo',            'Cumpliste todos los objetivos que te marcaste en un día.', '🎯', 140),
  ('goals_10',          '10 objetivos cumplidos', 'Has completado 10 objetivos diarios en total.',        '📝', 150)
) as v(key, title, description, icon, sort_order)
where not exists (select 1 from public.achievements);
