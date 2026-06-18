import { describe, expect, it } from 'vitest';
import { canonicalizeJson } from '../../src/shared/canonical-json.js';
import { hashIdempotentRequest } from '../../src/shared/request-hash.js';

describe('canonical JSON request hashing', () => {
  it('sorts object keys recursively while preserving array order', () => {
    const left = { z: [{ b: 2, a: 1 }], a: { y: true, x: null } };
    const right = { a: { x: null, y: true }, z: [{ a: 1, b: 2 }] };

    expect(hashIdempotentRequest(left)).toBe(hashIdempotentRequest(right));
    expect(hashIdempotentRequest({ values: [1, 2] })).not.toBe(
      hashIdempotentRequest({ values: [2, 1] }),
    );
  });

  it('preserves null, booleans, numbers, and omitted fields', () => {
    expect(canonicalizeJson({ n: null, b: false, value: 3 })).toBe(
      '{"b":false,"n":null,"value":3}',
    );
    expect(hashIdempotentRequest({ a: 1 })).not.toBe(
      hashIdempotentRequest({ a: 1, optional: null }),
    );
  });

  it('rejects unsupported and non-finite values', () => {
    expect(() => canonicalizeJson({ value: undefined })).toThrow(TypeError);
    expect(() => canonicalizeJson(Number.NaN)).toThrow(TypeError);
  });

  it('is deterministic across repeated calls', () => {
    const value = { nested: [{ id: 'a', enabled: true }] };
    expect(hashIdempotentRequest(value)).toBe(hashIdempotentRequest(value));
  });
});
