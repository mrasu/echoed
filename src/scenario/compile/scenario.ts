import { Config } from "@/scenario/compile/config";
import { Step, StepSchema } from "@/scenario/compile/step";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { escapeTemplateString } from "@/scenario/compile/util";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const ScenarioSchema = z.strictObject({
  name: z.string(),
  skip: z.boolean().optional(),
  variable: z.record(JsonSchema).optional(),
  steps: z.array(StepSchema),
});
export type ScenarioSchema = z.infer<typeof ScenarioSchema>;

export class Scenario {
  static parse(config: Config, scenario: ScenarioSchema): Scenario {
    const variable = TsVariable.parseRecord(scenario.variable);

    const steps = scenario.steps.map((step) => {
      return Step.parse(config, step);
    });

    return new Scenario(scenario.name, variable, scenario.skip ?? false, steps);
  }

  constructor(
    public readonly name: string,
    public readonly variable: Map<string, TsVariable>,
    public readonly skip: boolean,
    public readonly steps: Step[],
  ) {}

  getBoundVariablesBefore(index: number): string[] {
    const variables = new Set<string>();

    for (let i = 0; i < index && index < this.steps.length; i++) {
      for (const variable of this.steps[i].boundVariables()) {
        variables.add(variable);
      }
    }
    return [...variables.values()];
  }

  get escapedName(): string {
    return escapeTemplateString(this.name);
  }
}
