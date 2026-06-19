# Session Construction V2

Session Construction V2 converts a resistance-day budget into approved,
exactly prescribed resistance work. It is additive and is not connected to the
live V1 preview path.

## Movement slots

Session-kind templates create required and optional movement slots. Each slot
contains movement and substitution patterns, target muscles, role, priority,
set budget, rep zone, exact RPE target and ceiling, fatigue limits, and a
progression-policy reference.

Restriction-zeroed movement budgets remove the affected slot or use an
explicit allowed substitute. Required coverage cannot be silently discarded.

## Exercise candidates

Candidates come only from the approved exercise library. Filtering applies:

- deterministic eligibility status;
- exact or permitted movement pattern;
- equipment compatibility;
- training-status difficulty;
- fatigue limits;
- target-muscle overlap;
- prior exercise continuity;
- within-session duplicate prevention.

Eligible exercises rank above modifiable exercises. Exact pattern, target
muscle, fatigue fit, continuity, skill demand, stability demand, and lexical
exercise ID provide deterministic scoring and tie-breaking.

No speculative exercise metadata was added. Existing difficulty, skill,
stability, fatigue, movement-demand, equipment, range, rest, coaching, and
substitution metadata are sufficient for this checkpoint.

## Prescriptions

Selected exercises receive integer set counts, exact reps, exact target RPE,
an RPE ceiling, and exact rest seconds. Rep targets remain inside both the slot
zone and approved exercise range.

Calibration sets are limited to introduction/returning contexts. Backoff sets
are limited to primary strength work in intensification. No weight is
prescribed.

Each prescription includes a progression-policy ID, internal bounds, concise
user progression rule, approved substitution IDs, approved coaching notes,
and modification metadata when required.

## Duration and repair

Duration includes work time, prescribed rest, setup/transitions, eight minutes
of future warm-up allowance, and five minutes of cooldown allowance.

When over duration, the builder:

1. removes optional slots;
2. reduces non-primary sets;
3. recalculates prescriptions and duration;
4. fails if required movement coverage still cannot fit.

Primary required work is not silently removed.

## Validation

The independent V2 session validator checks selected IDs, eligibility,
modification metadata, duplicates, set-budget matching, exact prescriptions,
rest ranges, progression metadata, substitution integrity, duration, and
canonical names.

## Deferred work

Final sequencing optimization, session-specific warm-ups, detailed
conditioning prescriptions, supersets, and runtime progression remain
deferred.
