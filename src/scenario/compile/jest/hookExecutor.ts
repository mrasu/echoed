import { Config } from "@/scenario/compile/common/config";
import { HookExecutorBase } from "@/scenario/compile/common/hookExecutorBase";
import { RawString } from "@/scenario/compile/common/rawString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const HookExecutorSchema = z.union([
  z.string(),
  z.strictObject({
    bind: z.record(JsonSchema),
  }),
]);
export type HookExecutorSchema = z.infer<typeof HookExecutorSchema>;

export class HookExecutor extends HookExecutorBase {
  static parse(_config: Config, schema: HookExecutorSchema): HookExecutor {
    if (typeof schema === "string") {
      return new HookExecutor(new RawString(schema));
    }

    const bind = TsVariable.parseRecord(schema.bind);
    return new HookExecutor(undefined, bind);
  }

  constructor(
    public readonly rawString?: RawString,
    bind?: Map<string, TsVariable>,
  ) {
    super(bind);
  }
}
