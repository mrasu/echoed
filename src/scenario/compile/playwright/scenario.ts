import { Config } from "@/scenario/compile/common/config";
import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import {
  Fixtures,
  FixturesSchema,
} from "@/scenario/compile/playwright/fixtures";
import { Step, StepSchema } from "@/scenario/compile/playwright/step";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const ScenarioSchema = z.strictObject({
  name: z.string(),
  fixtures: FixturesSchema.optional(),
  skip: z.boolean().optional(),
  variable: z.record(JsonSchema).optional(),
  steps: z.array(StepSchema),
});
export type ScenarioSchema = z.infer<typeof ScenarioSchema>;

export class Scenario extends ScenarioBase<Step> {
  static parse(config: Config, scenario: ScenarioSchema): Scenario {
    const fixtures = Fixtures.parse(scenario.fixtures ?? []);
    const variable = TsVariable.parseRecord(scenario.variable);

    const steps = scenario.steps.map((step) => {
      return Step.parse(config, step);
    });

    return new Scenario(
      scenario.name,
      fixtures,
      variable,
      scenario.skip ?? false,
      steps,
    );
  }

  constructor(
    name: string,
    public readonly fixtures: Fixtures,
    public readonly variable: Map<string, TsVariable>,
    public readonly skip: boolean,
    steps: Step[],
  ) {
    super(name, steps);
  }
}
