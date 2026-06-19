# Calendar Planner V2

Calendar Planner V2 is an internal deterministic planner for longitudinal
programmes. The live V1 planner and `/api/odin/preview` continue using
`selectWeeklySplit()`.

## Pipeline

1. Candidate generation places fixed sport sessions, then enumerates complete
   resistance and conditioning schedules.
2. Hard constraints reject malformed cycles, unavailable-day use, frequency
   mismatches, missing sport sessions, invalid rolling schedules, and
   undocumented policy violations.
3. Valid candidates are scored for preferred-day fit, fatigue distribution,
   adjacent movement overlap, sport interference, rest distribution, and
   schedule simplicity.
4. Stable tie-breaking uses score, exception count, preferred-day fit,
   consecutive demand, overlap, sport interference, weekly preference, and
   lexical candidate ID.

Central weights and default spacing policies live in
`calendar-policies.ts`. No random selection is used.

## Supported templates

- Two- and three-day Full Body schedules
- Four-day Upper/Lower
- Five-day hybrid schedules, including 3-On/1-Off/2-On/1-Off and
  2-On/1-Off/3-On/1-Off
- Six-day weekly Push/Pull/Legs with an explicit density exception
- Eight-day rolling Push/Pull/Legs using 3-On/1-Off/3-On/1-Off

Explicit weekdays override defaults. When weekdays are absent, the result
includes `CALENDAR_DAYS_INFERRED_FROM_FREQUENCY` and reduced confidence.

## Sport and recovery

Sport sessions are fixed in the candidate before resistance placement. Sport
demand is derived from normalized intensity, body-region load, and impact
metadata. Primary sport increases adjacency penalties.

Recovery capacity changes candidate scoring and default consecutive-day
limits. It never overrides availability, cycle validity, or fixed sport days.
Age is not read directly by the calendar planner.

## Validation

`calendar-validator.ts` independently checks the selected V2 calendar. It does
not reuse planner scores. Stable findings cover cycle structure, unavailable
days, frequency, sport representation, dense schedule documentation, Full
Body spacing, movement overlap, and excessive rest blocks.

Calendar-specific concepts map to the existing validation report categories so
the legacy validation response shape remains unchanged.

## Limitations

This checkpoint places conditioning categories only; it does not prescribe
conditioning. Rolling cycles with fixed weekday sport schedules are not
resolved into calendar dates yet. Phase planning, week progression, exercise
selection, sequencing, and session-specific warm-ups remain out of scope.
