create extension if not exists "pgcrypto";

create table if not exists public.athlete_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  athlete_data jsonb not null,
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_library (
  id text primary key,
  exercise_data jsonb not null,
  status text not null check (status in ('active', 'deprecated', 'experimental')),
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_library_json_id_matches check (exercise_data ->> 'id' = id)
);

create table if not exists public.odin_programmes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_type text not null,
  status text not null check (status in ('draft', 'active', 'archived')),
  source text not null check (source in ('deterministic', 'llm_refined')),
  programme_data jsonb not null,
  validation_data jsonb not null,
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programme_versions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.odin_programmes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  change_reason text not null,
  programme_data jsonb not null,
  validation_data jsonb not null,
  created_at timestamptz not null default now(),
  unique (programme_id, version_number)
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null,
  operation text not null,
  status text not null check (status in ('started', 'succeeded', 'failed')),
  input_summary jsonb not null,
  output_reference jsonb,
  validation_summary jsonb,
  error_code text,
  error_message text,
  request_id text not null,
  duration_ms integer,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.idempotency_keys (
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  idempotency_key text not null,
  request_hash text not null,
  response_reference jsonb,
  status text not null check (status in ('started', 'succeeded', 'failed')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (user_id, endpoint, idempotency_key)
);

create index if not exists athlete_profiles_user_id_idx on public.athlete_profiles(user_id);
create index if not exists exercise_library_status_idx on public.exercise_library(status);
create index if not exists programmes_user_status_created_idx on public.odin_programmes(user_id, status, created_at desc);
create index if not exists programme_versions_programme_version_idx on public.programme_versions(programme_id, version_number desc);
create index if not exists agent_runs_user_created_idx on public.agent_runs(user_id, created_at desc);
create index if not exists idempotency_keys_expires_at_idx on public.idempotency_keys(expires_at);

alter table public.athlete_profiles enable row level security;
alter table public.exercise_library enable row level security;
alter table public.odin_programmes enable row level security;
alter table public.programme_versions enable row level security;
alter table public.agent_runs enable row level security;
alter table public.idempotency_keys enable row level security;

drop policy if exists "athlete profiles select own" on public.athlete_profiles;
create policy "athlete profiles select own"
  on public.athlete_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "athlete profiles insert own" on public.athlete_profiles;
create policy "athlete profiles insert own"
  on public.athlete_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "athlete profiles update own" on public.athlete_profiles;
create policy "athlete profiles update own"
  on public.athlete_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "exercise library authenticated active read" on public.exercise_library;
create policy "exercise library authenticated active read"
  on public.exercise_library for select
  to authenticated
  using (status = 'active');

drop policy if exists "odin_programmes select own" on public.odin_programmes;
create policy "odin_programmes select own"
  on public.odin_programmes for select
  using (auth.uid() = user_id);

drop policy if exists "programme versions select own" on public.programme_versions;
create policy "programme versions select own"
  on public.programme_versions for select
  using (
    exists (
      select 1
      from public.odin_programmes p
      where p.id = programme_id
        and p.user_id = auth.uid()
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_athlete_profiles_updated_at on public.athlete_profiles;
create trigger set_athlete_profiles_updated_at
  before update on public.athlete_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_exercise_library_updated_at on public.exercise_library;
create trigger set_exercise_library_updated_at
  before update on public.exercise_library
  for each row execute function public.set_updated_at();

drop trigger if exists set_programmes_updated_at on public.odin_programmes;
create trigger set_programmes_updated_at
  before update on public.odin_programmes
  for each row execute function public.set_updated_at();

create or replace function public.create_programme_with_version(
  p_user_id uuid,
  p_name text,
  p_goal_type text,
  p_status text,
  p_source text,
  p_programme_data jsonb,
  p_validation_data jsonb,
  p_schema_version integer,
  p_replace_existing_draft boolean
)
returns table(programme_id uuid, version_number integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.odin_programmes
    where user_id = p_user_id
      and status = 'draft'
  ) then
    if p_replace_existing_draft then
      update public.odin_programmes
      set status = 'archived'
      where user_id = p_user_id
        and status = 'draft';
    else
      raise exception 'DRAFT_PROGRAMME_ALREADY_EXISTS'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.odin_programmes (
    user_id,
    name,
    goal_type,
    status,
    source,
    programme_data,
    validation_data,
    schema_version
  )
  values (
    p_user_id,
    p_name,
    p_goal_type,
    p_status,
    p_source,
    p_programme_data,
    p_validation_data,
    p_schema_version
  )
  returning id into programme_id;

  version_number := 1;

  insert into public.programme_versions (
    programme_id,
    user_id,
    version_number,
    change_reason,
    programme_data,
    validation_data
  )
  values (
    programme_id,
    p_user_id,
    version_number,
    'initial_generation',
    p_programme_data,
    p_validation_data
  );

  return next;
end;
$$;

revoke all on function public.create_programme_with_version(
  uuid,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  integer,
  boolean
) from public, anon, authenticated;

grant execute on function public.create_programme_with_version(
  uuid,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  integer,
  boolean
) to service_role;
