import { odinError } from '../shared/errors/odin-errors.js';
import type { SupabaseClientLike } from '../infrastructure/supabase/supabase.types.js';

type IdempotencyRow = {
  user_id: string;
  endpoint: string;
  idempotency_key: string;
  request_hash: string;
  response_reference: Record<string, unknown> | null;
  status: 'started' | 'succeeded' | 'failed';
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
    const existing = await this.client
      .from<IdempotencyRow>('idempotency_keys')
      .select(
        'user_id,endpoint,idempotency_key,request_hash,response_reference,status',
      )
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing.error) {
      throw odinError(
        'IDEMPOTENCY_REQUEST_IN_PROGRESS',
        'Idempotency key could not be checked.',
        409,
      );
    }

    if (existing.data) {
      if (existing.data.request_hash !== requestHash) {
        throw odinError(
          'IDEMPOTENCY_KEY_CONFLICT',
          'Idempotency key was reused with a different request body.',
          409,
        );
      }

      if (
        existing.data.status === 'succeeded' &&
        existing.data.response_reference
      ) {
        return {
          type: 'replay',
          responseReference: existing.data.response_reference,
        };
      }

      throw odinError(
        'IDEMPOTENCY_REQUEST_IN_PROGRESS',
        'Request with this idempotency key is still in progress.',
        409,
      );
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const inserted = await this.client.from('idempotency_keys').insert({
      user_id: userId,
      endpoint,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
      status: 'started',
      expires_at: expiresAt,
    });

    if (inserted.error) {
      throw odinError(
        'IDEMPOTENCY_REQUEST_IN_PROGRESS',
        'Idempotency key could not be claimed.',
        409,
      );
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
}
