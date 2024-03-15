import { createBus } from "@/bus";
import { EchoedFatalError } from "@/echoedFatalError";
import { getTmpDirFromEnv } from "@/env";
import { EventBus } from "@/eventBus/infra/eventBus";
import { FsContainer } from "@/fs/fsContainer";
import { getBusIdFromGlobalThis } from "@/global";

export function newBus(
  fsContainer: FsContainer,
  shortMessage: boolean,
): EventBus {
  const busId = getBusId(shortMessage);
  const tmpDirPath = getTmpDirPath(shortMessage);

  const bus = createBus(fsContainer, busId, tmpDirPath);

  return bus;
}

function getTmpDirPath(shortMessage: boolean): string {
  const tmpDirPath = getTmpDirFromEnv();
  if (!tmpDirPath) {
    const prefix = shortMessage ? "" : "No directory for Echoed's log. ";
    throw new EchoedFatalError(prefix + "not using Echoed reporter?");
  }
  return tmpDirPath;
}

function getBusId(shortMessage: boolean): string {
  const busId = getBusIdFromGlobalThis();
  if (!busId) {
    const prefix = shortMessage ? "" : "No bus for Echoed. ";
    throw new EchoedFatalError(prefix + "not using test produced by Echoed?");
  }

  return busId;
}
