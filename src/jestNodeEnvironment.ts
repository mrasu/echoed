import NodeEnvironment from "jest-environment-node";
import type {
  JestEnvironmentConfig,
  EnvironmentContext,
} from "@jest/environment";
import { patchFetch, restoreFetch } from "./fetchPatch";
import { getTmpDirFromEnv } from "./env";

export class JestNodeEnvironment extends NodeEnvironment {
  testPath: string;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    this.testPath = context.testPath;
  }

  async setup() {
    await super.setup();

    const tmpDir = getTmpDirFromEnv();
    if (!tmpDir) {
      console.warn(
        "No output due to invalid setting for Tobikura. Reporter is not set?",
      );
    }

    patchFetch(tmpDir, this.testPath, this.global);
  }

  async teardown() {
    restoreFetch();
  }
}
