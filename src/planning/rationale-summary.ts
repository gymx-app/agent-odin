import type { AiStrategyOutput } from '../llm/ai-generation/ai-generation.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import { requiresSafeSplit } from './strategy/split-safety-override.js';

export type StrategyRationaleItem = {
  decision: string;
  value: string;
  reason: string;
  confidence: string;
};

export type DeterministicRationaleItem = {
  area: string;
  detail: string;
};

export type RationaleSummary = {
  ai_strategy: {
    decisions: StrategyRationaleItem[];
    assumptions: Array<{ assumption: string; confidence: string }>;
    key_policies: Array<{ policy: string; detail: string }>;
  };
  deterministic: {
    build_decisions: DeterministicRationaleItem[];
    phase_rationale: Array<{
      phase: string;
      phase_type: string;
      decisions: Array<{ decision: string; value: string; reason: string }>;
    }>;
  };
  combined: string[];
};

const splitLabel = (split: string): string => {
  const labels: Record<string, string> = {
    full_body: 'Full Body',
    upper_lower: 'Upper/Lower',
    push_pull_legs: 'Push/Pull/Legs',
    hybrid: 'Hybrid',
    specialized: 'Specialized',
    sport_support: 'Sport Support',
  };
  return labels[split] ?? split;
};

const periodLabel = (model: string): string => {
  const labels: Record<string, string> = {
    simple_progressive: 'Simple Progressive',
    block: 'Block Periodization',
    undulating: 'Undulating',
    concurrent: 'Concurrent',
    maintenance: 'Maintenance',
    competition_peak: 'Competition Peaking',
  };
  return labels[model] ?? model;
};

