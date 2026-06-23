import { z, type ZodTypeAny } from 'zod';

/**
 * OpenAI structured outputs require all object fields to be required.
 * Optional fields must use `.nullable()` instead of `.optional()`.
 * This recursively transforms a Zod schema to be OpenAI-compatible.
 */
export const toOpenAISchema = <T extends ZodTypeAny>(schema: T): ZodTypeAny => {
  if (schema instanceof z.ZodOptional) {
    return toOpenAISchema(schema.unwrap()).nullable();
  }

  if (schema instanceof z.ZodNullable) {
    return toOpenAISchema(schema.unwrap()).nullable();
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
