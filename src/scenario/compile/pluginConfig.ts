import { ScenarioCompilePluginConfig } from "@/config/scenarioCompileConfig";
import { AsserterConfig } from "@/scenario/compile/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/commonPluginConfig";
import { RunnerConfig } from "@/scenario/compile/runnerConfig";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { ScenarioBook } from "@/scenario/compile/scenarioBook";
import { addOrOverride } from "@/util/array";

const defaultRunnerNames = ["fetch", "waitForSpan"];
const defaultAsserterNames = ["assertStatus"];

export const DEFAULT_RUNNERS = defaultRunnerNames.map((name) => {
  return new RunnerConfig(
    name,
    "echoed/scenario/gen/jest/runner",
    new RunnerOption(new Map()),
  );
});

export const DEFAULT_ASSERTERS = defaultAsserterNames.map((name) => {
  return new AsserterConfig(
    name,
    "echoed/scenario/gen/jest/asserter",
    new Map(),
  );
});

export class PluginConfig {
  static parse(conf: ScenarioCompilePluginConfig): PluginConfig {
    const runners = addOrOverride(
      DEFAULT_RUNNERS,
      conf.runners.map((runner) => RunnerConfig.parse(runner)),
      (runner) => runner.name,
    );

    const asserters = addOrOverride(
      DEFAULT_ASSERTERS,
      conf.asserters.map((asserter) => AsserterConfig.parse(asserter)),
      (asserter) => asserter.name,
    );

    const commons = [
      ...conf.commons.map((comm) => CommonPluginConfig.parse(comm)),
    ];

    return new PluginConfig(runners, asserters, commons);
  }

  private readonly runnerNames: Set<string>;
  private readonly asserterNames: Set<string>;

  constructor(
    public readonly runners: RunnerConfig[],
    public readonly asserters: AsserterConfig[],
    public readonly commons: CommonPluginConfig[],
  ) {
    this.runnerNames = new Set(runners.map((runner) => runner.name));
    this.asserterNames = new Set(asserters.map((asserter) => asserter.name));
  }

  hasRunner(runnerName: string): boolean {
    return this.runnerNames.has(runnerName);
  }

  getUsedRunners(scenarioBook: ScenarioBook): RunnerConfig[] {
    const usedRunners = new Set<string>();

    for (const scenario of scenarioBook.scenarios) {
      for (const step of scenario.steps) {
        for (const arrange of step.arranges) {
          if (arrange.runner?.name) {
            usedRunners.add(arrange.runner.name);
          }
        }

        if (step.act?.runner.name) {
          usedRunners.add(step.act.runner.name);
        }
      }
    }

    return this.runners.filter((runner) => usedRunners.has(runner.name));
  }

  hasAsserter(asserterName: string): boolean {
    return this.asserterNames.has(asserterName);
  }

  getUsedAsserters(scenarioBook: ScenarioBook): AsserterConfig[] {
    const usedAsserters = new Set<string>();
    for (const scenario of scenarioBook.scenarios) {
      for (const step of scenario.steps) {
        for (const assert of step.asserts) {
          if (assert.asserter) {
            usedAsserters.add(assert.asserter.name);
          }
        }
      }
    }

    return this.asserters.filter((runner) => usedAsserters.has(runner.name));
  }
}
