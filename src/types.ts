import { z } from "zod";

const FetchStartedLog = z.strictObject({
  type: z.literal("fetchStarted"),
  traceId: z.string(),
  testPath: z.string(),
  timeMillis: z.number(),
});

export type FetchStartedLog = z.infer<typeof FetchStartedLog>;

const FetchFinishedLog = z.strictObject({
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

export const Log = z.discriminatedUnion("type", [
  FetchStartedLog,
  FetchFinishedLog,
]);
export type Log = z.infer<typeof Log>;
