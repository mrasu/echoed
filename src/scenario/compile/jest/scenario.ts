import { Config } from "@/scenario/compile/common/config";
import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Step, StepSchema } from "@/scenario/compile/jest/step";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const ScenarioSchema = z.strictObject({
  name: z.string(),
  skip: z.boolean().optional(),
  variable: z.record(JsonSchema).optional(),
  steps: z.array(StepSchema),
});
export type ScenarioSchema = z.infer<typeof ScenarioSchema>;

export class Scenario extends ScenarioBase<Step> {
  static parse(config: Config, scenario: ScenarioSchema): Scenario {
    const variable = TsVariable.parseRecord(scenario.variable);

    const steps = scenario.steps.map((step) => {
      return Step.parse(config, step);
    });

    return new Scenario(scenario.name, variable, scenario.skip ?? false, steps);
  }

  constructor(
    name: string,
    public readonly variable: Map<string, TsVariable>,
    public readonly skip: boolean,
    steps: Step[],
  ) {
    super(name, steps);
  }
}
