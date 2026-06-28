-- Rate limiting and audit trail for AI programme generation.
-- Used by the Vercel API (service_role only) — users have no direct access.

create table if not exists public.odin_generation_log (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  step            text        not null check (step in ('strategy', 'build')),
  tokens_input    integer     not null default 0 check (tokens_input >= 0),
  tokens_output   integer     not null default 0 check (tokens_output >= 0),
  repair_attempted boolean    not null default false,
  athlete_goal    text,
  created_at      timestamptz not null default now()
);

-- Index for the rate-limit query: count rows per user per step in the last N hours.
create index odin_generation_log_rate_limit_idx
  on public.odin_generation_log (user_id, step, created_at desc);

-- RLS: no direct row access for any client role — only service_role bypasses RLS.
alter table public.odin_generation_log enable row level security;
