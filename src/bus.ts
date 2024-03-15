import { EventBus } from "@/eventBus/infra/eventBus";
import { FileBus } from "@/eventBus/infra/fileBus";
import { FileSpace } from "@/fileSpace/fileSpace";
import { FsContainer } from "@/fs/fsContainer";

export function createBus(
  fsContainer: FsContainer,
  busId: string,
  tmpDirPath: string,
): EventBus {
  const tmpDir = fsContainer.newDirectory(tmpDirPath);
  const fileSpace = new FileSpace(tmpDir);
  const busFile = fileSpace.createBusFile(busId);
  const bus = new FileBus(busFile);

  return bus;
}
