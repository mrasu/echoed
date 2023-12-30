import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { TobikuraConfigLoader } from "@/config/tobikuraConfigLoader";

export class TobikuraConfig {
  static load(filepath: string): TobikuraConfig {
    return new TobikuraConfigLoader(filepath).loadFromFile();
  }

  constructor(
    public readonly output: string,
    public readonly serverPort: number,
    public readonly serverStopAfter: number,
    public readonly debug: boolean,
    public readonly propagationTestConfig: PropagationTestConfig,
  ) {}
}
