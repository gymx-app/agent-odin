export type HeaderValue = string | string[] | undefined;

export type HttpRequest = {
  method?: string;
  url?: string;
  headers: Record<string, HeaderValue>;
};

export type HttpResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string | number | readonly string[]) => void;
  end: (body?: string) => void;
};

export type HttpMethod = 'GET' | 'POST' | 'OPTIONS';
