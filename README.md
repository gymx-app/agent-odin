# Agent Odin

**GymX's AI-powered programme generation engine.**

Agent Odin is the intelligence service behind GymX. It accepts an athlete profile, reasons about training strategy using an AI agent backed by OpenAI or Anthropic, builds a periodised multi-phase programme with evidence-based exercise prescriptions, validates it against 20+ rule categories, self-repairs failures, and returns the result — all within a single API call.

```
Athlete Profile → Normalisation → AI Strategy → Phase Generation → Validation → Self-Repair → Programme
```

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Programme Generation Pipeline](#programme-generation-pipeline)
- [Planner Versions](#planner-versions)
- [Validation Engine](#validation-engine)
- [Exercise Library](#exercise-library)
- [Security](#security)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Design Documentation](#design-documentation)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Serverless                       │
│  ┌──────────┐  ┌────────────────────────────────────────┐   │
│  │  Health   │  │       Generate Programme (POST)        │   │
│  │  (GET)    │  │                                        │   │
│  └──────────┘  │  Auth → Normalize → Plan → Validate    │   │
│                │                                        │   │
│                └───────────┬──────────┬─────────────────┘   │
│                            │          │                     │
│                    ┌───────▼──┐  ┌────▼──────────┐          │
│                    │ Supabase │  │ OpenAI /       │          │
│                    │ Auth+DB  │  │ Anthropic LLM  │          │
│                    └──────────┘  └───────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

**Stack**: TypeScript (ESM) · Node.js · Vercel Serverless · Supabase · OpenAI · Anthropic · Zod

**Core numbers**: ~33,000 lines of source across 212 files · 83 test suites · 614 tests · 20+ validation rule categories

## API Reference

### Versioned Routes (recommended)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/health` | Service health check |
| `POST` | `/api/v1/odin/generate-programme` | Authenticated programme generation |

### Legacy Routes (still active)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/odin/generate-programme` | Authenticated programme generation |

### Authentication

All generation requests require a Supabase access token:

```http
Authorization: Bearer <supabase-access-token>
```

### Request

```http
POST /api/v1/odin/generate-programme
Content-Type: application/json
```

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
  "planner_version": "ai_agent_v1",
  "start_date": "2026-06-28"
}
```

The `athlete` object is validated through `AthleteInputSchema`. Request bodies are limited to 64 KiB.

### Response

```json
{
  "success": true,
  "data": {
    "source": "ai_generated",
    "planner_version": "ai_agent_v1",
    "schema_version": "2.0",
    "programme": { },
    "validation": { },
    "generation": { }
  }
}
```

### Error Response

All errors follow a consistent envelope:

```json
{
  "success": false,
  "error": {
    "code": "ATHLETE_PROFILE_INVALID",
    "message": "Athlete profile failed validation.",
    "details": null
  }
}
```

Error codes are typed as a string literal union (`OdinErrorCode`) for compile-time safety. See `src/shared/errors/odin-errors.ts` for the full list.

## Programme Generation Pipeline

### 1. Authentication & Input Validation

The bearer token is verified via Supabase. The athlete input is parsed and validated through Zod schemas with strict typing.

### 2. Athlete Normalisation

Raw athlete input is normalised into a rich training profile:

- **Training status classification** — beginner / intermediate / advanced based on training history
- **Weekly training minutes** — derived from available days and session duration
- **Equipment capabilities** — mapped from equipment level to available movement patterns
- **Recovery capacity** — estimated from age, training status, and lifestyle factors
- **Health flags** — injury restrictions, contraindicated movements, required modifications
- **Injury interpretation** — unknown or ambiguous injury descriptions are interpreted via AI (OpenAI or Anthropic) to map to specific anatomical areas and restrictions
- **Nutrition state & weight change trajectory** — goal-driven macro context
- **Sport interference** — secondary sport demands factored into recovery budgets
- **Programme horizon & confidence** — how far to plan and how much to trust inputs

### 3. AI Agent Strategy Generation (`ai_agent_v1`)

The AI agent receives the normalised profile and reasons about the optimal training strategy:

- **Phase sequencing** — determines the macro-cycle: which phases (hypertrophy, strength, peaking, deload, realization) in what order
- **Split selection** — full body, upper/lower, push/pull/legs based on frequency and goals
- **Volume budgeting** — weekly sets per muscle group, distributed across sessions
- **Progression model** — how load, volume, and intensity advance week-to-week

The agent has access to tools for searching the exercise library, checking volume compliance against evidence-based guidelines, and retrieving evidence rules.

### 4. Phase-by-Phase Programme Construction

Each phase is generated with full context of prior phases:

- Session construction with warmup, main work, and conditioning
- Exercise selection from the approved library with substitution groups
- Prescription building (sets, reps, RPE, tempo, rest periods)
- Exercise sequencing optimised for fatigue management
- Conditioning programming (modality, placement, intensity, progression)

### 5. Validation (20+ Rule Categories)

Every generated programme passes through a deterministic validation engine:

| Category | What It Checks |
|----------|---------------|
| Structural | Schema conformance, required fields, phase/week/session counts |
| Strategy | Goal alignment, split appropriateness, volume distribution |
| Phase | Phase ordering, deload placement, progressive overload |
| Week | Week type progression, load variation, recovery weeks |
| Session | Duration within bounds, balanced muscle targeting |
| Exercise Reference | All exercise IDs exist in the approved library |
| Exercise Sequence | No conflicting supersets, appropriate ordering |
| Prescription | Sets/reps/RPE within evidence-based ranges |
| Movement Balance | Push/pull ratio, bilateral balance, antagonist pairing |
| Duration | Session time estimates within athlete constraints |
| Equipment | All exercises compatible with available equipment |
| Athlete Constraints | Injury restrictions respected, contraindicated movements avoided |
| Fatigue | Weekly fatigue budget not exceeded, recovery adequate |
| Warmup | Appropriate warmup prescription for main movements |
| Recovery | Minimum rest between same-muscle sessions |
| Calendar | Day distribution matches athlete availability |
| Conditioning | Interference risk, modality appropriateness |
| Progression | Progressive overload across weeks |
| Naming | Exercise names match canonical library names |
| Goal Specificity | Programme specificity matches stated goals |
| Programme Coherence | Cross-phase consistency, no contradictions |

### 6. Self-Repair Loop

When validation finds issues, the system enters a self-repair loop:

1. Validation failures are fed back to the AI agent with specific failure context
2. The agent re-generates the failing phase with corrections
3. Re-validation confirms the repair
4. Up to 3 retries per phase, with 1 full strategy replan if all phase retries exhaust

### 7. Programme Assembly & Response

The validated programme is assembled with:
- Three-way rationale summary (strategy rationale, phase rationales, overall summary)
- Generation metadata (tokens used, stage durations, retry counts)
- Full validation report

## Planner Versions

| Version | Type | Description |
|---------|------|-------------|
| `ai_agent_v1` | AI Agent | **Default.** Multi-turn AI agent with tool use, self-repair, and evidence-based reasoning |
| `longitudinal_v1` | Deterministic + AI | Multi-phase deterministic planner with optional LLM refinement |
| `legacy_v1` | Deterministic | Single-phase baseline planner (original) |

The active planner version is controlled by `ODIN_DEFAULT_PLANNER_VERSION` and `ODIN_ALLOWED_PLANNER_VERSIONS`. Requests for a disabled version return `PLANNER_VERSION_DISABLED`.

## Exercise Library

Odin uses a curated, approved exercise library loaded from Supabase. Every exercise has:

- Canonical ID (stable contract across versions)
- Movement pattern classification (push, pull, hinge, squat, carry, etc.)
- Equipment requirements
- Muscle group targeting (primary, secondary, tertiary)
- Difficulty grading

The library is cached in-memory with a 5-minute TTL for performance. Exercise IDs are validated at both generation time and in the validation engine — no model-hallucinated exercise can enter a programme.

## Security

- **CORS**: Strict origin allowlist; no wildcard origins; localhost allowed only in development
- **Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Cache-Control: no-store`
- **Request ID**: Sanitised against injection (alphanumeric + dashes/underscores, max 128 chars)
- **Error details**: Production responses never leak internal error messages or stack traces
- **Input validation**: All API boundaries use Zod schemas with strict typing — no `z.any()`
- **Body limits**: 64 KiB maximum request body
- **Auth**: Supabase token verification on all mutation endpoints
- **Logging**: No authorization headers, tokens, request bodies, athlete profiles, injury notes, prompts, model responses, or provider errors are logged

## Environment Configuration

Copy `.env.example` and configure:

### Required

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |

### AI Generation (required for `ai_agent_v1`)

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_GENERATION_PROVIDER` | `openai` | LLM provider: `openai` or `anthropic` |
| `OPENAI_API_KEY` | — | OpenAI API key |
| `OPENAI_GENERATION_MODEL` | — | Model for programme generation |
| `OPENAI_GENERATION_TIMEOUT_MS` | `55000` | Generation request timeout |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `ANTHROPIC_MODEL` | — | Anthropic model ID |
| `ANTHROPIC_TIMEOUT_MS` | `55000` | Anthropic request timeout |

### LLM Refinement (optional, for `legacy_v1` / `longitudinal_v1`)

| Variable | Default | Description |
|----------|---------|-------------|
| `ODIN_LLM_REFINEMENT_ENABLED` | `false` | Enable LLM refinement for deterministic planners |
| `OPENAI_API_KEY` | — | Required when refinement is enabled |
| `OPENAI_MODEL` | — | Required when refinement is enabled |
| `OPENAI_TIMEOUT_MS` | `20000` | Refinement request timeout |
| `OPENAI_MAX_RETRIES` | `1` | Max retries for refinement calls |

### Planner Control

| Variable | Default | Description |
|----------|---------|-------------|
| `ODIN_DEFAULT_PLANNER_VERSION` | `legacy_v1` | Default planner when not specified in request |
| `ODIN_ALLOWED_PLANNER_VERSIONS` | `legacy_v1,longitudinal_v1,ai_agent_v1` | Comma-separated allowed versions |
| `ODIN_LONGITUDINAL_PLANNER_ENABLED` | `false` | Enable longitudinal planner |
| `ODIN_AI_AGENT_PLANNER_ENABLED` | `true` | Enable AI agent planner |

### General

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment: `development`, `test`, `production` |
| `APP_VERSION` | `0.1.0` | Application version string |
| `ALLOWED_ORIGINS` | — | Comma-separated CORS origin allowlist |
| `LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `ODIN_GENERATION_TIMEOUT_MS` | `60000` | Overall generation deadline |

## Local Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Lint
npm run lint

# Format check
npm run format:check

# Run tests
npm test

# Watch mode
npm run test:watch

# Build
npm run build

# Start local API (via Supabase CLI)
npm run dev:api
```

## Deployment

### Vercel (Primary)

The API is deployed as Vercel Serverless Functions. Routes are defined in `vercel.json` with `/api/v1/` versioned prefixes.

### Supabase Edge Functions (Secondary)

Edge function wrappers in `supabase/functions/` call the same handler code bundled via esbuild:

```bash
# Bundle and deploy
npm run deploy:functions
```

## Project Structure

```
agent-odin/
├── api/                          # Vercel serverless entry points
│   ├── health.ts                 # GET /api/health
│   └── odin/
│       └── generate-programme.ts # POST /api/odin/generate-programme
├── src/
│   ├── application/              # Application services (orchestration)
│   ├── domain/                   # Domain models and schemas
│   │   ├── athlete/              # Athlete input schemas and types
│   │   ├── exercise/             # Exercise schema, types, taxonomy
│   │   ├── programme/            # Programme schemas (v1 + v2)
│   │   └── shared/               # Shared domain enums
│   ├── exercises/                # Exercise library, filtering, eligibility
│   ├── infrastructure/           # Cross-cutting concerns
│   │   ├── config/               # Environment parsing (Zod-validated)
│   │   ├── http/                 # Handler, CORS, request parsing, responses
│   │   ├── logging/              # Structured logger with AsyncLocalStorage
│   │   └── supabase/             # Auth and admin client wrappers
│   ├── llm/                      # LLM integration
│   │   ├── ai-generation/        # AI agent planner (strategy, phases, tools)
│   │   ├── refinement*.ts        # V1 refinement (legacy)
│   │   └── v2-refinement*.ts     # V2 refinement (longitudinal)
│   ├── normalization/            # Athlete profile normalisation pipeline
│   ├── planning/                 # Deterministic planning engine
│   │   ├── calendar/             # Training day scheduling
│   │   ├── conditioning/         # Conditioning and finisher programming
│   │   ├── exercises/            # Exercise selection and prescription
│   │   ├── fatigue/              # Fatigue budget management
│   │   ├── intensity/            # Intensity planning
│   │   ├── phases/               # Phase sequencing and deload policy
│   │   ├── progression/          # Load progression policies
│   │   ├── sequencing/           # Exercise ordering within sessions
│   │   ├── sessions/             # Session construction
│   │   ├── strategy/             # Training strategy selection
│   │   ├── templates/            # Split templates (2-6 day)
│   │   ├── volume/               # Volume budgeting per muscle group
│   │   ├── warmup/               # Warmup and ramp-up set planning
│   │   └── weeks/                # Week-level progression
│   ├── repair/                   # Programme self-repair service
│   ├── repositories/             # Data access (Supabase)
│   ├── shared/                   # Shared utilities and error types
│   └── validation/               # 20+ validation rule categories
├── tests/                        # 83 test suites, 614 tests
├── fixtures/                     # Test fixtures and seed data
├── docs/                         # Architecture documentation
├── supabase/                     # Edge functions and migrations
└── vercel.json                   # API versioning rewrites
```

## Design Documentation

Detailed architecture docs live in `docs/`:

| Document | Topic |
|----------|-------|
| [Architecture History](docs/architecture-history.md) | Evolution of the system design |
| [Athlete Input V2](docs/athlete-input-v2.md) | Enriched athlete input model |
| [Programme Schema V2](docs/programme-schema-v2.md) | Longitudinal programme schema |
| [Strategy & Phase Planner V2](docs/strategy-and-phase-planner-v2.md) | Phase sequencing and strategy |
| [Calendar Planner V2](docs/calendar-planner-v2.md) | Training day scheduling |
| [Session Construction V2](docs/session-construction-v2.md) | Session building pipeline |
| [Conditioning Planner V2](docs/conditioning-planner-v2.md) | Conditioning programming |
| [Warmup & Sequencing V2](docs/warmup-and-exercise-sequencing-v2.md) | Warmup and exercise ordering |
| [Week Progression V2](docs/week-progression-planner-v2.md) | Weekly progression model |
| [Validation Architecture](docs/validation-architecture.md) | Validation engine design |
| [E2E Longitudinal Validation](docs/end-to-end-longitudinal-validation.md) | Integration test strategy |

## Authority Boundary

Odin **may**:
- Verify Supabase access tokens
- Accept and normalise athlete profiles
- Generate programmes using AI or deterministic planners
- Validate programmes against evidence-based rules
- Self-repair validation failures
- Return programme, validation, and generation metadata

Odin **may not**:
- Create or update athlete profiles
- Persist generated programmes
- Activate, archive, or finalise programmes
- Prescribe exact weights (RPE-based only)
- Bypass validation or self-repair rules

A separate user-authorised application service owns approval and programme persistence.

## Data Handling

Athlete and health-adjacent inputs are sensitive. Odin processes them transiently for programme generation. Request logging excludes authorisation headers, tokens, request bodies, athlete profiles, injury notes, prompts, model responses, service-role keys, and raw provider errors.

## License

Private. Copyright GymX.
