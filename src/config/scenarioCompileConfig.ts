import { JsonSchema } from "@/type/jsonZod";

export const DEFAULT_SCENARIO_COMPILE_OUT_DIR = "scenario_gen";
export const DEFAULT_SCENARIO_COMPILE_YAML_DIR = "scenario";

export class ScenarioCompileConfig {
  constructor(
    public readonly outDir: string,
    public readonly cleanOutDir: boolean,
    public readonly yamlDir: string,
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
