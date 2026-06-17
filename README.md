# agent-odin

`agent-odin` is the future programme-planning intelligence service for the GymX React + Vite PWA. It will generate structured, personalised, periodised exercise programmes from athlete profiles, goals, equipment availability, movement restrictions, an approved exercise library, deterministic programming rules, and an optional LLM refinement layer.

## Phase 1 scope

Phase 1 turns the Phase 0 domain-contract repository into a small deployable Vercel web service foundation.

Included:

- Plain Vercel Function support for `GET /api/health`.
- Shared API success and error response contracts.
- Typed application errors and framework-independent endpoint handling.
- Zod-based environment configuration.
- Reusable CORS handling.
- Request IDs and structured request logging.
- Focused Vitest coverage for the service foundation.

The Phase 0 domain schemas remain framework independent under `src/domain`.

## Architecture

- `api/` contains thin Vercel Function entrypoints.
- `src/infrastructure/config` owns environment parsing and typed configuration.
- `src/infrastructure/http` owns response contracts, CORS, request IDs, and endpoint wrapping.
- `src/infrastructure/logging` owns structured console logging.
- `src/shared/errors` owns application error types.
- `src/domain` remains independent of Vercel, HTTP, logging, storage, model providers, and UI concerns.

API handlers should call shared helpers rather than manually constructing response envelopes or error bodies.

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

Vercel discovers TypeScript functions under the root `api/` directory by convention. The file `api/health.ts` is deployed as `/api/health`.

Set production environment variables in the Vercel project settings:

- `NODE_ENV=production`
- `APP_VERSION=0.1.0`
- `ALLOWED_ORIGINS=https://your-app.example`
- `LOG_LEVEL=info`

Deploy with the Vercel CLI or Git integration after running the local verification scripts.

## Intentionally not implemented

Phase 1 does not include Supabase, authentication, OpenAI integration, programme generation, exercise selection, programme validators, persistence, caching, rate limiting, or agent frameworks.
