import { ConfigLoader } from "@/config/configLoader";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { IFile } from "@/fs/IFile";
import { FsContainer } from "@/fs/fsContainer";

export const ECHOED_CONFIG_FILE_NAME = ".echoed.yml";

export class Config {
  static load(fsContainer: FsContainer, file: IFile): Config {
    return new ConfigLoader(fsContainer).loadFromFile(file);
  }

  constructor(
    public readonly output: IFile,
    public readonly serverPort: number,
    public readonly serverStopAfter: number,
    public readonly debug: boolean,
    public readonly propagationTestConfig: PropagationTestConfig,
    public readonly serviceConfigs: ServiceConfig[],
    public readonly compileConfig: ScenarioCompileConfig | undefined,
  ) {}
}

export type ServiceConfig = {
  name: string;
  namespace?: string;
  openapi?: OpenApiConfig;
  proto?: ProtoConfig;
};

export type OpenApiConfig = {
  filePath: string;
  basePath?: string;
};

export type ProtoConfig = {
  filePath: string;
  services?: string[];
};
