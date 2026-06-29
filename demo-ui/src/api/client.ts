import type {
  AthleteInput,
  AthleteInputV2,
  ErrorEnvelope,
  InBodyParseResult,
  ProgrammePreviewResponse,
  SuccessEnvelope,
} from './contracts';

const configuredBase = import.meta.env.VITE_ODIN_API_BASE_URL?.trim() ?? '';
const apiBase = configuredBase.replace(/\/$/, '');
const isEdgeFunction = apiBase.includes('supabase.co');
export const apiPlatform: 'supabase' | 'vercel' | 'local' = isEdgeFunction
  ? 'supabase'
  : apiBase ? 'vercel' : 'local';

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

const paths = {
  health: isEdgeFunction ? '/functions/v1/health' : '/api/health',
  generateProgramme: isEdgeFunction ? '/functions/v1/generate-programme' : '/api/odin/generate-programme',
  generateProgrammeV2: '/api/v2/odin/generate-programme',
  parseInBody: '/api/v1/inbody/parse',
};

export type StepProgress = {
  step: string;
  detail: string;
  phaseIndex?: number;
  totalPhases?: number;
};

export const odinApi = {
  health: () =>
    request<{
      service: 'agent-odin';
      version: string;
      status: 'ok';
      ai_agent_enabled?: boolean;
      openai_connected?: boolean;
      ai_generation_provider?: 'openai' | 'anthropic';
      ai_provider_connected?: boolean;
    }>(paths.health),

  generateProgramme: async (
    token: string,
    athlete: AthleteInput,
    onProgress?: (progress: StepProgress) => void,
  ): Promise<ProgrammePreviewResponse> => {
    // Step 1: AI strategy (single LLM call)
    onProgress?.({ step: 'strategy', detail: 'Generating training strategy...' });
    const strategyResult = await request<{
      step: 'strategy';
      strategy: unknown;
      usage: { inputTokens: number; outputTokens: number };
    }>(paths.generateProgramme, {
      method: 'POST',
      token,
      body: { step: 'strategy', athlete },
    });

    const totalInputTokens = strategyResult.usage.inputTokens ?? 0;
    const totalOutputTokens = strategyResult.usage.outputTokens ?? 0;

    // Step 2: Deterministic build (strategy → full programme)
    onProgress?.({ step: 'build', detail: 'Building programme structure...' });
    const buildResult = await request<ProgrammePreviewResponse>(paths.generateProgramme, {
      method: 'POST',
      token,
      body: {
        step: 'build',
        athlete,
        strategy: strategyResult.strategy,
      },
    });

    buildResult.generation = {
      ...buildResult.generation,
      ai_generation: {
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        fallback_used: false,
      },
    };

    return buildResult;
  },

  parseInBody: (token: string, file: string, media_type: string): Promise<InBodyParseResult> =>
    request<InBodyParseResult>(paths.parseInBody, {
      method: 'POST',
      token,
      body: { file, media_type },
    }),

  generateProgrammeV2: async (
    token: string,
    athlete: AthleteInputV2,
    onProgress?: (progress: StepProgress) => void,
  ): Promise<ProgrammePreviewResponse> => {
    onProgress?.({ step: 'strategy', detail: 'Generating training strategy (v2)...' });
    const strategyResult = await request<{
      step: 'strategy';
      strategy: unknown;
      usage: { inputTokens: number; outputTokens: number };
    }>(paths.generateProgrammeV2, {
      method: 'POST',
      token,
      body: { step: 'strategy', athlete },
    });

    const totalInputTokens = strategyResult.usage.inputTokens ?? 0;
    const totalOutputTokens = strategyResult.usage.outputTokens ?? 0;

    onProgress?.({ step: 'build', detail: 'Building programme structure (v2)...' });
    const buildResult = await request<ProgrammePreviewResponse>(paths.generateProgrammeV2, {
      method: 'POST',
      token,
      body: { step: 'build', athlete, strategy: strategyResult.strategy },
    });

    buildResult.generation = {
      ...buildResult.generation,
      ai_generation: {
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        fallback_used: false,
      },
    };

    return buildResult;
  },
};
