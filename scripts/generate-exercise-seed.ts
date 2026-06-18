import { seedExercises } from '../fixtures/exercises/seed-exercises.js';
import { ExerciseSchema } from '../src/domain/exercise/exercise.schema.js';

const escapeSql = (value: string): string => value.replaceAll("'", "''");

console.log('-- Generated from fixtures/exercises/seed-exercises.ts');
console.log('-- Do not edit manually; run npm run supabase:seed:exercises.');
console.log('begin;');

seedExercises.forEach((exercise) => {
  const parsed = ExerciseSchema.parse(exercise);
  const json = escapeSql(JSON.stringify(parsed));

  console.log(`insert into public.exercise_library (id, exercise_data, status, schema_version)
values ('${escapeSql(parsed.id)}', '${json}'::jsonb, '${parsed.status}', 1)
on conflict (id) do update set
  exercise_data = excluded.exercise_data,
  status = excluded.status,
  schema_version = excluded.schema_version,
  updated_at = now();`);
});

console.log('commit;');
