import { TobikuraConfig } from "@/config/tobikuraConfig";
import { statSync } from "@/util/file";
import yaml from "js-yaml";
import fs from "fs";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { TobikuraConfigFileSchema } from "@/config/tobikuraConfigFileSchema";

type YamlValue = string | boolean | number | null;

export class TobikuraConfigLoader {
  constructor(private filepath: string) {}

  loadFromFile(): TobikuraConfig {
    const stat = statSync(this.filepath);
    if (!stat) {
      throw new Error(`Tobikura: config file not found: ${this.filepath}`);
    }
    if (!stat.isFile()) {
      throw new Error(`Tobikura: config file is not a file: ${this.filepath}`);
    }

    const fileContent = yaml.load(
      fs.readFileSync(this.filepath, "utf-8"),
    ) as TobikuraConfigFileSchema;

    if (fileContent.output === "") {
      throw new Error("Tobikura: invalid report option. `output` is required");
    }

    return new TobikuraConfig(
      fileContent.output,
      fileContent.serverPort ?? 3000,
      fileContent.serverStopAfter ?? 20,
      fileContent.debug ?? false,
      this.convertPropagationTestConfig(fileContent.propagationTest),
    );
  }

  private convertPropagationTestConfig(
    t?: TobikuraConfigFileSchema["propagationTest"],
  ): PropagationTestConfig {
    const enabled = t?.enabled ?? true;
    const ignore = {
      attributes: this.convertToEqComparables(t?.ignore?.attributes),
      resource: {
        attributes: this.convertToEqComparables(
          t?.ignore?.resource?.attributes,
        ),
      },
    };

    return new PropagationTestConfig({ enabled, ignore });
  }

  private convertToEqComparables(
    values: Record<string, YamlValue> | undefined,
  ): Map<string, Comparable> {
    if (!values) return new Map();

    const ret = new Map();
    for (const [key, val] of Object.entries(values)) {
      if (val === null) continue;

      ret.set(key, new Eq(val));
    }
    return ret;
  }
}
