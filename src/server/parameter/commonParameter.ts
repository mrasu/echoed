import { z } from "zod";

export const SuccessResponse = z.strictObject({
  success: z.literal(true),
});

export type SuccessResponse = z.infer<typeof SuccessResponse>;

export const NoResponse = "{}";
export type NoResponse = typeof NoResponse;
