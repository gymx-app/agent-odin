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
      'Preview - Deterministic',
      'Preview - LLM Optional',
      'Preview - Missing Auth',
      'Preview - Invalid Athlete',
      'Retired - PUT Athlete Profile',
      'Retired - POST Persistent Generate',
      'Retired - GET Current Programme',
      'Retired - GET Programme by ID',
    ].forEach((name) => expect(raw).toContain(name));
    expect(raw).toContain('/api/odin/preview');
    expect(raw).not.toContain('Idempotency-Key');
    expect(raw).not.toContain('programmeId');
  });
});
