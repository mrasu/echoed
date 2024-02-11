import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { LocalDirectory } from "@/fs/localDirectory";
import { LocalFile } from "@/fs/localFile";
import fs from "fs";

export type FsContainer = {
  mkdtempSync: (prefix: string) => IDirectory;
  newDirectory: (dir: string) => IDirectory;
  newFile: (filepath: string) => IFile;
};

export const buildFsContainerForApp = (): FsContainer => {
  return {
    mkdtempSync: (prefix: string): IDirectory => {
      return new LocalDirectory(fs.mkdtempSync(prefix));
    },
    newDirectory: (dir: string): IDirectory => {
      return new LocalDirectory(dir);
    },
    newFile(filepath: string): IFile {
      return new LocalFile(filepath);
    },
  };
};
