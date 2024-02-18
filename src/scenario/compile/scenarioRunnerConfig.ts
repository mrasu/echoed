import { RunnerOption } from "@/scenario/compile/runnerOption";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const ScenarioRunnerConfigSchema = z.strictObject({
  name: z.string(),
  option: z.record(JsonSchema).optional(),
});
export type RunnerOptionSchema = z.infer<typeof ScenarioRunnerConfigSchema>;

export class ScenarioRunnerConfig {
  static parse(schema: RunnerOptionSchema): ScenarioRunnerConfig {
    const name = schema.name;
    const option = RunnerOption.parse(schema.option);

    return new ScenarioRunnerConfig(name, option);
  }

  constructor(
    public readonly name: string,
    public readonly option: RunnerOption,
  ) {}
}
