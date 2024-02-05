import { ConfigLoader } from "@/config/configLoader";
import { PropagationTestConfig } from "@/config/propagationTestConfig";

export class Config {
  static load(filepath: string): Config {
    return new ConfigLoader().loadFromFile(filepath);
  }

  constructor(
    public readonly output: string,
    public readonly serverPort: number,
    public readonly serverStopAfter: number,
    public readonly debug: boolean,
    public readonly propagationTestConfig: PropagationTestConfig,
    public readonly serviceConfigs: ServiceConfig[],
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
