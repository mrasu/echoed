import type { Global } from "@jest/types";
import { FileBus } from "@/eventBus/infra/fileBus";

export async function openBus(busFilePath: string, global: Global.Global) {
  const bus = new FileBus(busFilePath);
  global.__ECHOED_BUS__ = bus;

  await bus.open();
  return bus;
}

export function closeBus(global: Global.Global) {
  global.__ECHOED_BUS__?.close();

  global.__ECHOED_BUS__ = undefined;
}
