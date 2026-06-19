# Week Progression Planner V2

Week Progression Planner V2 converts the selected strategy, calendar, and phase
architecture into explicit deterministic weeks. It is not connected to the
live V1 preview route.

## Week construction

Supported week types are introduction, loading, overload, deload, testing, and
maintenance. Introduction weeks are used at onboarding and major phase
transitions. Overload is limited to suitable advanced accumulation blocks.
Testing requires a dated performance target. Deload weeks come from the phase
fatigue policy, not calendar arithmetic.

Planning factors use centralized bounds:

- volume: 0.50–1.40;
- intensity: 0.75–1.25;
- effort: 0.75–1.20.

Ordinary transitions progress one major factor at a time. Volume increases are
capped by training status. A return from a deload is an explicit exception.

## Volume allocation

The allocator creates weekly working-set targets, direct muscle budgets,
movement-pattern budgets, and session budgets before exercise selection.
Recent muscle volume is used when supplied; otherwise planning starts
conservatively with `RECENT_VOLUME_UNKNOWN_CONSERVATIVE_START`.

Explicit energy deficit and low recovery constrain volume. Excluded movement
demands receive zero budget and eligible patterns absorb only the remaining
bounded allocation. Indirect-set accounting remains zero until exercise
selection provides enough information for reliable credit.

Session budgets use a conservative duration model containing warm-up, setup,
execution, and rest allowance. Low-priority volume is implicitly capped by the
session's maximum feasible working sets. No infeasible budget is emitted.

## Intensity and effort

Each week records rep emphasis, loading intent, primary/secondary/accessory RPE
targets, an RPE ceiling, and failure-exposure policy. Beginners, calorie
deficits, and strength-primary work avoid failure exposure. Controlled
isolation-only exposure is available only for suitable advanced hypertrophy
planning.

The plan does not require percentage-of-1RM data and does not prescribe
weights.

## Progression

Progression conditions are machine-readable. Policies define success, hold,
regression, and next actions. Coarse equipment increments prefer rep
progression. Advanced strength models may select step, wave, or
performance-based loading.

## Fatigue and deloads

Every week has systemic, upper-body, lower-body, grip, lower-back, and
conditioning fatigue targets. Repeated high-load sport reduces lower-body and
conditioning budgets.

Deloads explicitly reduce volume, intensity, effort, conditioning demand, and
exercise complexity while preserving future movement familiarity.
Readiness-trigger metadata remains descriptive and is not executed at runtime.

## Validation

`week-validator.ts` independently checks:

- week-factor bounds;
- weekly and combined load spikes;
- deficit volume;
- muscle and movement budgets;
- excluded movement allocation;
- session set and duration feasibility;
- RPE targets and ceilings;
- failure exposure;
- testing justification;
- meaningful deload execution.

Planner output is never accepted solely because it came from a deterministic
module.

## Deferred work

Exercise selection, exercise sequencing, exact set prescriptions,
session-specific warm-ups, indirect volume credit, and detailed conditioning
prescriptions remain out of scope.
