import { FileSpace } from "@/fileSpace/fileSpace";
import { buildMockFsContainer } from "@/testUtil/fs/mockFsContainer";

export function buildDummyFileSpace(): FileSpace {
  const fsContainer = buildMockFsContainer();
  const tmpDir = fsContainer.newDirectory("/tmp");
  const fileSpace = new FileSpace(tmpDir);

  return fileSpace;
}
