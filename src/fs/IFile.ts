import { IFileWatcher } from "@/fs/IFileWatcher";
import { IDirectory } from "@/fs/iDirectory";
import fs from "fs";

export interface IFile {
  path: string;

  toDir(): IDirectory;

  statSync(): fs.Stats | undefined;
  existsSync(): boolean;

  read(): Promise<string>;
  readSync(): string;

  startWatching(
    callback: (text: string) => Promise<void>,
  ): Promise<IFileWatcher>;

  ensureDir(): Promise<void>;

  createEmptyWithDir(): Promise<void>;

  write(text: string): Promise<void>;

  append(text: string): Promise<void>;
  appendLine(text: string): Promise<void>;

  unlink(): Promise<void>;
}
