export type HeaderValue = string | string[] | undefined;

export type HttpRequest = {
  method?: string;
  url?: string;
  headers: Record<string, HeaderValue>;
  body?: unknown;
  on?: (event: string, listener: (chunk?: unknown) => void) => void;
  destroy?: () => void;
};

export type HttpResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string | number | readonly string[]) => void;
  end: (body?: string) => void;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'OPTIONS';
