import type OpenAI from 'openai';
import { z } from 'zod';
import { odinError } from '../../shared/errors/odin-errors.js';

export type InBodyMediaType = 'application/pdf' | 'image/jpeg' | 'image/png';

export type ParsedInBodyData = {
  body_fat_pct: number | null;
  smm_kg: number | null;
  body_fat_mass_kg: number | null;
  bmr: number | null;
  visceral_fat_area: number | null;
  total_body_water_l: number | null;
  weight_kg: number | null;
  // Convenience conversion (1L water ≈ 1kg) so callers can submit this
  // value directly as inbody.total_body_water_kg without a manual unit
  // conversion step.
  total_body_water_kg: number | null;
};

const INBODY_PARSE_MODEL = 'gpt-4o';
const MAX_TOKENS = 512;

const SYSTEM_PROMPT = `You are an InBody scan data extractor.
You will receive an InBody body composition scan as a document or image.

Extract ONLY the following seven values and return them as a single JSON object:
  body_fat_pct       — body fat percentage (e.g. 23.5)
  smm_kg             — skeletal muscle mass in kilograms
  body_fat_mass_kg   — body fat mass in kilograms
  bmr                — basal metabolic rate in kcal/day
  visceral_fat_area  — visceral fat area in cm²
  total_body_water_l — total body water in litres
  weight_kg          — total body weight in kilograms

Rules:
- Return ONLY the JSON object. No explanation, no prose, no markdown.
- If a field is not present in the scan, set its value to null.
- Never guess, estimate, or interpolate. Only extract values you can read directly.
- Do not infer units — use the exact units specified above. If the scan shows a different unit, convert accurately or return null if conversion is ambiguous.

Example output:
{"body_fat_pct":23.5,"smm_kg":31.2,"body_fat_mass_kg":15.1,"bmr":1420,"visceral_fat_area":85,"total_body_water_l":32.4,"weight_kg":78.3}`.trim();

const parsedInBodySchema = z.object({
  body_fat_pct: z.number().nullable(),
  smm_kg: z.number().nullable(),
  body_fat_mass_kg: z.number().nullable(),
  bmr: z.number().nullable(),
  visceral_fat_area: z.number().nullable(),
  total_body_water_l: z.number().nullable(),
  weight_kg: z.number().nullable(),
});

const parseImageWithVision = async (
  file: string,
  mediaType: 'image/jpeg' | 'image/png',
  client: OpenAI,
): Promise<string> => {
  const response = await client.chat.completions.create({
    model: INBODY_PARSE_MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${file}` },
          },
          { type: 'text', text: 'Extract the InBody data from this scan.' },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw odinError('INBODY_PARSE_FAILED', 'Model returned no text content.', 422);
  return text;
};

const parsePdfWithFilesApi = async (
  file: string,
  client: OpenAI,
): Promise<string> => {
  const buffer = Buffer.from(file, 'base64');
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const uploadedFile = await client.files.create({
    file: new File([blob], 'inbody.pdf', { type: 'application/pdf' }),
    purpose: 'user_data',
  });

  try {
    const response = await client.responses.create({
      model: INBODY_PARSE_MODEL,
      max_output_tokens: MAX_TOKENS,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_file',
              file_id: uploadedFile.id,
            } as never,
            {
              type: 'input_text',
              text: `${SYSTEM_PROMPT}\n\nExtract the InBody data from this scan.`,
            },
          ],
        },
      ],
    });

    const text = response.output
      .filter((b) => b.type === 'message')
      .flatMap((b) => (b as { type: 'message'; content: { type: string; text?: string }[] }).content)
      .filter((c) => c.type === 'output_text')
      .map((c) => c.text ?? '')
      .join('')
      .trim();

    if (!text) throw odinError('INBODY_PARSE_FAILED', 'Model returned no text content.', 422);
    return text;
  } finally {
    await client.files.delete(uploadedFile.id).catch(() => undefined);
  }
};

export const parseInBodyFile = async (
  file: string,
  mediaType: InBodyMediaType,
  client: OpenAI,
): Promise<ParsedInBodyData> => {
  let responseText: string;

  try {
    if (mediaType === 'application/pdf') {
      responseText = await parsePdfWithFilesApi(file, client);
    } else {
      responseText = await parseImageWithVision(file, mediaType, client);
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'INBODY_PARSE_FAILED') {
      throw error;
    }
    const msg = error instanceof Error ? error.message : String(error);
    throw odinError('INBODY_API_ERROR', `OpenAI API error: ${msg}`, 502, {}, error instanceof Error ? error : undefined);
  }

  const json = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw odinError(
      'INBODY_PARSE_FAILED',
      'Model response was not valid JSON.',
      422,
      { raw: responseText.slice(0, 200) },
    );
  }

  const result = parsedInBodySchema.safeParse(parsed);
  if (!result.success) {
    throw odinError(
      'INBODY_PARSE_FAILED',
      'Model response did not match the expected InBody schema.',
      422,
      { issues: result.error.flatten() },
    );
  }

  return {
    ...result.data,
    total_body_water_kg: result.data.total_body_water_l,
  };
};
