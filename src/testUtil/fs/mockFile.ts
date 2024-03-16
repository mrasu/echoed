import { IFile } from "@/fs/IFile";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";

export class MockFile implements IFile {
  path: string;
  fileContents: MockFileContents;

  constructor(
    path: string = "dummy_file.txt",
    fileContents: MockFileContents = new MockFileContents(),
  ) {
    this.path = path;
    this.fileContents = fileContents;
  }

  get writtenText(): string | undefined {
    return this.fileContents.get(this.path);
  }

  toDir(): MockDirectory {
    return new MockDirectory(this.path, this.fileContents);
  }

  statSync(): undefined {
    return;
  }

  existsSync(): boolean {
    return false;
  }

  read(): Promise<string> {
    return Promise.resolve(this.readSync());
  }

  readSync(): string {
    return this.fileContents.get(this.path) ?? "";
  }

  ensureDir(): Promise<void> {
    return Promise.resolve();
  }

  createEmptyWithDir(): Promise<void> {
    return Promise.resolve();
  }

  async write(text: string): Promise<void> {
    this.fileContents.replace(this.path, text);

    return Promise.resolve();
  }

  append(text: string): Promise<void> {
    this.fileContents.append(this.path, text);
    return Promise.resolve();
  }

  async appendLine(origText: string): Promise<void> {
    await this.append(origText + "\n");
  }

  unlink(): Promise<void> {
    return Promise.resolve();
  }
}
