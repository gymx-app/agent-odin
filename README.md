# agent-odin

Agent Odin is GymX's authenticated, stateless programme-preview service. It
accepts a complete transient athlete profile, builds a deterministic baseline,
independently validates it, optionally applies bounded OpenAI refinement, and
returns the preview without updating profiles or persisting programmes.

The deterministic planner is authoritative. Model output is untrusted until
schema validation, bounded application, and full programme validation succeed.

## Authority boundary

Odin may:

- verify a Supabase access token
- accept transient athlete planning input
- normalize that input deterministically
- use only bundled approved exercise IDs and metadata
- build and validate a programme preview
- optionally apply bounded model refinement
- return programme, validation, and refinement metadata

Odin may not:

- create or update athlete or user profiles
- write generated previews to GymX or Supabase
- activate, archive, or finalize programmes
- prescribe exact weights
- bypass deterministic planning or validation

A separate user-authorized application service must own approval and finalized
programme persistence.

## Public API

| Method | Endpoint            | Purpose                                      |
| ------ | ------------------- | -------------------------------------------- |
| `GET`  | `/api/health`       | Process health                               |
| `POST` | `/api/odin/preview` | Authenticated stateless programme generation |

The previous persistence-oriented endpoints return
`410 ENDPOINT_RETIRED`:

- `PUT /api/profile`
- `POST /api/odin/generate`
- `GET /api/programmes/current`
- `GET /api/programmes/:id`

## Authentication

`POST /api/odin/preview` requires:

```http
Authorization: Bearer <Supabase access token>
```

The token is verified through Supabase and supplies the authenticated identity.
The preview request may not select or impersonate another user.

## Preview request

```json
{
  "athlete": {
    "name": "Demo Athlete",
    "age": 32,
    "sex": "male",
    "current_weight_kg": 82,
    "target_weight_kg": 74,
    "height_cm": 178,
    "goal": "fat_loss",
    "available_days_per_week": 3,
    "session_duration_min": 45,
    "equipment": "full_gym",
    "fitness_level": "beginner",
    "injuries": [],
    "inbody": null
  },
  "refinement_mode": "deterministic"
}
```

`refinement_mode` values:

- `deterministic`
- `llm_optional`
- `llm_required`

The `athlete` object is validated through the authoritative
`AthleteInputSchema`. It is used only for the current request and is not stored
by Odin.

Preview bodies are limited to 64 KiB.

## Preview response

```json
{
  "success": true,
  "data": {
    "source": "deterministic",
    "programme": {},
    "validation": {},
    "refinement": {}
  }
}
```

The response intentionally contains no:

- `programme_id`
- persistence version
- draft or activation status
- approval claim

All errors use the shared envelope:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request body.",
    "details": null
  }
}
```

## Preview flow

1. Verify the Supabase bearer token.
2. Validate the transient athlete request.
3. Normalize the athlete deterministically.
4. Load Odin's bundled approved exercise library.
5. Build and validate the deterministic baseline.
6. Optionally request and apply bounded refinement.
7. Validate the result again.
8. Return the preview without persistence.

## Exercise library

The preview service uses Odin's bundled approved exercise library. Exercise IDs
remain stable contracts. Model-generated exercise names cannot enter a
programme unless they resolve to an approved ID supplied in refinement context.

The bundled library avoids requiring or mutating a GymX database table during
preview.

## Deterministic planning and validation

The planner honors equipment, movement restrictions, required movement slots,
and session duration. It does not use random selection or prescribe exact
weights.

The validator is deterministic and non-mutating. Avoid-restriction violations
are hard failures. Validation findings use stable machine-readable codes, and
no model may override a validation error.

## Optional LLM refinement

- `deterministic`: never calls a model
- `llm_optional`: falls back to the deterministic baseline
- `llm_required`: fails safely if refinement is unavailable or rejected

Model output cannot control persistence, exercise identity, programme naming,
or validation.

## Environment

Copy `.env.example` and configure:

- `NODE_ENV`
- `APP_VERSION`
- `ALLOWED_ORIGINS`
- `LOG_LEVEL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ODIN_GENERATION_TIMEOUT_MS`
- `ODIN_LLM_REFINEMENT_ENABLED`
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TIMEOUT_MS`,
  `OPENAI_MAX_RETRIES` when refinement is enabled

`SUPABASE_SERVICE_ROLE_KEY` is not required by the public preview path.

`ALLOWED_ORIGINS` is a comma-separated allowlist. Wildcard origins are not
supported; localhost is accepted automatically only in development.

## Local setup and testing

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run dev:api
```

Import `postman/agent-odin.postman_collection.json` for manual checks. The
collection contains no real tokens or secrets.

## Data handling

Athlete and health-adjacent inputs are sensitive. Odin uses them transiently for
preview generation. Request logging does not include authorization headers,
tokens, full request bodies, athlete profiles, injury notes, prompts, model
responses, service-role keys, or raw provider errors.

Never store hidden chain-of-thought or raw provider internals.
