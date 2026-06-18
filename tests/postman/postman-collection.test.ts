import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Postman collection', () => {
  it('parses and does not contain committed secrets', () => {
    const raw = readFileSync(
      'postman/agent-odin.postman_collection.json',
      'utf8',
    );
    const collection = JSON.parse(raw) as {
      variable?: { key: string; value: string }[];
    };

    expect(collection).toEqual(
      expect.objectContaining({
        info: expect.objectContaining({
          name: expect.stringContaining('agent-odin'),
        }),
      }),
    );
    expect(raw).not.toContain('eyJ');
    expect(raw).not.toContain('OPENAI_API_KEY');
    expect(
      collection.variable?.find((variable) => variable.key === 'accessToken')
        ?.value,
    ).toBe('');
    [
      'PUT Athlete Profile - Invalid Profile',
      'Generate - Idempotent Replay',
      'Generate - Idempotency Conflict',
      'GET Programme - Not Found',
      'GET Programme - Invalid ID',
      'Generate - Deterministic',
      'Generate - LLM Optional',
      'Generate - LLM Required (Development Only)',
      'Generate - Invalid Refinement Mode',
      'Accepted LLM refinement',
      'Provider timeout fallback',
      'Provider refusal fallback',
      'Required refinement failure',
      'Validation rejection',
    ].forEach((name) => expect(raw).toContain(name));
    expect(raw).not.toContain('Phase 7');
    expect(raw.match(/Generate - LLM Optional/g)).toHaveLength(1);
  });
});
