-- Keep-alive: una tabla de una sola fila que el workflow de GitHub Actions
-- actualiza cada dia. Asi Supabase ve escrituras reales en la base de datos
-- (y no solo una lectura vacia) y no pausa el proyecto por inactividad.
-- No guarda ningun dato de usuarios.

create table if not exists public.keepalive (
  id int primary key default 1 check (id = 1),
  last_ping timestamptz not null default now(),
  ping_count bigint not null default 0
);

insert into public.keepalive (id) values (1) on conflict (id) do nothing;

-- RLS activado sin politicas: nadie puede leer/escribir la tabla directamente.
alter table public.keepalive enable row level security;

-- La unica forma de tocarla es esta funcion, que solo actualiza la fila.
create or replace function public.keep_alive()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update public.keepalive
     set last_ping = now(), ping_count = ping_count + 1
   where id = 1
  returning last_ping;
$$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon, authenticated;
