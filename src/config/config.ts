import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { ConfigLoader } from "@/config/configLoader";

export class Config {
  static load(filepath: string): Config {
    return new ConfigLoader(filepath).loadFromFile();
  }

  constructor(
    public readonly output: string,
    public readonly serverPort: number,
    public readonly serverStopAfter: number,
    public readonly debug: boolean,
    public readonly propagationTestConfig: PropagationTestConfig,
  ) {}
}
