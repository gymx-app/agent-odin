-- Captures *why* a repair round-trip fired, not just that one did.
-- repair_attempted (existing boolean) tells you a build needed a retry;
-- it doesn't say which validation codes forced it, so every repair was a
-- dead end for root-causing. repair_log already computes this in memory
-- (buildProgrammeWithRepair's RepairAttempt[].errorCodes) and discarded it.
-- Persisting it turns "repair happened" into "repair happened because X",
-- which is what's needed to find and fix the underlying strategy/planner
-- gap instead of just retrying around it.

alter table public.odin_generation_log
  add column repair_reasons text[];
