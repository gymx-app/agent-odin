import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Clock3,
  Copy,
  Dumbbell,
  FileCheck2,
  HeartPulse,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Database,
  UserRound,
} from 'lucide-react';
import { ApiError, odinApi } from './api/client';
import type {
  AthleteInput,
  DayOfWeek,
  LongitudinalOdinProgramme,
  ProgrammeDay,
  ProgrammePreviewResponse,
  PlannerVersion,
  RefinementMode,
  V2Day,
  V2Phase,
  V2Week,
} from './api/contracts';
import {
  isLegacyProgramme,
  isLongitudinalProgramme,
} from './api/contracts';
import { defaultProfile } from './fixtures/default-profile';
import {
  isSupabaseAuthConfigured,
  supabaseAuth,
} from './auth/supabase';
import { athleteInputSchema } from './profile/profile-schema';

const STORAGE_KEY = 'odin_demo_form';

type GenerationMode =
  | 'ai_agent'
  | 'longitudinal_deterministic'
  | 'longitudinal_ai_refined'
  | 'longitudinal_ai_required'
  | 'legacy_deterministic'
  | 'legacy_ai_refined'
  | 'legacy_ai_required';

const GENERATION_MODES: readonly {
  value: GenerationMode;
  title: string;
  description: string;
}[] = [
  {
    value: 'ai_agent',
    title: 'AI Agent',
    description: 'AI generates the full programme with tool use, reasoning, and replanning.',
  },
  {
    value: 'longitudinal_deterministic',
    title: 'Longitudinal — Deterministic',
    description: 'Evidence-based periodised planner. No AI refinement.',
  },
  {
    value: 'longitudinal_ai_refined',
    title: 'Longitudinal — AI Refined',
    description: 'Deterministic planner + optional AI polish. Falls back safely.',
  },
  {
    value: 'legacy_deterministic',
    title: 'Legacy — Deterministic',
    description: 'Original single-phase planner. No AI refinement.',
  },
  {
    value: 'legacy_ai_refined',
    title: 'Legacy — AI Refined',
    description: 'Original planner + optional AI polish. Falls back safely.',
  },
  {
    value: 'legacy_ai_required',
    title: 'Legacy — AI Required',
    description: 'Original planner + mandatory AI. Fails if unavailable. Dev only.',
  },
  {
    value: 'longitudinal_ai_required',
    title: 'Longitudinal — AI Required',
    description: 'Periodised planner + mandatory AI. Fails if unavailable. Dev only.',
  },
];

const generationModeToParams = (
  mode: GenerationMode,
): { plannerVersion: PlannerVersion; refinementMode: RefinementMode } => {
  switch (mode) {
    case 'ai_agent':
      return { plannerVersion: 'ai_agent_v1', refinementMode: 'deterministic' };
    case 'longitudinal_deterministic':
      return { plannerVersion: 'longitudinal_v1', refinementMode: 'deterministic' };
    case 'longitudinal_ai_refined':
      return { plannerVersion: 'longitudinal_v1', refinementMode: 'llm_optional' };
    case 'longitudinal_ai_required':
      return { plannerVersion: 'longitudinal_v1', refinementMode: 'llm_required' };
    case 'legacy_deterministic':
      return { plannerVersion: 'legacy_v1', refinementMode: 'deterministic' };
    case 'legacy_ai_refined':
      return { plannerVersion: 'legacy_v1', refinementMode: 'llm_optional' };
    case 'legacy_ai_required':
      return { plannerVersion: 'legacy_v1', refinementMode: 'llm_required' };
  }
};

const paramsToGenerationMode = (
  plannerVersion: PlannerVersion,
  refinementMode: RefinementMode,
): GenerationMode => {
  if (plannerVersion === 'ai_agent_v1') return 'ai_agent';
  if (plannerVersion === 'longitudinal_v1') {
    if (refinementMode === 'llm_required') return 'longitudinal_ai_required';
    if (refinementMode === 'llm_optional') return 'longitudinal_ai_refined';
    return 'longitudinal_deterministic';
  }
  if (refinementMode === 'llm_required') return 'legacy_ai_required';
  if (refinementMode === 'llm_optional') return 'legacy_ai_refined';
  return 'legacy_deterministic';
};

type StoredForm = {
  profile: AthleteInput;
  refinementMode: RefinementMode;
  plannerVersion: PlannerVersion;
};

const loadStoredForm = (): Partial<StoredForm> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredForm>;
    if (parsed.profile) {
      const result = athleteInputSchema.safeParse(parsed.profile);
      if (!result.success) return { refinementMode: parsed.refinementMode, plannerVersion: parsed.plannerVersion };
      parsed.profile = result.data;
    }
    return parsed;
  } catch {
    return {};
  }
};

const saveForm = (form: StoredForm) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch { /* quota exceeded — ignore */ }
};

type Notice = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message: string;
  details?: unknown;
};

type BusyAction =
  | 'health'
  | 'auth'
  | 'profile-load'
  | 'preview'
  | null;

type WorkflowStep = 'connect' | 'preview' | 'review';
type ResultTab = 'programme' | 'validation' | 'json';

type ProfileLoadState =
  | { status: 'default' }
  | { status: 'loading' }
  | {
      status: 'loaded';
      updatedAt: string | null;
      assumptions: string[];
    }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

type GymXUserProfile = {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  fitness_level: string | null;
  updated_at: string | null;
};

