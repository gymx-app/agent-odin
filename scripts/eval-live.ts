// Live-LLM eval harness. Unlike tests/eval/golden-set-scoring.test.ts (100%
// deterministic, zero LLM cost, gates CI), this makes real strategy calls
// against the configured provider — it costs real money and its output is
// non-deterministic, so it is NOT wired into CI or `npm test`. Run it by
// hand before/after a prompt or model change and read the diff yourself.
//
// Usage:
//   npm run eval:live                    # full corpus
//   npm run eval:live -- --only="Beginner Fat Loss,Multi Injury"
import { config } from '../src/infrastructure/config/env.js';
import { seedExercises } from '../src/exercises/approved-exercise-library.js';
import { normalizeAthlete } from '../src/normalization/athlete-normalizer.js';
import { buildAiStrategyContextV2 } from '../src/llm/ai-generation/ai-generation-context-builder.js';
import { getProvider } from '../src/llm/ai-generation/step-request-helpers.js';
import { buildProgrammeWithRepair } from '../src/planning/longitudinal-programme-planner.js';
import { aiStrategySystemPromptV2 } from '../src/llm/ai-generation/ai-generation-strategy-prompt-v2.js';
import { validAthleteFixtures } from '../fixtures/athletes/valid-athletes.js';
import { goldenSetAthleteFixtures } from '../fixtures/athletes/golden-set.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import type { AthleteInput } from '../src/domain/athlete/athlete.types.js';

const onlyArg = process.argv
  .find((arg) => arg.startsWith('--only='))
  ?.slice('--only='.length);
const onlyNames = onlyArg
  ? new Set(onlyArg.split(',').map((name) => name.trim()))
  : null;

const corpus: AthleteInput[] = [
  ...validAthleteFixtures,
  ...goldenSetAthleteFixtures,
].filter((athlete) => !onlyNames || onlyNames.has(athlete.name));

if (corpus.length === 0) {
  console.error('No profiles matched --only. Check the names against fixtures/athletes/*.ts.');
  process.exit(1);
}

type EvalResult = {
  profile: string;
  status: 'ok' | 'error';
  overall_score?: number;
  scores?: Record<string, number>;
  repair_attempts: number;
  repair_reasons: string[];
  input_tokens: number;
  output_tokens: number;
  duration_ms: number;
  provider?: string | null;
  model?: string | null;
  error?: string;
};

const runOne = async (
  athleteInput: AthleteInput,
  provider: ReturnType<typeof getProvider>,
): Promise<EvalResult> => {
  const startedAt = Date.now();

  try {
    const profile = normalizeAthlete(athleteInput);
    const strategyCtx = buildAiStrategyContextV2(profile, seedExercises);
    const strategyResult = await provider.generateStrategy(strategyCtx, {
      requestId: `eval-live-${athleteInput.name}`,
      strategySystemPrompt: aiStrategySystemPromptV2,
    });

    const buildResult = await buildProgrammeWithRepair(
      profile,
      seedExercises,
      strategyResult.output,
      provider,
      strategyCtx,
      {
        startDate: new Date().toISOString().slice(0, 10),
        deadline: Date.now() + config.generationTimeoutMs,
      },
    );

    return {
      profile: athleteInput.name,
      status: 'ok',
      overall_score: buildResult.validation.overall_score,
      scores: buildResult.validation.scores,
      repair_attempts: buildResult.repair_log.length,
      repair_reasons: [
        ...new Set(buildResult.repair_log.flatMap((r) => r.errorCodes)),
      ],
      input_tokens:
        (strategyResult.usage.inputTokens ?? 0) + buildResult.totalInputTokens,
      output_tokens:
        (strategyResult.usage.outputTokens ?? 0) +
        buildResult.totalOutputTokens,
      duration_ms: Date.now() - startedAt,
      provider: buildResult.provider ?? strategyResult.provider,
      model: buildResult.model ?? strategyResult.model,
    };
  } catch (err) {
    return {
      profile: athleteInput.name,
      status: 'error',
      repair_attempts: 0,
      repair_reasons: [],
      input_tokens: 0,
      output_tokens: 0,
      duration_ms: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

const main = async () => {
  console.log(
    `Running live eval against ${corpus.length} profile(s). This calls the real ${config.aiGenerationProvider} API and costs real tokens.\n`,
  );

  const provider = getProvider(config);
  const results: EvalResult[] = [];
  for (const athlete of corpus) {
    process.stdout.write(`  ${athlete.name}... `);
    const result = await runOne(athlete, provider);
    results.push(result);
    console.log(
      result.status === 'ok'
        ? `score ${result.overall_score}/100, ${result.repair_attempts} repair(s), ${result.duration_ms}ms`
        : `ERROR: ${result.error}`,
    );
  }

  console.log('\n--- Summary ---');
  console.table(
    results.map((r) => ({
      profile: r.profile,
      status: r.status,
      score: r.overall_score ?? '-',
      repairs: r.repair_attempts,
      repair_reasons: r.repair_reasons.join(', ') || '-',
      tokens: r.input_tokens + r.output_tokens,
      ms: r.duration_ms,
    })),
  );

  const failures = results.filter((r) => r.status === 'error');
  const lowScores = results.filter(
    (r) => r.status === 'ok' && (r.overall_score ?? 100) < 90,
  );
  if (failures.length > 0) {
    console.log(
      `\n${failures.length} profile(s) errored — see the table above.`,
    );
  }
  if (lowScores.length > 0) {
    console.log(
      `${lowScores.length} profile(s) scored below 90 — worth a manual look.`,
    );
  }

  mkdirSync('eval-results', { recursive: true });
  const outPath = `eval-results/${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nFull results written to ${outPath}`);

  if (failures.length > 0) process.exitCode = 1;
};

main();
