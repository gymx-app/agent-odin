-- Production hardening: atomic idempotency, single-query programme reads,
-- transactional idempotency completion, and per-user generation concurrency.

with duplicate_started_runs as (
  select id,
    row_number() over (
      partition by user_id, operation order by created_at desc, id desc
    ) as position
  from public.agent_runs
  where status = 'started' and operation = 'generate_programme'
)
update public.agent_runs r
set status = 'failed',
    error_code = 'GENERATION_SUPERSEDED',
    error_message = 'Superseded during concurrency migration.',
    completed_at = now()
from duplicate_started_runs d
where r.id = d.id and d.position > 1;

create unique index if not exists agent_runs_one_generation_per_user_idx
  on public.agent_runs(user_id, operation)
  where status = 'started' and operation = 'generate_programme';

create or replace function public.start_generation_run(
  p_user_id uuid,
  p_request_id text,
  p_input_summary jsonb,
  p_stale_after_seconds integer
)
returns table(id uuid, user_id uuid, request_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_run_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 1));

  update public.agent_runs r
  set status = 'failed',
      error_code = 'GENERATION_TIMEOUT',
      error_message = 'Generation lease expired.',
      completed_at = now()
  where r.user_id = p_user_id
    and r.operation = 'generate_programme'
    and r.status = 'started'
    and r.created_at <= now() - make_interval(secs => p_stale_after_seconds);

  if exists (
    select 1 from public.agent_runs r
    where r.user_id = p_user_id
      and r.operation = 'generate_programme'
      and r.status = 'started'
  ) then
    raise exception 'GENERATION_ALREADY_IN_PROGRESS' using errcode = 'P0001';
  end if;

  insert into public.agent_runs (
    user_id, agent_name, operation, status, input_summary, request_id
  )
  values (
    p_user_id, 'agent-odin', 'generate_programme', 'started',
    p_input_summary, p_request_id
  )
  returning agent_runs.id into new_run_id;

  return query
  select r.id, r.user_id, r.request_id
  from public.agent_runs r
  where r.id = new_run_id;
end;
$$;

