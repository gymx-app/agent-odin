// Shim process.env for Node.js compatibility
// @ts-ignore: Deno globalThis
globalThis.process = globalThis.process ?? { env: Deno.env.toObject() };

import { createHealthHandler } from '../_bundles/health-handler.js';

const handler = createHealthHandler();

Deno.serve(async (req: Request): Promise<Response> => {
  const httpRequest = {
    method: req.method,
    url: new URL(req.url).pathname,
    headers: Object.fromEntries(req.headers.entries()),
    body: undefined,
  };

  let statusCode = 200;
  const responseHeaders = new Headers();
  let responseBody = '';

  const httpResponse = {
    set statusCode(code: number) { statusCode = code; },
    get statusCode(): number { return statusCode; },
    setHeader: (name: string, value: string | number | readonly string[]) => {
      if (Array.isArray(value)) {
        (value as readonly string[]).forEach((v) => responseHeaders.append(name, v));
      } else {
        responseHeaders.set(name, String(value));
      }
    },
    end: (chunk?: string) => { responseBody = chunk ?? ''; },
  };

  await handler(httpRequest, httpResponse);

  return new Response(responseBody || null, {
    status: statusCode,
    headers: responseHeaders,
  });
});
