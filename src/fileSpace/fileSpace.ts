import { OtelDirectory } from "@/fileSpace/otelDirectory";
import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";

export class FileSpace {
  readonly testLogDir: IDirectory;
  private readonly busEventDir: IDirectory;
  readonly otelDir: OtelDirectory;

  constructor(dir: IDirectory) {
    this.testLogDir = dir.newDir("test");
    this.busEventDir = dir.newDir("busEvent");
    this.otelDir = new OtelDirectory(dir.newDir("otel"));
  }

  ensureDirectoryExistence(): void {
    this.testLogDir.mkdirSync();
    this.busEventDir.mkdirSync();
    this.otelDir.mkdirSync();
  }

  createBusFile(busID: string): IFile {
    return this.busEventDir.newFile(`bus-${busID}.jsonl`);
  }

  createTestLogFile(): IFile {
    const logDir = this.testLogDir;
    const filename = crypto.randomUUID() + ".json";
    return logDir.newFile(filename);
  }
}
