# agent-odin

`agent-odin` is the future programme-planning intelligence service for the GymX React + Vite PWA. It will generate structured, personalised, periodised exercise programmes from athlete profiles, goals, equipment availability, movement restrictions, an approved exercise library, deterministic programming rules, and an optional LLM refinement layer.

## Phase 3 scope

Phase 3 adds a deterministic exercise knowledge model on top of the Phase 0 domain contracts, Phase 1 deployable service foundation, and Phase 2 athlete normalization.

Included:

- Plain Vercel Function support for `GET /api/health`.
- Shared API success and error response contracts.
- Typed application errors and framework-independent endpoint handling.
- Zod-based environment configuration.
- Reusable CORS handling.
- Request IDs and structured request logging.
- Focused Vitest coverage for the service foundation.
- A pure `normalizeAthlete(input)` pipeline that converts `AthleteInput` into the existing `NormalizedAthleteProfile` schema.
- Deterministic calculations for weekly training minutes, weight-change direction, programme horizon, recovery capacity, injury movement tags, health flags, assumptions, and programme confidence.
- Structured exercise schemas, taxonomies, eligibility checks, equipment compatibility, filtering, substitution ranking, and a curated seed exercise library.

The Phase 0 domain schemas remain framework independent under `src/domain`. Phase 3 extends the normalized athlete profile with structured movement restrictions while preserving the existing flat `restricted_movement_tags` compatibility field.

## Architecture

- `api/` contains thin Vercel Function entrypoints.
- `src/infrastructure/config` owns environment parsing and typed configuration.
- `src/infrastructure/http` owns response contracts, CORS, request IDs, and endpoint wrapping.
- `src/infrastructure/logging` owns structured console logging.
- `src/shared/errors` owns application error types.
- `src/normalization` owns pure athlete-profile normalization calculations.
- `src/domain/exercise` owns exercise schemas and controlled exercise taxonomies.
- `src/exercises` owns pure exercise eligibility, equipment, filtering, substitution, and library validation utilities.
- `fixtures/exercises` owns the curated seed exercise library.
- `src/domain` remains independent of Vercel, HTTP, logging, storage, model providers, and UI concerns.

API handlers should call shared helpers rather than manually constructing response envelopes or error bodies.

## Normalization pipeline

`normalizeAthlete(input)` is exported from `src/normalization/athlete-normalizer.ts`. It:

- Preserves the original source input.
- Maps `fitness_level` directly to `training_age_category`.
- Calculates weekly training minutes as `available_days_per_week * session_duration_min`.
- Calculates internal weight change as absolute kg, percentage from start weight, and direction.
- Estimates a conservative programme horizon between 4 and 52 weeks.
- Maps injuries to generic movement restriction tags.
- Adds structured health flags for planning risks and data inconsistencies.
- Emits visible assumptions for missing recovery, training history, nutrition, timeline, InBody, and injury-detail data.
- Calculates programme confidence as `low`, `medium`, or `high`.

The pipeline is deterministic and does not call infrastructure, storage, authentication, Supabase, OpenAI, or any agent framework.

### Deterministic calculation approach

Fat-loss horizons use conservative percentage-of-bodyweight planning rates. Beginners with high body fat or elevated visceral fat can use a slightly higher planning bound, but the implementation still avoids automatically selecting an aggressive 1% weekly target. Intermediate and advanced athletes use the more conservative rate.

Muscle-gain horizons are based on requested scale-weight gain and do not imply that all gained weight is lean mass. Recomposition, strength, and endurance use goal-appropriate defaults by fitness level and available training time.

Recovery capacity is intentionally conservative because sleep, stress, occupation, and recovery markers are not yet collected. Advanced athletes do not automatically receive `high`.

Programme confidence uses a small score-based system:

- Blocking health flags force `low`.
- InBody data, known injury areas, directionally consistent targets, and clear availability improve confidence.
- Missing InBody data, unknown injury areas, goal-target mismatch, large weight-change requests, avoid-severity injuries, and numerous assumptions reduce confidence.
- Phase 2 rarely returns `high`; ordinary complete input without InBody generally returns `medium`.

