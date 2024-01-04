import { Config, OpenApiConfig, ServiceConfig } from "@/config/config";
import { statSync } from "@/util/file";
import yaml from "js-yaml";
import fs from "fs";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { ConfigFileSchema } from "@/config/configFileSchema";

type YamlValue = string | boolean | number | null;

export class ConfigLoader {
  constructor() {}

  loadFromFile(filepath: string): Config {
    const stat = statSync(filepath);
    if (!stat) {
      throw new Error(`Echoed: config file not found: ${filepath}`);
    }
    if (!stat.isFile()) {
      throw new Error(`Echoed: config file is not a file: ${filepath}`);
    }

    const fileContent = yaml.load(
      fs.readFileSync(filepath, "utf-8"),
    ) as ConfigFileSchema;

    return this.loadFromObject(fileContent);
  }

  loadFromObject(schemaObject: ConfigFileSchema): Config {
    if (schemaObject.output === "") {
      throw new Error("Echoed: invalid report option. `output` is required");
    }

    return new Config(
      schemaObject.output,
      schemaObject.serverPort ?? 3000,
      schemaObject.serverStopAfter ?? 20,
      schemaObject.debug ?? false,
      this.convertPropagationTestConfig(schemaObject.propagationTest),
      this.convertServiceConfigs(schemaObject.services),
    );
  }

  private convertPropagationTestConfig(
    t?: ConfigFileSchema["propagationTest"],
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

  private convertServiceConfigs(
    services: ConfigFileSchema["services"] | undefined,
  ): ServiceConfig[] {
    if (!services) return [];

    return services.map((service) => {
      return {
        name: service.name,
        namespace: service.namespace,
        openapi: this.convertOpenApiConfig(service.openapi),
      };
    });
  }

  private convertOpenApiConfig(
    config:
      | Exclude<ConfigFileSchema["services"], undefined>[number]["openapi"]
      | undefined,
  ): OpenApiConfig | undefined {
    if (!config) return;

    if (typeof config === "string") {
      return {
        filePath: config,
      };
    }

    return {
      filePath: config.filePath,
      basePath: config.basePath,
    };
  }
}
