import { ScenarioCompileTargetConfig } from "@/config/scenarioCompileTargetConfig";
import { JsonSchema } from "@/type/jsonZod";

export class ScenarioCompileConfig {
  constructor(
    public readonly targets: ScenarioCompileTargetConfig[],
    public readonly cleanOutDir: boolean,
    public readonly retry: number,
    public readonly env: Record<string, string | null>,
    public readonly plugin: ScenarioCompilePluginConfig,
  ) {}
}

export class ScenarioCompilePluginConfig {
  constructor(
    public readonly runners: ScenarioCompilePluginRunnerConfig[],
    public readonly asserters: ScenarioCompilePluginAsserterConfig[],
    public readonly commons: ScenarioCompilePluginImportConfig[],
  ) {}
}

export type ScenarioCompilePluginRunnerConfig = {
  module: string;
  name: string;
  option?: Record<string, JsonSchema>;
};

export type ScenarioCompilePluginAsserterConfig = {
  module: string;
  name: string;
  option?: Record<string, JsonSchema>;
};

export type ScenarioCompilePluginImportConfig = {
  module: string;
  names: string[];
  default?: string;
};
