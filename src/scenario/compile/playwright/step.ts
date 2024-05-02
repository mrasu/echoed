import { Act, ActSchema } from "@/scenario/compile/common/act";
import { Arrange } from "@/scenario/compile/common/arrange";
import { Assert } from "@/scenario/compile/common/assert";
import { Config } from "@/scenario/compile/common/config";
import { StepBase } from "@/scenario/compile/common/stepBase";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import {
  ArrangeSchema,
  parseArrange,
} from "@/scenario/compile/playwright/arrange";
import {
  AssertSchema,
  parseAssert,
} from "@/scenario/compile/playwright/assert";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const StepSchema = z.strictObject({
  description: z.string().optional(),
  variable: z.record(JsonSchema).optional(),
  arrange: z.array(ArrangeSchema).optional(),
  act: ActSchema.optional(),
  assert: z.array(AssertSchema).optional(),
  bind: z.record(JsonSchema).optional(),
});
export type StepSchema = z.infer<typeof StepSchema>;

export class Step extends StepBase {
  static parse(config: Config, step: StepSchema): Step {
    const variable = TsVariable.parseRecord(step.variable);
    const arranges = step.arrange?.map((a) => parseArrange(config, a)) ?? [];
    const act = step.act ? Act.parse(config, step.act) : undefined;
    const asserts = step.assert?.map((a) => parseAssert(config, a)) ?? [];
    const bind = TsVariable.parseRecord(step.bind);

    return new Step(step.description, variable, arranges, act, asserts, bind);
  }

  constructor(
    public readonly description: string | undefined,
    public readonly variable: Map<string, TsVariable>,
    arranges: Arrange[],
    act: Act | undefined,
    asserts: Assert[],
    bind: Map<string, TsVariable>,
  ) {
    super(arranges, act, asserts, bind);
  }
}
