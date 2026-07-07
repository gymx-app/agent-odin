-- Durable, checkpointed job architecture for AI programme generation (v2).
-- Replaces client-driven step orchestration (api/odin/generate-programme-v2.ts's
-- strategy/phase_reasoning/phase_tools/phase_week/assemble steps) with a
-- server-owned job: the client creates a job once, a worker processes it
-- stage-by-stage, checkpointing to this table after each stage.

create table public.programme_generation_jobs (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  status           text        not null default 'queued'
                     check (status in ('queued', 'running', 'succeeded', 'failed')),
  current_stage    text        not null default 'strategy'
                     check (current_stage in
                       ('strategy', 'phase_reasoning', 'phase_tools', 'phase_week', 'assemble', 'done')),
  phase_index      integer     not null default 0,
  week_index       integer     not null default 0,
  phase_count      integer,
  planner_version  text        not null default 'ai_agent_v2',
  request_id       text        not null,
  request_input    jsonb       not null,
  checkpoint_state jsonb       not null default '{}'::jsonb,
  result           jsonb,
  error            jsonb,
  attempt_count    integer     not null default 0,
  max_attempts     integer     not null default 5,
  lease_owner      text,
  lease_expires_at timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index programme_generation_jobs_user_created_idx
  on public.programme_generation_jobs (user_id, created_at desc);

-- Cheap candidate scan for the cron sweep.
create index programme_generation_jobs_claimable_idx
  on public.programme_generation_jobs (lease_expires_at)
  where status in ('queued', 'running');

-- One active generation per user (defense in depth — create_generation_job's
-- advisory lock handles the common path, this is the DB-level backstop).
create unique index programme_generation_jobs_one_active_per_user_idx
  on public.programme_generation_jobs (user_id)
  where status in ('queued', 'running');

alter table public.programme_generation_jobs enable row level security;

create policy "programme generation jobs select own"
  on public.programme_generation_jobs for select
  using (auth.uid() = user_id);
-- No insert/update/delete policy for anon/authenticated — service_role only,
-- which bypasses RLS entirely (matches odin_generation_log's convention).

create trigger set_programme_generation_jobs_updated_at
  before update on public.programme_generation_jobs
  for each row execute function public.set_updated_at();

-- Get-or-create: if the user already has a queued/running job, return it
-- instead of inserting a new one. This is the idempotency guarantee — a
-- client retrying a dropped create response gets the same job back instead
-- of paying for a second generation.
create function public.create_generation_job(
  p_user_id uuid,
  p_request_id text,
  p_request_input jsonb,
  p_planner_version text default 'ai_agent_v2'
)
returns public.programme_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  job public.programme_generation_jobs;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 2));

  select * into job
  from public.programme_generation_jobs
  where user_id = p_user_id and status in ('queued', 'running');

  if found then
    return job;
  end if;

  insert into public.programme_generation_jobs (
    user_id, request_id, request_input, planner_version
  )
  values (
    p_user_id, p_request_id, p_request_input, p_planner_version
  )
  returning * into job;

  return job;
end;
$$;

-- Single-job conditional claim. A plain row-locking UPDATE...WHERE is
-- sufficient (not FOR UPDATE SKIP LOCKED) because the caller already knows
-- the exact job_id: two concurrent claimants just serialize on the row lock,
-- and the loser's WHERE re-check (against the winner's committed row) matches
-- zero rows, which it treats as "someone else already owns this."
create function public.claim_generation_job(
  p_job_id uuid,
  p_lease_owner text,
  p_lease_seconds integer
)
returns public.programme_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  job public.programme_generation_jobs;
begin
  update public.programme_generation_jobs
  set status = 'running',
      lease_owner = p_lease_owner,
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      attempt_count = attempt_count + 1
  where id = p_job_id
    and status in ('queued', 'running')
    and lease_expires_at < now()
  returning * into job;

  return job;
end;
$$;

