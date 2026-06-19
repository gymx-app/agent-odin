# Programme validation architecture

`ProgrammeValidationService` is the in-process façade for deterministic
programme validation. It is not a separately deployed service and does not
change the public preview API.

## Current flow

1. `validateProgramme(programme, profile, exercises)` remains the compatibility
   entry point used by generation, preview, refinement, repositories, and tests.
2. The compatibility function delegates to the singleton
   `programmeValidationService`.
3. `createValidationContext` creates the shared immutable-by-convention context,
   including the approved-exercise lookup map.
4. Input schema checks run before the registered rule modules.
5. The selected rule set runs in registration order.
6. Existing score calculation produces the unchanged
   `ProgrammeValidationReport`.

The current rule set is identified by
`programme-validation/v1`. Version selection is internal and is intentionally
not added to the validation response.

Each registered rule also has a stable ID and an integer implementation version.
Changing rule order, severity, thresholds, findings, or scoring expectations
requires a new rule-set version and regression updates. Pure refactors that
provably preserve findings may retain the current version.

## Registering future rules

Current generated-programme rules are registered in
`programme-validation-rules.ts`. Calendar, phase, sequencing, and conditioning
rules should be added as independent deterministic modules and then registered
in a new rule set, for example `programme-validation/v2`.

Registration requirements:

- keep each rule a pure `ProgrammeValidator` where possible;
- use stable machine-readable finding codes;
- add direct unit tests for the rule module;
- define its position explicitly because finding order is part of current
  deterministic output;
- add golden preview regression updates only when the behaviour change is
  intentional;
- never let an LLM register, suppress, or override findings.

## Legacy and longitudinal validation

Legacy programmes should first be adapted into the authoritative
`OdinProgramme` and normalized-profile contracts, then validated through an
explicit legacy rule set registered with a distinct version. Adaptation
findings must remain visible rather than silently repairing source data.

Longitudinal validation will require a dedicated context containing calendar,
programme history, completed sessions, and phase boundaries. Add a separate
context factory and typed rule registry beside the current generated-programme
registry, then expose it through an additional façade method. Do not add
optional historical fields to current rule modules or alter
`validateProgramme`; this keeps current generation behaviour isolated.

Potential future rule groups:

- calendar: date coverage, unavailable dates, and schedule collisions;
- phase: phase continuity, deload placement, and phase-boundary constraints;
- sequencing: workout ordering and repeated movement or fatigue exposure;
- conditioning: modality, intensity, and resistance-training interference.

These rule groups remain deterministic and run in-process.
