import { z } from "zod";

export const FetchStartedLog = z.strictObject({
  type: z.literal("fetchStarted"),
  testId: z.string().optional(),
  traceId: z.string(),
  testPath: z.string(),
  timeMillis: z.number(),
});

export type FetchStartedLog = z.infer<typeof FetchStartedLog>;

export const FetchFinishedLog = z.strictObject({
  type: z.literal("fetchFinished"),
  traceId: z.string(),
  request: z.strictObject({
    url: z.string(),
    method: z.string(),
    body: z.string().optional(),
  }),
  response: z.strictObject({
    status: z.number(),
    body: z.string().optional(),
  }),
});

export type FetchFinishedLog = z.infer<typeof FetchFinishedLog>;

export const FetchFailedLog = z.strictObject({
  type: z.literal("fetchFailed"),
  traceId: z.string(),
  request: z.strictObject({
    url: z.string(),
    method: z.string(),
    body: z.string().optional(),
  }),
  reason: z.string(),
});

export type FetchFailedLog = z.infer<typeof FetchFailedLog>;

export const Log = z.discriminatedUnion("type", [
  FetchStartedLog,
  FetchFinishedLog,
  FetchFailedLog,
]);
export type Log = z.infer<typeof Log>;
