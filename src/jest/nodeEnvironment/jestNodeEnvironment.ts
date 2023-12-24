import NodeEnvironment from "jest-environment-node";
import type {
  JestEnvironmentConfig,
  EnvironmentContext,
} from "@jest/environment";
import { patchFetch, restoreFetch } from "@/fetchPatch";
import { getTmpDirFromEnv } from "@/env";
import { Logger } from "@/logger";
import { openBus, closeBus } from "@/openBus";
import { FileSpace } from "@/fileSpace";

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
      Logger.warn(
        "No trace inspection and output due to invalid setting for Tobikura. Reporter is not set?",
      );
    }

    if (tmpDir) {
      const fileSpace = new FileSpace(tmpDir);
      patchFetch(fileSpace.testLogDir, this.testPath, this.global);

      const workerID = process.env["JEST_WORKER_ID"];
      if (workerID) {
        const busFilePath = fileSpace.eventBusFilePath(workerID);
        await openBus(busFilePath, this.global);
      }
    }
  }

  async teardown() {
    closeBus(this.global);
    restoreFetch(this.global);

    await super.teardown();
  }
}
