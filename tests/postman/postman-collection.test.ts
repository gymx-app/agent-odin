import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Postman collection', () => {
  it('parses and does not contain committed secrets', () => {
    const raw = readFileSync(
      'postman/agent-odin.phase7.postman_collection.json',
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
      'POST Generate Programme - Athlete Profile Missing',
      'POST Generate Programme - Draft Conflict',
      'POST Generate Programme - Validation Failure',
      'POST Generate Programme - Idempotent Replay',
      'POST Generate Programme - Idempotency Conflict',
      'GET Programme by ID - Not Found',
      'Generate - Deterministic',
      'Generate - LLM Optional',
      'Generate - LLM Required (Development Only)',
      'Generate - Invalid Refinement Mode',
    ].forEach((name) => expect(raw).toContain(name));
  });
});
