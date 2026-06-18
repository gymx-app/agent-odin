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
};

type ProgrammeVersionRow = {
  version_number: number;
};

type CreateProgrammeRpcResult = {
  programme_id: string;
  version_number: number;
};

const toSavedProgramme = (
  row: ProgrammeRow,
  version: number,
): SavedProgramme => {
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
    version,
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

  async assertNoDraft(userId: string): Promise<void> {
    const existing = await this.getCurrentDraft(userId);

    if (existing) {
      throw odinError(
        'DRAFT_PROGRAMME_ALREADY_EXISTS',
        'A draft programme already exists.',
        409,
      );
    }
  }

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

    const rpcResult = await this.client.rpc?.<CreateProgrammeRpcResult>(
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
      },
    );

    if (rpcResult?.error?.message.includes('DRAFT_PROGRAMME_ALREADY_EXISTS')) {
      throw odinError(
        'DRAFT_PROGRAMME_ALREADY_EXISTS',
        'A draft programme already exists.',
        409,
      );
    }

    if (!rpcResult?.data || rpcResult.error) {
      throw odinError(
        'PROGRAMME_PERSISTENCE_FAILED',
        'Programme could not be saved with version 1.',
        500,
      );
    }

    const saved = await this.getById(input.userId, rpcResult.data.programme_id);

    if (!saved) {
      throw odinError(
        'PROGRAMME_VERSION_PERSISTENCE_FAILED',
        'Programme version 1 could not be verified.',
        500,
      );
    }

    return saved;
  }

  async getById(
    userId: string,
    programmeId: string,
  ): Promise<SavedProgramme | null> {
    const result = await this.client
      .from<ProgrammeRow>('programmes')
      .select(
        'id,user_id,name,goal_type,status,source,programme_data,validation_data,refinement_data',
      )
      .eq('id', programmeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (result.error) {
      throw odinError('PROGRAMME_NOT_FOUND', 'Programme was not found.', 404);
    }

    if (!result.data) {
      return null;
    }

    const version = await this.getLatestVersionNumber(result.data.id, userId);

    return toSavedProgramme(result.data, version);
  }

  async getCurrentDraft(userId: string): Promise<SavedProgramme | null> {
    const result = await this.client
      .from<ProgrammeRow>('programmes')
      .select(
        'id,user_id,name,goal_type,status,source,programme_data,validation_data,refinement_data',
      )
      .eq('user_id', userId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      throw odinError(
        'CURRENT_PROGRAMME_NOT_FOUND',
        'Current draft programme was not found.',
        404,
      );
    }

    if (!result.data) {
      return null;
    }

    const version = await this.getLatestVersionNumber(result.data.id, userId);

    return toSavedProgramme(result.data, version);
  }

  private async getLatestVersionNumber(
    programmeId: string,
    userId: string,
  ): Promise<number> {
    const result = await this.client
      .from<ProgrammeVersionRow>('programme_versions')
      .select('version_number')
      .eq('programme_id', programmeId)
      .eq('user_id', userId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error || !result.data) {
      throw odinError(
        'PROGRAMME_VERSION_PERSISTENCE_FAILED',
        'Programme version could not be loaded.',
        500,
      );
    }

    return result.data.version_number;
  }
}
