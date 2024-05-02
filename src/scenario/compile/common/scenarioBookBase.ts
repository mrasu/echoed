import { Config } from "@/scenario/compile/common/config";
import { PluginLister } from "@/scenario/compile/common/pluginLister";
import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { ScenarioRunnerConfig } from "@/scenario/compile/common/scenarioRunnerConfig";
import { StepBase } from "@/scenario/compile/common/stepBase";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { ScenarioBaseType } from "@/scenario/compile/common/typeUtil";

export abstract class ScenarioBookBase<
  T extends ScenarioBase<U>,
  U extends StepBase = ScenarioBaseType<T>,
> implements PluginLister
{
  protected constructor(
    public readonly scenarios: T[],
    public readonly runnerOptions: ScenarioRunnerConfig[],
    public readonly variable: Map<string, TsVariable>,
    public readonly retry: number | undefined,
  ) {}

  getRetryCount(config: Config): number {
    return this.retry ?? config.retry;
  }

  getUsedRunners(): Set<string> {
    const usedRunners = new Set<string>();

    for (const scenario of this.scenarios) {
      for (const step of scenario.steps) {
        for (const arrange of step.arranges) {
          if (arrange.runner?.name) {
            usedRunners.add(arrange.runner.name);
          }
        }

        if (step.act?.runner?.name) {
          usedRunners.add(step.act.runner.name);
        }
      }
    }

    return usedRunners;
  }

  getUsedAsserters(): Set<string> {
    const usedAsserters = new Set<string>();
    for (const scenario of this.scenarios) {
      for (const step of scenario.steps) {
        for (const assert of step.asserts) {
          if (assert.asserter) {
            usedAsserters.add(assert.asserter.name);
          }
        }
      }
    }

    return usedAsserters;
  }
}
