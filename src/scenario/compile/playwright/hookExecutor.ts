import { Config } from "@/scenario/compile/common/config";
import { HookExecutorBase } from "@/scenario/compile/common/hookExecutorBase";
import { RawString } from "@/scenario/compile/common/rawString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import {
  Fixtures,
  FixturesSchema,
} from "@/scenario/compile/playwright/fixtures";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const HookExecutorSchema = z.union([
  z.string(),
  z.strictObject({
    bind: z.record(JsonSchema),
    fixtures: FixturesSchema.optional(),
  }),
  z.strictObject({
    raw: z.string(),
    fixtures: FixturesSchema.optional(),
  }),
]);
export type HookExecutorSchema = z.infer<typeof HookExecutorSchema>;

export class HookExecutor extends HookExecutorBase {
  static parse(_config: Config, schema: HookExecutorSchema): HookExecutor {
    if (typeof schema === "string") {
      return new HookExecutor(new Fixtures([]), new RawString(schema));
    }

    const fixtures = Fixtures.parse(schema.fixtures ?? []);
    if ("raw" in schema) {
      return new HookExecutor(fixtures, new RawString(schema.raw));
    } else {
      const bind = TsVariable.parseRecord(schema.bind);
      return new HookExecutor(fixtures, undefined, bind);
    }
  }

  constructor(
    public readonly fixtures: Fixtures,
    public readonly rawString?: RawString,
    bind?: Map<string, TsVariable>,
  ) {
    super(bind);
  }
}
