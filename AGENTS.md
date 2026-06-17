# Agent Odin Instructions

- Domain schemas are contracts and must not be changed casually.
- Keep domain code independent of Vercel, Supabase, OpenAI, and UI concerns.
- Prefer pure functions.
- Future model output must be validated through these schemas.
- Do not add agent frameworks without explicit approval.
- Do not add fitness-science assumptions inside schema files unless they are structural invariants.
- Every schema change requires tests and fixture updates.
