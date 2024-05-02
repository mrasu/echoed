import { Asserter, AsserterSchema } from "@/scenario/compile/common/asserter";
import { Config } from "@/scenario/compile/common/config";
import { RawString } from "@/scenario/compile/common/rawString";
import { TsString } from "@/scenario/compile/common/tsString";
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
    public readonly tsString?: TsString,
    public readonly asserter?: Asserter,
  ) {}
}
