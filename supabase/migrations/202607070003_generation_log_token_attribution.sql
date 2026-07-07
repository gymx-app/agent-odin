-- Adds "which agent" attribution alongside the existing tokens_input/
-- tokens_output columns, so token consumption can be broken down by
-- provider/model/planner_version in addition to by user_id (already
-- possible with the existing column) and by step.
--
-- tokens_input/tokens_output already existed but were being hardcoded to 0
-- in the 'build' step and the job worker — the underlying LLM call results
-- carry real usage data (see AiGenerationResult.usage) that was being
-- discarded rather than threaded up to the log write. Fixed in code
-- alongside this migration, not by this migration alone.

alter table public.odin_generation_log
  add column provider text,
  add column model text,
  add column planner_version text;

-- Index for "which agent/model is consuming the most tokens" queries.
create index odin_generation_log_provider_model_idx
  on public.odin_generation_log (provider, model, created_at desc);
