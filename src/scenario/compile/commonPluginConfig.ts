import { ScenarioCompilePluginImportConfig } from "@/config/scenarioCompileConfig";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";

export class CommonPluginConfig {
  static parse(conf: ScenarioCompilePluginImportConfig): CommonPluginConfig {
    if (conf.default?.startsWith("_")) {
      throw new InvalidScenarioError(
        `Name of common plugin must not start with "_". This is reserved for internal use: ${conf.default}`,
      );
    }
    for (const name of conf.names) {
      if (name.startsWith("_")) {
        throw new InvalidScenarioError(
          `Name of common plugin must not start with "_". This is reserved for internal use: ${name}`,
        );
      }
    }

    return new CommonPluginConfig(conf.names ?? [], conf.default, conf.module);
  }

  constructor(
    public readonly names: string[],
    public readonly defaultName: string | undefined,
    public readonly module: string,
  ) {}

  get importClause(): string {
    let text = "";
    if (this.defaultName) {
      text += ` ${this.defaultName} `;
      if (this.names.length > 0) {
        text += `,`;
      }
    }

    if (this.names.length > 0) {
      text += ` { ${this.names.join(", ")} } `;
    }

    return text;
  }
}
