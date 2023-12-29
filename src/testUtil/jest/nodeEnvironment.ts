import { EnvironmentContext } from "@jest/environment";
import NodeEnvironment from "jest-environment-node";
import { buildGlobalConfig } from "@/testUtil/jest/globalConfig";
import { buildProjectConfig } from "@/testUtil/jest/projectConfig";

const context: EnvironmentContext = {
  console,
  docblockPragmas: {},
  testPath: __filename,
};

export function buildNodeEnvironment(): NodeEnvironment {
  const testEnvConfig = {
    globalConfig: buildGlobalConfig(),
    projectConfig: buildProjectConfig(),
  };

  const nodeEnvironment = new NodeEnvironment(testEnvConfig, context);

  return nodeEnvironment;
}
