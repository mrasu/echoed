import path from "path";
import fs from "fs";

export class FileSpace {
  readonly testLogDir: string;
  private readonly busEventDir: string;

  constructor(dir: string) {
    this.testLogDir = path.join(dir, "test");
    this.busEventDir = path.join(dir, "busEvent");
  }

  ensureDirectoryExistence() {
    fs.mkdirSync(this.testLogDir, { recursive: true });
    fs.mkdirSync(this.busEventDir, { recursive: true });
  }

  eventBusFilePath(jestWorkerID: string): string {
    return path.join(this.busEventDir, `bus-${jestWorkerID}.jsonl`);
  }
}
