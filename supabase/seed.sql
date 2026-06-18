-- Generated from fixtures/exercises/seed-exercises.ts
-- Do not edit manually; run npm run supabase:seed:exercises.
begin;
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_squat', '{"id":"bodyweight_squat","name":"Bodyweight Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":1},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_goblet_squat', '{"id":"dumbbell_goblet_squat","name":"Dumbbell Goblet Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["adductors","abdominals"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_back_squat', '{"id":"barbell_back_squat","name":"Barbell Back Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","spinal_erectors","abdominals"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":4,"axial":5,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":5,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":5,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"squat_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_leg_press', '{"id":"machine_leg_press","name":"Machine Leg Press","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_reverse_lunge', '{"id":"dumbbell_reverse_lunge","name":"Dumbbell Reverse Lunge","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"alternating","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_romanian_deadlift', '{"id":"dumbbell_romanian_deadlift","name":"Dumbbell Romanian Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors","forearms"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_deadlift', '{"id":"barbell_deadlift","name":"Barbell Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors","forearms","upper_back"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":4,"axial":5,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":5,"loaded_spinal_flexion":2,"unsupported_hip_hinge":5,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":2,"max":8},"default_rest_seconds":{"min":150,"max":300},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_pull_through', '{"id":"cable_pull_through","name":"Cable Pull Through","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_hip_thrust', '{"id":"barbell_hip_thrust","name":"Barbell Hip Thrust","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings","quadriceps"],"equipment":["barbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":4,"axial":2,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('push_up', '{"id":"push_up","name":"Push-Up","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts","abdominals"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_bench_press', '{"id":"dumbbell_bench_press","name":"Dumbbell Bench Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_chest_press', '{"id":"machine_chest_press","name":"Machine Chest Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_chest_press', '{"id":"cable_chest_press","name":"Cable Chest Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_overhead_press', '{"id":"dumbbell_overhead_press","name":"Dumbbell Overhead Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","upper_back"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_shoulder_press', '{"id":"machine_shoulder_press","name":"Machine Shoulder Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('pike_push_up', '{"id":"pike_push_up","name":"Pike Push-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","abdominals"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":4,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('seated_cable_row', '{"id":"seated_cable_row","name":"Seated Cable Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts","forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":2,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('one_arm_dumbbell_row', '{"id":"one_arm_dumbbell_row","name":"One-Arm Dumbbell Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","rear_delts","forearms"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":3,"axial":2,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":2,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_row', '{"id":"machine_row","name":"Machine Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('resistance_band_row', '{"id":"resistance_band_row","name":"Resistance Band Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":1,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_band","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('lat_pulldown', '{"id":"lat_pulldown","name":"Lat Pulldown","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["biceps","upper_back","forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":3,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('pull_up', '{"id":"pull_up","name":"Pull-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","forearms","abdominals"],"equipment":["bodyweight","pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":4,"axial":0,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":4,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('band_lat_pulldown', '{"id":"band_lat_pulldown","name":"Band Lat Pulldown","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["biceps","upper_back"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":1,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":1,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_band","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_pullover', '{"id":"machine_pullover","name":"Machine Pullover","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["triceps","upper_back"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('lying_leg_curl', '{"id":"lying_leg_curl","name":"Lying Leg Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["calves"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('seated_leg_curl', '{"id":"seated_leg_curl","name":"Seated Leg Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["calves"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_leg_extension', '{"id":"machine_leg_extension","name":"Machine Leg Extension","status":"active","exercise_type":"isolation","movement_patterns":["knee_extension_isolation"],"primary_muscles":["quadriceps"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_extension_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('band_terminal_knee_extension', '{"id":"band_terminal_knee_extension","name":"Band Terminal Knee Extension","status":"active","exercise_type":"isolation","movement_patterns":["knee_extension_isolation"],"primary_muscles":["quadriceps"],"secondary_muscles":[],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":1,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_extension_band","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_biceps_curl', '{"id":"dumbbell_biceps_curl","name":"Dumbbell Biceps Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_biceps_curl', '{"id":"cable_biceps_curl","name":"Cable Biceps Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('band_biceps_curl', '{"id":"band_biceps_curl","name":"Band Biceps Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":1,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_triceps_pressdown', '{"id":"cable_triceps_pressdown","name":"Cable Triceps Pressdown","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":["forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_overhead_triceps_extension', '{"id":"dumbbell_overhead_triceps_extension","name":"Dumbbell Overhead Triceps Extension","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":["forearms"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('band_triceps_pressdown', '{"id":"band_triceps_pressdown","name":"Band Triceps Pressdown","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":1,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_lateral_raise', '{"id":"dumbbell_lateral_raise","name":"Dumbbell Lateral Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts"],"secondary_muscles":["upper_back"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_lateral_raise', '{"id":"cable_lateral_raise","name":"Cable Lateral Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts"],"secondary_muscles":["upper_back"],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_lateral_raise', '{"id":"machine_lateral_raise","name":"Machine Lateral Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('standing_calf_raise', '{"id":"standing_calf_raise","name":"Standing Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('seated_machine_calf_raise', '{"id":"seated_machine_calf_raise","name":"Seated Machine Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_calf_press', '{"id":"machine_calf_press","name":"Machine Calf Press","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":1},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_farmer_carry', '{"id":"dumbbell_farmer_carry","name":"Dumbbell Farmer Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["forearms","upper_back"],"secondary_muscles":["abdominals","obliques","glutes"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_suitcase_carry', '{"id":"dumbbell_suitcase_carry","name":"Dumbbell Suitcase Carry","status":"active","exercise_type":"compound","movement_patterns":["carry","core_anti_rotation"],"primary_muscles":["obliques","forearms"],"secondary_muscles":["upper_back","abdominals"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":2,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('front_plank', '{"id":"front_plank","name":"Front Plank","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","front_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"none","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":1,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dead_bug', '{"id":"dead_bug","name":"Dead Bug","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ab_wheel_rollout', '{"id":"ab_wheel_rollout","name":"Ab Wheel Rollout","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["lats","front_delts"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('pallof_press', '{"id":"pallof_press","name":"Pallof Press","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques","abdominals"],"secondary_muscles":["front_delts"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('side_plank', '{"id":"side_plank","name":"Side Plank","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques"],"secondary_muscles":["abdominals","side_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":1,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_crunch', '{"id":"cable_crunch","name":"Cable Crunch","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_crunch', '{"id":"machine_crunch","name":"Machine Crunch","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bird_dog', '{"id":"bird_dog","name":"Bird Dog","status":"active","exercise_type":"isolation","movement_patterns":["core_extension"],"primary_muscles":["spinal_erectors","glutes"],"secondary_muscles":["abdominals"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('back_extension', '{"id":"back_extension","name":"Back Extension","status":"active","exercise_type":"isolation","movement_patterns":["core_extension"],"primary_muscles":["spinal_erectors","glutes"],"secondary_muscles":["hamstrings"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('treadmill_walk', '{"id":"treadmill_walk","name":"Treadmill Walk","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves"],"equipment":["treadmill"],"difficulty":"beginner","laterality":"alternating","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":1,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":1},"default_rep_range":{"min":10,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('stationary_bike', '{"id":"stationary_bike","name":"Stationary Bike","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves"],"equipment":["bike"],"difficulty":"beginner","laterality":"alternating","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":2,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('rower_liss', '{"id":"rower_liss","name":"Rower LISS","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["upper_back","quadriceps"],"secondary_muscles":["lats","hamstrings","biceps"],"equipment":["rower"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":2,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":1,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":45},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('elliptical_liss', '{"id":"elliptical_liss","name":"Elliptical LISS","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves"],"equipment":["elliptical"],"difficulty":"beginner","laterality":"alternating","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cat_cow_mobility', '{"id":"cat_cow_mobility","name":"Cat-Cow Mobility","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["spinal_erectors","abdominals"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"none","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":1,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_spine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('hip_flexor_mobility', '{"id":"hip_flexor_mobility","name":"Hip Flexor Mobility","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["glutes","quadriceps"],"secondary_muscles":["adductors"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":1},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_hip","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
commit;
