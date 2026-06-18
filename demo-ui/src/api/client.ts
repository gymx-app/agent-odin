import type {
  AthleteInput,
  ErrorEnvelope,
  ProgrammeResponse,
  RefinementMode,
  SuccessEnvelope,
} from './contracts';

const configuredBase = import.meta.env.VITE_ODIN_API_BASE_URL?.trim() ?? '';
const apiBase = configuredBase.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: unknown | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT';
  token?: string;
  body?: unknown;
  idempotencyKey?: string;
};

const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const headers = new Headers({ Accept: 'application/json' });

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  if (options.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey);
  }

  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Could not reach the Odin API. Is the backend running?',
      null,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | SuccessEnvelope<T>
    | ErrorEnvelope
    | null;

  if (!response.ok || !payload || !payload.success) {
    const error = payload && !payload.success ? payload.error : null;
    throw new ApiError(
      response.status,
      error?.code ?? 'INVALID_RESPONSE',
      error?.message ?? `Request failed with status ${response.status}.`,
      error?.details ?? null,
    );
  }

  return payload.data;
};

export const odinApi = {
  health: () =>
    request<{ service: 'agent-odin'; version: string; status: 'ok' }>(
      '/api/health',
    ),

  saveProfile: (token: string, profile: AthleteInput) =>
    request<{ profile: AthleteInput }>('/api/profile', {
      method: 'PUT',
      token,
      body: profile,
    }),

  generate: (
    token: string,
    body: {
      replace_existing_draft: boolean;
      refinement_mode: RefinementMode;
    },
    idempotencyKey?: string,
  ) =>
    request<ProgrammeResponse>('/api/odin/generate', {
      method: 'POST',
      token,
      body,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    }),

  currentProgramme: (token: string) =>
    request<ProgrammeResponse>('/api/programmes/current', { token }),

  programmeById: (token: string, programmeId: string) =>
    request<ProgrammeResponse>(
      `/api/programmes/${encodeURIComponent(programmeId)}`,
      { token },
    ),
};
