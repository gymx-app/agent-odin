# Programme Schema V2

Programme Schema V2 is an additive domain contract. It does not replace the
current planner or `/api/odin/preview`.

## Versions

- Existing planner output remains the unversioned legacy payload accepted by
  `OdinProgrammeSchema`, an alias of `LegacyOdinProgrammeSchema`.
- Explicit V1 interchange uses `schema_version: "1.0"` and
  `planner_version: "legacy_v1"`.
- Longitudinal V2 uses `schema_version: "2.0"` and
  `planner_version: "longitudinal_v1"`.
- `VersionedOdinProgrammeSchema` accepts only the explicit V1 and V2 branches.
  It never infers V2 from a legacy payload.

## V2 contract

V2 represents a preview programme as explicit calendar cycles, phases, weeks,
days, session warm-ups, exact set prescriptions, structured conditioning,
progression policy, fatigue-management policy, substitution policy, and safe
generation metadata.

Weekly calendars require seven ordered weekdays. Rolling calendars explicitly
contain more than seven ordered cycle days; an eight-day cycle cannot be
encoded as seven days. Every explicit programme week/cycle segment must match
the calendar length.

Exercise prescriptions retain exact target reps, target RPE, RPE ceilings, and
rest seconds. Progression bounds remain internal metadata. Exercise and
conditioning prescriptions reference programme-level policy IDs.

## Validation dispatch

`ProgrammeValidationService.validate` remains the legacy entry point and
preserves the existing response shape. `validateVersioned` dispatches explicit
V1 to the same deterministic legacy rules and V2 to V2 schema validation,
approved exercise ID/name checks, and initial conditioning interference checks.

Future calendar, phase, sequencing, and conditioning validators should be
registered as deterministic V2 rule modules behind the validation service.
They must accept a shared immutable V2 validation context, return stable
machine-readable findings, and remain independently testable. They must not be
added to the legacy rule registry or called directly by endpoint handlers.

## Compatibility projection

`toLegacyProgramme` is an explicit, test-only/application-controlled
projection. It requires legacy-only availability and equipment inputs, selects
the first representative cycle from each phase, maps at most seven cycle days,
and adds a compatibility assumption and warning. It does not claim later V2
weeks are identical and is not wired into production generation.

The current refinement applier remains typed for legacy programmes and rejects
schema version 2.0 at runtime.