-- Batch claim for the cron sweep, scanning across all users. FOR UPDATE SKIP
-- LOCKED here because it's scanning a set of candidates, not one known row.
create function public.claim_stale_generation_jobs(
  p_lease_seconds integer,
  p_limit integer
)
returns setof public.programme_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select id
    from public.programme_generation_jobs
    where status in ('queued', 'running') and lease_expires_at < now()
    order by lease_expires_at asc
    limit p_limit
    for update skip locked
  )
  update public.programme_generation_jobs j
  set status = 'running',
      lease_owner = 'cron:' || gen_random_uuid()::text,
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      attempt_count = j.attempt_count + 1
  from candidates c
  where j.id = c.id
  returning j.*;
end;
$$;

-- Write-back after a stage runs. Guarded on lease_owner matching: if the
-- lease was reclaimed by someone else while this caller's LLM call ran long,
-- this is a no-op (0 rows) and the caller must discard its result rather than
-- clobbering the new owner's progress. This — not the claim — is the actual
-- anti-double-write guarantee.
--
-- Non-terminal writes (p_status = 'running') release the lease immediately
-- (lease_expires_at = now()) so the very next tick can reclaim without
-- waiting out the full lease window.
create function public.complete_generation_stage(
  p_job_id uuid,
  p_lease_owner text,
  p_new_stage text,
  p_new_phase_index integer,
  p_new_week_index integer,
  p_new_phase_count integer,
  p_checkpoint_state jsonb,
  p_status text,
  p_result jsonb,
  p_error jsonb
)
returns public.programme_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  job public.programme_generation_jobs;
begin
  update public.programme_generation_jobs
  set current_stage = p_new_stage,
      phase_index = p_new_phase_index,
      week_index = p_new_week_index,
      phase_count = coalesce(p_new_phase_count, phase_count),
      checkpoint_state = p_checkpoint_state,
      status = p_status,
      result = p_result,
      error = p_error,
      lease_expires_at = case when p_status in ('succeeded', 'failed')
        then lease_expires_at else now() end
  where id = p_job_id and lease_owner = p_lease_owner
  returning * into job;

  return job;
end;
$$;

revoke all on function public.create_generation_job(uuid, text, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.create_generation_job(uuid, text, jsonb, text)
  to service_role;

revoke all on function public.claim_generation_job(uuid, text, integer)
  from public, anon, authenticated;
grant execute on function public.claim_generation_job(uuid, text, integer)
  to service_role;

revoke all on function public.claim_stale_generation_jobs(integer, integer)
  from public, anon, authenticated;
grant execute on function public.claim_stale_generation_jobs(integer, integer)
  to service_role;

revoke all on function public.complete_generation_stage(
  uuid, text, text, integer, integer, integer, jsonb, text, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_generation_stage(
  uuid, text, text, integer, integer, integer, jsonb, text, jsonb, jsonb
) to service_role;

-- Background sweep safety net for stalled jobs (self-continuation chain
-- broke: worker crash, cold-start eviction, etc.). Both extensions are
-- standard bundled Postgres extensions on Supabase, not a new external
-- service.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- The worker URL and shared secret are environment-specific and must NOT be
-- hardcoded here (this file is checked into git). Set them once per
-- environment via Supabase Vault before the sweep can do anything useful:
--   select vault.create_secret('https://<project-ref>.functions.supabase.co/generate-programme-job-worker', 'odin_worker_url');
--   select vault.create_secret('<value matching ODIN_WORKER_INTERNAL_SECRET>', 'odin_worker_secret');
-- The schedule itself is created unconditionally; until both secrets exist,
-- each tick's `where` guard below matches nothing and net.http_post is never
-- called (rather than failing on a null url).
select cron.schedule(
  'odin-generation-job-sweep',
  '* * * * *', -- every minute — pg_cron's interval-string form only allows 1-59 seconds, not 60

  $cron$
  select net.http_post(
    url := s.worker_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-odin-worker-secret', s.worker_secret
    ),
    body := jsonb_build_object('mode', 'sweep')
  )
  from (
    select
      (select decrypted_secret from vault.decrypted_secrets where name = 'odin_worker_url') as worker_url,
      (select decrypted_secret from vault.decrypted_secrets where name = 'odin_worker_secret') as worker_secret
  ) s
  where s.worker_url is not null and s.worker_secret is not null;
  $cron$
);
