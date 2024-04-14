import { EchoedFatalError } from "@/echoedFatalError";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { getTmpDirFromEnv } from "@/integration/common/util/env";
import { Environment } from "@/integration/jest/nodeEnvironment/environment";
import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from "@jest/environment";
import NodeEnvironment from "jest-environment-node";

export class JestNodeEnvironment extends NodeEnvironment {
  private env: Environment;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    this.env = new Environment(context.testPath);
  }

  override async setup(): Promise<void> {
    await super.setup();

    const tmpDirPath = getTmpDirFromEnv();
    if (!tmpDirPath) {
      throw new EchoedFatalError(
        "No directory for Echoed's log. not using reporter?",
      );
    }

    const fsContainer = buildFsContainerForApp();
    const tmpDir = fsContainer.newDirectory(tmpDirPath);
    this.env.setup(this.global, tmpDir);
  }

  override async teardown(): Promise<void> {
    this.env.teardown(this.global);

    await super.teardown();
  }
}
