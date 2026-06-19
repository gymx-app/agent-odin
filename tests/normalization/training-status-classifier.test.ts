import { describe, expect, it } from 'vitest';
import { classifyTrainingStatus } from '../../src/normalization/training-status-classifier.js';
import { createAthlete } from './test-athletes.js';

describe('classifyTrainingStatus', () => {
  it('uses legacy beginner with low confidence when history is absent', () => {
    expect(classifyTrainingStatus(createAthlete())).toMatchObject({
      value: 'beginner',
      confidence: 'low',
      reason_codes: expect.arrayContaining(['LEGACY_FITNESS_LEVEL_ONLY']),
    });
  });

  it('classifies consistent intermediate history', () => {
    expect(
      classifyTrainingStatus(
        createAthlete({
          fitness_level: 'intermediate',
          training_history: {
            years_consistent_training: 2,
            consistency_last_12_weeks: 'high',
            exercise_competency: 'competent',
          },
        }),
      ).value,
    ).toBe('intermediate');
  });

  it('requires history, consistency, and competency for advanced', () => {
    expect(
      classifyTrainingStatus(
        createAthlete({
          fitness_level: 'advanced',
          training_history: {
            years_consistent_training: 6,
            consistency_last_12_weeks: 'high',
            exercise_competency: 'advanced',
          },
        }),
      ).value,
    ).toBe('advanced');
  });

  it('classifies returning after detraining', () => {
    expect(
      classifyTrainingStatus(
        createAthlete({
          training_history: {
            detraining_weeks: 12,
          },
        }),
      ),
    ).toMatchObject({
      value: 'returning',
      reason_codes: ['RECENT_DETRAINING'],
    });
  });

  it('returns unknown for conflicting self-report and competency', () => {
    expect(
      classifyTrainingStatus(
        createAthlete({
          fitness_level: 'beginner',
          training_history: {
            exercise_competency: 'advanced',
          },
        }),
      ),
    ).toMatchObject({
      value: 'unknown',
      confidence: 'low',
      reason_codes: ['FITNESS_HISTORY_CONFLICT'],
    });
  });

  it('falls back with low confidence for incomplete history', () => {
    expect(
      classifyTrainingStatus(
        createAthlete({
          fitness_level: 'intermediate',
          training_history: {
            current_sessions_per_week: 3,
          },
        }),
      ),
    ).toMatchObject({
      value: 'intermediate',
      confidence: 'low',
      reason_codes: ['TRAINING_HISTORY_INCOMPLETE'],
    });
  });
});
