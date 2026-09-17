-- Kairo — Fase 1: Auth + perfiles + roles
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- 1. Tabla profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  current_streak int not null default 0,
  longest_streak int not null default 0
);

alter table public.profiles enable row level security;

-- ============================================================
-- 2. Función auxiliar is_admin()
-- security definer para evitar recursión de RLS al comprobar el rol
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- 3. Trigger: crear perfil automáticamente al registrarse
-- Asigna role='admin' si el email está en la lista de admins del instituto
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_emails text[] := array[
    'mariodonate30@gmail.com',
    'lara.martos@inscanroca.com',
    'ainoa.titos@inscanroca.com'
  ];
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when lower(new.email) = any (admin_emails) then 'admin'
      else 'student'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 4. Protección: un usuario no puede auto-asignarse el rol admin
-- ============================================================
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_role_before_update on public.profiles;
create trigger protect_role_before_update
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- ============================================================
-- 5. Políticas RLS
-- ============================================================

-- Cada usuario puede ver su propio perfil; los admins pueden ver todos
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Cada usuario puede actualizar su propio perfil (el rol queda protegido por el trigger)
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- No se define policy de insert/delete: los perfiles solo se crean vía el
-- trigger on_auth_user_created (security definer), que hace bypass de RLS.
