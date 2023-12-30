import { patchFetch, restoreFetch } from "@/fetchPatch";
import { openBus, closeBus } from "@/openBus";
import { FileSpace } from "@/fileSpace";
import type { Global } from "@jest/types";
import { FileLogger } from "@/fileLog/fileLogger";
import crypto from "crypto";
import path from "path";
import { IFileLogger } from "@/fileLog/iFileLogger";
import { NoopLogger } from "@/fileLog/noopLogger";

export class Environment {
  constructor(public testPath: string) {}

  async setup(
    global: Global.Global,
    tmpDir: string | undefined,
    workerID: string,
  ) {
    if (!tmpDir) {
      return;
    }

    const fileSpace = new FileSpace(tmpDir);
    this.patchFetch(fileSpace.testLogDir, global);

    const busFilePath = fileSpace.eventBusFilePath(workerID);
    await openBus(busFilePath, global);
  }

  async teardown(global: Global.Global) {
    closeBus(global);
    restoreFetch(global);
  }

  private patchFetch(tmpDir: string | undefined, global: Global.Global) {
    const logger = this.createLogger(tmpDir);

    patchFetch(logger, this.testPath, global);
  }

  private createLogger(tmpDir: string | undefined): IFileLogger {
    if (tmpDir) {
      const filename = crypto.randomUUID() + ".json";
      const filepath = path.join(tmpDir, filename);

      return new FileLogger(filepath);
    } else {
      return new NoopLogger();
    }
  }
}
