import { Act } from "@/scenario/compile/act";
import { AsserterConfig } from "@/scenario/compile/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/commonPluginConfig";
import { Config } from "@/scenario/compile/config";
import { EnvConfig } from "@/scenario/compile/envConfig";
import { Hook } from "@/scenario/compile/hook";
import { PluginConfig } from "@/scenario/compile/pluginConfig";
import { RunnerConfig } from "@/scenario/compile/runnerConfig";
import { RunnerContainer } from "@/scenario/compile/runnerContainer";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { Scenario } from "@/scenario/compile/scenario";
import { ScenarioBook } from "@/scenario/compile/scenarioBook";
import { Step } from "@/scenario/compile/step";
import { TsVariable } from "@/scenario/compile/tsVariable";

export const buildConfig = (opt?: {
  retry?: number;
  env?: EnvConfig;
  runners?: RunnerConfig[];
  asserters?: AsserterConfig[];
  commons?: CommonPluginConfig[];
}): Config => {
  const config = new Config(
    opt?.retry ?? 0,
    opt?.env ?? new EnvConfig(new Map()),

    new PluginConfig(
      opt?.runners ?? [buildRunnerConfig({ name: "dummyRunner" })],
      opt?.asserters ?? [new AsserterConfig("dummyAsserter", "", new Map())],
      opt?.commons ?? [],
    ),
  );
  return config;
};

export const buildRunnerConfig = (
  opt?: Partial<RunnerConfig>,
): RunnerConfig => {
  return new RunnerConfig(
    opt?.name ?? "runner3",
    opt?.module ?? "echoed/dummy/runner",
    opt?.option ?? new RunnerOption(new Map()),
  );
};

export const buildAsserterConfig = (
  opt?: Partial<AsserterConfig>,
): AsserterConfig => {
  return new AsserterConfig(
    opt?.name ?? "runner3",
    opt?.module ?? "echoed/dummy/runner",
    opt?.option ?? new Map<string, TsVariable>(),
  );
};

export const buildScenarioBook = (
  opt?: Partial<ScenarioBook>,
): ScenarioBook => {
  return new ScenarioBook(
    opt?.scenarios ?? [
      new Scenario("scenario", new Map(), false, [buildStep()]),
    ],
    opt?.runnerOptions ?? [],
    opt?.variable ?? new Map<string, TsVariable>(),
    opt?.hook ?? new Hook(),
    opt?.retry ?? undefined,
  );
};

export const buildStep = (opt?: Partial<Step>): Step => {
  return new Step(
    opt?.description ?? "scenario",
    opt?.variable ?? new Map<string, TsVariable>(),
    opt?.arranges ?? [],
    opt?.act ??
      new Act(
        new RunnerContainer(
          "runner",
          new TsVariable(null),
          new RunnerOption(new Map()),
        ),
      ),
    opt?.asserts ?? [],
    opt?.bind ?? new Map<string, TsVariable>(),
  );
};
