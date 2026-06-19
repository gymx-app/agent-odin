# Conditioning Planner and Concurrent Training V2

Conditioning Planner V2 converts longitudinal calendar placeholders into
structured, measurable prescriptions. It is deterministic and is not connected
to legacy V1 `liss_content`, persistence, or model refinement.

## Requirement and sport accounting

The planner selects no conditioning, minimum health, supportive,
developmental, performance, or maintenance work from the programme objective,
strategy, recovery state, activity, and reported sport. Sport calendar days are
represented as `sport_conditioning` so their duration, impact, intensity,
sprint exposure, and fatigue contribute to weekly load without generating a
duplicate workout.

## Modalities and restrictions

Controlled modality profiles centralize equipment needs, impact, eccentric
demand, lower-body demand, grip demand, lower-back demand, and movement
restriction tags. Selection prefers the lowest-conflict eligible modality.
Avoid restrictions exclude a modality; modify restrictions require explicit
modification metadata.

## Intensity and progression

Continuous work uses exact session-RPE targets or a controlled talk-test
label. Intervals specify exact work duration, recovery duration, interval
count, work intensity, and recovery intensity.

Beginners, aerobic-base work, and fat-loss support default to duration-first
progression. Performance conditioning uses interval-count progression. Deload
and maintenance weeks reduce or maintain easy exposure rather than removing it
automatically.

## Concurrent training

Programmes expose resistance, conditioning, or equal concurrent priority.
Resistance-priority combined sessions place low-conflict conditioning after
resistance. Conditioning-priority sessions may place key conditioning first.
Interference is graded from low to unacceptable using modality demand,
intensity, impact, duration, muscle overlap, order, recovery, and energy
availability.

## Weekly load and validation

Each week records formal and sport session counts, low/moderate/high intensity
minutes, high-impact minutes, sprint exposures, estimated fatigue, and
rationale. Independent validation checks modality eligibility, exact
intensity, interval structure, frequency, sport duplication, order,
interference, same-day metadata, progression, impact, sprint exposure, and
combined duration.

Detailed pace/power calibration, heart-rate reserve targets, automatic calendar
relocation, and conditioning exercise libraries remain deferred.
