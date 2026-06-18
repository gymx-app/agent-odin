import { beforeAll, describe, expect, it } from 'vitest';
import { beginnerFatLossAthlete } from '../../fixtures/athletes/valid-athletes.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { buildBaselineProgramme } from '../../src/planning/baseline-programme-planner.js';
import { ProgrammeRepository } from '../../src/repositories/programme.repository.js';
import {
  applyValidationSummary,
  validateProgramme,
} from '../../src/validation/programme-validator.js';
import { createQueryClient } from './test-supabase-client.js';

let row: Record<string, unknown>;

beforeAll(() => {
  const profile = normalizeAthlete(beginnerFatLossAthlete);
  const baseline = buildBaselineProgramme(profile, seedExercises);
  const validation = validateProgramme(baseline, profile, seedExercises);
  const programme = applyValidationSummary(baseline, validation);

  row = {
    id: '11111111-1111-4111-8111-111111111111',
    user_id: '22222222-2222-4222-8222-222222222222',
    name: programme.programme.name,
    goal_type: programme.programme.goal_type,
    status: 'draft',
    source: 'deterministic',
    programme_data: programme,
    validation_data: validation,
    refinement_data: {
      requested: false,
      applied: false,
      status: 'not_requested',
      reason_code: null,
      model: null,
      prompt_version: null,
      schema_version: null,
    },
    version_number: 1,
  };
});

describe('ProgrammeRepository', () => {
  it('creates programme and version 1 in one RPC result', async () => {
    const { client, calls } = createQueryClient({
      rpc: { data: row, error: null },
    });
    const repository = new ProgrammeRepository(client);

    const saved = await repository.createWithVersion({
      userId: row.user_id as string,
      replaceExistingDraft: false,
      status: 'draft',
      source: 'deterministic',
      programme: row.programme_data as never,
      validation: row.validation_data as never,
      refinement: row.refinement_data as never,
    });

    expect(saved.version).toBe(1);
    expect(calls.filter((call) => call.method === 'rpc')).toHaveLength(1);
    expect(calls.some((call) => call.method === 'from')).toBe(false);
  });

  it('retrieves the latest version with an ownership-scoped RPC', async () => {
    const { client, calls } = createQueryClient({
      rpc: { data: [{ ...row, version_number: 3 }], error: null },
    });

    const saved = await new ProgrammeRepository(client).getById(
      row.user_id as string,
      row.id as string,
    );

    expect(saved?.version).toBe(3);
    expect(calls).toContainEqual({
      method: 'rpc',
      args: [
        'get_programme_with_latest_version',
        { p_user_id: row.user_id, p_programme_id: row.id },
      ],
    });
  });

  it('rejects malformed stored JSON', async () => {
    const { client } = createQueryClient({
      rpc: {
        data: { ...row, programme_data: { invalid: true } },
        error: null,
      },
    });

    await expect(
      new ProgrammeRepository(client).getById(
        row.user_id as string,
        row.id as string,
      ),
    ).rejects.toMatchObject({ code: 'PROGRAMME_PERSISTENCE_FAILED' });
  });
});
