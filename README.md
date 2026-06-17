# agent-odin

`agent-odin` is the future programme-planning intelligence service for the GymX React + Vite PWA. It will generate structured, personalised, periodised exercise programmes from athlete profiles, goals, equipment availability, movement restrictions, an approved exercise library, deterministic programming rules, and an optional LLM refinement layer.

## Phase 0 scope

Phase 0 implements domain contracts only:

- Athlete input contracts.
- Internal normalized athlete profile contracts.
- Structured Odin programme output contracts.
- Fixtures and Vitest coverage for valid contracts and structural invariants.

## Architecture direction

The domain layer is intentionally framework independent. Schemas live under `src/domain` and use Zod as the runtime validation boundary. Future HTTP handlers, storage adapters, model calls, and programme-generation services should depend on these contracts rather than redefining them.

## Local setup

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## Available scripts

- `npm run typecheck` - run TypeScript without emitting files.
- `npm run lint` - run ESLint.
- `npm run format` - format the repository with Prettier.
- `npm run format:check` - check Prettier formatting.
- `npm test` - run Vitest once.
- `npm run test:watch` - run Vitest in watch mode.
- `npm run build` - emit compiled TypeScript and declarations to `dist`.

## Intentionally not implemented

Phase 0 does not include HTTP endpoints, Vercel Functions, Supabase, OpenAI integration, programme-generation logic, exercise-selection logic, authentication, persistence, caching, or agent frameworks.
