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
// odin-programme-design-logic.md, Section 5 (ZOURDOS_2019_BASTOS_2024_RIR_
// ACCURACY_DEGRADATION): self-reported RIR/RPE accuracy degrades the
// further a set is from failure — the doc's own worked example anchors
// this at "a set left at 4-5 reps in reserve", i.e. RPE 5-6. An overshoot
// signal computed from sessions working at or below that ceiling is less
// trustworthy than the same signal near failure, so it's required to
// persist one session longer before triggering a deload. This +1-session
// response is a heuristic built on the cited accuracy finding, not itself
// a validated protocol — it does not get its own citation code.
const LOW_CONFIDENCE_CEILING_THRESHOLD = 6;
const CONSECUTIVE_SESSIONS_REQUIRED_LOW_CONFIDENCE = 3;
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

const sessionAverageCeiling = (session: SessionPerformance): number => {
  const ceilings = session.completed_sets.map((set) => set.rpe_ceiling);
  return ceilings.reduce((sum, value) => sum + value, 0) / ceilings.length;
};

const isLowConfidenceSelfReportSession = (
  session: SessionPerformance,
): boolean => sessionAverageCeiling(session) <= LOW_CONFIDENCE_CEILING_THRESHOLD;

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

  // Rep-completion is an objective count, unaffected by RIR self-report
  // accuracy — only the RPE-overshoot signal below needs the low-confidence
  // window extension, so this check keeps the standard, fixed window.
  const rpeRequiredSessions =
    lastN.length === CONSECUTIVE_SESSIONS_REQUIRED &&
    lastN.every(isLowConfidenceSelfReportSession)
      ? CONSECUTIVE_SESSIONS_REQUIRED_LOW_CONFIDENCE
      : CONSECUTIVE_SESSIONS_REQUIRED;
  const rpeWindow = recentSessions.slice(-rpeRequiredSessions);

  if (
    rpeWindow.length === rpeRequiredSessions &&
    rpeWindow.every(
      (session) =>
        sessionAverageRpeOvershoot(session) >= RPE_OVERSHOOT_THRESHOLD,
    )
  ) {
    const lowConfidenceNote =
      rpeRequiredSessions === CONSECUTIVE_SESSIONS_REQUIRED_LOW_CONFIDENCE
        ? ' (relaxed threshold: ceiling <=6 self-report zone has degraded accuracy per ZOURDOS_2019_BASTOS_2024_RIR_ACCURACY_DEGRADATION — heuristic response, not itself validated)'
        : '';
    triggered_reasons.push(
      `PERSISTENT_RPE_ELEVATION: average reported RPE exceeded the ceiling by ${RPE_OVERSHOOT_THRESHOLD}+ across the last ${rpeRequiredSessions} sessions.${lowConfidenceNote}`,
    );
  }

  const deload_recommended = triggered_reasons.length > 0;

  return {
    deload_recommended,
    triggered_reasons,
    deload_adjustments: deload_recommended ? PHASE_DELOAD_ADJUSTMENTS : {},
  };
};
