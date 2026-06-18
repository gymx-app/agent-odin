import { odinError } from '../shared/errors/odin-errors.js';
import type { SupabaseClientLike } from '../infrastructure/supabase/supabase.types.js';
import type { AgentRun } from './repository.types.js';

type AgentRunRow = {
  id: string;
  user_id: string;
  request_id: string;
};

export type AgentRunInputSummary = {
  goal: string;
  fitness_level: string;
  available_days: number;
  session_duration: number;
  equipment: string;
  has_inbody: boolean;
  injury_count: number;
};

export class AgentRunRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async start(
    userId: string,
    requestId: string,
    inputSummary: AgentRunInputSummary,
  ): Promise<AgentRun> {
    const result = await this.client
      .from<AgentRunRow>('agent_runs')
      .insert({
        user_id: userId,
        agent_name: 'agent-odin',
        operation: 'generate_programme',
        status: 'started',
        input_summary: inputSummary,
        request_id: requestId,
      })
      .select('id,user_id,request_id')
      .single();

    if (result.error || !result.data) {
      throw odinError(
        'AGENT_RUN_PERSISTENCE_FAILED',
        'Agent run could not be started.',
        500,
      );
    }

    return {
      id: result.data.id,
      userId: result.data.user_id,
      requestId: result.data.request_id,
    };
  }

  async markSucceeded(
    runId: string,
    outputReference: Record<string, unknown>,
    validationSummary: Record<string, unknown>,
    durationMs: number,
  ): Promise<void> {
    const result = await this.client
      .from('agent_runs')
      .update({
        status: 'succeeded',
        output_reference: outputReference,
        validation_summary: validationSummary,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);

    if (result.error) {
      throw odinError(
        'AGENT_RUN_PERSISTENCE_FAILED',
        'Agent run could not be marked succeeded.',
        500,
      );
    }
  }

  async markFailed(
    runId: string,
    errorCode: string,
    errorMessage: string,
    durationMs: number,
  ): Promise<void> {
    const result = await this.client
      .from('agent_runs')
      .update({
        status: 'failed',
        error_code: errorCode,
        error_message: errorMessage,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);

    if (result.error) {
      throw odinError(
        'AGENT_RUN_PERSISTENCE_FAILED',
        'Agent run could not be marked failed.',
        500,
      );
    }
  }
}
