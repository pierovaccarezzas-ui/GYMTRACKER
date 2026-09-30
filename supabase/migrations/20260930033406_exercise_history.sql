create table if not exists public.exercise_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_id text not null,
  session_id text not null,
  exercise_id text not null,
  name text not null,
  target text,
  sets_target integer,
  completed_sets integer not null,
  recorded_at timestamptz not null default now(),
  primary key (user_id, week_id, session_id, exercise_id)
);
alter table public.exercise_history enable row level security;
grant select, insert, update, delete on public.exercise_history to authenticated;
create policy "own exercise history" on public.exercise_history for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
