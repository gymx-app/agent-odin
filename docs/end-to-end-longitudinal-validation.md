# End-to-End Longitudinal Validation and Deterministic Repair

Programme Validation V2 dispatches by schema and planner version. Legacy V1
continues to use the unchanged rule-set façade. `longitudinal_v1` uses an
explicit registry covering calendar, strategy, phases, weeks, sessions,
warm-ups, exercise sequencing, conditioning, and cross-programme coherence.

## Reports

V2 reports retain the existing pass/fail, findings, score, category score, and
summary fields. They additionally expose safe programme metrics, evaluated rule
versions, and repair metadata. Errors always determine invalidity; scores never
override errors.

Metrics include phase/week/session counts, working sets, weekly sets by primary
muscle, duration summaries, demanding-day concentration, interference counts,
and deload count. Athlete identity and raw profile data are excluded.

## Repair

The repair engine permits only local allowlisted operations. The current
operations normalize exercise order, correct compatible RPE ceilings, reduce
conditioning duration, restore resistance-priority order, and shorten
nonessential preparation where supported. Structural identity failures,
clinician violations, impossible required slots, and unknown policies are not
repaired blindly.

Repairs run once with a maximum of ten operations. The complete programme is
then schema-validated and run through every longitudinal rule again. A repair
is accepted only if all errors are removed and the score does not worsen.
Partial invalid output is never accepted.

## Assembly

`buildLongitudinalProgramme` provides the deterministic V2 assembly boundary:

1. calendar;
2. strategy;
3. phases;
4. weeks, volume, intensity and fatigue;
5. resistance sessions;
6. warm-ups and exercise sequencing;
7. conditioning and sport accounting;
8. complete schema validation;
9. full validation;
10. one bounded repair pass and full revalidation when eligible.

This entry point is additive. The public V1 preview/generation and persistence
paths remain unchanged, and V2 model refinement remains disabled.
