import { EchoedFatalError } from "@/echoedFatalError";
import { getTmpDirFromEnv } from "@/env";
import { FileSpace } from "@/fileSpace/fileSpace";
import { buildFsContainerForApp } from "@/fs/fsContainer";

export const getFileSpace = (): FileSpace => {
  const tmpDirPath = getTmpDirFromEnv();
  if (!tmpDirPath) {
    throw new EchoedFatalError(
      "No directory for Echoed's log. not using Echoed reporter?",
    );
  }
  const fsContainer = buildFsContainerForApp();
  const tmpDir = fsContainer.newDirectory(tmpDirPath);
  return new FileSpace(tmpDir);
};
