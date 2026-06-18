import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { readJsonBody } from '../../src/infrastructure/http/request-body.js';
import type { HttpRequest } from '../../src/infrastructure/http/types.js';

const schema = z.object({ value: z.string().default('default') });

describe('request body limits', () => {
  it('accepts parsed JSON at the exact byte limit', async () => {
    const body = { value: 'ok' };
    const bytes = Buffer.byteLength(JSON.stringify(body));
    await expect(
      readJsonBody({ headers: {}, body }, schema, bytes),
    ).resolves.toEqual(body);
  });

  it('rejects parsed JSON and Content-Length above the limit', async () => {
    await expect(
      readJsonBody({ headers: {}, body: { value: 'too large' } }, schema, 5),
    ).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE', httpStatus: 413 });

    await expect(
      readJsonBody(
        { headers: { 'content-length': '100' }, body: { value: 'ok' } },
        schema,
        10,
      ),
    ).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE' });
  });

  it('rejects an invalid Content-Length', async () => {
    await expect(
      readJsonBody(
        { headers: { 'content-length': 'wat' }, body: { value: 'ok' } },
        schema,
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('stops buffering a streamed body after the limit', async () => {
    const stream = new EventEmitter() as EventEmitter & HttpRequest;
    stream.headers = {};
    stream.destroy = () => undefined;
    const result = readJsonBody(stream, schema, 8);
    stream.emit('data', '{"value":"far too large"}');
    stream.emit('end');

    await expect(result).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE' });
  });

  it('handles malformed and empty JSON safely', async () => {
    await expect(
      readJsonBody({ headers: {}, body: '{' }, schema),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    await expect(
      readJsonBody({ headers: {}, body: {} }, schema),
    ).resolves.toEqual({ value: 'default' });
  });
});
