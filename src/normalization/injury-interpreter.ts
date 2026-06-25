import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AppConfig } from '../infrastructure/config/env.schema.js';
import type { AthleteInput } from '../domain/athlete/athlete.types.js';

type Injury = AthleteInput['injuries'][number];

const KNOWN_AREAS = [
  'knee',
  'lower_back',
  'wrist',
  'shoulder',
  'elbow',
  'ankle',
] as const;

type KnownArea = (typeof KNOWN_AREAS)[number];

type InterpretedInjury = {
  mapped_area: KnownArea;
  severity: 'avoid' | 'modify';
  notes: string;
};

const SYSTEM_PROMPT = `You are a sports-medicine classifier. Given a free-text injury description from a gym user, map it to the closest body region and severity.

Known regions (pick exactly one per injury):
- knee — includes patella, ACL, MCL, meniscus, quad tendon, patellar tendon, IT band (knee side)
- lower_back — includes lumbar spine, SI joint, disc, sciatica, hip flexor strain
- shoulder — includes rotator cuff, labrum, AC joint, deltoid, biceps tendon (long head)
- elbow — includes tennis elbow, golfer's elbow, triceps tendon
- wrist — includes carpal tunnel, TFCC, De Quervain's
- ankle — includes Achilles, plantar fascia, peroneal tendon, ankle ligaments

Severity rules:
- "avoid" — user says avoid, stop, can't do, pain during, post-surgery, acute injury, doctor said no
- "modify" — user says be careful, mild discomfort, tightness, old injury, manageable

If the description doesn't clearly map to any known region, return null for mapped_area.

Respond with a JSON array. Each element: { "mapped_area": "<region>" | null, "severity": "avoid" | "modify", "notes": "<brief clinical interpretation>" }

Array order must match the input order. No extra text.`;

const buildUserPrompt = (injuries: Injury[]): string =>
  injuries
    .map(
      (inj, i) =>
        `${i + 1}. Area: "${inj.area}" | Severity: "${inj.severity}" | Notes: "${inj.notes}"`,
    )
    .join('\n');

const parseResponse = (raw: string): InterpretedInjury[] => {
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

const interpretViaOpenAI = async (
  injuries: Injury[],
  config: AppConfig,
): Promise<InterpretedInjury[]> => {
  const client = new OpenAI({
    apiKey: config.openaiApiKey!,
    timeout: 10_000,
    maxRetries: 0,
  });

  const response = await client.chat.completions.create({
    model: config.openaiGenerationModel ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(injuries) },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content ?? '[]';
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.injuries ?? parsed.results ?? [];
};

const interpretViaAnthropic = async (
  injuries: Injury[],
  config: AppConfig,
): Promise<InterpretedInjury[]> => {
  const client = new Anthropic({
    apiKey: config.anthropicApiKey!,
    timeout: 10_000,
    maxRetries: 0,
  });

  const response = await client.messages.create({
    model: config.anthropicModel ?? 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(injuries) }],
  });

  const text =
    response.content[0]?.type === 'text' ? response.content[0].text : '[]';
  return parseResponse(text);
};

const needsInterpretation = (injury: Injury): boolean => {
  const normalized = injury.area
    .trim()
    .toLowerCase()
    .replaceAll('-', '_')
    .replaceAll(' ', '_');

  const knownAliases = new Set([
    ...KNOWN_AREAS,
    'knees', 'kneecap', 'patella',
    'back', 'low_back', 'lowerback', 'lumbar', 'spine',
    'wrists', 'shoulders', 'rotator_cuff',
    'elbows', 'ankles',
  ]);

  return !knownAliases.has(normalized);
};

export const interpretUnknownInjuries = async (
  injuries: Injury[],
  config: AppConfig,
): Promise<Injury[]> => {
  const unknownIndices = injuries
    .map((inj, i) => (needsInterpretation(inj) ? i : -1))
    .filter((i) => i >= 0);

  if (unknownIndices.length === 0) return injuries;

  const unknownInjuries = unknownIndices.map((i) => injuries[i]!);

  let interpreted: InterpretedInjury[];
  try {
    interpreted =
      config.aiGenerationProvider === 'anthropic' && config.anthropicApiKey
        ? await interpretViaAnthropic(unknownInjuries, config)
        : await interpretViaOpenAI(unknownInjuries, config);
  } catch {
    return injuries;
  }

  if (interpreted.length !== unknownInjuries.length) return injuries;

  const result = [...injuries];
  unknownIndices.forEach((originalIndex, interpIndex) => {
    const mapping = interpreted[interpIndex]!;
    if (mapping.mapped_area && KNOWN_AREAS.includes(mapping.mapped_area)) {
      result[originalIndex] = {
        area: mapping.mapped_area,
        severity: mapping.severity,
        notes: `[AI-interpreted from "${injuries[originalIndex]!.area}"] ${mapping.notes || injuries[originalIndex]!.notes}`,
      };
    }
  });

  return result;
};