revoke all on function public.start_generation_run(uuid, text, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.start_generation_run(uuid, text, jsonb, integer)
  to service_role;

create or replace function public.claim_idempotency_key(
  p_user_id uuid,
  p_endpoint text,
  p_idempotency_key text,
  p_request_hash text,
  p_ttl_seconds integer
)
returns table(outcome text, response_reference jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.idempotency_keys%rowtype;
  inserted_count integer;
begin
  insert into public.idempotency_keys (
    user_id, endpoint, idempotency_key, request_hash, status, expires_at
  )
  values (
    p_user_id, p_endpoint, p_idempotency_key, p_request_hash, 'started',
    now() + make_interval(secs => p_ttl_seconds)
  )
  on conflict (user_id, endpoint, idempotency_key) do nothing;

  get diagnostics inserted_count = row_count;
  if inserted_count = 1 then
    return query select 'started'::text, null::jsonb;
    return;
  end if;

  select *
  into existing
  from public.idempotency_keys
  where user_id = p_user_id
    and endpoint = p_endpoint
    and idempotency_key = p_idempotency_key
  for update;

  if existing.status = 'succeeded' then
    if existing.request_hash <> p_request_hash then
      return query select 'conflict'::text, null::jsonb;
    else
      return query select 'replay'::text, existing.response_reference;
    end if;
    return;
  end if;

  if existing.status = 'failed' then
    if existing.request_hash <> p_request_hash then
      return query select 'conflict'::text, null::jsonb;
      return;
    end if;

    update public.idempotency_keys
    set status = 'started',
        response_reference = null,
        expires_at = now() + make_interval(secs => p_ttl_seconds),
        created_at = now()
    where user_id = p_user_id
      and endpoint = p_endpoint
      and idempotency_key = p_idempotency_key;
    return query select 'started'::text, null::jsonb;
    return;
  end if;

  if existing.expires_at <= now() then
    update public.idempotency_keys
    set request_hash = p_request_hash,
        status = 'started',
        response_reference = null,
        expires_at = now() + make_interval(secs => p_ttl_seconds),
        created_at = now()
    where user_id = p_user_id
      and endpoint = p_endpoint
      and idempotency_key = p_idempotency_key;
    return query select 'started'::text, null::jsonb;
    return;
  end if;

  if existing.request_hash <> p_request_hash then
    return query select 'conflict'::text, null::jsonb;
  else
    return query select 'in_progress'::text, null::jsonb;
  end if;
end;
$$;

create or replace function public.mark_idempotency_failed(
  p_user_id uuid,
  p_endpoint text,
  p_idempotency_key text,
  p_request_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.idempotency_keys
  set status = 'failed', expires_at = now()
  where user_id = p_user_id
    and endpoint = p_endpoint
    and idempotency_key = p_idempotency_key
    and request_hash = p_request_hash
    and status = 'started';

  return found;
end;
$$;

revoke all on function public.claim_idempotency_key(uuid, text, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.claim_idempotency_key(uuid, text, text, text, integer)
  to service_role;
revoke all on function public.mark_idempotency_failed(uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.mark_idempotency_failed(uuid, text, text, text)
  to service_role;

drop function if exists public.create_programme_with_version(
  uuid, text, text, text, text, jsonb, jsonb, jsonb, integer, boolean
);

-- A prior, broken deploy already created this exact 13-arg signature
-- (referencing tables/columns that didn't exist yet); drop it explicitly
-- since CREATE OR REPLACE can't be used across the arg-count change from
-- the 10-arg version above, and a bare CREATE fails on the pre-existing
-- match.
drop function if exists public.create_programme_with_version(
  uuid, text, text, text, text, jsonb, jsonb, jsonb, integer, boolean, text, text, text
);

create function public.create_programme_with_version(
  p_user_id uuid,
  p_name text,
  p_goal_type text,
  p_status text,
  p_source text,
  p_programme_data jsonb,
  p_validation_data jsonb,
  p_refinement_data jsonb,
  p_schema_version integer,
  p_replace_existing_draft boolean,
  p_idempotency_endpoint text default null,
  p_idempotency_key text default null,
  p_request_hash text default null
)
returns table(
  id uuid,
  user_id uuid,
  name text,
  goal_type text,
  status text,
  source text,
  programme_data jsonb,
  validation_data jsonb,
  refinement_data jsonb,
  version_number integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_programme_id uuid;
begin
  -- Serialize draft replacement/creation for a user without an in-memory lock.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  if exists (
    select 1 from public.odin_programmes p
    where p.user_id = p_user_id and p.status = 'draft'
  ) then
    if p_replace_existing_draft then
      update public.odin_programmes p
      set status = 'archived'
      where p.user_id = p_user_id and p.status = 'draft';
    else
      raise exception 'DRAFT_PROGRAMME_ALREADY_EXISTS' using errcode = 'P0001';
    end if;
  end if;

  if p_idempotency_key is not null and not exists (
    select 1 from public.idempotency_keys i
    where i.user_id = p_user_id
      and i.endpoint = p_idempotency_endpoint
      and i.idempotency_key = p_idempotency_key
      and i.request_hash = p_request_hash
      and i.status = 'started'
  ) then
    raise exception 'IDEMPOTENCY_CLAIM_INVALID' using errcode = 'P0001';
  end if;

  insert into public.odin_programmes (
    user_id, name, goal_type, status, source, programme_data,
    validation_data, refinement_data, schema_version
  )
  values (
    p_user_id, p_name, p_goal_type, p_status, p_source, p_programme_data,
    p_validation_data, p_refinement_data, p_schema_version
  )
  returning odin_programmes.id into new_programme_id;

  insert into public.programme_versions (
    programme_id, user_id, version_number, change_reason, programme_data,
    validation_data, refinement_data
  )
  values (
    new_programme_id, p_user_id, 1, 'initial_generation', p_programme_data,
    p_validation_data, p_refinement_data
  );

  if p_idempotency_key is not null then
    update public.idempotency_keys i
    set status = 'succeeded',
        response_reference = jsonb_build_object('programme_id', new_programme_id),
        expires_at = greatest(i.expires_at, now() + interval '24 hours')
    where i.user_id = p_user_id
      and i.endpoint = p_idempotency_endpoint
      and i.idempotency_key = p_idempotency_key
      and i.request_hash = p_request_hash
      and i.status = 'started';

    if not found then
      raise exception 'IDEMPOTENCY_FINALIZATION_FAILED' using errcode = 'P0001';
    end if;
  end if;

  return query
  select p.id, p.user_id, p.name, p.goal_type, p.status, p.source,
    p.programme_data, p.validation_data, p.refinement_data, 1
  from public.odin_programmes p
  where p.id = new_programme_id;
end;
$$;

revoke all on function public.create_programme_with_version(
  uuid, text, text, text, text, jsonb, jsonb, jsonb, integer, boolean,
  text, text, text
) from public, anon, authenticated;
grant execute on function public.create_programme_with_version(
  uuid, text, text, text, text, jsonb, jsonb, jsonb, integer, boolean,
  text, text, text
) to service_role;

create or replace function public.get_programme_with_latest_version(
  p_user_id uuid,
  p_programme_id uuid
)
returns table(
  id uuid, user_id uuid, name text, goal_type text, status text, source text,
  programme_data jsonb, validation_data jsonb, refinement_data jsonb,
  version_number integer
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.user_id, p.name, p.goal_type, p.status, p.source,
    p.programme_data, p.validation_data, p.refinement_data, v.version_number
  from public.odin_programmes p
  join lateral (
    select pv.version_number
    from public.programme_versions pv
    where pv.programme_id = p.id and pv.user_id = p_user_id
    order by pv.version_number desc
    limit 1
  ) v on true
  where p.id = p_programme_id and p.user_id = p_user_id;
$$;

create or replace function public.get_current_draft_with_latest_version(
  p_user_id uuid
)
returns table(
  id uuid, user_id uuid, name text, goal_type text, status text, source text,
  programme_data jsonb, validation_data jsonb, refinement_data jsonb,
  version_number integer
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.user_id, p.name, p.goal_type, p.status, p.source,
    p.programme_data, p.validation_data, p.refinement_data, v.version_number
  from public.odin_programmes p
  join lateral (
    select pv.version_number
    from public.programme_versions pv
    where pv.programme_id = p.id and pv.user_id = p_user_id
    order by pv.version_number desc
    limit 1
  ) v on true
  where p.user_id = p_user_id and p.status = 'draft'
  order by p.created_at desc
  limit 1;
$$;

revoke all on function public.get_programme_with_latest_version(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.get_programme_with_latest_version(uuid, uuid)
  to service_role;
revoke all on function public.get_current_draft_with_latest_version(uuid)
  from public, anon, authenticated;
grant execute on function public.get_current_draft_with_latest_version(uuid)
  to service_role;
