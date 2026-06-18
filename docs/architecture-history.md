# Architecture history

Agent Odin was built incrementally:

- Foundation: framework-independent athlete and programme contracts.
- Normalization: deterministic profile normalization with visible assumptions.
- Exercise model: approved exercise IDs, metadata, eligibility, and substitutions.
- Planning: deterministic baseline programmes with exact set-level prescriptions.
- Validation: independent, deterministic programme validation.
- Persistence API: Supabase authentication, repositories, versioned programmes, and idempotency.
- Refinement: optional bounded OpenAI proposals with deterministic fallback and validation.
- Production hardening: atomic idempotency lifecycle, transactional persistence completion, single-operation programme reads, request limits, route validation, runtime reuse, and operational timings.

These labels describe implementation history only. The README documents the current product and is the authoritative operational overview.
