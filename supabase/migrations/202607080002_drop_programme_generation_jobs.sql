-- Tears down the durable job architecture from 202607070001. The granular
-- per-phase/per-week pipeline it ran (~26 sequential LLM calls per
-- programme) was never adopted by any client — demo-ui uses the
-- strategy->build fast path exclusively — and the cron sweep below was
-- firing net.http_post every minute, forever, against an orphaned worker
-- with nothing left to do. Removing the live artifacts to match the code
-- removal (job-stage-dispatcher.ts, generation-job.repository.ts, the 4
-- api/odin/generate-programme-job* handlers and edge functions).

select cron.unschedule('odin-generation-job-sweep');

delete from vault.secrets where name in ('odin_worker_url', 'odin_worker_secret');

drop function if exists public.complete_generation_stage(
  uuid, text, text, integer, integer, integer, jsonb, text, jsonb, jsonb
);
drop function if exists public.claim_stale_generation_jobs(integer, integer);
drop function if exists public.claim_generation_job(uuid, text, integer);
drop function if exists public.create_generation_job(uuid, text, jsonb, text);

drop table if exists public.programme_generation_jobs;
