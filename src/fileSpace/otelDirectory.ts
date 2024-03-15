import { IDirectory } from "@/fs/iDirectory";
import { IFile } from "@/fs/IFile";

export class OtelDirectory {
  constructor(private readonly dir: IDirectory) {}

  mkdirSync(): void {
    this.dir.mkdirSync();
  }

  get spanFile(): IFile {
    return this.dir.newFile("span.jsonl");
  }

  get logFile(): IFile {
    return this.dir.newFile("log.jsonl");
  }
}
