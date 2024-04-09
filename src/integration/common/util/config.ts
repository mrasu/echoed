import { Config } from "@/config/config";
import { FsContainer } from "@/fs/fsContainer";
import { LocalFile } from "@/fs/localFile";
import { throwError } from "@/integration/common/util/error";

export function loadConfig(
  fsContainer: FsContainer,
  configFile: LocalFile,
): Config {
  try {
    return Config.load(fsContainer, configFile);
  } catch (e) {
    throwError(e);
  }
}
