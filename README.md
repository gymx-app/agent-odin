# agent-odin

`agent-odin` is the future programme-planning intelligence service for the GymX React + Vite PWA. It will generate structured, personalised, periodised exercise programmes from athlete profiles, goals, equipment availability, movement restrictions, an approved exercise library, deterministic programming rules, and an optional LLM refinement layer.

## Phase 7 scope

Phase 7 adds optional OpenAI refinement to the authenticated Supabase-backed Odin API. The deterministic planner still creates the baseline, and the independent validator remains the final authority. The model proposes bounded patch operations rather than generating a programme from scratch.

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
- A pure `buildBaselineProgramme(profile, exercises, options?)` planner that emits a valid baseline `OdinProgramme`.
- A pure `validateProgramme(programme, profile, exercises)` engine that independently validates generated programmes and returns a structured report.
- A pure `applyValidationSummary(programme, report)` helper that copies validation results back into an `OdinProgramme` without mutating the source programme.
- Supabase Auth verification, server-side service-role persistence, RLS migrations, repository boundaries, idempotent generation, programme retrieval, and a versioned Postman collection.
- An optional provider-isolated OpenAI Responses API refinement layer using Structured Outputs and a strict Zod proposal schema.

The Phase 0 domain schemas remain framework independent under `src/domain`. Phase 4 extends the programme exercise prescription contract to support exact set-level prescriptions while keeping machine-readable progression boundaries. Phase 5 is still a library validation layer. Phase 6 adds authenticated HTTP endpoints but does not add OpenAI, Ragnar, automatic repair, queues, payments, coach accounts, or wearables.

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
- `src/planning` owns deterministic strategy selection, split selection, movement slots, exercise slot filling, exact prescriptions, duration estimation, progression policy, and programme compilation.
- `src/validation` owns deterministic programme validation, finding codes, category scoring, and validation-summary application.
- `src/infrastructure/supabase` owns Supabase clients and token verification.
- `src/repositories` owns Supabase persistence boundaries and validates JSONB before returning domain objects.
- `src/application` owns generation orchestration across normalization, planning, validation, persistence, agent runs, and idempotency.
- `src/llm` owns compact refinement context, prompt/schema versions, provider abstraction, OpenAI adapter, bounded proposal application, and deterministic acceptance policy.
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

## Baseline Programme Planner

`buildBaselineProgramme(profile, exercises, options?)` validates the normalized athlete profile, validates the approved exercise library, selects a strategy and split, builds a single Foundation phase, creates a seven-day template, fills movement slots with eligible exercises, assigns exact set-level prescriptions, estimates session duration, applies deterministic reductions when needed, and validates the final `OdinProgramme`.

OpenAI is intentionally absent from Phase 4. The baseline plan must be reproducible, inspectable, and testable before any future model layer can refine language or propose alternatives.

### Supported splits

- 2 days: Full Body.
- 3 days: Full Body.
- 4 days: Upper / Lower.
- 5 days: body-composition goals use 4 resistance days plus 1 LISS day; muscle gain uses a 5-day hybrid; endurance prioritizes LISS while preserving resistance work.
- 6 days: Push / Pull / Legs only for intermediate or advanced profiles without low recovery; otherwise a conservative hybrid fallback.
- 7 days: never 7 resistance days; active days are capped and at least one Rest day remains.

### Exact set-level prescriptions

Workout exercises contain exact `target_reps`, `target_rpe`, `rpe_ceiling`, `rest_seconds`, and `set_type` values for every set. Rep ranges remain only as `progression_bounds`; the user does not choose a value inside a range. Odin decides the starting target.

The first set is marked `calibration` so the athlete can choose a load expected to match the prescribed reps and RPE. The programme does not prescribe specific weight values.

### Progression boundaries

Phase 4 uses double progression as structured guidance: complete all prescribed sets at or below the RPE ceiling to increase target reps next time; complete the top progression bound to increase load next time and reset reps; miss the minimum target without exceeding the ceiling to maintain or reduce load. Live progression execution is left for future Ragnar logic.

### Naming and duration

