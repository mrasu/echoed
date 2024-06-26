import {
  Config,
  ECHOED_CONFIG_FILE_NAME,
  OpenApiConfig,
  ProtoConfig,
  ServiceConfig,
} from "@/config/config";
import { InvalidConfigError } from "@/config/invalidConfigError";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import {
  ScenarioCompileConfig,
  ScenarioCompilePluginAsserterConfig,
  ScenarioCompilePluginConfig,
  ScenarioCompilePluginImportConfig,
  ScenarioCompilePluginRunnerConfig,
} from "@/config/scenarioCompileConfig";
import { ScenarioCompileTargetConfig } from "@/config/scenarioCompileTargetConfig";
import {
  convertToComparable,
  convertToComparables,
} from "@/config/util/mapper";
import { IFile } from "@/fs/IFile";
import { FsContainer } from "@/fs/fsContainer";
import { Logger } from "@/logger";
import { ConfigSchema } from "@/schema/configSchema";
import {
  ConfigSchemaZod,
  PartialConfigSchemaZod,
} from "@/schema/configSchemaZod";
import { JsonSchema } from "@/type/jsonZod";
import { override, transformRecord } from "@/util/record";
import { formatZodError } from "@/util/zod";
import yaml from "js-yaml";
import { SafeParseReturnType } from "zod";

export const DEFAULT_SCENARIO_COMPILE_OUT_DIR = "scenario_gen";
export const DEFAULT_SCENARIO_COMPILE_YAML_DIR = "scenario";

// value of `overrides` in create-echoed/template/.echoed.yml
const EXAMPLE_TEMPLATE_OVERRIDDEN_CONFIG_PATH = "./example/.echoed.yml";

type scenarioCompile = NonNullable<ConfigSchema["scenario"]>["compile"];

export class ConfigLoader {
  constructor(private readonly fsContainer: FsContainer) {}

  loadFromFile(file: IFile): Config {
    const result = this.readFileRecursively(file);

    if (!result.success) {
      throw new InvalidConfigError(
        `Failed to parse configuration: ${formatZodError(result.error)}`,
      );
    }

    return this.loadFromObject(result.data);
  }

  private readFileRecursively(
    file: IFile,
  ): SafeParseReturnType<ConfigSchemaZod, ConfigSchemaZod> {
    const schemaObject = this.readFile(file, false);
    const config = ConfigSchemaZod.safeParse(schemaObject);

    if (!config.success) {
      return config;
    }

    let configData = config.data;

    if (configData.overrides) {
      for (const filepath of configData.overrides) {
        const overridden = this.readFileRecursivelyOverridden(
          this.fsContainer.newFile(filepath),
        );
        if (!overridden.success) {
          return overridden;
        }
        configData = override(configData, overridden.data);
      }
    }

    return { success: true, data: configData };
  }

  private readFileRecursivelyOverridden(
    file: IFile,
  ): SafeParseReturnType<PartialConfigSchemaZod, PartialConfigSchemaZod> {
    const schemaObject = this.readFile(file, true);
    const partial = PartialConfigSchemaZod.safeParse(schemaObject);

    if (!partial.success) {
      return partial;
    }

    let partialData = partial.data;

    if (partialData.overrides) {
      for (const filepath of partialData.overrides) {
        const overridden = this.readFileRecursivelyOverridden(
          this.fsContainer.newFile(filepath),
        );
        if (!overridden.success) {
          return overridden;
        }
        partialData = override(partialData, overridden.data);
      }
    }

    return { success: true, data: partialData };
  }

  private readFile(file: IFile, overridden: boolean): unknown {
    const overriddenTxt = overridden ? "overridden " : "";

    const stat = file.statSync();
    if (!stat) {
      if (overridden && file.path === EXAMPLE_TEMPLATE_OVERRIDDEN_CONFIG_PATH) {
        Logger.warn(`config file not found: ${file.path}`);
        Logger.warn(
          "When you delete `example` directory, remove `overrides` section in `" +
            ECHOED_CONFIG_FILE_NAME +
            "` too.",
        );
      }

      throw new InvalidConfigError(
        `${overriddenTxt}config file not found: ${file.path}`,
      );
    }

    if (!stat.isFile()) {
      throw new InvalidConfigError(
        `${overriddenTxt}config file is not a file: ${file.path}`,
      );
    }

    const schemaObject = yaml.load(file.readSync());
    return schemaObject;
  }

  loadFromObject(schemaObject: ConfigSchema): Config {
    if (schemaObject.output === "") {
      throw new InvalidConfigError(
        "Invalid report option. `output` is required",
      );
    }

    return new Config(
      this.fsContainer.newFile(schemaObject.output),
      schemaObject.serverPort ?? 3000,
      schemaObject.serverStopAfter ?? 20,
      schemaObject.debug ?? false,
      this.convertPropagationTestConfig(schemaObject.propagationTest),
      this.convertServiceConfigs(schemaObject.services),
      this.convertScenarioCompileConfig(schemaObject.scenario?.compile),
    );
  }

