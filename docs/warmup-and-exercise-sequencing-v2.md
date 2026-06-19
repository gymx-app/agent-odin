# Warm-up Planning and Exercise Sequencing V2

This checkpoint finalizes resistance sessions produced by Session Construction
V2. It is deterministic, operates only on already-selected approved exercises,
and is not connected to the legacy V1 preview path.

## Warm-up planning

Warm-ups use controlled activity names and the selected session patterns. The
planner may add a pulse raiser, dynamic mobility, targeted clinician-directed
mobility, movement rehearsal, and exercise-specific ramp-up sets. Every item
has an exact duration or repetition target and machine-readable rationale.

The first priority exercise receives one to three ramp-up sets based on week
type, training status, technical demand, power role, and intensity intent.
Ramp-up sets never count toward working volume and never prescribe a weight.

Brief targeted mobility is permitted when a clinician restriction requires it.
Prolonged static stretching is omitted before selected power work. Short
sessions compress general preparation while retaining movement rehearsal,
clinician-required preparation, and ramp-up work.

## Sequence candidates and constraints

The sequencer builds deterministic strict-priority, technical-priority, and
protected equipment-grouping candidates. An explicit specialised session may
also produce a specialisation-first isolation candidate.

Candidates are rejected when they place power after meaningful fatigue, grip
fatigue before a priority pull, lower-back fatigue before a priority hinge or
unsupported row, or fatiguing core work before a high-stability movement.
Excluded exercises and materially delayed primary work are also hard failures.

Pre-exhaust is never inferred. A priority isolation exercise may move early
only when the session or phase explicitly supports specialisation, and the
exception is recorded.

## Scoring and tie-breaking

Weights are centralized in `sequence-policies.ts`:

- priority preservation: 25
- power preservation: 15
- technical quality: 15
- fatigue interference: 25
- equipment efficiency: 10
- duration efficiency: 10

Equipment efficiency cannot outweigh adaptation quality. Equal scores prefer
fewer policy exceptions, earlier primary work, lower fatigue interference,
fewer equipment transitions, fewer changes from slot priority, and finally the
lexical candidate ID.

## Duration and bounded repair

Final duration includes exact warm-up time, ramp-up execution, working sets,
prescribed rest, sequence-dependent setup transitions, and cooldown allowance.
One repair pass removes nonessential warm-up components and shortens the pulse
raiser while preserving rehearsal, ramp-ups, and clinician-required work. The
planner fails if the session still exceeds its maximum.

## Validation

Independent validators check warm-up specificity, exact component targets,
ramp-up presence and bounds, static-stretch conflicts, clinician preparation,
display order, sequence rationale, power placement, grip/lower-back/core
dependencies, unsupported pre-exhaust, and duration after finalization.

## Deferred

Detailed conditioning generation, supersets, model refinement, persistence
changes, and automatic exercise substitution during sequencing remain
deferred.
