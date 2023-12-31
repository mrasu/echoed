import {
  Config,
  OpenApiConfig,
  ProtoConfig,
  ServiceConfig,
} from "@/config/config";
import { statSync } from "@/util/file";
import yaml from "js-yaml";
import fs from "fs";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { ConfigFileSchema } from "@/config/configFileSchema";
import { override } from "@/util/object";
import { Logger } from "@/logger";

type YamlValue = string | boolean | number | null;

// value of `overrides` in create/template/.echoed.yml
const EXAMPLE_TEMPLATE_OVERRIDDEN_CONFIG_PATH = "./example/.echoed.yml";

export class ConfigLoader {
  constructor() {}

  loadFromFile(filepath: string): Config {
    const schemaObject = this.readFileRecursively(filepath, false);

    return this.loadFromObject(schemaObject);
  }

  private readFileRecursively(
    filepath: string,
    overridden: boolean,
  ): ConfigFileSchema {
    const overriddenTxt = overridden ? "overridden " : "";

    const stat = statSync(filepath);
    if (!stat) {
      if (overridden && filepath === EXAMPLE_TEMPLATE_OVERRIDDEN_CONFIG_PATH) {
        Logger.warn(`config file not found: ${filepath}`);
        Logger.warn(
          "When you delete `example` directory, modify `./.echoed.yml` to remove `overrides` section.",
        );
      }

      throw new Error(
        `Echoed: ${overriddenTxt}config file not found: ${filepath}`,
      );
    }

    if (!stat.isFile()) {
      throw new Error(
        `Echoed: ${overriddenTxt}config file is not a file: ${filepath}`,
      );
    }

    let schemaObject = yaml.load(
      fs.readFileSync(filepath, "utf-8"),
    ) as ConfigFileSchema;

    if (schemaObject.overrides) {
      for (const filepath of schemaObject.overrides) {
        const overridden = this.readFileRecursively(filepath, true);
        schemaObject = override(schemaObject, overridden);
      }
    }

    return schemaObject;
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
        proto: this.convertProtoConfig(service.proto),
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

  private convertProtoConfig(
    config:
      | Exclude<ConfigFileSchema["services"], undefined>[number]["proto"]
      | undefined,
  ): ProtoConfig | undefined {
    if (!config) return;

    if (typeof config === "string") {
      return {
        filePath: config,
      };
    }

    return {
      filePath: config.filePath,
      services: config.services,
    };
  }
}
