import { z } from "zod";

export const ErrorMessage = z.strictObject({
  error: z.literal(true),
  reason: z.string(),
});
export type ErrorMessage = z.infer<typeof ErrorMessage>;
