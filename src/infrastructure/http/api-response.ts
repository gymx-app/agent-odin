import { z } from 'zod';

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.unknown().nullable(),
  }),
});

export const createSuccessResponseSchema = <DataSchema extends z.ZodTypeAny>(
  dataSchema: DataSchema,
) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export type ApiSuccessResponse<Data> = {
  success: true;
  data: Data;
};

export type ApiSuccessResult<Data> = {
  statusCode?: number;
  body: ApiSuccessResponse<Data>;
};

export type ApiErrorResponse = z.infer<typeof errorResponseSchema>;

export type ApiResponse<Data> = ApiSuccessResponse<Data> | ApiErrorResponse;

export const successResponse = <Data>(
  data: Data,
): ApiSuccessResponse<Data> => ({
  success: true,
  data,
});

export const successResult = <Data>(
  data: Data,
  statusCode = 200,
): ApiSuccessResult<Data> => ({
  statusCode,
  body: successResponse(data),
});

export const isSuccessResult = (
  value: unknown,
): value is ApiSuccessResult<unknown> =>
  typeof value === 'object' &&
  value !== null &&
  'body' in value &&
  typeof value.body === 'object' &&
  value.body !== null &&
  'success' in value.body &&
  (value.body as { success: unknown }).success === true;

export const errorResponse = (
  code: string,
  message: string,
  details: unknown = null,
): ApiErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    details: details ?? null,
  },
});