### Assumptions and limitations

Health flags are not medical diagnoses. Injury restrictions are generic movement tags for later planning and are not replacement-exercise prescriptions. Unknown injury areas are surfaced as flags and assumptions rather than being silently ignored.

Phase 2 does not prescribe calories, nutrition plans, clinical interventions, exercises, programme templates, or final programme content.

## Exercise Knowledge Model

Phase 3 represents exercises as structured data rather than free-text names. Each exercise has a stable lowercase snake-case `id`, display name, status, exercise type, movement patterns, muscles, equipment, difficulty, laterality, skill and stability demands, fatigue costs, movement-demand scores, default rep/rest ranges, substitution group, contraindication tags, coaching notes, and aliases.

### Exercise taxonomy

Controlled taxonomies cover:

- Movement patterns: squat, hinge, horizontal and vertical push/pull, isolation patterns, carries, core patterns, LISS, and mobility.
- Muscle groups: major upper-body, lower-body, trunk, and arm groups used by the current planner.
- Equipment: bodyweight, common free weights, cables, machines, racks, bands, and LISS cardio machines.
- Movement demands: canonical injury-aware demand tags such as `loaded_deep_knee_flexion`, `high_spinal_compression`, `overhead_loading`, `high_wrist_extension`, and `deep_ankle_dorsiflexion`.

Taxonomy changes are contract changes and require tests plus fixture updates.

### Fatigue and movement-demand scores

Fatigue costs use bounded 0-5 scores for systemic, local, axial, and grip fatigue. Movement demands use bounded 0-5 scores for every supported demand tag. These scores are planning metadata only; they are not medical diagnoses or clinical risk estimates.

### Structured movement restrictions

`NormalizedAthleteProfile` now includes `movement_restrictions`, where each restriction contains:

- `tag`
- `severity`: `modify` or `avoid`
- `source_area`
- `notes`

The existing `restricted_movement_tags` array remains as a derived compatibility field. Duplicate restrictions are merged conservatively, and `avoid` wins over `modify` for the same tag.

### Eligibility behavior

`evaluateExerciseEligibility(exercise, normalizedProfile)` returns:

- `eligible`: no relevant movement restriction, active exercise, not explicitly excluded.
- `modifiable`: a `modify` restriction conflicts with a non-zero movement-demand score, or the exercise is experimental.
- `excluded`: an `avoid` restriction conflicts with a non-zero movement-demand score, the exercise ID is explicitly excluded, or the exercise is deprecated.

The eligibility layer does not prescribe replacements automatically.

### Equipment assumptions

Equipment compatibility is conservative:

- `full_gym` allows all supported equipment.
- `dumbbells_only` allows bodyweight, dumbbell, and bench exercises.
- `bodyweight` allows bodyweight only; pull-up bars are not assumed in Phase 3.
- `home_gym` allows bodyweight, dumbbell, resistance band, and bench exercises.

Mismatch results include structured missing-equipment reasons.

### Filtering and substitutions

`filterEligibleExercises` supports movement pattern, primary muscle, maximum difficulty, equipment compatibility, modifiable inclusion, and substitution-group filters. Results are sorted deterministically by eligibility, difficulty, systemic fatigue, axial fatigue, then exercise name.

`findExerciseSubstitutions` is deterministic and LLM-free. It removes the source exercise, filters out ineligible options, requires shared movement patterns, prefers the same substitution group and shared primary muscles, and returns ranking reasons.

### Seed library scope

The seed library contains a curated set of 50-70 structured exercises across squat, hinge, push, pull, isolation, shoulder, calves, carries, core, LISS, and mobility categories. It includes bodyweight, dumbbell, machine, cable, band, barbell, and cardio-machine options, with beginner-friendly alternatives and higher-skill compounds.

### Example normalization

Input excerpt:

```json
{
  "current_weight_kg": 82,
  "target_weight_kg": 74,
  "goal": "fat_loss",
  "available_days_per_week": 3,
  "session_duration_min": 45,
  "fitness_level": "beginner",
  "injuries": [],
  "inbody": null
}
```

