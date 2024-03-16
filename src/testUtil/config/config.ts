import { Config, ServiceConfig } from "@/config/config";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { MockFile } from "@/testUtil/fs/mockFile";

const DEFAULT_CONFIG = {
  output: new MockFile(),
  serverPort: 0,
  serverStopAfter: 0,
  debug: false,
  propagationTestConfig: new PropagationTestConfig({
    enabled: true,
    ignore: {
      attributes: new Map(),
      resource: {
        attributes: new Map(),
      },
      conditions: [],
    },
  }),
  serviceConfigs: [] as ServiceConfig[],
  compileConfig: undefined as ScenarioCompileConfig | undefined,
};

export function buildConfig(
  overrides: Partial<typeof DEFAULT_CONFIG> = {},
): Config {
  const {
    output,
    serverPort,
    serverStopAfter,
    debug,
    propagationTestConfig,
    serviceConfigs,
    compileConfig,
  } = {
    ...DEFAULT_CONFIG,
    ...overrides,
  };

  return new Config(
    output,
    serverPort,
    serverStopAfter,
    debug,
    propagationTestConfig,
    serviceConfigs,
    compileConfig,
  );
}
