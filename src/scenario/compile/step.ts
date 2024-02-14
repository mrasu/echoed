import { Act, ActSchema } from "@/scenario/compile/act";
import { Arrange, ArrangeSchema } from "@/scenario/compile/arrange";
import { Assert, AssertSchema } from "@/scenario/compile/assert";
import { Config } from "@/scenario/compile/config";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const StepSchema = z.object({
  description: z.string().optional(),
  variable: z.record(JsonSchema).optional(),
  arrange: z.array(ArrangeSchema).optional(),
  act: ActSchema.optional(),
  assert: z.array(AssertSchema).optional(),
  bind: z.record(JsonSchema).optional(),
});
export type StepSchema = z.infer<typeof StepSchema>;

export class Step {
  static parse(config: Config, step: StepSchema): Step {
    const variable = TsVariable.parseRecord(step.variable);
    const arranges = step.arrange?.map((a) => Arrange.parse(config, a)) ?? [];
    const act = step.act ? Act.parse(config, step.act) : undefined;
    const asserts = step.assert?.map((a) => Assert.parse(config, a)) ?? [];
    const bind = TsVariable.parseRecord(step.bind);

    return new Step(step.description, variable, arranges, act, asserts, bind);
  }

  constructor(
    public readonly description: string | undefined,
    public readonly variable: Map<string, TsVariable>,
    public readonly arranges: Arrange[],
    public readonly act: Act | undefined,
    public readonly asserts: Assert[],
    public readonly bind: Map<string, TsVariable>,
  ) {}

  boundVariables(): string[] {
    return [...this.bind.keys()];
  }

  getArrangeBoundVariablesBefore(current: number): string[] {
    const variables = new Set<string>();

    for (let i = 0; i < current && i < this.arranges.length; i++) {
      for (const variable of this.arranges[i].boundVariables()) {
        variables.add(variable);
      }
    }
    return [...variables.values()];
  }

  getArrangeBoundVariables(): string[] {
    return this.getArrangeBoundVariablesBefore(this.arranges.length);
  }
}
