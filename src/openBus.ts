import { FileBus } from "@/eventBus/infra/fileBus";
import { IFile } from "@/fs/IFile";
import type { Global } from "@jest/types";

export async function openBus(
  bufFile: IFile,
  global: Global.Global,
): Promise<FileBus> {
  const bus = new FileBus(bufFile);
  global.__ECHOED_BUS__ = bus;

  await bus.open();
  return bus;
}

export function closeBus(global: Global.Global): void {
  global.__ECHOED_BUS__?.close();

  global.__ECHOED_BUS__ = undefined;
}
