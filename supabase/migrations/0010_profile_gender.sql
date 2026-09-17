-- Kairo — Género en el perfil
-- Ejecutar en el SQL Editor de Supabase (Project → SQL Editor → New query)
--
-- El género se pregunta en el test inicial (opcional) y se copia al perfil para
-- poder analizar los datos agregados separados por sexo y en conjunto. Las
-- políticas RLS de profiles ya cubren esta columna: cada usuario actualiza el
-- suyo (auth.uid() = id) y los admins pueden leer todos los perfiles.

alter table public.profiles
  add column if not exists gender text check (gender in ('chico', 'chica'));
