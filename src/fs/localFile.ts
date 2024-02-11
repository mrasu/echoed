import { IFile } from "@/fs/IFile";
import { IFileWatcher } from "@/fs/IFileWatcher";
import { FileWatcher } from "@/fs/fileWatcher";
import { IDirectory } from "@/fs/iDirectory";
import { LocalDirectory } from "@/fs/localDirectory";
import fs from "fs";
import path from "path";

const UTF_8 = "utf-8";

export class LocalFile implements IFile {
  constructor(public readonly path: string) {}

  toDir(): IDirectory {
    return new LocalDirectory(this.path);
  }

  async read(): Promise<string> {
    return await fs.promises.readFile(this.path, UTF_8);
  }

  readSync(): string {
    return fs.readFileSync(this.path, UTF_8);
  }

  existsSync(): boolean {
    return fs.existsSync(this.path);
  }

  statSync(): fs.Stats | undefined {
    try {
      return fs.statSync(this.path);
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && e.code === "ENOENT") {
        return undefined;
      }
      throw e;
    }
  }

  async startWatching(
    callback: (text: string) => Promise<void>,
  ): Promise<IFileWatcher> {
    const watcher = new FileWatcher(this);
    await watcher.open(async (text) => {
      await callback(text);
    });

    return watcher;
  }

  async ensureDir(): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.path), {
      recursive: true,
    });
  }

  async createEmptyWithDir(): Promise<void> {
    await this.ensureDir();
    await this.write("");
  }

  async write(text: string): Promise<void> {
    await fs.promises.writeFile(this.path, text, UTF_8);
  }

  async append(text: string): Promise<void> {
    await fs.promises.appendFile(this.path, text, UTF_8);
  }

  async appendLine(text: string): Promise<void> {
    await this.append(text + "\n");
  }

  async unlink(): Promise<void> {
    await fs.promises.unlink(this.path);
  }
}
