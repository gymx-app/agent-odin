import { PHASE_DELOAD_ADJUSTMENTS } from './deload-adjustments.js';

export type CompletedSet = {
  target_reps: number;
  rpe_ceiling: number;
  reps_achieved: number;
  rpe_reported: number;
};

export type SessionPerformance = {
  completed_sets: CompletedSet[];
};

export type ReadinessAssessment = {
  deload_recommended: boolean;
  triggered_reasons: string[];
  deload_adjustments: Partial<typeof PHASE_DELOAD_ADJUSTMENTS>;
};

const CONSECUTIVE_SESSIONS_REQUIRED = 2;
// A session "misses" when the majority of its sets fall short of target
// reps — a single off set doesn't indicate accumulated fatigue.
const MISSED_SET_MAJORITY_THRESHOLD = 0.5;
// Helms, Cronin, Storey & Zourdos (2016): sustained RPE overshoot above
// the prescribed ceiling is the standard signal for accumulated fatigue
// under an RPE-based autoregulation model.
const RPE_OVERSHOOT_THRESHOLD = 1;

const sessionMissedMajorityOfSets = (session: SessionPerformance): boolean => {
  const missed = session.completed_sets.filter(
    (set) => set.reps_achieved < set.target_reps,
  ).length;
  return missed / session.completed_sets.length >= MISSED_SET_MAJORITY_THRESHOLD;
};

const sessionAverageRpeOvershoot = (session: SessionPerformance): number => {
  const overshoots = session.completed_sets.map(
    (set) => set.rpe_reported - set.rpe_ceiling,
  );
  return overshoots.reduce((sum, value) => sum + value, 0) / overshoots.length;
};

// Turns the two previously-static readiness_triggers strings
// ("Repeated performance decline.", "Persistent recovery deterioration.")
// into computed conditions over the most recent sessions, instead of
// text that was never checked against anything.
export const evaluateReadiness = (
  recentSessions: SessionPerformance[],
): ReadinessAssessment => {
  const lastN = recentSessions.slice(-CONSECUTIVE_SESSIONS_REQUIRED);
  const triggered_reasons: string[] = [];

  if (
    lastN.length === CONSECUTIVE_SESSIONS_REQUIRED &&
    lastN.every(sessionMissedMajorityOfSets)
  ) {
    triggered_reasons.push(
      `REPEATED_PERFORMANCE_DECLINE: majority of sets missed target reps in the last ${CONSECUTIVE_SESSIONS_REQUIRED} sessions.`,
    );
  }

  if (
    lastN.length === CONSECUTIVE_SESSIONS_REQUIRED &&
    lastN.every(
      (session) =>
        sessionAverageRpeOvershoot(session) >= RPE_OVERSHOOT_THRESHOLD,
    )
  ) {
    triggered_reasons.push(
      `PERSISTENT_RPE_ELEVATION: average reported RPE exceeded the ceiling by ${RPE_OVERSHOOT_THRESHOLD}+ across the last ${CONSECUTIVE_SESSIONS_REQUIRED} sessions.`,
    );
  }

  const deload_recommended = triggered_reasons.length > 0;

  return {
    deload_recommended,
    triggered_reasons,
    deload_adjustments: deload_recommended ? PHASE_DELOAD_ADJUSTMENTS : {},
  };
};
