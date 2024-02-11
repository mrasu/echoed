import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";

export class FileSpace {
  readonly testLogDir: IDirectory;
  private readonly busEventDir: IDirectory;

  constructor(dir: IDirectory) {
    this.testLogDir = dir.newDir("test");
    this.busEventDir = dir.newDir("busEvent");
  }

  ensureDirectoryExistence(): void {
    this.testLogDir.mkdirSync();
    this.busEventDir.mkdirSync();
  }

  createBusFile(jestWorkerID: string): IFile {
    return this.busEventDir.newFile(`bus-${jestWorkerID}.jsonl`);
  }
}
