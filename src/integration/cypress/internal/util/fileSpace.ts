import { EchoedFatalError } from "@/echoedFatalError";
import { FileSpace } from "@/fileSpace/fileSpace";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { ICypressObj } from "@/integration/cypress/internal/infra/iCypressObj";
import { getTmpDirFromCypressEnv } from "@/integration/cypress/internal/util/env";

export function buildFileSpaceFromCypressEnv(cyObj: ICypressObj): FileSpace {
  const tmpDirPath = getTmpDirFromCypressEnv(cyObj);
  if (!tmpDirPath) {
    throw new EchoedFatalError(
      "No directory for Echoed's log. not using reporter?",
    );
  }

  const fsContainer = buildFsContainerForApp();
  const tmpDir = fsContainer.newDirectory(tmpDirPath);

  const fileSpace = new FileSpace(tmpDir);

  return fileSpace;
}
