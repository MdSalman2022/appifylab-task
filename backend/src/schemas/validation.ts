import type { Response } from "express";
import { z, type ZodType } from "zod";

export function validateInput<T>(
  schema: ZodType<T>,
  input: unknown,
  response: Response,
  message: string,
): T | null {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;

  response.status(422).json({
    error: {
      code: "VALIDATION_ERROR",
      message,
      details: z.flattenError(parsed.error).fieldErrors,
    },
  });
  return null;
}
