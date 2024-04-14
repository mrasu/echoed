import { EchoedFatalError } from "@/echoedFatalError";
import { FileSpace } from "@/fileSpace/fileSpace";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { getTmpDirFromEnv } from "@/integration/common/util/env";

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
