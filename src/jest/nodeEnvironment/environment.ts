import { patchFetch, restoreFetch } from "@/fetchPatch";
import { openBus, closeBus } from "@/openBus";
import { FileSpace } from "@/fileSpace";
import type { Global } from "@jest/types";
import { FileLogger } from "@/fileLog/fileLogger";
import crypto from "crypto";
import path from "path";
import { IFileLogger } from "@/fileLog/iFileLogger";

export class Environment {
  constructor(public testPath: string) {}

  async setup(
    global: Global.Global,
    tmpDir: string,
    workerID: string,
  ): Promise<void> {
    const fileSpace = new FileSpace(tmpDir);
    this.patchFetch(fileSpace.testLogDir, global);

    const busFilePath = fileSpace.eventBusFilePath(workerID);
    await openBus(busFilePath, global);
  }

  teardown(global: Global.Global): void {
    closeBus(global);
    restoreFetch(global);
  }

  private patchFetch(tmpDir: string, global: Global.Global): void {
    const logger = this.createLogger(tmpDir);

    patchFetch(logger, this.testPath, global);
  }

  private createLogger(tmpDir: string): IFileLogger {
    const filename = crypto.randomUUID() + ".json";
    const filepath = path.join(tmpDir, filename);

    return new FileLogger(filepath);
  }
}
