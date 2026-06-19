import type {
  AthleteInput,
  ErrorEnvelope,
  ProgrammePreviewResponse,
  PlannerVersion,
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

  preview: (
    token: string,
    athlete: AthleteInput,
    refinementMode: RefinementMode,
    plannerVersion: PlannerVersion,
  ) =>
    request<ProgrammePreviewResponse>('/api/odin/preview', {
      method: 'POST',
      token,
      body: {
        athlete,
        refinement_mode: refinementMode,
        planner_version: plannerVersion,
      },
    }),
};
