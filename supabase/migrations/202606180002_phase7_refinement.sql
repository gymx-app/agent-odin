alter table public.programmes
  add column if not exists refinement_data jsonb not null default
  '{"requested":false,"applied":false,"status":"not_requested","reason_code":null,"model":null,"prompt_version":null,"schema_version":null}'::jsonb;

alter table public.programme_versions
  add column if not exists refinement_data jsonb not null default
  '{"requested":false,"applied":false,"status":"not_requested","reason_code":null,"model":null,"prompt_version":null,"schema_version":null}'::jsonb;

drop function if exists public.create_programme_with_version(
  uuid,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  integer,
  boolean
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
    from public.programmes
    where user_id = p_user_id
      and status = 'draft'
  ) then
    if p_replace_existing_draft then
      update public.programmes
      set status = 'archived'
      where user_id = p_user_id
        and status = 'draft';
    else
      raise exception 'DRAFT_PROGRAMME_ALREADY_EXISTS'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.programmes (
    user_id,
    name,
    goal_type,
    status,
    source,
    programme_data,
    validation_data,
    refinement_data,
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
    p_refinement_data,
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
    validation_data,
    refinement_data
  )
  values (
    programme_id,
    p_user_id,
    version_number,
    'initial_generation',
    p_programme_data,
    p_validation_data,
    p_refinement_data
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
  jsonb,
  integer,
  boolean
) to service_role;
