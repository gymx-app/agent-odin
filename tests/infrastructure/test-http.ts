import type {
  HeaderValue,
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';

export type TestResponse = HttpResponse & {
  headers: Record<string, string | number | readonly string[]>;
  body: string | undefined;
  json: () => unknown;
};

export const createTestRequest = (
  overrides: Partial<HttpRequest> = {},
): HttpRequest => ({
  method: 'GET',
  url: '/api/health',
  headers: {},
  ...overrides,
});

export const createTestResponse = (): TestResponse => {
  const response: TestResponse = {
    statusCode: 0,
    headers: {},
    body: undefined,
    setHeader: (name, value) => {
      response.headers[name.toLowerCase()] = value;
    },
    end: (body) => {
      response.body = body;
    },
    json: () => {
      if (!response.body) {
        return undefined;
      }

      return JSON.parse(response.body);
    },
  };

  return response;
};

export const header = (
  value: string | number | readonly string[] | HeaderValue,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return undefined;
};
