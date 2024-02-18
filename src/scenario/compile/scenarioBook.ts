import { Config } from "@/scenario/compile/config";
import { Hook, HookSchema } from "@/scenario/compile/hook";
import { Scenario, ScenarioSchema } from "@/scenario/compile/scenario";
import {
  ScenarioRunnerConfig,
  ScenarioRunnerConfigSchema,
} from "@/scenario/compile/scenarioRunnerConfig";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const ScenarioBookSchema = z.strictObject({
  scenarios: z.array(ScenarioSchema),
  runners: z.array(ScenarioRunnerConfigSchema).optional(),
  variable: z.record(JsonSchema).optional(),
  hook: HookSchema.optional(),
  retry: z.number().optional(),
});
export type ScenarioBookSchema = z.infer<typeof ScenarioBookSchema>;

export class ScenarioBook {
  static parse(config: Config, schema: ScenarioBookSchema): ScenarioBook {
    const scenarios = schema.scenarios.map((scenario) => {
      return Scenario.parse(config, scenario);
    });

    const runnerOptions = (schema.runners ?? []).map((runner) =>
      ScenarioRunnerConfig.parse(runner),
    );
    const hook = Hook.parse(config, schema.hook);
    const variable = TsVariable.parseRecord(schema.variable);

    return new ScenarioBook(
      scenarios,
      runnerOptions,
      variable,
      hook,
      schema.retry,
    );
  }

  constructor(
    public readonly scenarios: Scenario[],
    public readonly runnerOptions: ScenarioRunnerConfig[],
    public readonly variable: Map<string, TsVariable>,
    public readonly hook: Hook,
    public readonly retry: number | undefined,
  ) {}

  getRetryCount(config: Config): number {
    return this.retry ?? config.retry;
  }
}