Output excerpt:

```json
{
  "training_age_category": "beginner",
  "weekly_training_minutes": 135,
  "programme_horizon_weeks": 17,
  "recovery_capacity": "moderate",
  "movement_restrictions": [],
  "restricted_movement_tags": [],
  "excluded_exercise_ids": [],
  "health_flags": [],
  "assumptions": [
    "Sleep and stress data were not provided.",
    "Detailed training history was not provided.",
    "Current strength levels were not provided.",
    "Nutrition and calorie intake were not provided.",
    "Target timeline was not explicitly provided.",
    "InBody data was not provided.",
    "No injuries were reported in the source input."
  ],
  "programme_confidence": "medium"
}
```

## Local setup

```bash
npm install
cp .env.example .env
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

For local API execution with the Vercel CLI:

```bash
npm run dev:api
```

Then call:

```bash
curl http://localhost:3000/api/health
```

Opening `http://localhost:3000/` directly returns 404 because this service has no frontend or root static page.

## Available scripts

- `npm run typecheck` - run TypeScript without emitting files.
- `npm run lint` - run ESLint.
- `npm run format` - format the repository with Prettier.
- `npm run format:check` - check Prettier formatting.
- `npm test` - run Vitest once.
- `npm run test:watch` - run Vitest in watch mode.
- `npm run build` - emit compiled TypeScript and declarations to `dist`.
- `npm run dev:api` - run the Vercel local development server.

## Environment variables

Configuration is parsed once through the Zod environment loader. Application code should import the typed configuration object instead of reading `process.env` directly.

| Variable          | Required | Default       | Description                                    |
| ----------------- | -------- | ------------- | ---------------------------------------------- |
| `NODE_ENV`        | No       | `development` | One of `development`, `test`, or `production`. |
| `APP_VERSION`     | No       | `0.1.0`       | Version returned by the health endpoint.       |
| `ALLOWED_ORIGINS` | No       | empty list    | Comma-separated list of allowed CORS origins.  |
| `LOG_LEVEL`       | No       | `info`        | One of `debug`, `info`, `warn`, or `error`.    |

`ALLOWED_ORIGINS` values are trimmed and empty entries are removed.

## Health endpoint

`GET /api/health` returns HTTP 200:

```json
{
  "success": true,
  "data": {
    "service": "agent-odin",
    "version": "0.1.0",
    "status": "ok"
  }
}
```

The endpoint returns an `x-request-id` response header. If the request includes `x-request-id`, that value is reused.

Unsupported methods return HTTP 405 with an `Allow: GET, OPTIONS` header and the shared API error shape. `OPTIONS` requests are handled as CORS preflight requests.

## CORS

CORS allows configured origins from `ALLOWED_ORIGINS`. During development, localhost origins are also accepted. The helper allows `GET`, `POST`, and `OPTIONS`, and the `Content-Type` and `Authorization` headers.

Disallowed origins are rejected with a controlled error response. Wildcard origins are not used.

## Vercel deployment

This is an API-only Vercel project. It does not configure an output directory and does not require a `public` folder or static frontend build output. The TypeScript build emits library artifacts to `dist`, but `dist` is not a Vercel static output directory.

`vercel.json` explicitly declares TypeScript files under the root `api/` directory as Vercel Node functions and routes `/api/*` requests to the matching function file. The file `api/health.ts` is deployed as `/api/health`.

Set production environment variables in the Vercel project settings:

- `NODE_ENV=production`
- `APP_VERSION=0.1.0`
- `ALLOWED_ORIGINS=https://your-app.example`
- `LOG_LEVEL=info`

Deploy with the Vercel CLI or Git integration after running the local verification scripts.

## Intentionally not implemented

Phase 3 does not include Supabase, authentication, OpenAI integration, programme generation, phase planning, weekly volume allocation, exercise-selection programmes, vector search, embeddings, fuzzy matching, HTTP endpoints for exercise lookup, persistence, caching, rate limiting, calorie prescription, nutrition plans, or agent frameworks.
