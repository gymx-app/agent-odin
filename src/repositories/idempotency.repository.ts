import { odinError } from '../shared/errors/odin-errors.js';
import type { SupabaseClientLike } from '../infrastructure/supabase/supabase.types.js';

type IdempotencyClaimRow = {
  outcome: 'started' | 'replay' | 'conflict' | 'in_progress';
  response_reference: Record<string, unknown> | null;
};

export type IdempotencyClaim =
  | { type: 'started' }
  | { type: 'replay'; responseReference: Record<string, unknown> };

export class IdempotencyRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async claim(
    userId: string,
    endpoint: string,
    idempotencyKey: string,
    requestHash: string,
  ): Promise<IdempotencyClaim> {
    const result = await this.client.rpc?.<
      IdempotencyClaimRow | IdempotencyClaimRow[]
    >('claim_idempotency_key', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_idempotency_key: idempotencyKey,
      p_request_hash: requestHash,
      p_ttl_seconds: 24 * 60 * 60,
    });
    const claim = Array.isArray(result?.data) ? result.data[0] : result?.data;

    if (result?.error || !claim) {
      throw odinError(
        'IDEMPOTENCY_REQUEST_IN_PROGRESS',
        'Idempotency key could not be claimed.',
        409,
      );
    }

    if (claim.outcome === 'conflict') {
      throw odinError(
        'IDEMPOTENCY_KEY_CONFLICT',
        'Idempotency key was reused with a different request body.',
        409,
      );
    }

    if (claim.outcome === 'in_progress') {
      throw odinError(
        'IDEMPOTENCY_REQUEST_IN_PROGRESS',
        'Request with this idempotency key is still in progress.',
        409,
      );
    }

    if (claim.outcome === 'replay' && claim.response_reference) {
      return {
        type: 'replay',
        responseReference: claim.response_reference,
      };
    }

    return { type: 'started' };
  }

  async markSucceeded(
    userId: string,
    endpoint: string,
    idempotencyKey: string,
    responseReference: Record<string, unknown>,
  ): Promise<void> {
    const result = await this.client
      .from('idempotency_keys')
      .update({
        status: 'succeeded',
        response_reference: responseReference,
      })
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .eq('idempotency_key', idempotencyKey);

    if (result.error) {
      throw odinError(
        'IDEMPOTENCY_REQUEST_IN_PROGRESS',
        'Idempotency key could not be completed.',
        409,
      );
    }
  }

  async markFailed(
    userId: string,
    endpoint: string,
    idempotencyKey: string,
    requestHash: string,
  ): Promise<void> {
    const result = await this.client.rpc?.('mark_idempotency_failed', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_idempotency_key: idempotencyKey,
      p_request_hash: requestHash,
    });

    if (result?.error || result?.data !== true) {
      throw odinError(
        'IDEMPOTENCY_FINALIZATION_FAILED',
        'Idempotency request could not be marked failed.',
        500,
      );
    }
  }
}
