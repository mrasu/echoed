import { ScenarioCompileTargetConfig } from "@/config/scenarioCompileTargetConfig";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";

const DEFAULT_TARGETS: {
  yamlDir: string;
  outDir: string;
  type: ScenarioCompileTargetConfig["type"];
  useEchoedFeatures?: boolean;
}[] = [
  {
    yamlDir: "scenario",
    outDir: "scenario_gen",
    type: "jest",
    useEchoedFeatures: true,
  },
];

export function buildScenarioCompileTargetConfigs(
  targets?: typeof DEFAULT_TARGETS,
): ScenarioCompileTargetConfig[] {
  return (targets ?? DEFAULT_TARGETS).map((target) => {
    return new ScenarioCompileTargetConfig(
      new MockDirectory(target.yamlDir),
      new MockDirectory(target.outDir),
      target.type,
      target.useEchoedFeatures ?? true,
    );
  });
}
