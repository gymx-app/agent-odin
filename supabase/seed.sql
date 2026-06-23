-- Generated from fixtures/exercises/seed-exercises.ts
-- Do not edit manually; run npm run supabase:seed:exercises.
begin;
delete from public.exercise_library;
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
values ('barbell_front_squat', '{"id":"barbell_front_squat","name":"Barbell Front Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["abdominals","upper_back","spinal_erectors"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":4,"axial":4,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":5,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":4},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"squat_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["front squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_squat', '{"id":"smith_machine_squat","name":"Smith Machine Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["smith_machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":4,"axial":3,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"squat_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_hack_squat', '{"id":"machine_hack_squat","name":"Machine Hack Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":4,"axial":2,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":5,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"squat_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["hack squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_pendulum_squat', '{"id":"machine_pendulum_squat","name":"Machine Pendulum Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["adductors"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":5,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["pendulum squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_v_squat', '{"id":"machine_v_squat","name":"Machine V-Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":4,"axial":2,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":5,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["v squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_bulgarian_split_squat', '{"id":"dumbbell_bulgarian_split_squat","name":"Dumbbell Bulgarian Split Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors","calves"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":["bulgarian split squat","rear foot elevated split squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_split_squat', '{"id":"dumbbell_split_squat","name":"Dumbbell Split Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"unilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":4,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_step_up', '{"id":"dumbbell_step_up","name":"Dumbbell Step-Up","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"alternating","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_walking_lunge', '{"id":"barbell_walking_lunge","name":"Barbell Walking Lunge","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves","abdominals"],"equipment":["barbell"],"difficulty":"advanced","laterality":"alternating","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":4,"local":4,"axial":3,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_sissy_squat', '{"id":"bodyweight_sissy_squat","name":"Bodyweight Sissy Squat","status":"active","exercise_type":"isolation","movement_patterns":["knee_extension_isolation"],"primary_muscles":["quadriceps"],"secondary_muscles":["calves"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":4},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_extension_machine","contraindication_tags":["loaded_deep_knee_flexion","deep_ankle_dorsiflexion"],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_romanian_deadlift', '{"id":"barbell_romanian_deadlift","name":"Barbell Romanian Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors","forearms","upper_back"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":4,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":5,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["barbell RDL"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_sumo_deadlift', '{"id":"barbell_sumo_deadlift","name":"Barbell Sumo Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","quadriceps"],"secondary_muscles":["hamstrings","adductors","spinal_erectors","forearms"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":4,"axial":4,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":2,"max":8},"default_rest_seconds":{"min":150,"max":300},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["sumo deadlift"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trap_bar_deadlift', '{"id":"trap_bar_deadlift","name":"Trap Bar Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","quadriceps"],"secondary_muscles":["hamstrings","spinal_erectors","forearms","upper_back"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":5,"local":4,"axial":4,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["hex bar deadlift"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_swing', '{"id":"kettlebell_swing","name":"Kettlebell Swing","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors","abdominals","front_delts"],"equipment":["kettlebell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_explosive","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_deadlift', '{"id":"kettlebell_deadlift","name":"Kettlebell Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors","forearms"],"equipment":["kettlebell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_single_leg_rdl', '{"id":"dumbbell_single_leg_rdl","name":"Dumbbell Single-Leg Romanian Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors","forearms","calves"],"equipment":["dumbbell"],"difficulty":"advanced","laterality":"unilateral","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":3,"axial":2,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_single_leg","contraindication_tags":[],"coaching_notes":[],"aliases":["single leg RDL"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_hip_thrust', '{"id":"machine_hip_thrust","name":"Machine Hip Thrust","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings","quadriceps"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":4,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_good_morning', '{"id":"barbell_good_morning","name":"Barbell Good Morning","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","spinal_erectors"],"secondary_muscles":["glutes","abdominals"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":3,"axial":5,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":5,"loaded_spinal_flexion":3,"unsupported_hip_hinge":5,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"hinge_loaded","contraindication_tags":["high_spinal_compression","loaded_spinal_flexion"],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_glute_kickback', '{"id":"cable_glute_kickback","name":"Cable Glute Kickback","status":"active","exercise_type":"isolation","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings"],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":2,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"glute_isolation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_bench_press', '{"id":"barbell_bench_press","name":"Barbell Bench Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["barbell","bench","rack"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":12},"default_rest_seconds":{"min":90,"max":240},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["flat bench press","bench press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_incline_bench_press', '{"id":"barbell_incline_bench_press","name":"Barbell Incline Bench Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","front_delts"],"secondary_muscles":["triceps"],"equipment":["barbell","bench","rack"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["incline bench press","incline barbell press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_incline_bench_press', '{"id":"dumbbell_incline_bench_press","name":"Dumbbell Incline Bench Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","front_delts"],"secondary_muscles":["triceps"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":3,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["incline dumbbell press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_decline_bench_press', '{"id":"dumbbell_decline_bench_press","name":"Dumbbell Decline Bench Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["decline dumbbell press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_bench_press', '{"id":"smith_machine_bench_press","name":"Smith Machine Bench Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["smith_machine","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_incline_press', '{"id":"smith_machine_incline_press","name":"Smith Machine Incline Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","front_delts"],"secondary_muscles":["triceps"],"equipment":["smith_machine","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":3,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_incline_chest_press', '{"id":"machine_incline_chest_press","name":"Machine Incline Chest Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","front_delts"],"secondary_muscles":["triceps"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_fly', '{"id":"dumbbell_fly","name":"Dumbbell Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_fly', '{"id":"cable_fly","name":"Cable Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_pec_deck', '{"id":"machine_pec_deck","name":"Machine Pec Deck","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":["pec fly machine","chest fly machine"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('weighted_chest_dip', '{"id":"weighted_chest_dip","name":"Weighted Chest Dip","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":4,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":5,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":["deep_shoulder_extension"],"coaching_notes":[],"aliases":["chest dip","parallel bar dip"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_overhead_press', '{"id":"barbell_overhead_press","name":"Barbell Overhead Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","upper_back","abdominals"],"equipment":["barbell","rack"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":3,"axial":3,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":5,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":90,"max":210},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["standing overhead press","military press","OHP"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_arnold_press', '{"id":"dumbbell_arnold_press","name":"Dumbbell Arnold Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","side_delts"],"secondary_muscles":["triceps","upper_back"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["arnold press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_shoulder_press', '{"id":"smith_machine_shoulder_press","name":"Smith Machine Shoulder Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts"],"equipment":["smith_machine","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_seated_overhead_press', '{"id":"dumbbell_seated_overhead_press","name":"Dumbbell Seated Overhead Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","upper_back"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["seated dumbbell press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('landmine_press', '{"id":"landmine_press","name":"Landmine Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","chest"],"secondary_muscles":["triceps","abdominals"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_bent_over_row', '{"id":"barbell_bent_over_row","name":"Barbell Bent-Over Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","rear_delts","spinal_erectors","forearms"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":4,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["bent over row","barbell row"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('tbar_row', '{"id":"tbar_row","name":"T-Bar Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","rear_delts","spinal_erectors"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":4,"axial":3,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["t-bar row","landmine row"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('chest_supported_dumbbell_row', '{"id":"chest_supported_dumbbell_row","name":"Chest-Supported Dumbbell Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["dumbbell","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["incline dumbbell row"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('chest_supported_machine_row', '{"id":"chest_supported_machine_row","name":"Chest-Supported Machine Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_face_pull', '{"id":"cable_face_pull","name":"Cable Face Pull","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts","upper_back"],"secondary_muscles":["side_delts","biceps"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":["face pull"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('inverted_row', '{"id":"inverted_row","name":"Inverted Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts","abdominals"],"equipment":["bodyweight","rack"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":["body row","Australian pull-up"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_reverse_fly', '{"id":"dumbbell_reverse_fly","name":"Dumbbell Reverse Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts"],"secondary_muscles":["upper_back"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":["rear delt fly","bent over reverse fly"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_reverse_fly', '{"id":"machine_reverse_fly","name":"Machine Reverse Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts"],"secondary_muscles":["upper_back"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":["reverse pec deck"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_reverse_fly', '{"id":"cable_reverse_fly","name":"Cable Reverse Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts"],"secondary_muscles":["upper_back"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('chin_up', '{"id":"chin_up","name":"Chin-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","biceps"],"secondary_muscles":["upper_back","forearms","abdominals"],"equipment":["bodyweight","pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":4,"axial":0,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":5,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":["supinated pull-up"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('neutral_grip_pull_up', '{"id":"neutral_grip_pull_up","name":"Neutral-Grip Pull-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","forearms","abdominals"],"equipment":["bodyweight","pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":4,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":["hammer grip pull-up"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('close_grip_lat_pulldown', '{"id":"close_grip_lat_pulldown","name":"Close-Grip Lat Pulldown","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["biceps","upper_back","forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":["v-bar lat pulldown","neutral grip pulldown"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_straight_arm_pulldown', '{"id":"cable_straight_arm_pulldown","name":"Cable Straight-Arm Pulldown","status":"active","exercise_type":"isolation","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["triceps","abdominals"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":["straight arm lat pulldown","pullover cable"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_assisted_pull_up', '{"id":"machine_assisted_pull_up","name":"Machine Assisted Pull-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","forearms"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["assisted chin-up","gravitron"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_biceps_curl', '{"id":"barbell_biceps_curl","name":"Barbell Biceps Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["barbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":2,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["straight bar curl","EZ bar curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_hammer_curl', '{"id":"dumbbell_hammer_curl","name":"Dumbbell Hammer Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["neutral grip curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_incline_curl', '{"id":"dumbbell_incline_curl","name":"Dumbbell Incline Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["incline dumbbell curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_preacher_curl', '{"id":"machine_preacher_curl","name":"Machine Preacher Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["preacher curl machine"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_concentration_curl', '{"id":"dumbbell_concentration_curl","name":"Dumbbell Concentration Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_rope_hammer_curl', '{"id":"cable_rope_hammer_curl","name":"Cable Rope Hammer Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_skull_crusher', '{"id":"barbell_skull_crusher","name":"Barbell Skull Crusher","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":["forearms"],"equipment":["barbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":5,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["lying triceps extension","french press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_close_grip_bench_press', '{"id":"barbell_close_grip_bench_press","name":"Barbell Close-Grip Bench Press","status":"active","exercise_type":"compound","movement_patterns":["elbow_extension","horizontal_push"],"primary_muscles":["triceps"],"secondary_muscles":["chest","front_delts"],"equipment":["barbell","bench","rack"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":5,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["close grip bench"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('weighted_triceps_dip', '{"id":"weighted_triceps_dip","name":"Weighted Triceps Dip","status":"active","exercise_type":"compound","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":["chest","front_delts"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"bilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":4,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":5,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"elbow_extension","contraindication_tags":["deep_shoulder_extension"],"coaching_notes":[],"aliases":["tricep dip","upright dip"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_triceps_extension', '{"id":"machine_triceps_extension","name":"Machine Triceps Extension","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_overhead_triceps_extension', '{"id":"cable_overhead_triceps_extension","name":"Cable Overhead Triceps Extension","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_front_raise', '{"id":"dumbbell_front_raise","name":"Dumbbell Front Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["front_delts"],"secondary_muscles":["side_delts"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_upright_row', '{"id":"cable_upright_row","name":"Cable Upright Row","status":"active","exercise_type":"compound","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts","upper_back"],"secondary_muscles":["biceps","front_delts"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":4,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_shrug', '{"id":"dumbbell_shrug","name":"Dumbbell Shrug","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["upper_back"],"secondary_muscles":["forearms"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":2,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shrug","contraindication_tags":[],"coaching_notes":[],"aliases":["trap shrug"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_shrug', '{"id":"barbell_shrug","name":"Barbell Shrug","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["upper_back"],"secondary_muscles":["forearms"],"equipment":["barbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":3,"axial":2,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shrug","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_shrug', '{"id":"machine_shrug","name":"Machine Shrug","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["upper_back"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":3,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shrug","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('standing_machine_calf_raise', '{"id":"standing_machine_calf_raise","name":"Standing Machine Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":3,"axial":2,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('single_leg_calf_raise', '{"id":"single_leg_calf_raise","name":"Single-Leg Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":2,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_wrist_curl', '{"id":"dumbbell_wrist_curl","name":"Dumbbell Wrist Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["forearms"],"secondary_muscles":[],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":2,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"forearm_isolation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_reverse_wrist_curl', '{"id":"dumbbell_reverse_wrist_curl","name":"Dumbbell Reverse Wrist Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["forearms"],"secondary_muscles":[],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"forearm_isolation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('nordic_hamstring_curl', '{"id":"nordic_hamstring_curl","name":"Nordic Hamstring Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["calves","glutes"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":4,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["nordic curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_leg_curl', '{"id":"dumbbell_leg_curl","name":"Dumbbell Leg Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["calves"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["prone dumbbell leg curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_hip_adduction', '{"id":"machine_hip_adduction","name":"Machine Hip Adduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_adduction"],"primary_muscles":["adductors"],"secondary_muscles":["glutes"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_adduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_hip_adduction', '{"id":"cable_hip_adduction","name":"Cable Hip Adduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_adduction"],"primary_muscles":["adductors"],"secondary_muscles":["glutes"],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":2,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_adduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_hip_abduction', '{"id":"machine_hip_abduction","name":"Machine Hip Abduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_abduction"],"primary_muscles":["glutes"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":["abductor machine"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_hip_abduction', '{"id":"cable_hip_abduction","name":"Cable Hip Abduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_abduction"],"primary_muscles":["glutes"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":2,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_clamshell', '{"id":"bodyweight_clamshell","name":"Clamshell","status":"active","exercise_type":"isolation","movement_patterns":["hip_abduction"],"primary_muscles":["glutes"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('banded_hip_abduction', '{"id":"banded_hip_abduction","name":"Banded Hip Abduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_abduction"],"primary_muscles":["glutes"],"secondary_muscles":[],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":1,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_farmer_carry', '{"id":"kettlebell_farmer_carry","name":"Kettlebell Farmer Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["forearms","upper_back"],"secondary_muscles":["abdominals","obliques","glutes"],"equipment":["kettlebell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_rack_carry', '{"id":"kettlebell_rack_carry","name":"Kettlebell Rack Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["abdominals","upper_back"],"secondary_muscles":["forearms","front_delts","biceps"],"equipment":["kettlebell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('hanging_leg_raise', '{"id":"hanging_leg_raise","name":"Hanging Leg Raise","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","forearms"],"equipment":["bodyweight","pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_hanging_leg_raise', '{"id":"machine_hanging_leg_raise","name":"Captain''s Chair Leg Raise","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["vertical knee raise"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_woodchop', '{"id":"cable_woodchop","name":"Cable Woodchop","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques"],"secondary_muscles":["abdominals","front_delts"],"equipment":["cable"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":["cable chop"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_v_up', '{"id":"bodyweight_v_up","name":"V-Up","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_mountain_climber', '{"id":"bodyweight_mountain_climber","name":"Mountain Climber","status":"active","exercise_type":"compound","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","front_delts","quadriceps"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":2,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":30},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('thoracic_spine_rotation', '{"id":"thoracic_spine_rotation","name":"Thoracic Spine Rotation","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["spinal_erectors","obliques"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_spine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('shoulder_dislocate', '{"id":"shoulder_dislocate","name":"Shoulder Dislocate","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["front_delts","rear_delts"],"secondary_muscles":["chest","upper_back"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":1,"deep_shoulder_extension":1,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":["band pass-through"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ankle_mobility_drill', '{"id":"ankle_mobility_drill","name":"Ankle Mobility Drill","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_ankle","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('world_greatest_stretch', '{"id":"world_greatest_stretch","name":"World''s Greatest Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["glutes","adductors"],"secondary_muscles":["spinal_erectors","quadriceps","hamstrings"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_hip","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
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
values ('treadmill_incline_walk', '{"id":"treadmill_incline_walk","name":"Treadmill Incline Walk","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["glutes","calves"],"secondary_muscles":["quadriceps","hamstrings"],"equipment":["treadmill"],"difficulty":"beginner","laterality":"alternating","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":10,"max":45},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('treadmill_run', '{"id":"treadmill_run","name":"Treadmill Run","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["quadriceps","glutes","calves"],"secondary_muscles":["hamstrings"],"equipment":["treadmill"],"difficulty":"intermediate","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":4,"local":3,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":4,"single_leg_loading":3,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('assault_bike_cardio', '{"id":"assault_bike_cardio","name":"Assault Bike","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","front_delts","triceps"],"equipment":["bike"],"difficulty":"intermediate","laterality":"alternating","skill_demand":1,"stability_demand":0,"fatigue_cost":{"systemic":4,"local":3,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":30},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('stair_machine_cardio', '{"id":"stair_machine_cardio","name":"Stair Machine","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["quadriceps","glutes","calves"],"secondary_muscles":["hamstrings"],"equipment":["machine"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":10,"max":45},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('sled_push', '{"id":"sled_push","name":"Sled Push","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["calves","front_delts"],"equipment":["sled"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":4,"local":3,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('swimming_liss', '{"id":"swimming_liss","name":"Swimming","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["lats","front_delts"],"secondary_muscles":["upper_back","triceps","quadriceps"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"alternating","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('wall_slide', '{"id":"wall_slide","name":"Wall Slide","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["front_delts","upper_back"],"secondary_muscles":["side_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('leg_swing', '{"id":"leg_swing","name":"Leg Swing","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["glutes","quadriceps"],"secondary_muscles":["hamstrings","adductors"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_hip","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('banded_face_pull', '{"id":"banded_face_pull","name":"Banded Face Pull","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts","upper_back"],"secondary_muscles":["side_delts","biceps"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
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
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_box_squat', '{"id":"barbell_box_squat","name":"Barbell Box Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","spinal_erectors","abdominals"],"equipment":["barbell","rack","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":4,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"squat_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["box squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_zercher_squat', '{"id":"barbell_zercher_squat","name":"Barbell Zercher Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["abdominals","biceps","upper_back"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":4,"axial":3,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":5,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"squat_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["zercher squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('landmine_squat', '{"id":"landmine_squat","name":"Landmine Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["abdominals","upper_back"],"equipment":["barbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_lateral_lunge', '{"id":"barbell_lateral_lunge","name":"Barbell Lateral Lunge","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","adductors"],"secondary_muscles":["glutes","hamstrings"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"alternating","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":3,"local":3,"axial":3,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":4,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":10},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_lateral_lunge', '{"id":"dumbbell_lateral_lunge","name":"Dumbbell Lateral Lunge","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","adductors"],"secondary_muscles":["glutes","hamstrings"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"alternating","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":3,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_pistol_squat', '{"id":"bodyweight_pistol_squat","name":"Bodyweight Pistol Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves","abdominals"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"unilateral","skill_demand":5,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":5,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":5},"default_rep_range":{"min":1,"max":8},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":["pistol squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_walking_lunge', '{"id":"dumbbell_walking_lunge","name":"Dumbbell Walking Lunge","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"alternating","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":4,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_split_squat', '{"id":"smith_machine_split_squat","name":"Smith Machine Split Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["smith_machine"],"difficulty":"beginner","laterality":"unilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":3,"axial":2,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":4,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_reverse_lunge', '{"id":"bodyweight_reverse_lunge","name":"Bodyweight Reverse Lunge","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":0,"single_leg_loading":3,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_forward_lunge', '{"id":"barbell_forward_lunge","name":"Barbell Forward Lunge","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors","calves"],"equipment":["barbell","rack"],"difficulty":"intermediate","laterality":"alternating","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":4,"axial":3,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_rack_pull', '{"id":"barbell_rack_pull","name":"Barbell Rack Pull","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors","upper_back","forearms"],"equipment":["barbell","rack"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":3,"axial":3,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["rack pull"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_deficit_deadlift', '{"id":"barbell_deficit_deadlift","name":"Barbell Deficit Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors","quadriceps","forearms","upper_back"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":5,"axial":5,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":5,"loaded_spinal_flexion":3,"unsupported_hip_hinge":5,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":2,"max":6},"default_rest_seconds":{"min":180,"max":300},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["deficit deadlift"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_stiff_leg_deadlift', '{"id":"barbell_stiff_leg_deadlift","name":"Barbell Stiff-Leg Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","spinal_erectors"],"secondary_muscles":["glutes","forearms"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":4,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":3,"unsupported_hip_hinge":5,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["stiff leg deadlift","SLDL"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_romanian_deadlift', '{"id":"smith_machine_romanian_deadlift","name":"Smith Machine Romanian Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors"],"equipment":["smith_machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_hip_thrust', '{"id":"dumbbell_hip_thrust","name":"Dumbbell Hip Thrust","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings","quadriceps"],"equipment":["dumbbell","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_glute_bridge', '{"id":"bodyweight_glute_bridge","name":"Bodyweight Glute Bridge","status":"active","exercise_type":"isolation","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":["glute bridge"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('single_leg_glute_bridge', '{"id":"single_leg_glute_bridge","name":"Single-Leg Glute Bridge","status":"active","exercise_type":"isolation","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":2,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('single_leg_hip_thrust', '{"id":"single_leg_hip_thrust","name":"Single-Leg Hip Thrust","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings","quadriceps"],"equipment":["bodyweight","bench"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":3,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('hyperextension_45', '{"id":"hyperextension_45","name":"45-Degree Hyperextension","status":"active","exercise_type":"isolation","movement_patterns":["hinge","core_extension"],"primary_muscles":["spinal_erectors","glutes"],"secondary_muscles":["hamstrings"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":2,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["45 degree back extension","roman chair extension"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('reverse_hyperextension', '{"id":"reverse_hyperextension","name":"Reverse Hyperextension","status":"active","exercise_type":"isolation","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":2,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"glute_isolation","contraindication_tags":[],"coaching_notes":[],"aliases":["reverse hyper"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_floor_press', '{"id":"dumbbell_floor_press","name":"Dumbbell Floor Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":1,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["floor press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_floor_press', '{"id":"barbell_floor_press","name":"Barbell Floor Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":1,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_squeeze_press', '{"id":"dumbbell_squeeze_press","name":"Dumbbell Squeeze Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["hex press","crush press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('decline_barbell_bench_press', '{"id":"decline_barbell_bench_press","name":"Decline Barbell Bench Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["barbell","bench","rack"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":4,"local":4,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["decline bench press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_decline_chest_press', '{"id":"machine_decline_chest_press","name":"Machine Decline Chest Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('decline_push_up', '{"id":"decline_push_up","name":"Decline Push-Up","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts","abdominals"],"equipment":["bodyweight","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('incline_push_up', '{"id":"incline_push_up","name":"Incline Push-Up","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts"],"equipment":["bodyweight","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":2,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":1,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_incline_fly', '{"id":"dumbbell_incline_fly","name":"Dumbbell Incline Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('low_cable_fly', '{"id":"low_cable_fly","name":"Low-to-High Cable Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_push_press', '{"id":"barbell_push_press","name":"Barbell Push Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","quadriceps","abdominals"],"equipment":["barbell","rack"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":3,"axial":3,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":5,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":90,"max":210},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["push press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_z_press', '{"id":"barbell_z_press","name":"Barbell Z-Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","abdominals"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":3,"local":3,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":5,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["z press","seated floor press"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_lateral_raise_single_arm', '{"id":"cable_lateral_raise_single_arm","name":"Single-Arm Cable Lateral Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_single_arm_overhead_press', '{"id":"dumbbell_single_arm_overhead_press","name":"Dumbbell Single-Arm Overhead Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","obliques"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_overhead_press', '{"id":"kettlebell_overhead_press","name":"Kettlebell Overhead Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts","abdominals"],"equipment":["kettlebell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('single_arm_cable_row', '{"id":"single_arm_cable_row","name":"Single-Arm Cable Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","rear_delts","obliques"],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_pendlay_row', '{"id":"barbell_pendlay_row","name":"Barbell Pendlay Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts","spinal_erectors","forearms"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":3,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["pendlay row","strict barbell row"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('meadows_row', '{"id":"meadows_row","name":"Meadows Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","rear_delts","forearms"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":3,"axial":2,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["landmine row single arm"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('seal_row', '{"id":"seal_row","name":"Seal Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["barbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":4,"axial":0,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":150},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["prone bench row"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('band_pull_apart', '{"id":"band_pull_apart","name":"Band Pull-Apart","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts","upper_back"],"secondary_muscles":[],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":30},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_prone_row', '{"id":"dumbbell_prone_row","name":"Dumbbell Prone Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["dumbbell","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":3,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('wide_grip_lat_pulldown', '{"id":"wide_grip_lat_pulldown","name":"Wide-Grip Lat Pulldown","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["upper_back","biceps","forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":3,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":["wide grip pulldown"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('underhand_lat_pulldown', '{"id":"underhand_lat_pulldown","name":"Underhand Lat Pulldown","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","biceps"],"secondary_muscles":["upper_back","forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":["reverse grip lat pulldown","supinated lat pulldown"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('single_arm_lat_pulldown', '{"id":"single_arm_lat_pulldown","name":"Single-Arm Lat Pulldown","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["biceps","upper_back"],"equipment":["cable"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_lat_pulldown', '{"id":"machine_lat_pulldown","name":"Machine Lat Pulldown","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["biceps","upper_back"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_preacher_curl', '{"id":"barbell_preacher_curl","name":"Barbell Preacher Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["barbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":5,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["EZ bar preacher curl","scott curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_bayesian_curl', '{"id":"cable_bayesian_curl","name":"Cable Bayesian Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["cable"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["behind the body curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_drag_curl', '{"id":"barbell_drag_curl","name":"Barbell Drag Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_reverse_curl', '{"id":"barbell_reverse_curl","name":"Barbell Reverse Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["forearms","biceps"],"secondary_muscles":[],"equipment":["barbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"forearm_isolation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_spider_curl', '{"id":"dumbbell_spider_curl","name":"Dumbbell Spider Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["spider curl","prone incline curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_curl_bar', '{"id":"cable_curl_bar","name":"Cable EZ-Bar Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_triceps_kickback', '{"id":"dumbbell_triceps_kickback","name":"Dumbbell Triceps Kickback","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["tricep kickback"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_single_arm_triceps_pressdown', '{"id":"cable_single_arm_triceps_pressdown","name":"Cable Single-Arm Triceps Pressdown","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_skull_crusher', '{"id":"dumbbell_skull_crusher","name":"Dumbbell Skull Crusher","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('diamond_push_up', '{"id":"diamond_push_up","name":"Diamond Push-Up","status":"active","exercise_type":"compound","movement_patterns":["elbow_extension","horizontal_push"],"primary_muscles":["triceps"],"secondary_muscles":["chest","front_delts","abdominals"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":4,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["close grip push-up"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_rope_overhead_extension', '{"id":"cable_rope_overhead_extension","name":"Cable Rope Overhead Extension","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('band_pull_apart_shoulder', '{"id":"band_pull_apart_shoulder","name":"Band Pull-Apart (Overhead)","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["rear_delts","side_delts"],"secondary_muscles":["upper_back"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":1,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_front_raise', '{"id":"cable_front_raise","name":"Cable Front Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["front_delts"],"secondary_muscles":["side_delts"],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_y_raise', '{"id":"dumbbell_y_raise","name":"Dumbbell Y-Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts","rear_delts"],"secondary_muscles":["upper_back"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_crunch', '{"id":"bodyweight_crunch","name":"Crunch","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_bicycle_crunch', '{"id":"bodyweight_bicycle_crunch","name":"Bicycle Crunch","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion","core_anti_rotation"],"primary_muscles":["abdominals","obliques"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_russian_twist', '{"id":"bodyweight_russian_twist","name":"Russian Twist","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques"],"secondary_muscles":["abdominals"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_flutter_kick', '{"id":"bodyweight_flutter_kick","name":"Flutter Kick","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["quadriceps"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":40},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_reverse_crunch', '{"id":"bodyweight_reverse_crunch","name":"Reverse Crunch","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_lying_leg_raise', '{"id":"bodyweight_lying_leg_raise","name":"Lying Leg Raise","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["quadriceps"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_toe_touch', '{"id":"bodyweight_toe_touch","name":"Toe Touch","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('decline_crunch', '{"id":"decline_crunch","name":"Decline Crunch","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques"],"equipment":["bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":["decline sit-up"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('weighted_plank', '{"id":"weighted_plank","name":"Weighted Plank","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","front_delts"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"none","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":1,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('stability_ball_rollout', '{"id":"stability_ball_rollout","name":"Stability Ball Rollout","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["lats","front_delts"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_hollow_body_hold', '{"id":"bodyweight_hollow_body_hold","name":"Hollow Body Hold","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","quadriceps"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"none","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["hollow hold"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_plank_shoulder_tap', '{"id":"bodyweight_plank_shoulder_tap","name":"Plank Shoulder Tap","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["abdominals","obliques"],"secondary_muscles":["front_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":2,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":2,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_pallof_rotation', '{"id":"cable_pallof_rotation","name":"Cable Pallof Rotation","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques","abdominals"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_side_bend', '{"id":"dumbbell_side_bend","name":"Dumbbell Side Bend","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques"],"secondary_muscles":["abdominals"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":2,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('copenhagen_plank', '{"id":"copenhagen_plank","name":"Copenhagen Plank","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation","hip_adduction"],"primary_muscles":["obliques","adductors"],"secondary_muscles":["abdominals","glutes"],"equipment":["bodyweight","bench"],"difficulty":"advanced","laterality":"unilateral","skill_demand":3,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":45},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":["Copenhagen side plank"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('weighted_back_extension', '{"id":"weighted_back_extension","name":"Weighted Back Extension","status":"active","exercise_type":"isolation","movement_patterns":["core_extension"],"primary_muscles":["spinal_erectors","glutes"],"secondary_muscles":["hamstrings"],"equipment":["machine","dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":3,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_superman', '{"id":"bodyweight_superman","name":"Superman","status":"active","exercise_type":"isolation","movement_patterns":["core_extension"],"primary_muscles":["spinal_erectors"],"secondary_muscles":["glutes","rear_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["back raise","prone back extension"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('standing_leg_curl', '{"id":"standing_leg_curl","name":"Standing Leg Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["calves"],"equipment":["machine"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":1,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('glute_ham_raise', '{"id":"glute_ham_raise","name":"Glute-Ham Raise","status":"active","exercise_type":"compound","movement_patterns":["knee_flexion_isolation","hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors","calves"],"equipment":["machine"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["GHD","GHR","glute ham developer"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('swiss_ball_leg_curl', '{"id":"swiss_ball_leg_curl","name":"Swiss Ball Leg Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["glutes","calves"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["stability ball hamstring curl"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('single_leg_extension', '{"id":"single_leg_extension","name":"Single-Leg Extension","status":"active","exercise_type":"isolation","movement_patterns":["knee_extension_isolation"],"primary_muscles":["quadriceps"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":1,"high_impact":0,"single_leg_loading":1,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_extension_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('reverse_nordic_curl', '{"id":"reverse_nordic_curl","name":"Reverse Nordic Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_extension_isolation"],"primary_muscles":["quadriceps"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_extension_machine","contraindication_tags":["loaded_deep_knee_flexion"],"coaching_notes":[],"aliases":["reverse Nordic"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_fire_hydrant', '{"id":"bodyweight_fire_hydrant","name":"Fire Hydrant","status":"active","exercise_type":"isolation","movement_patterns":["hip_abduction"],"primary_muscles":["glutes"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":1,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('banded_lateral_walk', '{"id":"banded_lateral_walk","name":"Banded Lateral Walk","status":"active","exercise_type":"compound","movement_patterns":["hip_abduction"],"primary_muscles":["glutes"],"secondary_muscles":["quadriceps"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":["monster walk","lateral band walk"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_standing_hip_adduction', '{"id":"cable_standing_hip_adduction","name":"Cable Standing Hip Adduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_adduction"],"primary_muscles":["adductors"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":2,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_adduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_adductor_squeeze', '{"id":"bodyweight_adductor_squeeze","name":"Adductor Squeeze","status":"active","exercise_type":"isolation","movement_patterns":["hip_adduction"],"primary_muscles":["adductors"],"secondary_muscles":["glutes"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_adduction","contraindication_tags":[],"coaching_notes":[],"aliases":["ball squeeze"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('leg_press_calf_raise', '{"id":"leg_press_calf_raise","name":"Leg Press Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":3,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_calf_raise', '{"id":"smith_machine_calf_raise","name":"Smith Machine Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["smith_machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":3,"axial":2,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('donkey_calf_raise', '{"id":"donkey_calf_raise","name":"Donkey Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":3,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_overhead_carry', '{"id":"kettlebell_overhead_carry","name":"Kettlebell Overhead Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["front_delts","abdominals"],"secondary_muscles":["upper_back","triceps","obliques"],"equipment":["kettlebell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":["overhead carry","waiter carry"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trap_bar_farmer_carry', '{"id":"trap_bar_farmer_carry","name":"Trap Bar Farmer Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["forearms","upper_back"],"secondary_muscles":["abdominals","obliques","glutes"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":4,"local":3,"axial":3,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":["hex bar carry"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_wrist_curl', '{"id":"cable_wrist_curl","name":"Cable Wrist Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["forearms"],"secondary_muscles":[],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":2,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"forearm_isolation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_wrist_curl', '{"id":"barbell_wrist_curl","name":"Barbell Wrist Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["forearms"],"secondary_muscles":[],"equipment":["barbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":2,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"forearm_isolation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ninety_ninety_hip_switch', '{"id":"ninety_ninety_hip_switch","name":"90/90 Hip Switch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["glutes","adductors"],"secondary_muscles":["obliques"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":1,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_hip","contraindication_tags":[],"coaching_notes":[],"aliases":["90-90 hip rotation"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('scapular_push_up', '{"id":"scapular_push_up","name":"Scapular Push-Up","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["upper_back"],"secondary_muscles":["front_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":2,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('banded_shoulder_external_rotation', '{"id":"banded_shoulder_external_rotation","name":"Banded External Rotation","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["rear_delts"],"secondary_muscles":["upper_back"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":["band external rotation"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('foam_roller_thoracic_extension', '{"id":"foam_roller_thoracic_extension","name":"Foam Roller Thoracic Extension","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["spinal_erectors"],"secondary_muscles":["upper_back"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"none","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_spine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_goblet_squat', '{"id":"kettlebell_goblet_squat","name":"Kettlebell Goblet Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["adductors","abdominals"],"equipment":["kettlebell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('belt_squat', '{"id":"belt_squat","name":"Belt Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","adductors"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":4,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"squat_machine","contraindication_tags":[],"coaching_notes":[],"aliases":["hip belt squat"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_single_leg_rdl', '{"id":"kettlebell_single_leg_rdl","name":"Kettlebell Single-Leg RDL","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors","forearms","calves"],"equipment":["kettlebell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":3,"axial":1,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_single_leg","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_snatch_grip_rdl', '{"id":"barbell_snatch_grip_rdl","name":"Barbell Snatch-Grip RDL","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","upper_back"],"secondary_muscles":["glutes","spinal_erectors","forearms"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":4,"axial":4,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":5,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":4,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":10},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":["snatch grip Romanian deadlift"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_upright_row', '{"id":"dumbbell_upright_row","name":"Dumbbell Upright Row","status":"active","exercise_type":"compound","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts","upper_back"],"secondary_muscles":["biceps","front_delts"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shoulder_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_row', '{"id":"smith_machine_row","name":"Smith Machine Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["smith_machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":3,"axial":2,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_wide_grip_row', '{"id":"cable_wide_grip_row","name":"Cable Wide-Grip Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","rear_delts"],"secondary_muscles":["lats","biceps"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_assisted_dip', '{"id":"machine_assisted_dip","name":"Machine Assisted Dip","status":"active","exercise_type":"compound","movement_patterns":["elbow_extension","horizontal_push"],"primary_muscles":["triceps","chest"],"secondary_muscles":["front_delts"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":["assisted dip","gravitron dip"]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_pullover', '{"id":"dumbbell_pullover","name":"Dumbbell Pullover","status":"active","exercise_type":"isolation","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["chest","triceps"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":3,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_hip_thrust', '{"id":"smith_machine_hip_thrust","name":"Smith Machine Hip Thrust","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings","quadriceps"],"equipment":["smith_machine","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":4,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_calf_raise_seated', '{"id":"smith_machine_calf_raise_seated","name":"Smith Machine Seated Calf Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["smith_machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":3,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":10,"max":25},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_bear_crawl', '{"id":"bodyweight_bear_crawl","name":"Bear Crawl","status":"active","exercise_type":"compound","movement_patterns":["carry","core_anti_extension"],"primary_muscles":["abdominals","front_delts"],"secondary_muscles":["quadriceps","obliques","triceps"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"alternating","skill_demand":2,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":45},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('machine_abductor_standing', '{"id":"machine_abductor_standing","name":"Standing Machine Hip Abduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_abduction"],"primary_muscles":["glutes"],"secondary_muscles":[],"equipment":["machine"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":1,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":2,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_abduction","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_hip_thrust_single_leg', '{"id":"barbell_hip_thrust_single_leg","name":"Barbell Single-Leg Hip Thrust","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes"],"secondary_muscles":["hamstrings"],"equipment":["barbell","bench"],"difficulty":"advanced","laterality":"unilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":4,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":4,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_thrust","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('landmine_romanian_deadlift', '{"id":"landmine_romanian_deadlift","name":"Landmine Romanian Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors"],"equipment":["barbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":1,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_pull_through_single_leg', '{"id":"cable_pull_through_single_leg","name":"Cable Single-Leg Pull-Through","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors"],"equipment":["cable"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":4,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_single_leg","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_incline_row', '{"id":"dumbbell_incline_row","name":"Dumbbell Incline Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","rear_delts"],"secondary_muscles":["lats","biceps"],"equipment":["dumbbell","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":3,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_row', '{"id":"kettlebell_row","name":"Kettlebell Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","rear_delts","forearms"],"equipment":["kettlebell"],"difficulty":"beginner","laterality":"unilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":3,"axial":1,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":2,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_clean', '{"id":"kettlebell_clean","name":"Kettlebell Clean","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["forearms","upper_back","abdominals"],"equipment":["kettlebell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":3,"axial":1,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":1,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_explosive","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_clean_and_press', '{"id":"kettlebell_clean_and_press","name":"Kettlebell Clean & Press","status":"active","exercise_type":"compound","movement_patterns":["hinge","vertical_push"],"primary_muscles":["front_delts","glutes"],"secondary_muscles":["hamstrings","triceps","forearms","abdominals"],"equipment":["kettlebell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":3,"axial":2,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":90,"max":150},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_rear_delt_row', '{"id":"dumbbell_rear_delt_row","name":"Dumbbell Rear Delt Row","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts"],"secondary_muscles":["upper_back"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":1,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_high_row', '{"id":"cable_high_row","name":"Cable High Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","rear_delts"],"secondary_muscles":["lats","biceps"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_incline_row', '{"id":"smith_machine_incline_row","name":"Smith Machine Incline Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["smith_machine","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('incline_dumbbell_fly', '{"id":"incline_dumbbell_fly","name":"Incline Dumbbell Fly","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_crossover_low_to_high', '{"id":"cable_crossover_low_to_high","name":"Cable Crossover Low-to-High","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('svend_press', '{"id":"svend_press","name":"Svend Press","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"chest_fly","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('straight_arm_pulldown', '{"id":"straight_arm_pulldown","name":"Straight Arm Pulldown","status":"active","exercise_type":"isolation","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["upper_back","rear_delts"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_pullover', '{"id":"cable_pullover","name":"Cable Pullover","status":"active","exercise_type":"isolation","movement_patterns":["vertical_pull"],"primary_muscles":["lats"],"secondary_muscles":["chest","triceps"],"equipment":["cable"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('prone_y_raise', '{"id":"prone_y_raise","name":"Prone Y Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["upper_back","rear_delts"],"secondary_muscles":["side_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"prehab_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('prone_t_raise', '{"id":"prone_t_raise","name":"Prone T Raise","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["upper_back","rear_delts"],"secondary_muscles":["side_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"prehab_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_upright_row_wide', '{"id":"dumbbell_upright_row_wide","name":"Dumbbell Wide Upright Row","status":"active","exercise_type":"compound","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts","upper_back"],"secondary_muscles":["biceps","front_delts"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"upright_row","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('reverse_curl', '{"id":"reverse_curl","name":"Reverse Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["forearms","biceps"],"secondary_muscles":[],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":3,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('zottman_curl', '{"id":"zottman_curl","name":"Zottman Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps","forearms"],"secondary_muscles":[],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bayesian_cable_curl', '{"id":"bayesian_cable_curl","name":"Bayesian Cable Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["cable"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ez_bar_skull_crusher', '{"id":"ez_bar_skull_crusher","name":"EZ Bar Skull Crusher","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["barbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('jm_press', '{"id":"jm_press","name":"JM Press","status":"active","exercise_type":"compound","movement_patterns":["elbow_extension","horizontal_push"],"primary_muscles":["triceps"],"secondary_muscles":["chest","front_delts"],"equipment":["barbell","bench"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":3,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('wrist_roller', '{"id":"wrist_roller","name":"Wrist Roller","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["forearms"],"secondary_muscles":[],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":2,"axial":0,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":2,"max":5},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"forearm","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('plate_pinch_hold', '{"id":"plate_pinch_hold","name":"Plate Pinch Hold","status":"active","exercise_type":"isolation","movement_patterns":["carry"],"primary_muscles":["forearms"],"secondary_muscles":[],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":45},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"forearm","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_pause_deadlift', '{"id":"barbell_pause_deadlift","name":"Pause Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["spinal_erectors","forearms","upper_back"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":4,"axial":5,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":5,"loaded_spinal_flexion":2,"unsupported_hip_hinge":5,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":2,"max":5},"default_rest_seconds":{"min":180,"max":300},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('behind_the_neck_press', '{"id":"behind_the_neck_press","name":"Behind the Neck Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","side_delts"],"secondary_muscles":["triceps","upper_back"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":5,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('smith_machine_ohp', '{"id":"smith_machine_ohp","name":"Smith Machine Overhead Press","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["side_delts"],"equipment":["smith_machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"vertical_push_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_lu_raise', '{"id":"dumbbell_lu_raise","name":"Dumbbell Lu Raise","status":"active","exercise_type":"isolation","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","side_delts"],"secondary_muscles":["upper_back"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"front_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('chest_supported_cable_row', '{"id":"chest_supported_cable_row","name":"Chest Supported Cable Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["cable","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_cable","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_seal_row', '{"id":"barbell_seal_row","name":"Barbell Seal Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts","forearms"],"equipment":["barbell","bench"],"difficulty":"advanced","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":3,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('helms_row', '{"id":"helms_row","name":"Helms Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts"],"equipment":["dumbbell","bench"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('assisted_pull_up', '{"id":"assisted_pull_up","name":"Assisted Pull-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","forearms"],"equipment":["machine"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":3,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"vertical_pull_machine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('weighted_pull_up', '{"id":"weighted_pull_up","name":"Weighted Pull-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","upper_back"],"secondary_muscles":["biceps","forearms","abdominals"],"equipment":["pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":4,"axial":1,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":4,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"vertical_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('weighted_chin_up', '{"id":"weighted_chin_up","name":"Weighted Chin-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull"],"primary_muscles":["lats","biceps"],"secondary_muscles":["upper_back","forearms","abdominals"],"equipment":["pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":4,"axial":1,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":5,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"vertical_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('slider_leg_curl', '{"id":"slider_leg_curl","name":"Slider Leg Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["glutes","calves"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('stability_ball_leg_curl', '{"id":"stability_ball_leg_curl","name":"Stability Ball Leg Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["glutes","calves"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('tibialis_raise', '{"id":"tibialis_raise","name":"Tibialis Raise","status":"active","exercise_type":"isolation","movement_patterns":["calf_raise"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":30},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"calf_raise","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('toes_to_bar', '{"id":"toes_to_bar","name":"Toes to Bar","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","lats"],"equipment":["pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":1,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ghd_sit_up', '{"id":"ghd_sit_up","name":"GHD Sit-Up","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["quadriceps","obliques"],"equipment":["machine"],"difficulty":"advanced","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":3,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":4,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('l_sit_hold', '{"id":"l_sit_hold","name":"L-Sit Hold","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["quadriceps","triceps"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":30},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dragon_flag', '{"id":"dragon_flag","name":"Dragon Flag","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","lats"],"equipment":["bench"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":3,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":3,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('landmine_rotation', '{"id":"landmine_rotation","name":"Landmine Rotation","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques"],"secondary_muscles":["abdominals","front_delts"],"equipment":["barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_rotation","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('suitcase_deadlift', '{"id":"suitcase_deadlift","name":"Suitcase Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge","core_anti_rotation"],"primary_muscles":["glutes","hamstrings","obliques"],"secondary_muscles":["forearms","spinal_erectors"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":3,"local":3,"axial":2,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_bottom_up_carry', '{"id":"kettlebell_bottom_up_carry","name":"Kettlebell Bottom-Up Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["forearms","front_delts"],"secondary_muscles":["abdominals","obliques"],"equipment":["kettlebell"],"difficulty":"advanced","laterality":"unilateral","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":2,"axial":0,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":45},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('zercher_carry', '{"id":"zercher_carry","name":"Zercher Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["abdominals","biceps"],"secondary_muscles":["upper_back","glutes","forearms"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":3,"axial":3,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":45},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ankle_dorsiflexion_mobility', '{"id":"ankle_dorsiflexion_mobility","name":"Ankle Dorsiflexion Mobility","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_ankle","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('prone_scorpion', '{"id":"prone_scorpion","name":"Prone Scorpion","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["glutes","obliques"],"secondary_muscles":["spinal_erectors","quadriceps"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"alternating","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_hip","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('foam_roll_thoracic', '{"id":"foam_roll_thoracic","name":"Foam Roll Thoracic Spine","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["upper_back"],"secondary_muscles":["spinal_erectors"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"none","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_spine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('deep_squat_hold', '{"id":"deep_squat_hold","name":"Deep Squat Hold","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["adductors","calves"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":3},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_hip","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('band_shoulder_warm_up', '{"id":"band_shoulder_warm_up","name":"Band Shoulder Warm-Up","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["front_delts","rear_delts"],"secondary_muscles":["upper_back"],"equipment":["resistance_band"],"difficulty":"beginner","laterality":"bilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":0,"max":30},"substitution_group":"mobility_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('copenhagen_adduction', '{"id":"copenhagen_adduction","name":"Copenhagen Adduction","status":"active","exercise_type":"isolation","movement_patterns":["hip_adduction"],"primary_muscles":["adductors"],"secondary_muscles":["obliques"],"equipment":["bodyweight","bench"],"difficulty":"advanced","laterality":"unilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":1,"local":3,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":3,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"hip_adduction_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('box_jump', '{"id":"box_jump","name":"Box Jump","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["calves","hamstrings"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":2,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":3,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"plyometric_lower","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('box_jump_step_down', '{"id":"box_jump_step_down","name":"Box Jump with Step Down","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["calves","hamstrings"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":2,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":2,"high_impact":1,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"plyometric_lower","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('broad_jump', '{"id":"broad_jump","name":"Broad Jump","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","quadriceps"],"secondary_muscles":["hamstrings","calves"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":2,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":4,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":6},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"plyometric_lower","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('medicine_ball_slam', '{"id":"medicine_ball_slam","name":"Medicine Ball Slam","status":"active","exercise_type":"compound","movement_patterns":["hinge","core_flexion"],"primary_muscles":["abdominals","lats"],"secondary_muscles":["front_delts","triceps","glutes"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":2,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":1,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"power_upper","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('medicine_ball_chest_pass', '{"id":"medicine_ball_chest_pass","name":"Medicine Ball Chest Pass","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts"],"equipment":["dumbbell"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":1,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"power_upper","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('medicine_ball_rotational_throw', '{"id":"medicine_ball_rotational_throw","name":"Medicine Ball Rotational Throw","status":"active","exercise_type":"compound","movement_patterns":["core_anti_rotation"],"primary_muscles":["obliques"],"secondary_muscles":["abdominals","glutes","front_delts"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"power_upper","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_snatch', '{"id":"kettlebell_snatch","name":"Kettlebell Snatch","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings"],"secondary_muscles":["upper_back","front_delts","forearms"],"equipment":["kettlebell"],"difficulty":"advanced","laterality":"unilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":3,"axial":2,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":10},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"power_kettlebell","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_power_clean', '{"id":"barbell_power_clean","name":"Barbell Power Clean","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings","upper_back"],"secondary_muscles":["quadriceps","front_delts","forearms"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":4,"axial":4,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":2,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":2,"max":5},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"olympic_lift","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_hang_clean', '{"id":"barbell_hang_clean","name":"Barbell Hang Clean","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings","upper_back"],"secondary_muscles":["quadriceps","front_delts","forearms"],"equipment":["barbell"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":4,"axial":3,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":2,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":2,"max":5},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"olympic_lift","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_push_jerk', '{"id":"barbell_push_jerk","name":"Barbell Push Jerk","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps","quadriceps"],"secondary_muscles":["glutes","abdominals"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":4,"fatigue_cost":{"systemic":4,"local":3,"axial":3,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":2,"single_leg_loading":0,"high_spinal_compression":3,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":5,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":2,"max":5},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"olympic_lift","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('barbell_thruster', '{"id":"barbell_thruster","name":"Barbell Thruster","status":"active","exercise_type":"compound","movement_patterns":["squat","vertical_push"],"primary_muscles":["quadriceps","front_delts"],"secondary_muscles":["glutes","triceps","abdominals"],"equipment":["barbell","rack"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":5,"local":4,"axial":4,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"olympic_lift","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('dumbbell_thruster', '{"id":"dumbbell_thruster","name":"Dumbbell Thruster","status":"active","exercise_type":"compound","movement_patterns":["squat","vertical_push"],"primary_muscles":["quadriceps","front_delts"],"secondary_muscles":["glutes","triceps","abdominals"],"equipment":["dumbbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":3,"axial":2,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":3,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"power_dumbbell","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('muscle_up', '{"id":"muscle_up","name":"Muscle-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_pull","horizontal_push"],"primary_muscles":["lats","chest","triceps"],"secondary_muscles":["biceps","abdominals","front_delts"],"equipment":["pullup_bar"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":5,"fatigue_cost":{"systemic":4,"local":4,"axial":0,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":1,"max":5},"default_rest_seconds":{"min":120,"max":240},"substitution_group":"vertical_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('handstand_push_up', '{"id":"handstand_push_up","name":"Handstand Push-Up","status":"active","exercise_type":"compound","movement_patterns":["vertical_push"],"primary_muscles":["front_delts","triceps"],"secondary_muscles":["upper_back","abdominals"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"bilateral","skill_demand":5,"stability_demand":5,"fatigue_cost":{"systemic":3,"local":3,"axial":1,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":5,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":4,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":1,"max":8},"default_rest_seconds":{"min":120,"max":180},"substitution_group":"vertical_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('archer_push_up', '{"id":"archer_push_up","name":"Archer Push-Up","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts","abdominals"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"unilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":3,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":3,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ring_dip', '{"id":"ring_dip","name":"Ring Dip","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts","abdominals"],"equipment":["bodyweight"],"difficulty":"advanced","laterality":"bilateral","skill_demand":4,"stability_demand":5,"fatigue_cost":{"systemic":3,"local":3,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ring_row', '{"id":"ring_row","name":"Ring Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts","abdominals"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('bodyweight_dip', '{"id":"bodyweight_dip","name":"Bodyweight Dip","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest","triceps"],"secondary_muscles":["front_delts"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":4,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('battle_rope', '{"id":"battle_rope","name":"Battle Rope","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["front_delts","forearms"],"secondary_muscles":["abdominals","upper_back"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"alternating","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":4,"local":3,"axial":0,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":15,"max":45},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"hiit_upper","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ski_erg', '{"id":"ski_erg","name":"Ski Erg","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["lats","triceps"],"secondary_muscles":["abdominals","upper_back"],"equipment":["machine"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":3,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":45},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('jump_rope', '{"id":"jump_rope","name":"Jump Rope","status":"active","exercise_type":"cardio","movement_patterns":["liss"],"primary_muscles":["calves"],"secondary_muscles":["quadriceps","forearms","front_delts"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":3,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":30,"max":300},"default_rest_seconds":{"min":0,"max":60},"substitution_group":"liss","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('neck_flexion_plate', '{"id":"neck_flexion_plate","name":"Plate Neck Flexion","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["neck"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"none","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"neck","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('neck_extension_plate', '{"id":"neck_extension_plate","name":"Plate Neck Extension","status":"active","exercise_type":"isolation","movement_patterns":["core_extension"],"primary_muscles":["neck"],"secondary_muscles":["upper_back"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"none","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"neck","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('neck_lateral_flexion', '{"id":"neck_lateral_flexion","name":"Neck Lateral Flexion","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_rotation"],"primary_muscles":["neck"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":1,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":25},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"neck","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('neck_harness_extension', '{"id":"neck_harness_extension","name":"Neck Harness Extension","status":"active","exercise_type":"isolation","movement_patterns":["core_extension"],"primary_muscles":["neck"],"secondary_muscles":["upper_back"],"equipment":["bodyweight"],"difficulty":"intermediate","laterality":"none","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"neck","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('neck_curl', '{"id":"neck_curl","name":"Neck Curl","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["neck"],"secondary_muscles":[],"equipment":["bench"],"difficulty":"intermediate","laterality":"none","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":2,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":30,"max":60},"substitution_group":"neck","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trap_bar_rdl', '{"id":"trap_bar_rdl","name":"Trap Bar Romanian Deadlift","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["spinal_erectors","forearms"],"equipment":["trap_bar"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":4,"local":3,"axial":3,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":12},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"hinge_loaded","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trap_bar_shrug', '{"id":"trap_bar_shrug","name":"Trap Bar Shrug","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["upper_back"],"secondary_muscles":["forearms"],"equipment":["trap_bar"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":1,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shrug","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trap_bar_carry', '{"id":"trap_bar_carry","name":"Trap Bar Carry","status":"active","exercise_type":"compound","movement_patterns":["carry"],"primary_muscles":["forearms","upper_back"],"secondary_muscles":["abdominals","obliques","glutes"],"equipment":["trap_bar"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":2,"axial":2,"grip":5},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":2,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"carry","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('sled_pull', '{"id":"sled_pull","name":"Sled Pull","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["hamstrings","glutes"],"secondary_muscles":["upper_back","forearms","calves"],"equipment":["sled"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":4,"local":3,"axial":1,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":2,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"sled","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('sled_drag_backward', '{"id":"sled_drag_backward","name":"Backward Sled Drag","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps"],"secondary_muscles":["calves","glutes"],"equipment":["sled"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":2,"fatigue_cost":{"systemic":3,"local":3,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":10},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"sled","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('sled_lateral_drag', '{"id":"sled_lateral_drag","name":"Lateral Sled Drag","status":"active","exercise_type":"compound","movement_patterns":["hip_abduction"],"primary_muscles":["glutes","adductors"],"secondary_muscles":["quadriceps","calves"],"equipment":["sled"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":3,"local":3,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":2,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"sled","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('tire_flip', '{"id":"tire_flip","name":"Tire Flip","status":"active","exercise_type":"compound","movement_patterns":["hinge"],"primary_muscles":["glutes","hamstrings","quadriceps"],"secondary_muscles":["chest","front_delts","triceps","forearms","spinal_erectors"],"equipment":["tire"],"difficulty":"advanced","laterality":"bilateral","skill_demand":3,"stability_demand":3,"fatigue_cost":{"systemic":5,"local":4,"axial":4,"grip":4},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":2,"single_leg_loading":0,"high_spinal_compression":4,"loaded_spinal_flexion":0,"unsupported_hip_hinge":4,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":90,"max":180},"substitution_group":"strongman","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_row', '{"id":"trx_row","name":"TRX Row","status":"active","exercise_type":"compound","movement_patterns":["horizontal_pull"],"primary_muscles":["upper_back","lats"],"secondary_muscles":["biceps","rear_delts","abdominals"],"equipment":["suspension"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":2,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_pull_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_chest_press', '{"id":"trx_chest_press","name":"TRX Chest Press","status":"active","exercise_type":"compound","movement_patterns":["horizontal_push"],"primary_muscles":["chest"],"secondary_muscles":["triceps","front_delts","abdominals"],"equipment":["suspension"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":2,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"horizontal_push_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_face_pull', '{"id":"trx_face_pull","name":"TRX Face Pull","status":"active","exercise_type":"isolation","movement_patterns":["horizontal_pull"],"primary_muscles":["rear_delts","upper_back"],"secondary_muscles":["biceps"],"equipment":["suspension"],"difficulty":"beginner","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":1,"local":1,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":12,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"rear_delt","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_fallout', '{"id":"trx_fallout","name":"TRX Fallout","status":"active","exercise_type":"isolation","movement_patterns":["core_anti_extension"],"primary_muscles":["abdominals"],"secondary_muscles":["obliques","lats","front_delts"],"equipment":["suspension"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_anti_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_pistol_squat', '{"id":"trx_pistol_squat","name":"TRX Assisted Pistol Squat","status":"active","exercise_type":"compound","movement_patterns":["squat"],"primary_muscles":["quadriceps","glutes"],"secondary_muscles":["hamstrings","calves","abdominals"],"equipment":["suspension"],"difficulty":"intermediate","laterality":"unilateral","skill_demand":3,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":4,"high_impact":0,"single_leg_loading":5,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":4},"default_rep_range":{"min":4,"max":10},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"single_leg_squat","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_hamstring_curl', '{"id":"trx_hamstring_curl","name":"TRX Hamstring Curl","status":"active","exercise_type":"isolation","movement_patterns":["knee_flexion_isolation"],"primary_muscles":["hamstrings"],"secondary_muscles":["glutes","calves"],"equipment":["suspension"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":6,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"knee_flexion_bodyweight","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_y_fly', '{"id":"trx_y_fly","name":"TRX Y Fly","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["rear_delts","upper_back"],"secondary_muscles":["side_delts"],"equipment":["suspension"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":3,"fatigue_cost":{"systemic":1,"local":1,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"prehab_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('trx_pike', '{"id":"trx_pike","name":"TRX Pike","status":"active","exercise_type":"isolation","movement_patterns":["core_flexion"],"primary_muscles":["abdominals"],"secondary_muscles":["front_delts","obliques"],"equipment":["suspension"],"difficulty":"advanced","laterality":"bilateral","skill_demand":3,"stability_demand":5,"fatigue_cost":{"systemic":2,"local":3,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":1,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":5,"max":12},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"core_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('turkish_get_up', '{"id":"turkish_get_up","name":"Turkish Get-Up","status":"active","exercise_type":"compound","movement_patterns":["hinge","squat"],"primary_muscles":["glutes","abdominals","front_delts"],"secondary_muscles":["quadriceps","obliques","triceps","upper_back"],"equipment":["kettlebell"],"difficulty":"advanced","laterality":"unilateral","skill_demand":5,"stability_demand":5,"fatigue_cost":{"systemic":3,"local":2,"axial":1,"grip":3},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":3,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":4,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":1,"max":5},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"kettlebell_complex","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kettlebell_windmill', '{"id":"kettlebell_windmill","name":"Kettlebell Windmill","status":"active","exercise_type":"compound","movement_patterns":["hinge","core_anti_rotation"],"primary_muscles":["obliques","hamstrings"],"secondary_muscles":["glutes","front_delts","upper_back"],"equipment":["kettlebell"],"difficulty":"advanced","laterality":"unilateral","skill_demand":4,"stability_demand":4,"fatigue_cost":{"systemic":2,"local":2,"axial":1,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":3,"overhead_loading":3,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":3,"max":8},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"kettlebell_complex","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cable_shrug', '{"id":"cable_shrug","name":"Cable Shrug","status":"active","exercise_type":"isolation","movement_patterns":["shoulder_abduction"],"primary_muscles":["upper_back"],"secondary_muscles":["forearms"],"equipment":["cable"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":10,"max":20},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"shrug","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ez_bar_spider_curl', '{"id":"ez_bar_spider_curl","name":"EZ Bar Spider Curl","status":"active","exercise_type":"isolation","movement_patterns":["elbow_flexion"],"primary_muscles":["biceps"],"secondary_muscles":["forearms"],"equipment":["ez_barbell","bench"],"difficulty":"beginner","laterality":"bilateral","skill_demand":1,"stability_demand":1,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":4,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_flexion","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ez_bar_upright_row', '{"id":"ez_bar_upright_row","name":"EZ Bar Upright Row","status":"active","exercise_type":"compound","movement_patterns":["shoulder_abduction"],"primary_muscles":["side_delts","upper_back"],"secondary_muscles":["biceps","front_delts"],"equipment":["ez_barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":1,"fatigue_cost":{"systemic":2,"local":2,"axial":0,"grip":2},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":3,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"upright_row","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('ez_bar_overhead_extension', '{"id":"ez_bar_overhead_extension","name":"EZ Bar Overhead Triceps Extension","status":"active","exercise_type":"isolation","movement_patterns":["elbow_extension"],"primary_muscles":["triceps"],"secondary_muscles":[],"equipment":["ez_barbell"],"difficulty":"intermediate","laterality":"bilateral","skill_demand":2,"stability_demand":2,"fatigue_cost":{"systemic":1,"local":2,"axial":0,"grip":1},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":2,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":4,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":60,"max":120},"substitution_group":"elbow_extension","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('standing_hamstring_stretch', '{"id":"standing_hamstring_stretch","name":"Standing Hamstring Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["hamstrings"],"secondary_muscles":["calves"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_posterior","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('standing_quad_stretch', '{"id":"standing_quad_stretch","name":"Standing Quad Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["quadriceps"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_anterior","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('pigeon_stretch', '{"id":"pigeon_stretch","name":"Pigeon Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["glutes"],"secondary_muscles":["adductors"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_hip","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('kneeling_hip_flexor_stretch', '{"id":"kneeling_hip_flexor_stretch","name":"Kneeling Hip Flexor Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["quadriceps"],"secondary_muscles":["glutes"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":1,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_anterior","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('doorway_chest_stretch', '{"id":"doorway_chest_stretch","name":"Doorway Chest Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["chest"],"secondary_muscles":["front_delts"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":2,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_chest","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cross_body_shoulder_stretch', '{"id":"cross_body_shoulder_stretch","name":"Cross-Body Shoulder Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["rear_delts"],"secondary_muscles":["upper_back"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_shoulder","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('seated_figure_four_stretch', '{"id":"seated_figure_four_stretch","name":"Seated Figure-Four Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["glutes"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_hip","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('cat_cow', '{"id":"cat_cow","name":"Cat-Cow","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["spinal_erectors","abdominals"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":8,"max":15},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_spine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('child_pose', '{"id":"child_pose","name":"Child''s Pose","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["lats","spinal_erectors"],"secondary_muscles":["glutes"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"bilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_spine","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('standing_calf_stretch', '{"id":"standing_calf_stretch","name":"Standing Calf Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["calves"],"secondary_muscles":[],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":2},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_calf","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('neck_stretch_lateral', '{"id":"neck_stretch_lateral","name":"Lateral Neck Stretch","status":"active","exercise_type":"mobility","movement_patterns":["mobility"],"primary_muscles":["neck"],"secondary_muscles":["upper_back"],"equipment":["bodyweight"],"difficulty":"beginner","laterality":"unilateral","skill_demand":0,"stability_demand":0,"fatigue_cost":{"systemic":0,"local":0,"axial":0,"grip":0},"movement_demands":{"loaded_deep_knee_flexion":0,"high_impact":0,"single_leg_loading":0,"high_spinal_compression":0,"loaded_spinal_flexion":0,"unsupported_hip_hinge":0,"overhead_loading":0,"deep_shoulder_extension":0,"high_abduction_loading":0,"high_wrist_extension":0,"fixed_pronated_grip":0,"high_elbow_flexion_load":0,"high_elbow_extension_load":0,"deep_ankle_dorsiflexion":0},"default_rep_range":{"min":20,"max":60},"default_rest_seconds":{"min":0,"max":0},"substitution_group":"stretch_neck","contraindication_tags":[],"coaching_notes":[],"aliases":[]}'::jsonb, 'active', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();
commit;
