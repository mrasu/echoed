import { OtelDirectory } from "@/fileSpace/otelDirectory";
import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";

export class FileSpace {
  readonly testLogDir: IDirectory;
  readonly otelDir: OtelDirectory;

  constructor(dir: IDirectory) {
    this.testLogDir = dir.newDir("test");
    this.otelDir = new OtelDirectory(dir.newDir("otel"));
  }

  ensureDirectoryExistence(): void {
    this.testLogDir.mkdirSync();
    this.otelDir.mkdirSync();
  }

  createTestLogFile(): IFile {
    const logDir = this.testLogDir;
    const filename = crypto.randomUUID() + ".json";
    return logDir.newFile(filename);
  }
}
