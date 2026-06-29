import Anthropic from '@anthropic-ai/sdk';
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
};

const INBODY_PARSE_MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 512;

const SYSTEM_PROMPT = `You are an InBody scan data extractor.
You will receive an InBody body composition scan as a document or image.

Extract ONLY the following six values and return them as a single JSON object:
  body_fat_pct       — body fat percentage (e.g. 23.5)
  smm_kg             — skeletal muscle mass in kilograms
  body_fat_mass_kg   — body fat mass in kilograms
  bmr                — basal metabolic rate in kcal/day
  visceral_fat_area  — visceral fat area in cm²
  total_body_water_l — total body water in litres

Rules:
- Return ONLY the JSON object. No explanation, no prose, no markdown.
- If a field is not present in the scan, set its value to null.
- Never guess, estimate, or interpolate. Only extract values you can read directly.
- Do not infer units — use the exact units specified above. If the scan shows a different unit, convert accurately or return null if conversion is ambiguous.

Example output:
{"body_fat_pct":23.5,"smm_kg":31.2,"body_fat_mass_kg":15.1,"bmr":1420,"visceral_fat_area":85,"total_body_water_l":32.4}`.trim();

const parsedInBodySchema = z.object({
  body_fat_pct: z.number().nullable(),
  smm_kg: z.number().nullable(),
  body_fat_mass_kg: z.number().nullable(),
  bmr: z.number().nullable(),
  visceral_fat_area: z.number().nullable(),
  total_body_water_l: z.number().nullable(),
});

const buildContentBlock = (
  file: string,
  mediaType: InBodyMediaType,
): Anthropic.Messages.ContentBlockParam => {
  if (mediaType === 'application/pdf') {
    return {
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: file,
      },
    } as Anthropic.Messages.ContentBlockParam;
  }

  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType,
      data: file,
    },
  };
};

export const parseInBodyFile = async (
  file: string,
  mediaType: InBodyMediaType,
  client: Anthropic,
): Promise<ParsedInBodyData> => {
  let responseText: string;

  try {
    const message = await client.messages.create({
      model: INBODY_PARSE_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            buildContentBlock(file, mediaType),
            { type: 'text', text: 'Extract the InBody data from this scan.' },
          ],
        },
      ],
    });

    const firstBlock = message.content[0];
    if (!firstBlock || firstBlock.type !== 'text') {
      throw odinError('INBODY_PARSE_FAILED', 'Model returned no text content.', 422);
    }

    responseText = firstBlock.text.trim();
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw odinError(
        'INBODY_API_ERROR',
        `Anthropic API error: ${error.message}`,
        502,
        { status: error.status },
        error,
      );
    }
    throw error;
  }

  // Strip optional markdown code fences before parsing
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

  return result.data;
};
