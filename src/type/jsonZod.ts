import { z } from "zod";

const Literal = z.union([z.string(), z.boolean(), z.number(), z.null()]);
type Literal = z.infer<typeof Literal>;

type Json = Literal | { [key: string]: Json } | Json[];

export const JsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([Literal, z.array(JsonSchema), z.record(JsonSchema)]),
);
export type JsonSchema = z.infer<typeof JsonSchema>;
