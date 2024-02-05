import { getTmpDirFromEnv } from "@/env";
import { Environment } from "@/jest/nodeEnvironment/environment";
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

    const tmpDir = getTmpDirFromEnv();
    if (!tmpDir) {
      throw new Error("No directory for Echoed's log. not using reporter?");
    }

    const workerID = process.env["JEST_WORKER_ID"];

    await this.env.setup(this.global, tmpDir, workerID!);
  }

  override async teardown(): Promise<void> {
    this.env.teardown(this.global);

    await super.teardown();
  }
}
