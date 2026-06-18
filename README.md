# agent-odin

Agent Odin is GymX's authenticated programme-generation service. It normalizes an athlete profile, builds a deterministic baseline programme, independently validates it, optionally applies bounded OpenAI refinement, and persists the accepted programme in Supabase.

The deterministic planner is authoritative. Model output is untrusted until schema validation, bounded application, and full programme validation succeed.

## Current capabilities

- Supabase bearer-token authentication and user-scoped persistence
- deterministic athlete normalization, exercise eligibility, planning, and validation
- exact set-level reps, RPE, RPE ceilings, and rest seconds
- optional bounded LLM refinement with deterministic fallback
- atomic programme and version-1 persistence
- recoverable, expiring idempotency with replay
- one in-progress generation per user
- request IDs, structured logs, stage timings, CORS, and body-size limits
- current-draft and programme-by-ID queries with ownership privacy

## Architecture

```text
GymX PWA
  → thin Vercel API handlers
  → application services
  → athlete normalization
  → deterministic baseline planner
  → independent programme validator
  → optional bounded LLM refinement
  → transactional Supabase persistence
```

Domain, normalization, planning, exercise, and validation code do not depend on Vercel, Supabase, OpenAI, or UI code. Repositories own database access and validate stored JSON through the domain Zod schemas.

## API

| Method | Endpoint                  | Purpose                                                           |
| ------ | ------------------------- | ----------------------------------------------------------------- |
| `GET`  | `/api/health`             | Process health; does not require Supabase or OpenAI configuration |
| `PUT`  | `/api/profile`            | Authenticated athlete-profile command API                         |
| `POST` | `/api/odin/generate`      | Generate and persist a draft programme                            |
| `GET`  | `/api/programmes/current` | Return the authenticated user's latest draft                      |
| `GET`  | `/api/programmes/:id`     | Return a user-owned programme by UUID                             |

`PUT /api/profile` is the supported profile-write boundary for this repository. The authenticated token supplies the user ID; body-supplied user IDs are rejected by the strict schema.

Generate bodies are limited to 8 KiB. Profile bodies and the shared fallback are limited to 64 KiB. Oversized requests return `413 PAYLOAD_TOO_LARGE`. Programme route IDs are UUID validated before storage access and malformed IDs return `400 INVALID_PROGRAMME_ID`.

## Authentication and privacy

Protected endpoints require `Authorization: Bearer <Supabase access token>`. The verified token is the only source of user identity. The service-role key is server-side only. Programme lookups always include the user ID, and missing or cross-user IDs return the same 404 response.

Logs contain request IDs, statuses, stable error codes, durations, and generation-stage timings. They do not contain bearer tokens, request bodies, athlete profiles, injury notes, prompts, model responses, service-role keys, or raw provider errors.

## Generation flow

1. Authenticate the user.
2. Atomically claim or replay the idempotency key when supplied.
3. Load the athlete profile.
4. Start the generation run, enforcing one active generation per user.
5. Normalize the athlete and load approved exercises.
6. Build and validate the deterministic baseline.
7. Optionally request and apply a bounded refinement proposal.
8. Validate the resulting programme again.
9. Atomically create the programme, create version 1, replace a draft when requested, and complete idempotency.
10. Complete the generation run and return the saved programme.

The database transaction is the single authority for draft conflicts. `replace_existing_draft=false` returns `409 DRAFT_PROGRAMME_ALREADY_EXISTS`; `true` archives drafts in the same transaction. Active programmes are not archived.

## Idempotency

`POST /api/odin/generate` accepts `Idempotency-Key`. Scope is `(user ID, endpoint, key)`, and the relevant request body is hashed with recursively canonicalized JSON and SHA-256.

- identical succeeded requests replay the stored programme
- a changed request conflicts
- non-expired work reports in progress
- expired work is reclaimable
- failed identical work is retryable
- programme creation, version creation, and success finalization commit together

Replays do not call OpenAI and do not create another programme.

## Deterministic planning and validation

The planner uses approved exercise IDs only, honors equipment and movement restrictions, preserves required movement slots, treats session duration as a hard constraint, and does not prescribe weights. User-facing prescriptions contain exact reps; rep ranges remain internal progression boundaries.

The validator is deterministic and non-mutating. Avoid-restriction violations are hard failures. Validation codes are stable machine-readable contracts, and no model may override a validation error.

## Optional LLM refinement

Modes are:

- `deterministic`: never instantiate or call the provider
- `llm_optional`: safely fall back to the baseline on unavailable or rejected refinement
- `llm_required`: fail safely when refinement cannot produce an accepted result

The model receives approved exercise IDs and may propose only bounded schema-validated changes. It cannot control persistence, names, exact prescription invariants, or validation.

## Database model

Supabase migrations define:

- `athlete_profiles`
- `exercise_library`
- `programmes`
- `programme_versions`
- `agent_runs`
- `idempotency_keys`

RLS remains enabled. Service-role-only RPCs provide atomic idempotency claims, transactional programme creation, and one-operation programme/version reads. Required indexes cover user/status programme lookup, version lookup, agent runs, and idempotency expiry.

## Environment

Copy `.env.example` and configure:

- `NODE_ENV`
- `APP_VERSION`
- `ALLOWED_ORIGINS`
- `LOG_LEVEL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ODIN_GENERATION_TIMEOUT_MS`
- `ODIN_LLM_REFINEMENT_ENABLED`
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TIMEOUT_MS`, `OPENAI_MAX_RETRIES`

`ALLOWED_ORIGINS` is the canonical comma-separated CORS variable. `GYMX_ALLOWED_ORIGIN` remains temporarily accepted for compatibility but is deprecated and absent from `.env.example`. Wildcard origins are not supported; localhost is allowed automatically only in development.

## Local setup and testing

```bash
npm install
npm run supabase:seed:exercises
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run dev:api
```

Import `postman/agent-odin.postman_collection.json` for manual API checks. It contains no real credentials. Use collection variables for `baseUrl`, `accessToken`, `programmeId`, `idempotencyKey`, and `requestId`.

## Data classification

The service treats health-adjacent data as sensitive:

- identity data: Supabase user identifiers and authentication metadata
- athlete profile data: goals, availability, equipment, and training history
- body composition: weight and optional InBody measurements
- injuries and restrictions: user-supplied limitations and generic movement tags
- programme data: generated workouts and prescriptions
- performance data: not currently managed by Odin
- agent-run metadata: safe summaries, status, timings, and output references

Access is user-scoped, secrets remain server-side, and logging is minimized. Data retention and deletion policies remain operational requirements. This repository does not claim HIPAA, GDPR, SOC 2, or medical-device compliance.

## Operational limitations

- no distributed queue or background worker
- no automatic repair loop
- no Ragnar or workout-session autoregulation
- no exact weight prescription
- no conversational interface, embeddings, or vector search
- database and provider cancellation are limited to the capabilities exposed by their clients
- rate-limit integration is an application-boundary extension point; generation concurrency is enforced in PostgreSQL

Historical implementation notes are in `docs/architecture-history.md`.

## Future agent boundary

A future bounded internal agent may orchestrate application-layer capabilities after contracts, authorization, observability, and evaluation are mature. It must not expose planner or validator internals as public tool endpoints, bypass deterministic planning or validation, or control persistence directly.
