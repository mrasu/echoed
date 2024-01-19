import { z } from "zod";

const FetchStartedLog = z.object({
  type: z.literal("fetchStarted"),
  traceId: z.string(),
  testPath: z.string(),
  timeMillis: z.number(),
});

export type FetchStartedLog = z.infer<typeof FetchStartedLog>;

const FetchFinishedLog = z.object({
  type: z.literal("fetchFinished"),
  traceId: z.string(),
  request: z.object({
    url: z.string(),
    method: z.string(),
    body: z.string().optional(),
  }),
  response: z.object({
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