Programme names are concise, such as `Fat Loss Base`, `Hypertrophy Base`, and `Strength Base`. The phase is always `Foundation`. Workout titles use canonical session names such as `Full Body`, `Upper Body — Strength`, `Lower Body — Quad Focus`, `Push`, `Pull`, `Legs`, `LISS Cardio`, and `Rest`.

Exercise names use common gym terminology. Grip, stance, and setup guidance belong in `tags` or `coaching_cues`, not long display names.

Duration estimation includes warm-up, cooldown, set execution, exact rest seconds, and transitions. Session duration is a hard constraint. If a workout is too long, the planner removes optional accessory slots first, then reduces lower-priority set counts, then reduces required work to a two-set minimum. If required movement patterns still cannot fit, the planner fails with a structured `PlannerError` and does not return a partial programme.

## Programme Validation

`validateProgramme(programme, profile, exercises)` independently evaluates an `OdinProgramme` against the normalized athlete profile and approved exercise library. It does not trust the planner's existing `validation_summary`, does not mutate the programme, does not repair invalid content, and does not call OpenAI, Supabase, authentication, persistence, or any agent framework.

The report contains `passed`, `status`, `overall_score`, per-category scores, structured findings, and summary counts. Status values are:

- `pass`: no errors or warnings.
- `pass_with_warnings`: warnings only.
- `fail`: at least one error.

Findings use stable machine-readable codes, severity (`info`, `warning`, `error`), category, concise message, nullable phase/day/exercise references, and optional metadata.

### Validation Categories

- `structure`: schema validity, phase/template consistency, weekday coverage, day type rules, display order, set numbering, dates, and phase week counts.
- `constraint_fit`: equipment compatibility, excluded exercises, and movement restrictions.
- `exercise_integrity`: approved exercise IDs, deprecated usage, duplicate exercises, metadata agreement, and display-name matching.
- `movement_balance`: weekly lower-body, hinge/posterior-chain, push, pull, core coverage, and push/pull exposure.
- `recovery_fit`: consecutive primary-muscle overlap, high axial loading, and high grip loading.
- `fatigue_management`: daily and weekly fatigue estimates from exercise fatigue metadata, set counts, and RPE targets.
- `goal_specificity`: goal-aligned weekly structure and calorie-burn guarantee rejection.
- `progression_quality`: deterministic double-progression wording, bounds, and absence of exact load prescription.
- `session_time_fit`: independently recalculated workout duration, LISS duration, and rest-day duration leakage.
- `prescription_quality`: exact target reps, RPE, ceilings, rests, progression bounds, and no specific weight values.
- `naming_quality`: concise programme labels, Foundation phase names, canonical workout titles, and approved exercise display names.

### Scoring

Each category starts at 100. Deductions are deterministic: `info` deducts 1 point, `warning` deducts 10 points, and `error` deducts 35 points. Critical errors such as schema failure, unknown or deprecated exercises, unavailable equipment, avoid-restriction violations, invalid exact prescriptions, specific weight prescription, and hard duration violations force their category score to 0. Scores are clamped from 0 to 100.

The overall score is a weighted average:

- `constraint_fit`: 15%
- `prescription_quality`: 15%
- `recovery_fit`: 12%
- `fatigue_management`: 12%
- `movement_balance`: 10%
- `goal_specificity`: 10%
- `progression_quality`: 10%
- `session_time_fit`: 8%
- `exercise_integrity`: 5%
- `structure`: 2%
- `naming_quality`: 1%

Scores are diagnostic planning signals, not proof of scientific optimality. A failed programme can still have a numeric score, but `status` remains `fail`.

### Movement, Recovery, And Fatigue Rules

Movement balance evaluates each phase week template separately. Push/pull balance uses weekly set counts for horizontal and vertical push patterns versus horizontal and vertical pull patterns. A difference up to 20% is acceptable, above 20% through 35% is a warning, and above 35% is an error. The difference formula is `abs(push_sets - pull_sets) / max(push_sets, pull_sets)`.

