-- Kairo — Fase 10: Eliminación de cuenta
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)

-- ============================================================
-- Función delete_own_account()
-- Permite que un usuario autenticado elimine SU PROPIA cuenta.
-- Borra la fila de auth.users; gracias a los "on delete cascade" del esquema
-- se eliminan también su perfil y todos sus datos (check-ins, objetivos,
-- encuestas, sesiones de enfoque/meditación y logros).
--
-- security definer: se ejecuta con privilegios del propietario (postgres) para
-- poder borrar de auth.users, pero solo actúa sobre auth.uid() (la sesión que
-- llama), nunca sobre otro usuario.
-- ============================================================
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No hay sesión activa.';
  end if;

  delete from auth.users where id = uid;
end;
$$;

-- Solo los usuarios autenticados pueden invocarla; cada uno solo puede borrarse
-- a sí mismo porque la función usa auth.uid() internamente.
revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
