create table if not exists public.gymtrack_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.gymtrack_state enable row level security;

grant select, insert, update on table public.gymtrack_state to authenticated;

create policy "Cada usuario puede leer su estado de GymTrack"
on public.gymtrack_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Cada usuario puede crear su estado de GymTrack"
on public.gymtrack_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Cada usuario puede actualizar su estado de GymTrack"
on public.gymtrack_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter table public.gymtrack_state replica identity full;
alter publication supabase_realtime add table public.gymtrack_state;
