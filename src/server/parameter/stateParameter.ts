import { z } from "zod";

export const States = ["start", "end"] as const;
export type State = (typeof States)[number];

export const StateEventRequestParam = z.strictObject({
  name: z.string(),
  state: z.enum(States),
});

export type StateEventRequestParam = z.infer<typeof StateEventRequestParam>;
