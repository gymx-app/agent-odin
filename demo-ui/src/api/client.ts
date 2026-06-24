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
      // Sub-step A: Reasoning + tool calls (exercise search, volume compliance)
      onProgress?.({
        step: 'phase_prep',
        detail: `Phase ${i + 1}/${totalPhases} — reasoning & searching exercises...`,
        phaseIndex: i,
        totalPhases,
      });

      const prepResult = await request<{
        step: 'phase_prep';
        phase_index: number;
        reasoning: string | null;
        tool_conversation: unknown[];
        usage: { inputTokens: number; outputTokens: number };
      }>(paths.previewStep, {
        method: 'POST',
        token,
        body: {
          step: 'phase_prep',
          athlete,
          strategy: strategyResult.strategy,
          phase_index: i,
          prior_phase_summaries: summaries,
        },
      });

      totalInputTokens += prepResult.usage.inputTokens ?? 0;
      totalOutputTokens += prepResult.usage.outputTokens ?? 0;

      // Sub-step C: Generate weeks one at a time
      const phaseSkeleton = strategy.phase_skeletons[i] as {
        phase_id: string;
        phase_number: number;
        name: string;
        phase_type: string;
        objective: string;
        start_week: number;
        end_week: number;
        weeks_count: number;
        volume_direction: string;
        intensity_direction: string;
        effort_direction: string;
        progression_model: string;
      };
      const weeksCount = phaseSkeleton.weeks_count;
      const weeks: unknown[] = [];
      const weekSummaries: { week_number: number; week_type: string }[] = [];
      let previousResponseId: string | undefined;

      for (let w = 0; w < weeksCount; w++) {
        onProgress?.({
          step: 'phase_week',
          detail: `Phase ${i + 1}/${totalPhases} — week ${w + 1}/${weeksCount}...`,
          phaseIndex: i,
          totalPhases,
        });

        const fullStrategy = strategyResult.strategy as Record<string, unknown>;
        const weekBody: Record<string, unknown> = {
          step: 'phase_week',
          athlete,
          phase_index: i,
          week_index: w,
          prior_weeks: weekSummaries,
        };

        if (previousResponseId) {
          weekBody.previous_response_id = previousResponseId;
          weekBody.strategy = {
            phase_skeletons: (fullStrategy as { phase_skeletons: unknown[] }).phase_skeletons,
            fatigue_management_policy: (fullStrategy as { fatigue_management_policy: unknown }).fatigue_management_policy,
          };
        } else {
          weekBody.strategy = strategyResult.strategy;
          weekBody.prior_phase_summaries = summaries;
          weekBody.reasoning = prepResult.reasoning;
          weekBody.tool_conversation = prepResult.tool_conversation;
        }

        const weekResult = await request<{
          step: 'phase_week';
          phase_index: number;
          week_index: number;
          week: unknown;
          response_id: string | null;
          usage: { inputTokens: number; outputTokens: number };
        }>(paths.previewStep, {
          method: 'POST',
          token,
          body: weekBody,
        });

        previousResponseId = weekResult.response_id ?? undefined;
        const weekData = weekResult.week as { week_number: number; week_type: string };
        weeks.push(weekData);
        weekSummaries.push({ week_number: weekData.week_number, week_type: weekData.week_type });
        totalInputTokens += weekResult.usage.inputTokens ?? 0;
        totalOutputTokens += weekResult.usage.outputTokens ?? 0;
      }

      const phase = {
        ...phaseSkeleton,
        weeks,
        rationale: [],
      };
      phases.push(phase);

      const exercisesUsed = new Set<string>();
      const volumeByMuscle: Record<string, number> = {};
      for (const week of weeks) {
        const w = week as { days: Array<{ exercises: Array<{ exercise_id: string; primary_muscles: string[]; sets: Array<{ set_type: string }> }> }> };
        for (const day of w.days ?? []) {
          for (const ex of day.exercises ?? []) {
            exercisesUsed.add(ex.exercise_id);
            const workingSets = (ex.sets ?? []).filter((s) => s.set_type === 'working').length;
            for (const muscle of ex.primary_muscles ?? []) {
              volumeByMuscle[muscle] = (volumeByMuscle[muscle] ?? 0) + workingSets;
            }
          }
        }
      }
      summaries.push({
        phase_id: phaseSkeleton.phase_id,
        phase_type: phaseSkeleton.phase_type,
        objective: phaseSkeleton.objective,
        exercises_used: [...exercisesUsed],
        volume_per_muscle_group: volumeByMuscle,
        progression_model: phaseSkeleton.progression_model,
      });
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
