import { IFile } from "@/fs/IFile";

export interface IDirectory {
  path: string;

  newDir(dir: string): IDirectory;
  newFile(filename: string): IFile;

  resolve(): string;

  mkdirSync(): void;
  readdir(): Promise<IFile[]>;

  rm(): Promise<void>;
}
