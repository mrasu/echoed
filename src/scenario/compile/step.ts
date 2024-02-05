import { Act, ActSchema } from "@/scenario/compile/act";
import { Assert, AssertSchema } from "@/scenario/compile/assert";
import { Config } from "@/scenario/compile/config";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const StepSchema = z.object({
  description: z.string().optional(),
  variable: z.record(JsonSchema).optional(),
  act: ActSchema.optional(),
  assert: z.array(AssertSchema).optional(),
  bind: z.record(JsonSchema).optional(),
});
export type StepSchema = z.infer<typeof StepSchema>;

export class Step {
  static parse(config: Config, step: StepSchema): Step {
    const variable = TsVariable.parseRecord(step.variable);
    const act = step.act ? Act.parse(config, step.act) : undefined;
    const asserts = step.assert?.map((a) => Assert.parse(config, a)) ?? [];
    const bind = TsVariable.parseRecord(step.bind);

    return new Step(step.description, variable, act, asserts, bind);
  }

  constructor(
    public readonly description: string | undefined,
    public readonly variable: Map<string, TsVariable>,
    public readonly act: Act | undefined,
    public readonly asserts: Assert[],
    public readonly bind: Map<string, TsVariable>,
  ) {}

  boundVariables(): IterableIterator<string> {
    return this.bind.keys();
  }
}
