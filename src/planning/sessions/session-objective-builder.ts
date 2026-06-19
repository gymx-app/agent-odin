import type {
  ResistanceSessionBuilderInput,
  SessionKind,
} from './session.types.js';

export const canonicalSessionTitle = (
  kind: SessionKind,
  emphasis?: string,
): string => {
  const title: Record<SessionKind, string> = {
    full_body: 'Full Body',
    upper: 'Upper Body',
    lower: 'Lower Body',
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    specialized: 'Specialized',
    sport_support: 'Sport Support',
  };
  return emphasis ? `${title[kind]} — ${emphasis}` : title[kind];
};

export const sessionObjective = (
  input: ResistanceSessionBuilderInput,
): string =>
  `${input.phase.objective} Use exact prescriptions within the session fatigue and duration budget.`;
