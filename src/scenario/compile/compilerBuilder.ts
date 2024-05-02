import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { ScenarioCompileTargetConfig } from "@/config/scenarioCompileTargetConfig";
import { IDirectory } from "@/fs/iDirectory";
import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { ScenarioBookBase } from "@/scenario/compile/common/scenarioBookBase";
import { StepBase } from "@/scenario/compile/common/stepBase";
import { JestScenarioCompiler } from "@/scenario/compile/jest/jestScenarioCompiler";
import { PlaywrightScenarioCompiler } from "@/scenario/compile/playwright/playwrightScenarioCompiler";
import { ScenarioCompiler } from "@/scenario/compile/scenarioCompiler";
import { neverVisit } from "@/util/never";

export function buildCompiler(
  target: ScenarioCompileTargetConfig,
  echoedRootDir: IDirectory,
  compileConfig: ScenarioCompileConfig,
): ScenarioCompiler<ScenarioBookBase<ScenarioBase<StepBase>>> {
  switch (target.type) {
    case "jest":
      return new JestScenarioCompiler(echoedRootDir, compileConfig);
    case "playwright":
      return new PlaywrightScenarioCompiler(echoedRootDir, compileConfig);
    default:
      neverVisit("unknown ScenarioCompiler type", target.type);
  }
}
