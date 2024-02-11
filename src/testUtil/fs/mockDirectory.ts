import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { MockFile } from "@/testUtil/fs/mockFile";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";
import path from "path";

export class MockDirectory implements IDirectory {
  constructor(
    public path: string = "mockDir",
    public fileContents: MockFileContents = new MockFileContents(),
  ) {}

  newDir(dir: string): IDirectory {
    return new MockDirectory(path.join(this.path, dir), this.fileContents);
  }

  newFile(filename: string): MockFile {
    return new MockFile(
      true,
      path.join(this.path, filename),
      this.fileContents,
    );
  }

  resolve(): string {
    return this.path;
  }

  mkdirSync(): void {}

  readdir(): Promise<IFile[]> {
    return Promise.resolve([]);
  }

  rm(): Promise<void> {
    return Promise.resolve();
  }
}
