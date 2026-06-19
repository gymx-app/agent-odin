# Strategy Selector V2 and Phase Planner

These modules are additive longitudinal planning boundaries. The live V1
planner continues to use `selectProgrammeStrategy()` and
`buildFoundationPhase()`.

## Strategy selection

`selectProgrammeStrategyV2()` generates multiple strategy candidates, rejects
hard incompatibilities, scores the remaining candidates, and selects one using
stable tie-breaking.

Scoring covers:

- stated-goal alignment;
- normalized training-status fit;
- calendar frequency and cycle compatibility;
- recovery capacity;
- explicit energy availability;
- sport load and priority;
- programme horizon;
- complexity and adherence fit.

Diet pattern and origin metadata are not strategy selectors. An explicit
calorie deficit constrains recoverable volume without replacing the athlete's
stated goal.

Hard constraints reject unsupported six-day PPL, undated competition peaks,
advanced progression for insufficient training status, excessive complexity
for short horizons, and development-incompatible maintenance strategies.

## Phase planning

`planProgrammePhases()` selects a deterministic template based on objective,
training status, horizon, periodization, and fatigue strategy. Canonical phase
names are used. The allocator:

- assigns every programme week exactly once;
- creates ordered, non-overlapping boundaries;
- trims optional complexity when minimum phase lengths exceed the horizon;
- distributes remaining weeks deterministically;
- gives recovery phases a valid one-week minimum;
- ends the final phase on the programme horizon.

Phase directions are explicit. Foundation establishes continuity,
accumulation increases recoverable demand, intensification raises loading,
recovery reduces volume and effort, and maintenance consolidates.

## Deload policy

Planned deloads are created only for `planned_deload` or `combined` fatigue
strategies. Recovery-phase starts are preferred. If no recovery phase exists,
a meaningful transition into intensification may be used. Week one and
arbitrary every-fourth-week placement are not used.

## Validation

Strategy and phase validators independently inspect the finished V2 contract.
They do not trust candidate scores. Findings cover goal/calendar/recovery fit,
training-status complexity, phase boundaries, duration, direction coherence,
realization/testing justification, and deload strategy and placement.

The new findings use existing validation report categories so the public
validation response shape remains unchanged.

## Current boundary

The phase planner returns architecture only. Detailed explicit weeks, exercise
selection, set prescriptions, conditioning prescriptions, sequencing, and
warm-ups remain out of scope. The live preview endpoint is unchanged.