const labelize = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const ageFromDateOfBirth = (dateOfBirth: string): number => {
  const birthDate = new Date(`${dateOfBirth}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate());

  if (beforeBirthday) age -= 1;
  return age;
};

const mapGymXProfile = (
  source: GymXUserProfile,
): { profile: AthleteInput; assumptions: string[] } => {
  const assumptions: string[] = [];
  const name =
    source.full_name?.trim() ||
    [source.first_name, source.last_name].filter(Boolean).join(' ').trim() ||
    defaultProfile.name;
  const age = source.date_of_birth
    ? ageFromDateOfBirth(source.date_of_birth)
    : (source.age ?? defaultProfile.age);
  const sex =
    source.gender === 'male' || source.gender === 'female'
      ? source.gender
      : defaultProfile.sex;
  const fitnessLevel =
    source.fitness_level === 'beginner' ||
    source.fitness_level === 'intermediate' ||
    source.fitness_level === 'advanced'
      ? source.fitness_level
      : defaultProfile.fitness_level;

  if (!source.full_name && !source.first_name && !source.last_name)
    assumptions.push('Name uses the demo default.');
  if (source.age === null && !source.date_of_birth)
    assumptions.push('Age uses the demo default.');
  if (source.gender !== 'male' && source.gender !== 'female')
    assumptions.push('Sex uses the demo default because GymX has no binary value.');
  if (!source.current_weight_kg)
    assumptions.push('Current weight uses the demo default.');
  if (!source.target_weight_kg)
    assumptions.push('Target weight uses the demo default.');
  if (!source.height_cm) assumptions.push('Height uses the demo default.');
  if (fitnessLevel === defaultProfile.fitness_level && source.fitness_level !== fitnessLevel)
    assumptions.push('Fitness level uses the demo default.');
  assumptions.push(
    'Goal, availability, session duration, equipment, injuries, and InBody remain demo defaults because GymX user_profiles does not store those Odin fields.',
  );

  return {
    profile: {
      ...defaultProfile,
      name,
      age,
      sex,
      current_weight_kg:
        source.current_weight_kg ?? defaultProfile.current_weight_kg,
      target_weight_kg:
        source.target_weight_kg ?? defaultProfile.target_weight_kg,
      height_cm: source.height_cm ?? defaultProfile.height_cm,
      fitness_level: fitnessLevel,
    },
    assumptions,
  };
};

const errorNotice = (error: unknown): Notice => {
  if (error instanceof ApiError) {
    return {
      tone: 'error',
      title: error.code,
      message: error.message,
      details: error.details,
    };
  }
  return {
    tone: 'error',
    title: 'UNEXPECTED_ERROR',
    message: error instanceof Error ? error.message : 'Something went wrong.',
  };
};

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {hint ? <span className="field-hint">{hint}</span> : null}
  </label>
);

const Button = ({
  children,
  busy = false,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}) => (
  <button
    {...props}
    type={props.type ?? 'button'}
    className={`button button-${variant} ${props.className ?? ''}`}
    aria-busy={busy || undefined}
  >
    {busy ? <Loader2 size={16} className="spin" /> : null}
    {children}
  </button>
);

const StatusPill = ({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'positive' | 'warning' | 'negative' | 'neutral' | 'purple';
}) => <span className={`status-pill status-${tone}`}>{children}</span>;

const ScoreRing = ({ score }: { score: number }) => (
  <div
    className="score-ring"
    style={{ '--score': `${Math.max(0, Math.min(100, score)) * 3.6}deg` } as React.CSSProperties}
  >
    <div>
      <strong>{Math.round(score)}</strong>
      <span>/100</span>
    </div>
  </div>
);

// --- V1 Legacy Programme View ---

const WorkoutDay = ({ day }: { day: ProgrammeDay }) => (
  <details className={`workout-day workout-${day.workout_type}`}>
    <summary>
      <div className="day-code">{day.day_of_week.slice(0, 3)}</div>
      <div className="day-heading">
        <strong>{day.title || labelize(day.workout_type)}</strong>
        <span>
          {day.subtitle ||
            (day.workout_type === 'rest'
              ? 'Recovery day'
              : `${day.exercises.length} exercises`)}
        </span>
      </div>
      <div className="day-meta">
        {day.duration_min ? (
          <span>
            <Clock3 size={14} /> {day.duration_min} min
          </span>
        ) : null}
        <StatusPill>
          {day.workout_type === 'liss' ? 'LISS' : labelize(day.workout_type)}
        </StatusPill>
        <ChevronDown size={18} className="chevron" />
      </div>
    </summary>
    <div className="day-content">
      {day.liss_content ? <p className="liss-copy">{day.liss_content}</p> : null}
      {day.exercises.map((exercise) => (
        <div className="exercise-row" key={exercise.exercise_id}>
          <div className="exercise-order">
            {String(exercise.display_order + 1).padStart(2, '0')}
          </div>
          <div className="exercise-main">
            <strong>{exercise.exercise_name}</strong>
            <span>{exercise.primary_muscles.map(labelize).join(' · ')}</span>
          </div>
          <div className="set-chips">
            {exercise.sets.map((set) => (
              <span key={set.set_number}>
                {set.target_reps} reps
                <small> RPE {set.target_rpe}</small>
              </span>
            ))}
          </div>
          <div className="rest-copy">
            {exercise.sets[0]?.rest_seconds ?? 0}s rest
          </div>
        </div>
      ))}
    </div>
  </details>
);

const LegacyProgrammeView = ({
  programme,
  selectedPhase,
}: {
  programme: import('./api/contracts').OdinProgramme;
  selectedPhase: number;
}) => {
  const activeDays =
    programme.phase_week_templates.find(
      (template) => template.phase_number === selectedPhase,
    )?.days ?? [];

  return (
    <div className="workout-list">
      {activeDays.map((day) => (
        <WorkoutDay key={day.day_of_week} day={day} />
      ))}
    </div>
  );
};

// --- V2 Longitudinal Programme View ---

const dayTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    resistance: 'Resistance',
    conditioning: 'Conditioning',
    combined: 'Combined',
    sport: 'Sport',
    recovery: 'Recovery',
    rest: 'Rest',
  };
  return map[type] ?? labelize(type);
};

const dayTypeTone = (type: string): 'positive' | 'purple' | 'warning' | 'neutral' => {
  if (type === 'resistance' || type === 'combined') return 'positive';
  if (type === 'conditioning' || type === 'sport') return 'purple';
  if (type === 'recovery') return 'warning';
  return 'neutral';
};

const setsAreIdentical = (sets: { target_reps: number; target_rpe: number; rest_seconds: number }[]) => {
  if (sets.length <= 1) return true;
  const first = sets[0]!;
  return sets.every(
    (s) =>
      s.target_reps === first.target_reps &&
      s.target_rpe === first.target_rpe &&
      s.rest_seconds === first.rest_seconds,
  );
};

const V2DayCard = ({ day, calendarType }: { day: V2Day; calendarType: 'weekly' | 'rolling' }) => {
  const dayLabel = calendarType === 'weekly' && day.day_of_week
    ? day.day_of_week.slice(0, 3)
    : `D${day.cycle_day}`;

  if (day.day_type === 'rest') {
    return (
      <div className="v2-day-card v2-rest-day">
        <div className="v2-day-header">
          <div className="day-code">{dayLabel}</div>
          <div className="day-heading">
            <strong>{day.title}</strong>
            <span>Rest day</span>
          </div>
          <StatusPill>Rest</StatusPill>
        </div>
      </div>
    );
  }

  return (
    <details className="v2-day-card">
      <summary className="v2-day-header">
        <div className="day-code">{dayLabel}</div>
        <div className="day-heading">
          <strong>{day.title}</strong>
          <span>
            {day.subtitle || (day.session_metadata?.session_kind
              ? labelize(day.session_metadata.session_kind)
              : dayTypeLabel(day.day_type))}
          </span>
        </div>
        <div className="day-meta">
          {day.estimated_duration_min ? (
            <span><Clock3 size={14} /> {day.estimated_duration_min} min</span>
          ) : null}
          {day.fatigue_classification !== 'none' ? (
            <StatusPill tone={day.fatigue_classification === 'high' ? 'warning' : 'neutral'}>
              {labelize(day.fatigue_classification)} fatigue
            </StatusPill>
          ) : null}
          <StatusPill tone={dayTypeTone(day.day_type)}>
            {dayTypeLabel(day.day_type)}
          </StatusPill>
          <ChevronDown size={18} className="chevron" />
        </div>
      </summary>

      <div className="day-content">
        {day.movement_emphasis.length > 0 ? (
          <div className="v2-emphasis">
            {day.movement_emphasis.map((e) => (
              <StatusPill key={e}>{labelize(e)}</StatusPill>
            ))}
          </div>
        ) : null}

        {day.warmup.length > 0 ? (
          <div className="v2-section">
            <h5>Warm-up</h5>
            {day.warmup.map((item) => (
              <div className="v2-warmup-row" key={item.warmup_id}>
                <span className="v2-warmup-type">{labelize(item.component_type)}</span>
                <strong>{item.activity_name}</strong>
                <span className="v2-warmup-detail">
                  {item.duration_seconds
                    ? `${item.duration_seconds}s`
                    : item.repetitions
                      ? `${item.repetitions} reps`
                      : ''}
                  {item.related_exercise_id ? ' · linked' : ''}
                </span>
                {item.purpose ? <span className="v2-purpose">{item.purpose}</span> : null}
              </div>
            ))}
          </div>
        ) : null}

        {day.exercises.length > 0 ? (
          <div className="v2-section">
            <h5>Exercises</h5>
            {day.exercises.map((ex) => (
              <div className="v2-exercise-card" key={ex.prescription_id}>
                <div className="v2-exercise-header">
                  <div className="exercise-order">
                    {String(ex.display_order + 1).padStart(2, '0')}
                  </div>
                  <div className="exercise-main">
                    <strong>{ex.exercise_name}</strong>
                    <span>
                      {labelize(ex.sequence_role)}
                      {ex.movement_patterns.length > 0 ? ` · ${ex.movement_patterns.map(labelize).join(', ')}` : ''}
                    </span>
                  </div>
                  <div className="v2-exercise-meta">
                    <span>{ex.primary_muscles.map(labelize).join(', ')}</span>
                    {ex.equipment.length > 0 ? (
                      <span>{ex.equipment.map(labelize).join(', ')}</span>
                    ) : null}
                  </div>
                </div>

                <div className="v2-sets">
                  {setsAreIdentical(ex.sets) ? (
                    <div className="v2-set-compact">
                      {ex.sets.length} &times; {ex.sets[0]!.target_reps} &middot; RPE {ex.sets[0]!.target_rpe} &middot; Rest {ex.sets[0]!.rest_seconds}s
                    </div>
                  ) : (
                    ex.sets.map((set) => (
                      <div className="v2-set-row" key={set.set_number}>
                        Set {set.set_number} &middot; {set.target_reps} reps &middot; RPE {set.target_rpe} &middot; Rest {set.rest_seconds}s
                        {set.set_type !== 'working' ? (
                          <StatusPill>{labelize(set.set_type)}</StatusPill>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                {ex.user_progression_rule ? (
                  <div className="v2-progression">
                    <span>Progression:</span> {ex.user_progression_rule}
                  </div>
                ) : null}

                {ex.warnings.length > 0 ? (
                  <div className="v2-warnings">
                    {ex.warnings.map((w, i) => (
                      <span key={i}><AlertCircle size={12} /> {w}</span>
                    ))}
                  </div>
                ) : null}

                {ex.coaching_cues.length > 0 ? (
                  <div className="v2-cues">
                    {ex.coaching_cues.map((c, i) => (
                      <span key={i}>{c}</span>
                    ))}
                  </div>
                ) : null}

                {ex.sequencing_rationale.length > 0 ? (
                  <details className="v2-rationale">
                    <summary><Sparkles size={12} /> Why this exercise?</summary>
                    <ul>
                      {ex.sequencing_rationale.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}

                <details className="v2-dev-details">
                  <summary>IDs</summary>
                  <code>{ex.prescription_id} / {ex.exercise_id}</code>
                </details>
              </div>
            ))}
          </div>
        ) : null}

        {day.conditioning.length > 0 ? (
          <div className="v2-section">
            <h5>
              {day.conditioning.some((c) => c.conditioning_type === 'sport_conditioning')
                ? 'Sport'
                : 'Conditioning'}
            </h5>
            {day.conditioning.map((c) => (
              <div className="v2-conditioning-card" key={c.conditioning_id}>
                <div className="v2-conditioning-header">
                  <strong>{c.activity_name}</strong>
                  <StatusPill>{labelize(c.conditioning_type)}</StatusPill>
                </div>
                <dl className="v2-conditioning-meta">
                  <div><dt>Duration</dt><dd>{c.duration_min} min</dd></div>
                  <div><dt>Intensity</dt><dd>{c.intensity.target_label ?? `${c.intensity.method}${c.intensity.target_min != null ? ` ${c.intensity.target_min}–${c.intensity.target_max}` : ''}`}</dd></div>
                  <div><dt>Placement</dt><dd>{labelize(c.placement)}</dd></div>
                  <div><dt>Interference</dt><dd>{labelize(c.interference_risk)}</dd></div>
                  <div><dt>Impact</dt><dd>{labelize(c.impact_level)}</dd></div>
                  <div><dt>Fatigue</dt><dd>{labelize(c.fatigue_cost)}</dd></div>
                  {c.same_day_separation ? (
                    <div><dt>Separation</dt><dd>{labelize(c.same_day_separation.category)}</dd></div>
                  ) : null}
                </dl>
                {c.intervals ? (
                  <div className="v2-intervals">
                    {c.intervals.interval_count} intervals &middot;{' '}
                    {c.intervals.work_seconds}s work / {c.intervals.recovery_seconds}s recovery
                  </div>
                ) : null}
                <div className="v2-purpose">{c.purpose}</div>
                {c.rationale.length > 0 ? (
                  <details className="v2-rationale">
                    <summary><Sparkles size={12} /> Why this activity?</summary>
                    <ul>
                      {c.rationale.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {day.cooldown.length > 0 ? (
          <div className="v2-section">
            <h5>Cooldown</h5>
            {day.cooldown.map((item) => (
              <div className="v2-warmup-row" key={item.cooldown_id}>
                <strong>{item.activity_name}</strong>
                <span className="v2-warmup-detail">
                  {item.duration_seconds
                    ? `${item.duration_seconds}s`
                    : item.repetitions
                      ? `${item.repetitions} reps`
                      : ''}
                </span>
                {item.purpose ? <span className="v2-purpose">{item.purpose}</span> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </details>
  );
};

const V2WeekCard = ({ week, calendarType, defaultOpen }: { week: V2Week; calendarType: 'weekly' | 'rolling'; defaultOpen: boolean }) => {
  const isDeload = week.week_type === 'deload';

  return (
    <details className={`v2-week-card ${isDeload ? 'v2-deload' : ''}`} open={defaultOpen || undefined}>
      <summary className="v2-week-header">
        <ChevronRight size={16} className="v2-collapse-icon" />
        <strong>Week {week.week_number}</strong>
        <StatusPill tone={isDeload ? 'warning' : 'neutral'}>{labelize(week.week_type)}</StatusPill>
        <span className="v2-week-factors">
          Vol {week.planned_volume_factor.toFixed(2)} · Int {week.planned_intensity_factor.toFixed(2)} · Eff {week.planned_effort_factor.toFixed(2)}
        </span>
      </summary>
      <div className="v2-week-content">
        <p className="v2-objective">{week.objective}</p>
        {week.progression_notes.length > 0 ? (
          <details className="v2-rationale">
            <summary><Sparkles size={12} /> Why this week?</summary>
            <ul>
              {week.progression_notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </details>
        ) : null}
        <div className="v2-day-list">
          {week.days.map((day) => (
            <V2DayCard key={day.day_id} day={day} calendarType={calendarType} />
          ))}
        </div>
        {week.review_triggers.length > 0 ? (
          <div className="v2-review-triggers">
            <h5>Review Triggers</h5>
            {week.review_triggers.map((t, i) => (
              <div key={i} className="v2-trigger">
                <StatusPill>{labelize(t.trigger_type)}</StatusPill>
                <span>{t.message}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </details>
  );
};

const V2PhaseCard = ({ phase, calendarType, defaultOpen }: { phase: V2Phase; calendarType: 'weekly' | 'rolling'; defaultOpen: boolean }) => (
  <details className="v2-phase-card" open={defaultOpen || undefined}>
    <summary className="v2-phase-header">
      <ChevronRight size={18} className="v2-collapse-icon" />
      <div className="v2-phase-title">
        <strong>Phase {phase.phase_number}: {phase.name}</strong>
        <span>
          {labelize(phase.phase_type)} · Weeks {phase.start_week}–{phase.end_week}
        </span>
      </div>
      <div className="v2-phase-directions">
        <StatusPill>Vol {phase.volume_direction}</StatusPill>
        <StatusPill>Int {phase.intensity_direction}</StatusPill>
        <StatusPill>Eff {phase.effort_direction}</StatusPill>
      </div>
    </summary>
    <div className="v2-phase-content">
      <p className="v2-objective">{phase.objective}</p>
      {phase.rationale.length > 0 ? (
        <details className="v2-rationale v2-rationale-phase">
          <summary><Sparkles size={12} /> Why this phase?</summary>
          <ul>
            {phase.rationale.map((r, i) => (
              <li key={i}>
                <strong>{labelize(r.code)}</strong>: {r.reason}
                <span className="v2-rationale-value">{r.selected_value}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {phase.weeks.map((week, i) => (
        <V2WeekCard
          key={week.week_id}
          week={week}
          calendarType={calendarType}
          defaultOpen={defaultOpen && i === 0}
        />
      ))}
    </div>
  </details>
);

const ProgrammeSummaryCard = ({ programme }: { programme: LongitudinalOdinProgramme }) => {
  const p = programme.programme;
  const s = programme.strategy;
  const cal = programme.calendar;

  const items: [string, string | number | undefined][] = [
    ['Objective', p.goal_description],
    ['Start date', p.start_date],
    ['Target weeks', p.target_weeks],
    ['Start weight', `${p.start_weight_kg} kg`],
    ['Target weight', `${p.target_weight_kg} kg`],
    ['Periodization', labelize(s.periodization_model)],
    ['Progression', labelize(s.progression_model)],
    ['Split', labelize(s.split_type)],
    ['Resistance frequency', `${s.resistance_frequency}x/cycle`],
    ['Conditioning frequency', `${s.conditioning_frequency}x/cycle`],
    ['Calendar', labelize(cal.cycle_type)],
    ['Cycle length', `${cal.cycle_length_days} days`],
    ['Volume strategy', labelize(s.volume_strategy)],
    ['Intensity strategy', labelize(s.intensity_strategy)],
    ['Fatigue strategy', labelize(s.fatigue_strategy)],
    ['Conditioning strategy', labelize(s.conditioning_strategy)],
  ];

  return (
    <div className="v2-summary-card">
      <dl className="v2-summary-grid">
        {items.map(
          ([label, value]) =>
            value != null && value !== '' ? (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ) : null,
        )}
      </dl>
    </div>
  );
};

const LongitudinalProgrammeView = ({ programme }: { programme: LongitudinalOdinProgramme }) => (
  <div className="v2-programme">
    <ProgrammeSummaryCard programme={programme} />
    <div className="v2-phase-list">
      {programme.phases.map((phase, i) => (
        <V2PhaseCard
          key={phase.phase_id}
          phase={phase}
          calendarType={programme.calendar.cycle_type}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  </div>
);

// --- Generation Metadata ---

const GenerationMeta = ({ data }: { data: ProgrammePreviewResponse }) => {
  const ai = data.generation.ai_generation;
  return (
    <div className="v2-gen-meta">
      <div><dt>Planner</dt><dd>{labelize(data.planner_version)}</dd></div>
      <div><dt>Schema</dt><dd>{data.schema_version}</dd></div>
      <div><dt>Source</dt><dd>{labelize(data.source)}</dd></div>
      <div><dt>Validation</dt><dd>{data.validation.passed ? 'Valid' : 'Invalid'}</dd></div>
      <div><dt>Score</dt><dd>{Math.round(data.validation.overall_score)}</dd></div>
      <div>
        <dt>Refinement</dt>
        <dd>
          {data.refinement.status === 'applied' || data.refinement.status === 'accepted'
            ? data.refinement.operation_count != null && data.refinement.operation_count > 0
              ? `Applied (${data.refinement.operation_count} changes)`
              : data.refinement.applied
                ? 'Applied'
                : 'No change'
            : data.refinement.status === 'not_requested'
              ? 'Not requested'
              : data.refinement.status === 'fallback'
                ? `Fallback${data.refinement.reason_code ? ` — ${data.refinement.reason_code}` : ''}`
                : labelize(data.refinement.status)}
        </dd>
      </div>
      {ai ? (
        <>
          <div>
            <dt>AI tokens</dt>
            <dd>{(ai.total_input_tokens + ai.total_output_tokens).toLocaleString()}</dd>
          </div>
          {ai.fallback_used ? (
            <div>
              <dt>AI fallback</dt>
              <dd>{ai.fallback_reason ?? 'Yes'}</dd>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

// --- Unsupported version ---

const UnsupportedVersionView = () => (
  <div className="validation-card">
    <h4>Unsupported programme version</h4>
    <p>
      This programme version is not supported by the current demo UI.
      Inspect the Raw JSON response for details.
    </p>
  </div>
);

// --- Result tabs ---

const ResultTabs = ({
  active,
  onChange,
}: {
  active: ResultTab;
  onChange: (tab: ResultTab) => void;
}) => (
  <div className="result-tabs">
    {(['programme', 'validation', 'json'] as const).map((tab) => (
      <button
        key={tab}
        type="button"
        className={active === tab ? 'active' : ''}
        onClick={() => onChange(tab)}
      >
        {tab === 'programme' ? 'Programme' : tab === 'validation' ? 'Validation' : 'Raw JSON'}
      </button>
    ))}
  </div>
);

// --- Raw JSON viewer ---

const RawJsonViewer = ({ data }: { data: unknown }) => {
  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    void navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="raw-json-viewer">
      <div className="raw-json-toolbar">
        <button type="button" onClick={copyJson} className="button button-ghost">
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <pre className="raw-json-content">{json}</pre>
    </div>
  );
};

function App() {
  const [storedForm] = useState(loadStoredForm);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<AthleteInput>(storedForm.profile ?? defaultProfile);
  const [profileLoad, setProfileLoad] =
    useState<ProfileLoadState>({ status: 'default' });
  const [generationMode, setGenerationMode] = useState<GenerationMode>(
    paramsToGenerationMode(
      storedForm.plannerVersion ?? 'ai_agent_v1',
      storedForm.refinementMode ?? 'deterministic',
    ),
  );
  const { plannerVersion, refinementMode } = generationModeToParams(generationMode);
  const [programme, setProgramme] =
    useState<ProgrammePreviewResponse | null>(null);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [resultTab, setResultTab] = useState<ResultTab>('programme');
  const [busy, setBusy] = useState<BusyAction>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [health, setHealth] = useState<{
    status: 'checking' | 'online' | 'offline';
    version?: string;
    openaiConnected?: boolean;
    aiAgentEnabled?: boolean;
  }>({ status: 'checking' });

  const workflowStep: WorkflowStep = !token.trim()
    ? 'connect'
    : !programme
      ? 'preview'
      : 'review';

  const isBusy = busy !== null;

  const run = async <T,>(
    action: Exclude<BusyAction, null>,
    operation: () => Promise<T>,
    onSuccess: (value: T) => void,
  ) => {
    setBusy(action);
    setNotice(null);
    try {
      onSuccess(await operation());
    } catch (error) {
      setNotice(errorNotice(error));
    } finally {
      setBusy(null);
    }
  };

  const checkHealth = async () => {
    setBusy('health');
    setNotice(null);
    try {
      const data = await odinApi.health();
      setHealth({
        status: 'online',
        version: data.version,
        openaiConnected: data.openai_connected,
        aiAgentEnabled: data.ai_agent_enabled,
      });
      setNotice({
        tone: 'success',
        title: 'API connected',
        message: `Agent Odin ${data.version} is healthy.`,
      });
    } catch (error) {
      setHealth({ status: 'offline' });
      setNotice(errorNotice(error));
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    odinApi
      .health()
      .then((data) => setHealth({
        status: 'online',
        version: data.version,
        openaiConnected: data.openai_connected,
        aiAgentEnabled: data.ai_agent_enabled,
      }))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  useEffect(() => {
    if (!supabaseAuth) return;

    void supabaseAuth.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? '');
      setSessionEmail(data.session?.user.email ?? null);
    });

    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? '');
      setSessionEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    saveForm({ profile, refinementMode, plannerVersion });
  }, [profile, refinementMode, plannerVersion, generationMode]);

  const loadAuthenticatedProfile = async (showNotice = true) => {
    const authClient = supabaseAuth;

    if (!authClient) return;

    setBusy('profile-load');
    setProfileLoad({ status: 'loading' });

    try {
      const { data, error } = await authClient
        .from('user_profiles')
        .select(
          'full_name,first_name,last_name,age,date_of_birth,gender,height_cm,current_weight_kg,target_weight_kg,fitness_level,updated_at',
        )
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setProfile(defaultProfile);
        setProfileLoad({ status: 'not_found' });
        if (showNotice) {
          setNotice({
            tone: 'info',
            title: 'Signed in — no saved profile',
            message:
              'Authentication succeeded, but this user has no GymX user_profiles row. The form remains on demo defaults.',
          });
        }
        return;
      }

      const mapped = mapGymXProfile(data as GymXUserProfile);
      const parsed = athleteInputSchema.safeParse(mapped.profile);

      if (!parsed.success) {
        throw new Error(
          'The mapped GymX profile does not match the current Odin profile schema.',
        );
      }

      setProfile(parsed.data);
      setProfileLoad({
        status: 'loaded',
        updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
        assumptions: mapped.assumptions,
      });
      if (showNotice) {
        setNotice({
          tone: 'success',
          title: 'GymX profile loaded',
          message:
            'Supabase authentication is valid. Compatible fields from this user’s GymX profile populated the Odin form.',
          details: {
            mapping_assumptions: mapped.assumptions,
          },
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Profile loading failed.';
      setProfileLoad({ status: 'error', message });
      if (showNotice) {
        setNotice({
          tone: 'error',
          title: 'PROFILE_LOAD_FAILED',
          message,
        });
      }
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (!token) {
      setProfileLoad({ status: 'default' });
      return;
    }

    void loadAuthenticatedProfile(true);
  }, [token]);

  const requireToken = (): boolean => {
    if (token.trim()) return true;
    setNotice({
      tone: 'info',
      title: 'Sign in required',
      message:
        'Sign in with a Supabase development test user before calling a protected endpoint.',
    });
    return false;
  };

  const signIn = () => {
    const authClient = supabaseAuth;

    if (!authClient) {
      setNotice({
        tone: 'info',
        title: 'Supabase configuration required',
        message:
          'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to demo-ui/.env.local, then restart Vite.',
      });
      return;
    }
    if (!email.trim() || !password) {
      setNotice({
        tone: 'info',
        title: 'Credentials required',
        message: 'Enter the email and password for a development test user.',
      });
      return;
    }

    void run(
      'auth',
      async () => {
        const { data, error } = await authClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.session) throw new Error('Supabase did not return a session.');
        return data.session;
      },
      (session) => {
        setToken(session.access_token);
        setSessionEmail(session.user.email ?? email.trim());
        setPassword('');
        setNotice({
          tone: 'success',
          title: 'Signed in',
          message: `Connected as ${session.user.email ?? 'Supabase test user'}.`,
        });
      },
    );
  };

  const signOut = () => {
    const authClient = supabaseAuth;

    if (!authClient) return;
    void run(
      'auth',
      async () => {
        const { error } = await authClient.auth.signOut();
        if (error) throw error;
      },
      () => {
        setToken('');
        setSessionEmail(null);
        setProfile(defaultProfile);
        setProfileLoad({ status: 'default' });
        setProgramme(null);
        setNotice({
          tone: 'success',
          title: 'Signed out',
          message: 'The local Supabase session has been cleared.',
        });
      },
    );
  };

  const updateProfile = <K extends keyof AthleteInput>(
    key: K,
    value: AthleteInput[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updateNestedProfile = <K extends keyof AthleteInput>(
    group: K,
    field: string,
    value: unknown,
  ) => {
    setProfile((current) => ({
      ...current,
      [group]: { ...((current[group] as Record<string, unknown>) ?? {}), [field]: value },
    }));
  };

  const toggleScheduleDay = (day: DayOfWeek) => {
    setProfile((current) => {
      const currentDays = current.schedule?.available_days ?? [];
      const next = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      return {
        ...current,
        available_days_per_week: next.length || current.available_days_per_week,
        schedule: { ...(current.schedule ?? {}), available_days: next },
      };
    });
  };

  const generatePreview = () => {
    if (!requireToken()) return;
    const parsed = athleteInputSchema.safeParse(profile);
    if (!parsed.success) {
      setNotice({
        tone: 'error',
        title: 'PROFILE_VALIDATION_FAILED',
        message:
          'Review the validation details and correct the profile before generating a preview.',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    void run(
      'preview',
      () =>
        odinApi.preview(
          token.trim(),
          parsed.data,
          refinementMode,
          plannerVersion,
        ),
      (data) => {
        setProgramme(data);
        setResultTab('programme');
        if (isLegacyProgramme(data.programme)) {
          setSelectedPhase(data.programme.phases[0]?.phase_number ?? 1);
        }
        setNotice({
          tone: 'success',
          title: 'Programme preview generated',
          message: `${data.programme.programme.name} is ready to review. Nothing was persisted.`,
        });
        document
          .querySelector('#programme')
          ?.scrollIntoView({ behavior: 'smooth' });
      },
    );
  };

  const programmeName = programme?.programme.programme.name ?? '';
  const programmeDescription = programme
    ? isLegacyProgramme(programme.programme)
      ? programme.programme.programme.goal_description
      : isLongitudinalProgramme(programme.programme)
        ? programme.programme.programme.goal_description
        : ''
    : '';

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Odin Programme Studio">
          <span className="brand-mark">
            <Dumbbell size={20} />
          </span>
          <span>
            <strong>ODIN</strong>
            <small>Programme Studio</small>
          </span>
        </a>
        <nav>
          <a href="#athlete">Athlete</a>
          <a href="#generate">Preview</a>
          <a href="#programme">Programme</a>
        </nav>
        <button
          className={`health-chip health-${health.status}`}
          onClick={() => void checkHealth()}
          disabled={isBusy}
          aria-label={`API ${health.status}${
            health.version ? `, version ${health.version}` : ''
          }. Check health`}
        >
          {busy === 'health' ? (
            <Loader2 size={14} className="spin" />
          ) : (
            <span className="health-dot" />
          )}
          API {health.status}
          {health.version ? ` · v${health.version}` : ''}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow">
            <Sparkles size={14} /> AI-powered programme planning
          </div>
          <h1>
            Build with precision.
            <span>Train with intent.</span>
          </h1>
          <p>
            A focused interface for Odin's authenticated API—from transient
            athlete input to a validated, exercise-level programme preview.
          </p>
          <div className="hero-steps">
            <span><b>01</b> Connect</span>
            <ArrowRight size={16} />
            <span><b>02</b> Profile</span>
            <ArrowRight size={16} />
            <span><b>03</b> Generate</span>
            <ArrowRight size={16} />
            <span><b>04</b> Review</span>
          </div>
        </section>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="section-icon"><KeyRound size={20} /></div>
          {sessionEmail ? (
            <>
              <div className="auth-copy">
                <strong id="auth-title">Connected to Supabase</strong>
                <span>{sessionEmail}</span>
              </div>
              <StatusPill tone="positive">
                <Check size={13} /> Authenticated
              </StatusPill>
              <Button
                variant="secondary"
                onClick={signOut}
                busy={busy === 'auth'}
                disabled={isBusy}
              >
                <LogOut size={15} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <div className="auth-copy">
                <strong id="auth-title">Sign in to Supabase</strong>
                <span>Use a development test user. Session managed by Supabase.</span>
              </div>
              <div className="auth-fields">
                <label>
                  <Mail size={15} />
                  <input
                    aria-label="Supabase email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="test@example.com"
                    autoComplete="username"
                  />
                </label>
                <label>
                  <LockKeyhole size={15} />
                  <input
                    aria-label="Supabase password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') signIn();
                    }}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </label>
              </div>
              <Button onClick={signIn} busy={busy === 'auth'} disabled={isBusy}>
                <LogIn size={15} /> Sign in
              </Button>
            </>
          )}
          {!isSupabaseAuthConfigured ? (
            <div className="auth-config-warning">
              <AlertCircle size={15} />
              Add Supabase URL and anon key to <code>demo-ui/.env.local</code>.
            </div>
          ) : null}
        </section>

        {notice ? (
          <section
            className={`notice notice-${notice.tone}`}
            role={notice.tone === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {notice.tone === 'success' ? (
              <Check size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <div>
              <strong>{notice.title}</strong>
              <span>{notice.message}</span>
              {notice.details ? (
                <details>
                  <summary>Validation details</summary>
                  <pre>{JSON.stringify(notice.details, null, 2)}</pre>
                </details>
              ) : null}
            </div>
            <button onClick={() => setNotice(null)} aria-label="Dismiss message">
              &times;
            </button>
          </section>
        ) : null}

        <section className="workspace-grid">
          <div className="main-column">
            <section className="panel" id="athlete">
              <div className="panel-heading">
                <div>
                  <span className="section-number">01</span>
                  <div>
                    <h2>Athlete profile</h2>
                    <p>Inputs match the current transient athlete contract.</p>
                  </div>
                </div>
                <StatusPill
                  tone={
                    profileLoad.status === 'loaded'
                      ? 'positive'
                      : profileLoad.status === 'error'
                        ? 'negative'
                        : 'neutral'
                  }
                >
                  {profileLoad.status === 'loading' ? (
                    <Loader2 size={13} className="spin" />
                  ) : profileLoad.status === 'loaded' ? (
                    <Database size={13} />
                  ) : (
                    <UserRound size={13} />
                  )}
                  {profileLoad.status === 'loaded'
                    ? 'Loaded from GymX'
                    : profileLoad.status === 'not_found'
                      ? 'New profile'
                      : profileLoad.status === 'error'
                        ? 'Load failed'
                        : profileLoad.status === 'loading'
                          ? 'Loading'
                          : 'Required'}
                </StatusPill>
              </div>

              <div className="form-grid">
                <Field label="Name">
                  <input
                    aria-label="Athlete name"
                    value={profile.name}
                    onChange={(event) => updateProfile('name', event.target.value)}
                  />
                </Field>
                <Field label="Age">
                  <input
                    aria-label="Athlete age"
                    type="number"
                    min={16}
                    max={100}
                    value={profile.age}
                    onChange={(event) =>
                      updateProfile('age', Number(event.target.value))
                    }
                  />
                </Field>
                <Field label="Sex">
                  <select
                    aria-label="Athlete sex"
                    value={profile.sex}
                    onChange={(event) =>
                      updateProfile('sex', event.target.value as AthleteInput['sex'])
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Fitness level">
                  <select
                    aria-label="Fitness level"
                    value={profile.fitness_level}
                    onChange={(event) =>
                      updateProfile(
                        'fitness_level',
                        event.target.value as AthleteInput['fitness_level'],
                      )
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </Field>
                <Field label="Current weight" hint="Kilograms">
                  <input
                    aria-label="Current weight in kilograms"
                    type="number"
                    step="0.1"
                    min="1"
                    value={profile.current_weight_kg}
                    onChange={(event) =>
                      updateProfile(
                        'current_weight_kg',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Target weight" hint="Kilograms">
                  <input
                    aria-label="Target weight in kilograms"
                    type="number"
                    step="0.1"
                    min="1"
                    value={profile.target_weight_kg}
                    onChange={(event) =>
                      updateProfile(
                        'target_weight_kg',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Height" hint="Centimetres">
                  <input
                    aria-label="Height in centimetres"
                    type="number"
                    min="1"
                    value={profile.height_cm}
                    onChange={(event) =>
                      updateProfile('height_cm', Number(event.target.value))
                    }
                  />
                </Field>
                <Field label="Goal">
                  <select
                    aria-label="Training goal"
                    value={profile.goal}
                    onChange={(event) =>
                      updateProfile(
                        'goal',
                        event.target.value as AthleteInput['goal'],
                      )
                    }
                  >
                    {[
                      'fat_loss',
                      'muscle_gain',
                      'recomposition',
                      'strength',
                      'endurance',
                    ].map((goal) => (
                      <option key={goal} value={goal}>{labelize(goal)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Training days" hint="2–7 days per week">
                  <input
                    aria-label="Available training days per week"
                    type="number"
                    min={2}
                    max={7}
                    value={profile.available_days_per_week}
                    onChange={(event) =>
                      updateProfile(
                        'available_days_per_week',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Session duration" hint="20–180 minutes">
                  <input
                    aria-label="Session duration in minutes"
                    type="number"
                    min={20}
                    max={180}
                    value={profile.session_duration_min}
                    onChange={(event) =>
                      updateProfile(
                        'session_duration_min',
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Equipment">
                  <select
                    aria-label="Available equipment"
                    value={profile.equipment}
                    onChange={(event) =>
                      updateProfile(
                        'equipment',
                        event.target.value as AthleteInput['equipment'],
                      )
                    }
                  >
                    {[
                      'full_gym',
                      'dumbbells_only',
                      'bodyweight',
                      'home_gym',
                    ].map((equipment) => (
                      <option key={equipment} value={equipment}>
                        {labelize(equipment)}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="field span-2">
                  <span className="field-label">Injuries and restrictions</span>
                  <div className="injury-row">
                    <input
                      aria-label="Injury area"
                      value={profile.injuries[0]?.area ?? ''}
                      onChange={(event) => {
                        const area = event.target.value;
                        updateProfile(
                          'injuries',
                          area
                            ? [{
                                area,
                                severity: profile.injuries[0]?.severity ?? 'modify',
                                notes: profile.injuries[0]?.notes ?? '',
                              }]
                            : [],
                        );
                      }}
                      placeholder="Optional area, e.g. shoulder"
                    />
                    <select
                      aria-label="Injury severity"
                      value={profile.injuries[0]?.severity ?? 'modify'}
                      disabled={!profile.injuries[0]}
                      onChange={(event) => {
                        if (!profile.injuries[0]) return;
                        updateProfile('injuries', [{
                          ...profile.injuries[0],
                          severity: event.target.value as 'avoid' | 'modify',
                        }]);
                      }}
                    >
                      <option value="modify">Modify</option>
                      <option value="avoid">Avoid</option>
                    </select>
                    <input
                      aria-label="Injury notes"
                      value={profile.injuries[0]?.notes ?? ''}
                      disabled={!profile.injuries[0]}
                      onChange={(event) => {
                        if (!profile.injuries[0]) return;
                        updateProfile('injuries', [{
                          ...profile.injuries[0],
                          notes: event.target.value,
                        }]);
                      }}
                      placeholder="Optional notes"
                    />
                  </div>
                  <span className="field-hint">
                    Demo supports one visible restriction; the API accepts an array.
                  </span>
                </div>
              </div>

              <details className="advanced-section">
                <summary>Nutrition</summary>
                <div className="section-grid">
                  <Field label="Calorie status">
                    <select
                      aria-label="Calorie status"
                      value={profile.nutrition?.calorie_status ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'nutrition',
                          'calorie_status',
                          event.target.value || undefined,
                        )
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="deficit">Deficit</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="surplus">Surplus</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </Field>
                  <Field label="Daily protein" hint="Grams per day">
                    <input
                      aria-label="Estimated protein grams per day"
                      type="number"
                      min={0}
                      max={1000}
                      value={profile.nutrition?.estimated_protein_g_per_day ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'nutrition',
                          'estimated_protein_g_per_day',
                          event.target.value ? Number(event.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 140"
                    />
                  </Field>
                </div>
              </details>

              <details className="advanced-section">
                <summary>Training History</summary>
                <div className="section-grid">
                  <Field label="Years training">
                    <input
                      aria-label="Years of consistent training"
                      type="number"
                      min={0}
                      max={80}
                      step={0.5}
                      value={profile.training_history?.years_consistent_training ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'training_history',
                          'years_consistent_training',
                          event.target.value ? Number(event.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 3"
                    />
                  </Field>
                  <Field label="Recent consistency" hint="Last 12 weeks">
                    <select
                      aria-label="Consistency last 12 weeks"
                      value={profile.training_history?.consistency_last_12_weeks ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'training_history',
                          'consistency_last_12_weeks',
                          event.target.value || undefined,
                        )
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </Field>
                  <Field label="Current sessions/week">
                    <input
                      aria-label="Current sessions per week"
                      type="number"
                      min={0}
                      max={14}
                      value={profile.training_history?.current_sessions_per_week ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'training_history',
                          'current_sessions_per_week',
                          event.target.value ? Number(event.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 4"
                    />
                  </Field>
                  <Field label="Exercise competency">
                    <select
                      aria-label="Exercise competency"
                      value={profile.training_history?.exercise_competency ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'training_history',
                          'exercise_competency',
                          event.target.value || undefined,
                        )
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="novice">Novice</option>
                      <option value="competent">Competent</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </Field>
                </div>
              </details>

              <details className="advanced-section">
                <summary>Lifestyle</summary>
                <div className="section-grid">
                  <Field label="Sleep hours" hint="Average per night">
                    <input
                      aria-label="Average sleep hours"
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={profile.lifestyle?.sleep_hours ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'lifestyle',
                          'sleep_hours',
                          event.target.value ? Number(event.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 7"
                    />
                  </Field>
                  <Field label="Perceived stress" hint="1 = low, 10 = high">
                    <input
                      aria-label="Perceived stress level"
                      type="number"
                      min={1}
                      max={10}
                      value={profile.lifestyle?.perceived_stress ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'lifestyle',
                          'perceived_stress',
                          event.target.value ? Number(event.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 4"
                    />
                  </Field>
                  <Field label="Occupation type">
                    <select
                      aria-label="Occupation type"
                      value={profile.lifestyle?.occupation_type ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'lifestyle',
                          'occupation_type',
                          event.target.value || undefined,
                        )
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="sedentary">Sedentary</option>
                      <option value="mixed">Mixed</option>
                      <option value="active">Active</option>
                      <option value="manual">Manual</option>
                    </select>
                  </Field>
                </div>
              </details>

              <details className="advanced-section">
                <summary>Sport</summary>
                <div className="section-grid">
                  <Field label="Sport name">
                    <input
                      aria-label="Sport name"
                      value={profile.sport?.name ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'sport',
                          'name',
                          event.target.value || undefined,
                        )
                      }
                      placeholder="e.g. Football, BJJ"
                    />
                  </Field>
                  <Field label="Sessions/week">
                    <input
                      aria-label="Sport sessions per week"
                      type="number"
                      min={0}
                      max={14}
                      value={profile.sport?.sessions_per_week ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'sport',
                          'sessions_per_week',
                          event.target.value ? Number(event.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 3"
                    />
                  </Field>
                  <Field label="Sport intensity">
                    <select
                      aria-label="Sport intensity"
                      value={profile.sport?.intensity ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'sport',
                          'intensity',
                          event.target.value || undefined,
                        )
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </Field>
                  <Field label="Sport priority">
                    <select
                      aria-label="Sport priority"
                      value={profile.sport?.priority ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'sport',
                          'priority',
                          event.target.value || undefined,
                        )
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="supporting">Supporting</option>
                      <option value="equal">Equal</option>
                      <option value="primary">Primary</option>
                    </select>
                  </Field>
                  <Field label="Lower body load">
                    <select
                      aria-label="Sport lower body load"
                      value={profile.sport?.lower_body_load ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'sport',
                          'lower_body_load',
                          event.target.value || undefined,
                        )
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </Field>
                </div>
              </details>

              <details className="advanced-section">
                <summary>Schedule</summary>
                <div className="section-grid">
                  <div className="field span-2">
                    <span className="field-label">Available days</span>
                    <div className="day-toggles">
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                        <label key={day} className="day-toggle">
                          <input
                            type="checkbox"
                            checked={profile.schedule?.available_days?.includes(day) ?? false}
                            onChange={() => toggleScheduleDay(day)}
                          />
                          <span>{day.slice(0, 3).toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                    <span className="field-hint">
                      Selecting days auto-syncs the training days count above.
                    </span>
                  </div>
                  <Field label="Preferred time">
                    <input
                      aria-label="Preferred workout time"
                      value={profile.schedule?.preferred_workout_time ?? ''}
                      onChange={(event) =>
                        updateNestedProfile(
                          'schedule',
                          'preferred_workout_time',
                          event.target.value || undefined,
                        )
                      }
                      placeholder="e.g. morning, evening"
                    />
                  </Field>
                </div>
              </details>

              <div className="panel-actions">
                <span>
                  <ShieldCheck size={16} />
                  {profileLoad.status === 'loaded'
                    ? `Mapped from GymX through user-scoped RLS${
                        profileLoad.updatedAt
                          ? ` · ${new Date(profileLoad.updatedAt).toLocaleString()}`
                          : ''
                      }`
                    : 'User ID comes from the verified token'}
                </span>
                <div className="profile-actions">
                  <Button
                    variant="secondary"
                    onClick={() => void loadAuthenticatedProfile(true)}
                    busy={busy === 'profile-load'}
                    disabled={!token || isBusy}
                  >
                    <RefreshCw size={16} /> Reload profile
                  </Button>
                </div>
              </div>
            </section>

            <section className="panel" id="generate">
              <div className="panel-heading">
                <div>
                  <span className="section-number">02</span>
                  <div>
                    <h2>Generate preview</h2>
                    <p>
                      Athlete input is sent transiently and is not persisted by Odin.
                    </p>
                  </div>
                </div>
                <StatusPill tone="purple"><Bot size={13} /> Odin</StatusPill>
              </div>

              <div className="mode-grid">
                {GENERATION_MODES.map(({ value, title, description }) => (
                  <label
                    key={value}
                    className={`mode-card ${generationMode === value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="generation-mode"
                      value={value}
                      checked={generationMode === value}
                      onChange={() => setGenerationMode(value)}
                    />
                    <span className="radio-mark" />
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </label>
                ))}
              </div>

              {health.status === 'online' && (
                <div className={`openai-status ${health.openaiConnected ? 'connected' : 'disconnected'}`}>
                  <span className="openai-status-dot" />
                  <span>
                    {health.openaiConnected
                      ? 'OpenAI connected — AI generation available'
                      : 'OpenAI not configured — AI modes will fall back to deterministic'}
                  </span>
                </div>
              )}

              <div className="preview-actions">
                <span>
                  <ShieldCheck size={16} />
                  Authenticated, stateless preview
                </span>
                <Button
                  onClick={generatePreview}
                  busy={busy === 'preview'}
                  disabled={isBusy}
                >
                  <Sparkles size={16} /> Generate preview
                </Button>
              </div>
            </section>

            <section className="panel programme-panel" id="programme">
              <div className="panel-heading programme-heading">
                <div>
                  <span className="section-number">03</span>
                  <div>
                    <h2>Programme review</h2>
                    <p>Inspect the transient output, validation, and refinement metadata.</p>
                  </div>
                </div>
              </div>

              {programme ? (
                <div className="programme-result">
                  <div className="programme-overview">
                    <div>
                      <div className="eyebrow">Stateless preview</div>
                      <h3>{programmeName}</h3>
                      <p>{programmeDescription}</p>
                      <div className="overview-pills">
                        <StatusPill tone={programme.validation.passed ? 'positive' : 'negative'}>
                          {programme.validation.passed ? 'Validated' : 'Invalid'}
                        </StatusPill>
                        <StatusPill tone={programme.source === 'ai_generated' ? 'purple' : 'neutral'}>{labelize(programme.source)}</StatusPill>
                        <StatusPill>{labelize(programme.planner_version)}</StatusPill>
                        <StatusPill>Schema {programme.schema_version}</StatusPill>
                        {isLegacyProgramme(programme.programme) ? (
                          <>
                            <StatusPill>{programme.programme.programme.target_weeks} weeks</StatusPill>
                            <StatusPill>{programme.programme.programme.available_days} days</StatusPill>
                          </>
                        ) : isLongitudinalProgramme(programme.programme) ? (
                          <StatusPill>{programme.programme.programme.target_weeks} weeks</StatusPill>
                        ) : null}
                      </div>
                    </div>
                    <ScoreRing score={programme.validation.overall_score} />
                  </div>

                  <GenerationMeta data={programme} />
                  <ResultTabs active={resultTab} onChange={setResultTab} />

                  {resultTab === 'programme' ? (
                    <>
                      {isLegacyProgramme(programme.programme) ? (
                        <>
                          <div className="phase-tabs">
                            {programme.programme.phases.map((phase) => (
                              <button
                                type="button"
                                key={phase.phase_number}
                                className={selectedPhase === phase.phase_number ? 'active' : ''}
                                onClick={() => setSelectedPhase(phase.phase_number)}
                              >
                                <span>Phase {phase.phase_number}</span>
                                <strong>{phase.name}</strong>
                                <small>{phase.weeks_count} weeks</small>
                              </button>
                            ))}
                          </div>
                          <LegacyProgrammeView
                            programme={programme.programme}
                            selectedPhase={selectedPhase}
                          />
                        </>
                      ) : isLongitudinalProgramme(programme.programme) ? (
                        <LongitudinalProgrammeView programme={programme.programme} />
                      ) : (
                        <UnsupportedVersionView />
                      )}
                    </>
                  ) : resultTab === 'validation' ? (
                    <div className="validation-grid">
                      <div className="validation-card">
                        <div className="card-title">
                          <FileCheck2 size={18} />
                          <strong>Validation report</strong>
                          <StatusPill
                            tone={programme.validation.passed ? 'positive' : 'negative'}
                          >
                            {labelize(programme.validation.status)}
                          </StatusPill>
                        </div>
                        <div className="score-bars">
                          {Object.entries(programme.validation.scores).map(
                            ([name, score]) => (
                              <div key={name}>
                                <span>{labelize(name)}</span>
                                <i><b style={{ width: `${score}%` }} /></i>
                                <strong>{Math.round(score)}</strong>
                              </div>
                            ),
                          )}
                        </div>
                        {programme.validation.findings.length ? (
                          <div className="findings">
                            {programme.validation.findings.map((finding, index) => (
                              <div key={`${finding.code}-${index}`} className={`finding-${finding.severity}`}>
                                <AlertCircle size={14} />
                                <span>
                                  <strong>{finding.code}</strong>
                                  {finding.message}
                                  {finding.category ? <small>{labelize(finding.category)}</small> : null}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="empty-note"><Check size={15} /> No validation findings.</p>
                        )}
                      </div>

                      {programme.generation.ai_generation ? (
                        <div className="validation-card">
                          <div className="card-title">
                            <Sparkles size={18} />
                            <strong>AI Generation</strong>
                            <StatusPill tone={programme.generation.ai_generation.fallback_used ? 'warning' : 'positive'}>
                              {programme.generation.ai_generation.fallback_used ? 'Fallback' : 'AI Generated'}
                            </StatusPill>
                          </div>
                          <dl className="metadata-list">
                            <div><dt>Source</dt><dd>{labelize(programme.source)}</dd></div>
                            <div><dt>Input tokens</dt><dd>{programme.generation.ai_generation.total_input_tokens.toLocaleString()}</dd></div>
                            <div><dt>Output tokens</dt><dd>{programme.generation.ai_generation.total_output_tokens.toLocaleString()}</dd></div>
                            <div><dt>Total tokens</dt><dd>{(programme.generation.ai_generation.total_input_tokens + programme.generation.ai_generation.total_output_tokens).toLocaleString()}</dd></div>
                            <div><dt>Fallback used</dt><dd>{programme.generation.ai_generation.fallback_used ? 'Yes' : 'No'}</dd></div>
                            {programme.generation.ai_generation.fallback_reason ? (
                              <div><dt>Fallback reason</dt><dd>{programme.generation.ai_generation.fallback_reason}</dd></div>
                            ) : null}
                          </dl>
                        </div>
                      ) : null}

                      <div className="validation-card">
                        <div className="card-title">
                          <Bot size={18} />
                          <strong>Refinement</strong>
                          <StatusPill tone="purple">
                            {labelize(programme.refinement.status)}
                          </StatusPill>
                        </div>
                        <dl className="metadata-list">
                          <div><dt>Requested</dt><dd>{programme.refinement.requested ? 'Yes' : 'No'}</dd></div>
                          <div><dt>Applied</dt><dd>{programme.refinement.applied ? 'Yes' : 'No'}</dd></div>
                          {programme.refinement.model != null ? (
                            <div><dt>Model</dt><dd>{programme.refinement.model}</dd></div>
                          ) : null}
                          <div><dt>Reason</dt><dd>{programme.refinement.reason_code ?? '—'}</dd></div>
                          {programme.refinement.prompt_version != null ? (
                            <div><dt>Prompt</dt><dd>{programme.refinement.prompt_version}</dd></div>
                          ) : null}
                          {programme.refinement.operation_count != null ? (
                            <div><dt>Operations</dt><dd>{programme.refinement.operation_count} applied</dd></div>
                          ) : programme.refinement.accepted_operation_count != null ? (
                            <div><dt>Operations</dt><dd>{programme.refinement.accepted_operation_count} accepted</dd></div>
                          ) : null}
                          {programme.refinement.accepted_operation_types && programme.refinement.accepted_operation_types.length > 0 ? (
                            <div><dt>Types</dt><dd>{programme.refinement.accepted_operation_types.map(labelize).join(', ')}</dd></div>
                          ) : null}
                          {programme.refinement.retry_attempted != null ? (
                            <div><dt>Retry</dt><dd>{programme.refinement.retry_attempted ? 'Yes' : 'No'}</dd></div>
                          ) : null}
                        </dl>
                      </div>
                    </div>
                  ) : (
                    <RawJsonViewer data={programme} />
                  )}
                </div>
              ) : (
                <div className="empty-programme">
                  <div className="empty-orbit"><Activity size={28} /></div>
                  <h3>No preview generated</h3>
                  <p>
                    Configure the athlete and generate a validated, stateless programme preview.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={generatePreview}
                    busy={busy === 'preview'}
                    disabled={isBusy}
                  >
                    <Sparkles size={15} /> Generate preview
                  </Button>
                </div>
              )}
            </section>
          </div>

          <aside className="side-column">
            <div className="side-card sticky-card">
              <div className="side-card-heading">
                <CircleDashed size={18} />
                <strong>Workflow</strong>
              </div>
              <ol className="workflow-list">
                <li className={token.trim() ? 'done' : 'active'}>
                  <span>{token.trim() ? <Check size={13} /> : '1'}</span>
                  <div><strong>Connect</strong><small>Sign in to Supabase</small></div>
                </li>
                <li className={token.trim() ? 'done' : ''}>
                  <span>{token.trim() ? <Check size={13} /> : '2'}</span>
                  <div><strong>Configure athlete</strong><small>Transient input</small></div>
                </li>
                <li className={workflowStep === 'preview' ? 'active' : programme ? 'done' : ''}>
                  <span>{programme ? <Check size={13} /> : '3'}</span>
                  <div><strong>Generate preview</strong><small>POST /api/odin/preview</small></div>
                </li>
                <li className={programme ? 'done' : workflowStep === 'review' ? 'active' : ''}>
                  <span>{programme ? <Check size={13} /> : '4'}</span>
                  <div><strong>Review</strong><small>Validated programme</small></div>
                </li>
              </ol>
            </div>

            <div className="side-card">
              <div className="side-card-heading">
                <HeartPulse size={18} />
                <strong>API surface</strong>
              </div>
              <ul className="endpoint-list">
                <li><code>GET</code><span>/api/health</span></li>
                <li><code>POST</code><span>/api/odin/preview</span></li>
              </ul>
            </div>

            <div className="side-card planned-card">
              <div className="side-card-heading">
                <Clock3 size={18} />
                <strong>Planned capabilities</strong>
              </div>
              <p>Visible for product context only. No backend contracts are assumed.</p>
              <button disabled><Play size={15} /> Activate programme <span>Planned</span></button>
              <button disabled><Dumbbell size={15} /> Start workout <span>Planned</span></button>
              <button disabled><Activity size={15} /> Log performance <span>Planned</span></button>
            </div>
          </aside>
        </section>
      </main>

      <footer>
        <div className="brand compact">
          <span className="brand-mark"><Dumbbell size={16} /></span>
          <span><strong>ODIN</strong><small>Demo UI</small></span>
        </div>
        <p>Standalone interface · Existing public contracts only · GymX unchanged</p>
      </footer>
    </div>
  );
}

export default App;