Recovery spacing checks consecutive days for repeated primary-muscle emphasis, high axial loading, and high grip loading. Fatigue uses exercise metadata multiplied by set count and average target RPE relative to 7, with extra warnings for low-recovery athletes exposed to high daily fatigue.

### Known Limitations

Phase 5 uses broad deterministic heuristics. It does not implement automatic programme repair, individualized volume landmarks, medical diagnosis, nutrition, live coaching, persistence, public HTTP validation, or LLM review. Future automatic repair or model refinement must run validation again and may not override validation errors.

## Supabase API

Phase 6 authenticates requests with Supabase access tokens. Clients send `Authorization: Bearer <token>`. `agent-odin` verifies the token with the Supabase anon client, derives the authenticated `user_id` from the verified user, and uses the service-role admin client only for server-side reads and writes. Request bodies never select a user ID.

Protected Supabase endpoints require:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GYMX_ALLOWED_ORIGIN` or `ALLOWED_ORIGINS`

These values are parsed by the central environment loader and are validated when the auth or admin Supabase client is created. This keeps `GET /api/health` available even when database credentials are intentionally absent. The service-role key must never be exposed to the browser, responses, Postman files, or logs.

### Database Model

The Phase 6 migration creates:

- `athlete_profiles`: one validated `AthleteInput` JSONB profile per Supabase user.
- `exercise_library`: approved exercise JSONB keyed by canonical exercise ID.
- `programmes`: saved programme JSON, validation report, status, source, and owner.
- `programme_versions`: immutable version records; generation creates version 1 atomically.
- `agent_runs`: safe generation lifecycle records without tokens, secrets, stack traces, or full profiles.
- `idempotency_keys`: persistent request keys scoped by user, endpoint, and key.

RLS allows users to select, insert, and update their own athlete profile; select their own programmes and versions; and read active exercises while authenticated. Normal frontend users do not insert generated programmes directly. Programme writes, version writes, agent-run writes, and idempotency writes are performed by the server service-role client.

### Generation Flow

`POST /api/odin/generate`:

1. Verify the Supabase bearer token.
2. Load the authenticated user’s stored athlete profile.
3. Normalize the profile.
4. Load and validate active approved exercises.
5. Build the deterministic baseline programme.
6. Validate the programme independently.
7. Reject failed validation.
8. Apply validation summary to a copied programme.
9. Persist programme and version 1 through `create_programme_with_version`.
10. Mark the agent run succeeded or failed.
11. Return the saved programme.

Generation defaults to `draft`; users should review before activation. If an existing draft is present and `replace_existing_draft` is false, the API returns `DRAFT_PROGRAMME_ALREADY_EXISTS`. When replacement is explicitly true, existing drafts are archived in the same database transaction before the new draft and version 1 are created. Active programmes are never automatically archived.

### Idempotency

`POST /api/odin/generate` accepts optional `Idempotency-Key`. The key is scoped to authenticated user and endpoint. The canonical request body is hashed and stored without tokens. Replaying the same body returns the original programme with HTTP 200. Reusing the key with a different body returns `IDEMPOTENCY_KEY_CONFLICT`; a still-running request returns `IDEMPOTENCY_REQUEST_IN_PROGRESS`.

### Endpoints

- `GET /api/health`: unauthenticated service health.
- `PUT /api/profile`: authenticated helper endpoint for local integration testing; body must match `AthleteInputSchema`.
- `POST /api/odin/generate`: authenticated deterministic generation.
- `GET /api/programmes/:id`: authenticated programme retrieval by owner.
- `GET /api/programmes/current`: authenticated latest draft retrieval.

All API handlers use the shared response envelope and error wrapper. They do not return stack traces, Supabase internal errors, bearer tokens, or secrets.

### Postman

The current collection is stored at `postman/agent-odin.phase7.postman_collection.json`. It uses collection variables:

- `baseUrl`
- `accessToken`
- `programmeId`
- `idempotencyKey`

`accessToken` is intentionally empty in git. The generation request test stores the returned `programme_id` into `programmeId` and asserts version 1, deterministic source, and validation status.

### Local Supabase Setup

1. Start Supabase locally or connect to a development Supabase project.
2. Apply migrations from `supabase/migrations`.
3. Generate exercise seed SQL with `npm run supabase:seed:exercises`.
4. Apply `supabase/seed.sql`.
5. Create or sign in a test user through Supabase Auth.
6. Put the access token into the Postman `accessToken` variable.
7. Save a profile with `PUT /api/profile`.
8. Generate with `POST /api/odin/generate`.
9. Retrieve with `GET /api/programmes/{{programmeId}}` or `GET /api/programmes/current`.

## Constrained LLM Refinement

Phase 7 supports three generation modes:

- `deterministic`: never calls OpenAI and saves the validated baseline.
- `llm_optional`: attempts refinement and safely falls back to the deterministic baseline on any provider, proposal, application, or validation failure.
- `llm_required`: development/testing mode that returns a controlled error when refinement cannot be accepted.

The model receives a compact planning context containing an age band, planning-relevant athlete fields, restrictions, health-flag summaries, the validated baseline, exact prescriptions, and at most five eligible alternatives per exercise slot. It never receives Supabase user IDs, email, bearer tokens, API keys, or raw database rows.

### Structured Proposal

The model returns a strict patch-style `ProgrammeRefinementProposal`. Allowed operations are exercise replacement, exercise reorder, bounded reps/RPE/rest/set-count changes, LISS duration adjustment, subtitle changes, coaching cues, assumptions, review triggers, or no change.

Programme names, phase names, workout titles, exercise display names, user identity, progression boundaries, and arbitrary programme paths are model-invariant. Specific weight prescriptions, unknown exercise IDs, unrestricted exercise lists, medical advice, and user-selected rep ranges are forbidden.

Prompt and schema versions are:

- `REFINEMENT_PROMPT_VERSION = odin_refinement_v1`
- `REFINEMENT_SCHEMA_VERSION = 1`

### Acceptance And Fallback

Every applied proposal is validated again by the full Phase 5 validator. Refinement is rejected when it introduces errors, lowers constraint fit, exercise integrity, prescription quality, session-time fit, or naming quality, or lowers overall score by more than two points. Baseline constraint fit must remain 100 when it started at 100.

One corrective retry is allowed only for structurally parsed proposals that fail bounded application or deterministic validation. Refusals, provider outages, malformed output, exhausted provider retries, and timeouts do not trigger a corrective loop. Optional mode falls back; required mode returns `LLM_REQUIRED_REFINEMENT_FAILED`.

Successful responses include safe refinement metadata: requested/applied/status, fallback reason code, configured model, prompt version, provider response ID, safe token counts, and accepted/rejected operation counts. Raw prompts, raw provider responses, hidden reasoning, and API keys are never returned.

### OpenAI Configuration

```text
ODIN_LLM_REFINEMENT_ENABLED=false
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_TIMEOUT_MS=20000
OPENAI_MAX_RETRIES=1
```

OpenAI credentials are required only when refinement is enabled. The model name comes from configuration, never from domain logic or the frontend. The SDK uses the Responses API without streaming and caps structured proposal output at 4,000 tokens.

### Postman Refinement Validation

Import `postman/agent-odin.phase7.postman_collection.json`. Run deterministic generation first, then optional generation with draft replacement. Confirm `source` is `llm_refined` when accepted or `deterministic` with fallback metadata. Exact set prescriptions and canonical labels must remain intact. Reusing the same idempotency key must return the saved programme without another provider call.

### Phase 7 Limitations

Phase 7 does not implement unrestricted generation, conversational chat, Ragnar, live autoregulation, automatic repair, medical or rehabilitation advice, nutrition, payments, coach-client access, wearables, Redis, queues, embeddings, vector search, streaming, fine-tuning, or background model jobs.

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

Phase 4 does not include Supabase, authentication, OpenAI integration, persistence, caching, Ragnar autoregulation, adaptive volume landmarks, nutrition or calorie prescription, vector search, embeddings, fuzzy matching, public programme-generation endpoints, or agent frameworks.
