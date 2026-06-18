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
    const rpcResult = await this.client.rpc?.<AgentRunRow | AgentRunRow[]>(
      'start_generation_run',
      {
        p_user_id: userId,
        p_request_id: requestId,
        p_input_summary: inputSummary,
        p_stale_after_seconds: 120,
      },
    );
    const data = Array.isArray(rpcResult?.data)
      ? rpcResult.data[0]
      : rpcResult?.data;

    if (rpcResult?.error || !data) {
      if (
        rpcResult?.error?.code === '23505' ||
        rpcResult?.error?.message.includes('GENERATION_ALREADY_IN_PROGRESS')
      ) {
        throw odinError(
          'GENERATION_ALREADY_IN_PROGRESS',
          'Programme generation is already in progress.',
          409,
        );
      }

      throw odinError(
        'AGENT_RUN_PERSISTENCE_FAILED',
        'Agent run could not be started.',
        500,
      );
    }

    return {
      id: data.id,
      userId: data.user_id,
      requestId: data.request_id,
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
      .eq('id', runId)
      .eq('status', 'started');

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
      .eq('id', runId)
      .eq('status', 'started');

    if (result.error) {
      throw odinError(
        'AGENT_RUN_PERSISTENCE_FAILED',
        'Agent run could not be marked failed.',
        500,
      );
    }
  }
}
