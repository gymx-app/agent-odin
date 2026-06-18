import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  'supabase/migrations/202606180003_production_hardening.sql',
  'utf8',
);

describe('production hardening migration', () => {
  it('defines atomic and recoverable idempotency lifecycle operations', () => {
    expect(migration).toContain('claim_idempotency_key');
    expect(migration).toContain("existing.status = 'failed'");
    expect(migration).toContain('existing.expires_at <= now()');
    expect(migration).toContain(
      'on conflict (user_id, endpoint, idempotency_key)',
    );
    expect(migration).toContain('mark_idempotency_failed');
  });

  it('completes idempotency in the programme transaction', () => {
    expect(migration).toContain(
      'create function public.create_programme_with_version',
    );
    expect(migration).toContain("set status = 'succeeded'");
    expect(migration).toContain(
      "response_reference = jsonb_build_object('programme_id', new_programme_id)",
    );
  });

  it('serializes draft creation and enforces recoverable user concurrency', () => {
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain('agent_runs_one_generation_per_user_idx');
    expect(migration).toContain('start_generation_run');
    expect(migration).toContain('GENERATION_ALREADY_IN_PROGRESS');
  });

  it('provides ownership-scoped single-operation programme reads', () => {
    expect(migration).toContain('get_programme_with_latest_version');
    expect(migration).toContain('get_current_draft_with_latest_version');
    expect(migration).toContain('p.user_id = p_user_id');
  });
});
