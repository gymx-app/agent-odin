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
  preview: isEdgeFunction ? '/functions/v1/preview' : '/api/odin/preview',
  previewStep: isEdgeFunction ? '/functions/v1/preview-step' : '/api/odin/preview-step',
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

  preview: (
    token: string,
    athlete: AthleteInput,
    refinementMode: RefinementMode,
    plannerVersion: PlannerVersion,
  ) =>
    request<ProgrammePreviewResponse>(paths.preview, {
      method: 'POST',
      token,
      body: {
        athlete,
        refinement_mode: refinementMode,
        planner_version: plannerVersion,
      },
    }),

  previewStepped: async (
    token: string,
    athlete: AthleteInput,
    onProgress?: (progress: StepProgress) => void,
  ): Promise<ProgrammePreviewResponse> => {
    // Step 1: Strategy
    onProgress?.({ step: 'strategy', detail: 'Generating training strategy...' });
    const strategyResult = await request<{
      step: 'strategy';
      strategy: unknown;
      usage: { inputTokens: number; outputTokens: number };
    }>(paths.previewStep, {
      method: 'POST',
      token,
      body: { step: 'strategy', athlete },
    });

    const strategy = strategyResult.strategy as { phase_skeletons: unknown[] };
    const totalPhases = strategy.phase_skeletons.length;
    let totalInputTokens = strategyResult.usage.inputTokens ?? 0;
    let totalOutputTokens = strategyResult.usage.outputTokens ?? 0;

    // Step 2..N: Phases
    const phases: unknown[] = [];
    const summaries: unknown[] = [];

    for (let i = 0; i < totalPhases; i++) {
      // Sub-step A: Reasoning (tool-use / exercise search)
      onProgress?.({
        step: 'phase_reasoning',
        detail: `Phase ${i + 1}/${totalPhases} — reasoning...`,
        phaseIndex: i,
        totalPhases,
      });

      const reasoningResult = await request<{
        step: 'phase_reasoning';
        phase_index: number;
        reasoning: string | null;
        usage: { inputTokens: number; outputTokens: number };
      }>(paths.previewStep, {
        method: 'POST',
        token,
        body: {
          step: 'phase_reasoning',
          athlete,
          strategy: strategyResult.strategy,
          phase_index: i,
          prior_phase_summaries: summaries,
        },
      });

      totalInputTokens += reasoningResult.usage.inputTokens ?? 0;
      totalOutputTokens += reasoningResult.usage.outputTokens ?? 0;

      // Sub-step B: Generate phase structure
      onProgress?.({
        step: 'phase_generate',
        detail: `Phase ${i + 1}/${totalPhases} — generating...`,
        phaseIndex: i,
        totalPhases,
      });

      const phaseResult = await request<{
        step: 'phase_generate';
        phase: unknown;
        summary: unknown;
        usage: { inputTokens: number; outputTokens: number };
      }>(paths.previewStep, {
        method: 'POST',
        token,
        body: {
          step: 'phase_generate',
          athlete,
          strategy: strategyResult.strategy,
          phase_index: i,
          prior_phase_summaries: summaries,
          reasoning: reasoningResult.reasoning,
        },
      });

      phases.push(phaseResult.phase);
      summaries.push(phaseResult.summary);
      totalInputTokens += phaseResult.usage.inputTokens ?? 0;
      totalOutputTokens += phaseResult.usage.outputTokens ?? 0;
    }

    // Final step: Assemble + validate
    onProgress?.({ step: 'assemble', detail: 'Assembling and validating programme...' });
    const assembleResult = await request<ProgrammePreviewResponse>(paths.previewStep, {
      method: 'POST',
      token,
      body: {
        step: 'assemble',
        athlete,
        strategy: strategyResult.strategy,
        phases,
      },
    });

    // Attach AI generation metadata
    assembleResult.generation = {
      ...assembleResult.generation,
      ai_generation: {
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        fallback_used: false,
      },
    };

    return assembleResult;
  },
};
