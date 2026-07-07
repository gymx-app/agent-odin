-- Adds stage-level observability to odin_generation_log. Stage timing
-- (stage_durations_ms) was already being computed in code (see
-- ai-programme-generation.service.ts / programme-preview.service.ts) but
-- only ever returned to the client, never persisted — meaning there was no
-- way to answer "how long does strategy generation typically take" or
-- "what's our failure rate" without external log scraping. Failed
-- generations weren't logged at all (logGeneration was only called on the
-- success path).

alter table public.odin_generation_log
  drop constraint odin_generation_log_step_check,
  add constraint odin_generation_log_step_check check (
    step in (
      'strategy', 'build',
      'phase_prep', 'phase_reasoning', 'phase_tools', 'phase_week', 'assemble'
    )
  );

alter table public.odin_generation_log
  add column status text not null default 'succeeded'
    check (status in ('succeeded', 'failed')),
  add column error_code text,
  add column duration_ms integer check (duration_ms >= 0),
  add column stage_durations_ms jsonb;

-- Index for a failure-rate / slow-stage dashboard query (see the Supabase
-- Studio "Reports" SQL provided alongside this migration).
create index odin_generation_log_status_created_idx
  on public.odin_generation_log (status, created_at desc);
