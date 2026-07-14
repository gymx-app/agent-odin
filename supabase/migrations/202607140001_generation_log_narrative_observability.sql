-- narratives_unavailable/narrative_retry_reasons let us see *why* narrative
-- synthesis gave up on a given build, instead of only seeing an empty
-- citations array client-side with no server-side trail to debug from.

alter table public.odin_generation_log
  add column narratives_unavailable boolean,
  add column narrative_retry_reasons text[];
