import { z, type ZodTypeAny } from 'zod';

/**
 * OpenAI structured outputs require all object fields to be required,
 * no additionalProperties (z.record), and no refinements.
 * This recursively transforms a Zod schema to be OpenAI-compatible:
 * - .optional() → .nullable()
 * - z.record() fields → z.null() (OpenAI can't handle dynamic keys)
 * - z.ZodEffects (refinements) are unwrapped
 *
 * Only direct z.record() fields on an object are stripped — deeply nested
 * records are converted to z.null() in-place so parent structures survive.
 */
export const toOpenAISchema = <T extends ZodTypeAny>(schema: T): ZodTypeAny => {
  if (schema instanceof z.ZodOptional) {
    return toOpenAISchema(schema.unwrap()).nullable();
  }

  if (schema instanceof z.ZodNullable) {
    return toOpenAISchema(schema.unwrap()).nullable();
  }

  if (schema instanceof z.ZodRecord) {
    return z.null();
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, ZodTypeAny>;
    const newShape: Record<string, ZodTypeAny> = {};
    for (const [key, value] of Object.entries(shape)) {
      newShape[key] = toOpenAISchema(value);
    }
    return z.object(newShape);
  }

  if (schema instanceof z.ZodArray) {
    return z.array(toOpenAISchema(schema.element));
  }

  if (schema instanceof z.ZodEffects) {
    return toOpenAISchema(schema.innerType());
  }

  if (schema instanceof z.ZodDefault) {
    return toOpenAISchema(schema.removeDefault());
  }

  return schema;
};
