create table if not exists public.training_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  label text not null,
  subtitle text,
  day_of_week smallint,
  optional boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

create table if not exists public.exercise_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  exercise_id text not null,
  name text not null,
  exercise_type text,
  target text,
  sets_target integer,
  reps text,
  completed_sets integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, session_id, exercise_id),
  foreign key (user_id, session_id) references public.training_sessions(user_id, session_id) on delete cascade
);

create table if not exists public.run_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id text not null,
  run_date text,
  run_type text,
  km numeric,
  minutes integer,
  seconds integer,
  pace text,
  kmh numeric,
  recorded_at timestamptz not null default now(),
  primary key (user_id, run_id)
);

alter table public.training_sessions enable row level security;
alter table public.exercise_progress enable row level security;
alter table public.run_entries enable row level security;

grant select, insert, update, delete on public.training_sessions, public.exercise_progress, public.run_entries to authenticated;

create policy "own training sessions" on public.training_sessions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own exercise progress" on public.exercise_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own run entries" on public.run_entries for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
