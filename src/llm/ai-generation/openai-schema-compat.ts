import { z, type ZodTypeAny } from 'zod';

const containsRecord = (schema: ZodTypeAny): boolean => {
  if (schema instanceof z.ZodRecord) return true;
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable)
    return containsRecord(schema.unwrap());
  if (schema instanceof z.ZodDefault)
    return containsRecord(schema.removeDefault());
  if (schema instanceof z.ZodEffects)
    return containsRecord(schema.innerType());
  if (schema instanceof z.ZodArray) return containsRecord(schema.element);
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, ZodTypeAny>;
    return Object.values(shape).some(containsRecord);
  }
  return false;
};

/**
 * OpenAI structured outputs require all object fields to be required,
 * no additionalProperties (z.record), and no refinements.
 * This recursively transforms a Zod schema to be OpenAI-compatible:
 * - .optional() → .nullable()
 * - Fields containing z.record() are stripped (OpenAI can't handle dynamic keys)
 * - z.ZodEffects (refinements) are unwrapped
 */
export const toOpenAISchema = <T extends ZodTypeAny>(schema: T): ZodTypeAny => {
  if (schema instanceof z.ZodOptional) {
    const inner = schema.unwrap();
    if (containsRecord(inner)) {
      return z.null();
    }
    return toOpenAISchema(inner).nullable();
  }

  if (schema instanceof z.ZodNullable) {
    const inner = schema.unwrap();
    if (containsRecord(inner)) {
      return z.null();
    }
    return toOpenAISchema(inner).nullable();
  }

  if (schema instanceof z.ZodRecord) {
    return z.null();
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, ZodTypeAny>;
    const newShape: Record<string, ZodTypeAny> = {};
    for (const [key, value] of Object.entries(shape)) {
      if (containsRecord(value)) continue;
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
