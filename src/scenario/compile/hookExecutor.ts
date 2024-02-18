import { Config } from "@/scenario/compile/config";
import { RawString } from "@/scenario/compile/rawString";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const HookExecutorSchema = z.union([
  z.string(),
  z.strictObject({
    bind: z.record(JsonSchema),
  }),
]);
export type HookExecutorSchema = z.infer<typeof HookExecutorSchema>;

export class HookExecutor {
  static parse(_config: Config, schema: HookExecutorSchema): HookExecutor {
    if (typeof schema === "string") {
      return new HookExecutor(new RawString(schema));
    }

    const bind = TsVariable.parseRecord(schema.bind);
    return new HookExecutor(undefined, bind);
  }

  constructor(
    public readonly rawString?: RawString,
    public readonly bind?: Map<string, TsVariable>,
  ) {}

  boundVariables(): string[] {
    return [...(this.bind?.keys() ?? [].values())];
  }
}
