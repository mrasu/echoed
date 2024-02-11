import { IFile } from "@/fs/IFile";
import { FsContainer } from "@/fs/fsContainer";
import { IDirectory } from "@/fs/iDirectory";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { MockFile } from "@/testUtil/fs/mockFile";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";

export const buildMockFsContainer = (): FsContainer => {
  const fileContents = new MockFileContents();
  return {
    mkdtempSync: (prefix: string): IDirectory => {
      return new MockDirectory(prefix + "mock");
    },
    newDirectory: (dir: string): IDirectory => {
      return new MockDirectory(dir, fileContents);
    },
    newFile: (filepath: string): IFile => {
      return new MockFile(true, filepath);
    },
  };
};
