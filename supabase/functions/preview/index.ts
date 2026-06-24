// @ts-ignore: Deno globalThis
globalThis.process = globalThis.process ?? { env: Deno.env.toObject() };

import { createPreviewHandler } from '../_bundles/preview-handler.js';

let handler: ReturnType<typeof createPreviewHandler> | null = null;

const getHandler = () => {
  if (!handler) {
    handler = createPreviewHandler();
  }
  return handler;
};

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    let body: unknown;
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('application/json') && req.body) {
      try {
        body = await req.json();
      } catch {
        body = undefined;
      }
    }

    const httpRequest = {
      method: req.method,
      url: new URL(req.url).pathname,
      headers: Object.fromEntries(req.headers.entries()),
      body,
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

    await getHandler()(httpRequest, httpResponse);

    return new Response(responseBody || null, {
      status: statusCode,
      headers: responseHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('EDGE_FUNCTION_ERROR', { message, stack });
    return new Response(
      JSON.stringify({ success: false, error: { code: 'EDGE_FUNCTION_ERROR', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
