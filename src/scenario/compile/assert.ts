import { Asserter, AsserterSchema } from "@/scenario/compile/asserter";
import { Config } from "@/scenario/compile/config";
import { RawString } from "@/scenario/compile/rawString";
import { z } from "zod";

export const AssertSchema = z.string().or(AsserterSchema);
export type AssertSchema = z.infer<typeof AssertSchema>;

export class Assert {
  static parse(config: Config, schema: AssertSchema): Assert {
    if (typeof schema === "string") {
      return new Assert(new RawString(schema));
    } else {
      return new Assert(undefined, Asserter.parse(config, schema));
    }
  }

  constructor(
    public readonly rawString?: RawString,
    public readonly asserter?: Asserter,
  ) {}
}
