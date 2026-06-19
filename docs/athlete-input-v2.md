# Athlete Input V2 and normalized athlete state

Athlete Input V2 extends the existing preview request additively. All original
athlete fields remain required and unchanged. Enriched sections are optional,
strictly validated objects.

## Optional input sections

- `training_history`
- `schedule`
- `lifestyle`
- `nutrition`
- `sport`
- `equipment_details`
- `movement_restrictions`
- optional waist, lean-mass, and origin metadata

Explicit schedule contradictions are rejected rather than silently repaired.
Explicit equipment capabilities override venue-preset assumptions in the
normalized profile, but exercise selection continues using the legacy venue
preset during this checkpoint.

Origin and ethnicity metadata are retained only as source facts. They do not
affect training status, recovery, strategy, exercise selection, volume,
conditioning, or nutrition state.

## Normalized state

`athlete_state` contains machine-readable derived values. Every value includes:

- `value`
- stable `reason_codes`
- contributing `source_fields`
- `confidence`

Current derived states cover training status, schedule capacity, recovery,
movement limitations, energy availability, protein adequacy, adherence, sport
interference, conditioning readiness, and impact tolerance.

Legacy normalized fields remain present. In particular, current programme
strategy still uses legacy `fitness_level`, `available_days_per_week`, broad
`equipment`, and the existing top-level `recovery_capacity`. Athlete Input V2
does not refactor calendar, phase, sequencing, or conditioning planning.

## Assumptions and missing inputs

The legacy string `assumptions` array remains unchanged for programme-output
compatibility. New `planning_assumptions` and `missing_inputs` arrays provide
structured uncertainty and confidence information.

Missing enriched data lowers confidence but does not block deterministic
preview generation.

## Refinement context

Refinement receives compact derived athlete-state values and reason codes.
Raw enriched input, origin metadata, deficiencies, detailed training-volume
history, and personal identifiers are not added to the model context.
