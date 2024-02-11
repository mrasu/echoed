import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { LocalFile } from "@/fs/localFile";
import fs from "fs";
import path from "path";

export class LocalDirectory implements IDirectory {
  constructor(public path: string) {}

  newDir(dir: string): IDirectory {
    return new LocalDirectory(path.join(this.path, dir));
  }

  newFile(filename: string): IFile {
    const filepath = path.join(this.path, filename);
    return new LocalFile(filepath);
  }

  resolve(): string {
    return path.resolve(this.path);
  }

  mkdirSync(): void {
    fs.mkdirSync(this.path, { recursive: true });
  }

  async readdir(): Promise<IFile[]> {
    const files = await fs.promises.readdir(this.path);
    return files.map((file) => {
      return this.newFile(file);
    });
  }

  async rm(): Promise<void> {
    await fs.promises.rm(this.path, { recursive: true, force: true });
  }
}
