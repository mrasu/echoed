import { IFile } from "@/fs/IFile";
import { IFileWatcher } from "@/fs/IFileWatcher";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";
import { MockFileWatcher } from "@/testUtil/fs/mockFileWatcher";

export class MockFile implements IFile {
  private watcher?: MockFileWatcher;
  private readonly createsWatcherIfNecessary: boolean;

  path: string;
  fileContents: MockFileContents;

  static buildWithWatcher(
    watcher: MockFileWatcher,
    path?: string,
    fileContents?: MockFileContents,
  ): MockFile {
    const ret = new MockFile(false, path, fileContents);
    ret.watcher = watcher;

    return ret;
  }

  constructor(
    createsWatcherIfNecessary: boolean,
    path: string = "dummy_file.txt",
    fileContents: MockFileContents = new MockFileContents(),
  ) {
    this.createsWatcherIfNecessary = createsWatcherIfNecessary;
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

  async startWatching(
    callback: (text: string) => Promise<void>,
  ): Promise<IFileWatcher> {
    let watcher: IFileWatcher;
    if (this.createsWatcherIfNecessary) {
      watcher = this.watcher ?? new MockFileWatcher();
    } else {
      watcher = this.watcher!;
    }

    await watcher.open(callback);
    return watcher;
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

  async append(text: string): Promise<void> {
    this.fileContents.append(this.path, text);
    await this.watcher?.runCallback(text);
  }

  async appendLine(origText: string): Promise<void> {
    await this.append(origText + "\n");
  }

  unlink(): Promise<void> {
    return Promise.resolve();
  }
}
