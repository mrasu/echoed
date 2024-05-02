import { Config } from "@/scenario/compile/common/config";
import { ScenarioBookBase } from "@/scenario/compile/common/scenarioBookBase";
import {
  ScenarioRunnerConfig,
  ScenarioRunnerConfigSchema,
} from "@/scenario/compile/common/scenarioRunnerConfig";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Hook, HookSchema } from "@/scenario/compile/playwright/hook";
import {
  Scenario,
  ScenarioSchema,
} from "@/scenario/compile/playwright/scenario";
import {
  UseOption,
  UseOptionSchema,
} from "@/scenario/compile/playwright/useOption";
import { PlaywrightScenarioYamlSchema } from "@/schema/playwrightScenarioYamlSchema";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const ScenarioBookSchema = z.strictObject({
  use: UseOptionSchema.optional(),
  scenarios: z.array(ScenarioSchema),
  runners: z.array(ScenarioRunnerConfigSchema).optional(),
  variable: z.record(JsonSchema).optional(),
  hook: HookSchema.optional(),
  retry: z.number().optional(),
});
export type ScenarioBookSchema = z.infer<typeof ScenarioBookSchema>;

export class ScenarioBook extends ScenarioBookBase<Scenario> {
  static parse(config: Config, schema: ScenarioBookSchema): ScenarioBook {
    const scenarios = schema.scenarios.map((scenario) => {
      return Scenario.parse(config, scenario);
    });

    const useOption = UseOption.parse(schema.use ?? {});

    const runnerOptions = (schema.runners ?? []).map((runner) =>
      ScenarioRunnerConfig.parse(runner),
    );
    const hook = Hook.parse(config, schema.hook);
    const variable = TsVariable.parseRecord(schema.variable);

    return new ScenarioBook(
      scenarios,
      useOption,
      runnerOptions,
      variable,
      hook,
      schema.retry,
    );
  }

  constructor(
    scenarios: Scenario[],
    public readonly useOption: UseOption,
    runnerOptions: ScenarioRunnerConfig[],
    variable: Map<string, TsVariable>,
    public readonly hook: Hook,
    retry: number | undefined,
  ) {
    super(scenarios, runnerOptions, variable, retry);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeCheck: z.ZodType<PlaywrightScenarioYamlSchema> = ScenarioBookSchema;
