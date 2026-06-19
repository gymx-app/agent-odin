import type { MovementDemandTag } from '../../domain/exercise/exercise-taxonomy.js';
import type { ConditioningModality } from './conditioning.types.js';

export type ModalityProfile = {
  display_name: string;
  required_equipment: string[];
  impact: 'low' | 'moderate' | 'high';
  eccentric_demand: 'low' | 'moderate' | 'high';
  lower_body_demand: 'low' | 'moderate' | 'high';
  grip_demand: 'low' | 'moderate' | 'high';
  lower_back_demand: 'low' | 'moderate' | 'high';
  restriction_tags: MovementDemandTag[];
};

export const CONDITIONING_MODALITIES: Record<
  ConditioningModality,
  ModalityProfile
> = {
  walking: {
    display_name: 'Walking',
    required_equipment: ['bodyweight', 'treadmill'],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'low',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: [],
  },
  incline_walking: {
    display_name: 'Incline Walking',
    required_equipment: ['treadmill'],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'moderate',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: ['deep_ankle_dorsiflexion'],
  },
  stationary_bike: {
    display_name: 'Stationary Bike',
    required_equipment: ['bike'],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'moderate',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: ['loaded_deep_knee_flexion'],
  },
  elliptical: {
    display_name: 'Elliptical',
    required_equipment: ['elliptical'],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'moderate',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: ['loaded_deep_knee_flexion'],
  },
  rowing: {
    display_name: 'Rowing Machine',
    required_equipment: ['rower'],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'moderate',
    grip_demand: 'high',
    lower_back_demand: 'moderate',
    restriction_tags: [
      'loaded_deep_knee_flexion',
      'unsupported_hip_hinge',
      'fixed_pronated_grip',
    ],
  },
  stair_machine: {
    display_name: 'Stair Machine',
    required_equipment: ['machine'],
    impact: 'moderate',
    eccentric_demand: 'moderate',
    lower_body_demand: 'high',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: ['loaded_deep_knee_flexion', 'deep_ankle_dorsiflexion'],
  },
  running: {
    display_name: 'Running',
    required_equipment: ['bodyweight', 'treadmill'],
    impact: 'high',
    eccentric_demand: 'high',
    lower_body_demand: 'high',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: ['high_impact', 'single_leg_loading'],
  },
  sled: {
    display_name: 'Sled Work',
    required_equipment: ['other'],
    impact: 'moderate',
    eccentric_demand: 'low',
    lower_body_demand: 'high',
    grip_demand: 'moderate',
    lower_back_demand: 'moderate',
    restriction_tags: ['loaded_deep_knee_flexion'],
  },
  swimming: {
    display_name: 'Swimming',
    required_equipment: ['other'],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'low',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: ['overhead_loading'],
  },
  assault_bike: {
    display_name: 'Assault Bike',
    required_equipment: ['bike'],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'high',
    grip_demand: 'moderate',
    lower_back_demand: 'low',
    restriction_tags: ['loaded_deep_knee_flexion'],
  },
  sport: {
    display_name: 'Sport Session',
    required_equipment: [],
    impact: 'moderate',
    eccentric_demand: 'moderate',
    lower_body_demand: 'moderate',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: [],
  },
  other_approved: {
    display_name: 'Approved Conditioning Activity',
    required_equipment: [],
    impact: 'low',
    eccentric_demand: 'low',
    lower_body_demand: 'low',
    grip_demand: 'low',
    lower_back_demand: 'low',
    restriction_tags: [],
  },
};

export const MODALITY_PREFERENCE_ORDER: ConditioningModality[] = [
  'walking',
  'stationary_bike',
  'elliptical',
  'incline_walking',
  'rowing',
  'swimming',
  'stair_machine',
  'running',
  'assault_bike',
  'sled',
];
