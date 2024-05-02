import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";

const DEFAULT_RUNNER_NAMES = ["fetch", "waitForSpan"];
export function buildRunners(): RunnerConfig[] {
  return DEFAULT_RUNNER_NAMES.map((name) => {
    return new RunnerConfig(
      name,
      "echoed/scenario/gen/dummy/runner",
      new RunnerOption(new Map()),
    );
  });
}

const DEFAULT_ASSERTER_NAMES = ["assertStatus"];
export function buildAsserters(): AsserterConfig[] {
  return DEFAULT_ASSERTER_NAMES.map((name) => {
    return new AsserterConfig(
      name,
      "echoed/scenario/gen/dummy/asserter",
      new Map(),
    );
  });
}

export function buildCommonPlugins(): CommonPluginConfig[] {
  return [];
}
