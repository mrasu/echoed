import NodeEnvironment from "jest-environment-node";
import type {
  JestEnvironmentConfig,
  EnvironmentContext,
} from "@jest/environment";
import { getTmpDirFromEnv } from "@/env";
import { Logger } from "@/logger";
import { Environment } from "@/jest/nodeEnvironment/environment";

export class JestNodeEnvironment extends NodeEnvironment {
  private env: Environment;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    this.env = new Environment(context.testPath);
  }

  async setup() {
    await super.setup();

    const tmpDir = getTmpDirFromEnv();
    if (!tmpDir) {
      Logger.warn(
        "No trace inspection and output due to invalid setting for Echoed. Reporter is not set?",
      );
    }

    const workerID = process.env["JEST_WORKER_ID"];

    await this.env.setup(this.global, tmpDir, workerID!);
  }

  async teardown() {
    await this.env.teardown(this.global);

    await super.teardown();
  }
}