  private convertPropagationTestConfig(
    t?: ConfigSchema["propagationTest"],
  ): PropagationTestConfig {
    const enabled = t?.enabled ?? true;
    const ignore = {
      attributes: convertToComparables(t?.ignore?.attributes),
      resource: {
        attributes: convertToComparables(t?.ignore?.resource?.attributes),
      },
      conditions:
        t?.ignore?.conditions?.map((c) => {
          return {
            attributes: convertToComparables(c.attributes),
            resource: {
              attributes: convertToComparables(c.resource?.attributes),
            },
          };
        }) ?? [],
    };

    return new PropagationTestConfig({ enabled, ignore });
  }

  private convertServiceConfigs(
    services: ConfigSchema["services"] | undefined,
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
      | Exclude<ConfigSchema["services"], undefined>[number]["openapi"]
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
      coverage: this.convertOpenApiCoverageConfig(config.coverage),
    };
  }

  private convertOpenApiCoverageConfig(
    config:
      | NonNullable<
          Exclude<
            NonNullable<ConfigSchema["services"]>[number]["openapi"],
            string
          >
        >["coverage"]
      | undefined,
  ): OpenApiConfig["coverage"] | undefined {
    if (!config) return;

    return {
      undocumentedOperation: {
        ignores: config.undocumentedOperation.ignores.map((ignore) => {
          return {
            path: convertToComparable(ignore.path),
            method: ignore.method,
          };
        }),
      },
    };
  }

  private convertProtoConfig(
    config:
      | Exclude<ConfigSchema["services"], undefined>[number]["proto"]
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
      coverage: this.convertProtoCoverageConfig(config.coverage),
    };
  }

  private convertProtoCoverageConfig(
    config:
      | NonNullable<
          Exclude<
            NonNullable<ConfigSchema["services"]>[number]["proto"],
            string
          >
        >["coverage"]
      | undefined,
  ): ProtoConfig["coverage"] | undefined {
    if (!config) return;

    return {
      undocumentedMethod: {
        ignores: config.undocumentedMethod.ignores.map((ignore) => {
          return {
            service: convertToComparable(ignore.service),
            method: convertToComparable(ignore.method),
          };
        }),
      },
    };
  }

  private convertScenarioCompileConfig(
    compile: scenarioCompile | undefined,
  ): ScenarioCompileConfig | undefined {
    if (!compile) return;

    return new ScenarioCompileConfig(
      this.convertScenarioCompileTargetConfig(compile),
      compile.cleanOutDir ?? false,
      compile.retry ?? 0,
      compile.env ?? {},
      this.convertScenarioCompilePluginConfig(compile.plugin),
    );
  }

  private convertScenarioCompileTargetConfig(
    compile: NonNullable<scenarioCompile>,
  ): ScenarioCompileTargetConfig[] {
    if (!compile.targets) {
      const yamlDir = compile.yamlDir ?? DEFAULT_SCENARIO_COMPILE_YAML_DIR;
      const outDir = compile.outDir ?? DEFAULT_SCENARIO_COMPILE_OUT_DIR;

      return [
        new ScenarioCompileTargetConfig(
          this.fsContainer.newDirectory(yamlDir),
          this.fsContainer.newDirectory(outDir),
          "jest",
          true,
        ),
      ];
    }

    return compile.targets.map((target) => {
      return new ScenarioCompileTargetConfig(
        this.fsContainer.newDirectory(target.yamlDir),
        this.fsContainer.newDirectory(target.outDir),
        target.type,
        target.useEchoedFeatures ?? true,
      );
    });
  }

  private convertScenarioCompilePluginConfig(
    compile: NonNullable<scenarioCompile>["plugin"] | undefined,
  ): ScenarioCompilePluginConfig {
    if (!compile) return new ScenarioCompilePluginConfig([], [], []);

    const runners = compile.runners?.map(
      (runner): ScenarioCompilePluginRunnerConfig => {
        return {
          module: runner.module,
          name: runner.name,
          option: this.parseJSONRecord(runner.option),
        };
      },
    );

    const asserters = compile.asserters?.map(
      (asserter): ScenarioCompilePluginAsserterConfig => {
        return {
          module: asserter.module,
          name: asserter.name,
          option: this.parseJSONRecord(asserter.option),
        };
      },
    );

    const commons = compile.commons?.map(
      (com): ScenarioCompilePluginImportConfig => {
        return {
          module: com.module,
          names: com.names ?? [],
          default: com.default,
        };
      },
    );

    return new ScenarioCompilePluginConfig(
      runners ?? [],
      asserters ?? [],
      commons ?? [],
    );
  }

  private parseJSONRecord(
    option: Record<string, unknown> | undefined,
  ): Record<string, JsonSchema> | undefined {
    if (!option) return;

    return transformRecord(option, (v) => JsonSchema.parse(v));
  }
}
