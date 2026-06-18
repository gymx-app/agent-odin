import type { AthleteGoalSchema } from '../domain/shared/domain-enums.js';
import { OdinProgrammeSchema } from '../domain/programme/programme.schema.js';
import { odinError } from '../shared/errors/odin-errors.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import { ProgrammeValidationReportSchema } from '../validation/validation-report.schema.js';
import { RefinementMetadataSchema } from '../llm/refinement.schema.js';
import type { SupabaseClientLike } from '../infrastructure/supabase/supabase.types.js';
import type {
  ProgrammeCreateInput,
  ProgrammeSource,
  ProgrammeStatus,
  SavedProgramme,
} from './repository.types.js';

type ProgrammeRow = {
  id: string;
  user_id: string;
  name: string;
  goal_type: typeof AthleteGoalSchema._type;
  status: ProgrammeStatus;
  source: ProgrammeSource;
  programme_data: unknown;
  validation_data: unknown;
  refinement_data: unknown;
  version_number: number;
};

const toSavedProgramme = (row: ProgrammeRow): SavedProgramme => {
  const parsed = OdinProgrammeSchema.safeParse(row.programme_data);
  const validation = ProgrammeValidationReportSchema.safeParse(
    row.validation_data,
  );
  const refinement = RefinementMetadataSchema.safeParse(row.refinement_data);

  if (!parsed.success || !validation.success || !refinement.success) {
    throw odinError(
      'PROGRAMME_PERSISTENCE_FAILED',
      'Stored programme is invalid.',
      500,
    );
  }

  return {
    id: row.id,
    userId: row.user_id,
    version: row.version_number,
    name: row.name,
    goalType: row.goal_type,
    status: row.status,
    source: row.source,
    programme: parsed.data,
    validation: validation.data as ProgrammeValidationReport,
    refinement: refinement.data,
  };
};

export class ProgrammeRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async createWithVersion(
    input: ProgrammeCreateInput,
  ): Promise<SavedProgramme> {
    if (!input.validation.passed) {
      throw odinError(
        'GENERATED_PROGRAMME_INVALID',
        'Invalid programmes cannot be persisted.',
        422,
      );
    }

    const rpcResult = await this.client.rpc?.<ProgrammeRow | ProgrammeRow[]>(
      'create_programme_with_version',
      {
        p_user_id: input.userId,
        p_name: input.programme.programme.name,
        p_goal_type: input.programme.programme.goal_type,
        p_status: input.status,
        p_source: input.source,
        p_programme_data: input.programme,
        p_validation_data: input.validation,
        p_refinement_data: input.refinement,
        p_schema_version: 1,
        p_replace_existing_draft: input.replaceExistingDraft,
        p_idempotency_endpoint: input.idempotency?.endpoint ?? null,
        p_idempotency_key: input.idempotency?.key ?? null,
        p_request_hash: input.idempotency?.requestHash ?? null,
      },
    );
    const row = Array.isArray(rpcResult?.data)
      ? rpcResult.data[0]
      : rpcResult?.data;

    if (rpcResult?.error?.message.includes('DRAFT_PROGRAMME_ALREADY_EXISTS')) {
      throw odinError(
        'DRAFT_PROGRAMME_ALREADY_EXISTS',
        'A draft programme already exists.',
        409,
      );
    }

    if (!row || rpcResult?.error) {
      throw odinError(
        'PROGRAMME_PERSISTENCE_FAILED',
        'Programme could not be saved with version 1.',
        500,
      );
    }

    return toSavedProgramme(row);
  }

  async getById(
    userId: string,
    programmeId: string,
  ): Promise<SavedProgramme | null> {
    const result = await this.client.rpc?.<ProgrammeRow | ProgrammeRow[]>(
      'get_programme_with_latest_version',
      { p_user_id: userId, p_programme_id: programmeId },
    );
    const row = Array.isArray(result?.data) ? result.data[0] : result?.data;

    if (result?.error) {
      throw odinError('PROGRAMME_NOT_FOUND', 'Programme was not found.', 404);
    }

    if (!row) {
      return null;
    }

    return toSavedProgramme(row);
  }

  async getCurrentDraft(userId: string): Promise<SavedProgramme | null> {
    const result = await this.client.rpc?.<ProgrammeRow | ProgrammeRow[]>(
      'get_current_draft_with_latest_version',
      { p_user_id: userId },
    );
    const row = Array.isArray(result?.data) ? result.data[0] : result?.data;

    if (result?.error) {
      throw odinError(
        'CURRENT_PROGRAMME_NOT_FOUND',
        'Current draft programme was not found.',
        404,
      );
    }

    if (!row) {
      return null;
    }

    return toSavedProgramme(row);
  }
}