export const buildRationaleSummary = (
  aiStrategy: AiStrategyOutput,
  programme: LongitudinalOdinProgramme,
  profile: NormalizedAthleteProfile,
): RationaleSummary => {
  const strat = aiStrategy.strategy;
  const prog = programme;

  // The model's own SPLIT_TYPE_DECISION rationale entry occasionally
  // disagrees with the split_type it actually committed to in the same
  // output (e.g. reasoning justifying push_pull_legs while split_type
  // correctly reflects a safety override to upper_lower) — strategy-
  // validator.ts flags this as AI_STRATEGY_RATIONALE_SPLIT_MISMATCH so it's
  // observable, but the user-facing narrative must never describe a split
  // the athlete isn't actually on, so it's reconciled here to the real
  // value before narrative synthesis (which reads this summary, not the
  // model's raw output) ever sees it.
  const aiDecisions: StrategyRationaleItem[] = strat.rationale.map((r) => {
    if (r.code === 'SPLIT_TYPE_DECISION' && r.selected_value !== prog.strategy.split_type) {
      return {
        decision: r.code.replace(/_/g, ' ').toLowerCase(),
        value: prog.strategy.split_type,
        reason: requiresSafeSplit(profile)
          ? 'Return-to-training status, low recovery capacity, an avoid-severity movement restriction, or a blocking health flag requires full_body or upper_lower split regardless of days available — a conservative safety default, not evidence from a specific trial.'
          : `Split chosen from available_days_per_week: ${splitLabel(prog.strategy.split_type)} fits ${prog.strategy.resistance_frequency} resistance sessions/week without exceeding available session-days.`,
        confidence: r.confidence,
      };
    }
    return {
      decision: r.code.replace(/_/g, ' ').toLowerCase(),
      value: r.selected_value,
      reason: r.reason,
      confidence: r.confidence,
    };
  });

  const assumptions = aiStrategy.assumptions.map((a) => ({
    assumption: a.message,
    confidence: a.confidence,
  }));

  const keyPolicies: Array<{ policy: string; detail: string }> = [];

  keyPolicies.push({
    policy: 'Progression',
    detail: `${aiStrategy.progression_policy.default_model.replace(/_/g, ' ')} — ${aiStrategy.progression_policy.success_condition}`,
  });

  keyPolicies.push({
    policy: 'Fatigue management',
    detail: `${aiStrategy.fatigue_management_policy.strategy.replace(/_/g, ' ')} with deloads at weeks ${aiStrategy.fatigue_management_policy.planned_deload_weeks.join(', ') || 'none'}`,
  });

  if (aiStrategy.conditioning_policy.weekly_target_sessions > 0) {
    keyPolicies.push({
      policy: 'Conditioning',
      detail: `${aiStrategy.conditioning_policy.weekly_target_sessions}x/week for ${aiStrategy.conditioning_policy.primary_purpose.replace(/_/g, ' ')} via ${aiStrategy.conditioning_policy.preferred_modalities.join(', ')}`,
    });
  }

  const buildDecisions: DeterministicRationaleItem[] = [];

  buildDecisions.push({
    area: 'Training split',
    detail: `${splitLabel(prog.strategy.split_type)} — ${prog.strategy.resistance_frequency} resistance sessions/week`,
  });

  buildDecisions.push({
    area: 'Programme duration',
    detail: `${prog.programme.target_weeks} weeks across ${prog.phases.length} phases`,
  });

  buildDecisions.push({
    area: 'Periodization',
    detail: periodLabel(prog.strategy.periodization_model),
  });

  const totalExercises = new Set(
    prog.phases
      .flatMap((p) => p.weeks)
      .flatMap((w) => w.days)
      .flatMap((d) => d.exercises)
      .map((e) => e.exercise_id),
  ).size;

  buildDecisions.push({
    area: 'Exercise selection',
    detail: `${totalExercises} unique exercises selected from the approved library`,
  });

  const calendarDays = prog.calendar.days;
  const trainingDays = calendarDays.filter((d) => d.planned_session_type !== 'rest');
  const restDays = calendarDays.filter((d) => d.planned_session_type === 'rest');
  buildDecisions.push({
    area: 'Weekly schedule',
    detail: `${trainingDays.map((d) => d.session_label).join(', ')} — ${restDays.length} rest day${restDays.length !== 1 ? 's' : ''}`,
  });

  const phaseRationale = prog.phases.map((phase) => ({
    phase: phase.name,
    phase_type: phase.phase_type,
    decisions: phase.rationale.map((r) => ({
      decision: r.code.replace(/_/g, ' ').toLowerCase(),
      value: r.selected_value,
      reason: r.reason,
    })),
  }));

  const combined: string[] = [];

  combined.push(
    `This ${prog.programme.target_weeks}-week ${prog.programme.goal_type.replace(/_/g, ' ')} programme uses ${periodLabel(prog.strategy.periodization_model).toLowerCase()} with a ${splitLabel(prog.strategy.split_type).toLowerCase()} split (${prog.strategy.resistance_frequency} days/week).`,
  );

  const phaseNames = prog.phases.map((p) => `${p.name} (${p.weeks_count}wk)`).join(' → ');
  combined.push(`Phase progression: ${phaseNames}.`);

  if (strat.rationale.length > 0) {
    const topReasons = strat.rationale.slice(0, 3).map((r) => r.reason);
    combined.push(`Key coaching decisions: ${topReasons.join('. ')}.`);
  }

  if (assumptions.length > 0) {
    combined.push(
      `Planning assumptions: ${assumptions.map((a) => a.assumption).join('. ')}.`,
    );
  }

  const deloadWeeks = aiStrategy.fatigue_management_policy.planned_deload_weeks;
  if (deloadWeeks.length > 0) {
    combined.push(`Deload weeks scheduled at weeks ${deloadWeeks.join(', ')} to manage fatigue accumulation.`);
  }

  return {
    ai_strategy: { decisions: aiDecisions, assumptions, key_policies: keyPolicies },
    deterministic: { build_decisions: buildDecisions, phase_rationale: phaseRationale },
    combined,
  };
};
