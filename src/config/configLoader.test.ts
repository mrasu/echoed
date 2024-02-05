import { Config, ServiceConfig } from "@/config/config";
import { ConfigLoader } from "@/config/configLoader";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { ConfigSchema } from "@/schema/configSchema";

describe("ConfigLoader", () => {
  describe("loadFromObject", () => {
    describe("when services section exists", () => {
      const buildDefaultSchemaObject = (
        services: ConfigSchema["services"],
      ): { output: string; services: ConfigSchema["services"] } => {
        return {
          output: "dummy",
          services,
        };
      };

      const buildConfig = (serviceConfigs: ServiceConfig[]): Config => {
        return new Config(
          "dummy",
          3000,
          20,
          false,
          new PropagationTestConfig({
            enabled: true,
            ignore: {
              attributes: new Map(),
              resource: {
                attributes: new Map(),
              },
            },
          }),
          serviceConfigs,
          undefined,
        );
      };

      describe("when only name exists", () => {
        it("should load name", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
              },
            ]),
          );
          expect(config).toEqual(
            buildConfig([
              {
                name: "service",
              },
            ]),
          );
        });
      });

      describe("when namespace exists", () => {
        it("should load namespace too", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                namespace: "awesome-namespace",
              },
            ]),
          );
          expect(config).toEqual(
            buildConfig([
              {
                name: "service",
                namespace: "awesome-namespace",
              },
            ]),
          );
        });
      });

      describe("when multiple services exist", () => {
        it("should load multiple config", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service1",
                openapi: "/1/dummy-openapi.yaml",
              },
              {
                name: "service2",
                proto: "./2/dummy.proto",
              },
            ]),
          );
          expect(config).toEqual(
            buildConfig([
              {
                name: "service1",
                namespace: undefined,
                openapi: {
                  filePath: "/1/dummy-openapi.yaml",
                  basePath: undefined,
                },
              },
              {
                name: "service2",
                namespace: undefined,
                proto: {
                  filePath: "./2/dummy.proto",
                  services: undefined,
                },
              },
            ]),
          );
        });
      });

      describe("when openapi is string", () => {
        it("should load openapi with filename", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                openapi: "/hello/dummy-openapi.yaml",
              },
            ]),
          );
          expect(config).toEqual(
            buildConfig([
              {
                name: "service",
                openapi: {
                  filePath: "/hello/dummy-openapi.yaml",
                },
              },
            ]),
          );
        });
      });

      describe("when openapi is object", () => {
        it("should load openapi with filename", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                openapi: {
                  filePath: "/hello/dummy-openapi.yaml",
                  basePath: "/api",
                },
              },
            ]),
          );
          expect(config).toEqual(
            buildConfig([
              {
                name: "service",
                openapi: {
                  filePath: "/hello/dummy-openapi.yaml",
                  basePath: "/api",
                },
              },
            ]),
          );
        });
      });

      describe("when proto is string", () => {
        it("should load proto with filename", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                proto: "/hello/dummy.proto",
              },
            ]),
          );
          expect(config).toEqual(
            buildConfig([
              {
                name: "service",
                proto: {
                  filePath: "/hello/dummy.proto",
                },
              },
            ]),
          );
        });
      });

      describe("when proto is object", () => {
        it("should load proto with filename", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                proto: {
                  filePath: "/hello/dummy.proto",
                  services: ["service1", "service2"],
                },
              },
            ]),
          );
          expect(config).toEqual(
            buildConfig([
              {
                name: "service",
                proto: {
                  filePath: "/hello/dummy.proto",
                  services: ["service1", "service2"],
                },
              },
            ]),
          );
        });
      });
    });

    describe("when compile section exists", () => {
      const buildSchemaObject = (
        compile: NonNullable<ConfigSchema["scenario"]>["compile"],
      ): { output: string; scenario: ConfigSchema["scenario"] } => {
        return {
          output: "dummy",
          scenario: {
            compile,
          },
        };
      };

      const buildCompileConfig = (
        compileConfig?: Partial<ScenarioCompileConfig>,
      ): ScenarioCompileConfig => {
        return new ScenarioCompileConfig(
          compileConfig?.outDir ?? "scenario_gen",
          compileConfig?.cleanOutDir ?? false,
          compileConfig?.yamlDir ?? "scenario",
          compileConfig?.retry ?? 0,
          compileConfig?.env ?? {},
          {
            runners: compileConfig?.plugin?.runners ?? [],
            asserters: compileConfig?.plugin?.asserters ?? [],
            commons: compileConfig?.plugin?.commons ?? [],
          },
        );
      };

      describe("when config is undefined", () => {
        it("should load no CompileConfig", () => {
          const config = new ConfigLoader().loadFromObject(
            buildSchemaObject(undefined),
          );

          expect(config.compileConfig).toEqual(undefined);
        });
      });

      describe("when config is empty", () => {
        it("should load default CompileConfig", () => {
          const config = new ConfigLoader().loadFromObject(
            buildSchemaObject({}),
          );

          expect(config.compileConfig).toEqual(buildCompileConfig({}));
        });
      });

      describe("when outDir exists", () => {
        it("should set outDir", () => {
          const config = new ConfigLoader().loadFromObject(
            buildSchemaObject({
              outDir: "dummy_out",
            }),
          );

          expect(config.compileConfig).toEqual(
            buildCompileConfig({ outDir: "dummy_out" }),
          );
        });
      });

      describe("when cleanOutDir exists", () => {
        it("should set cleanOutDir", () => {
          const config = new ConfigLoader().loadFromObject(
            buildSchemaObject({
              cleanOutDir: true,
            }),
          );

          expect(config.compileConfig).toEqual(
            buildCompileConfig({ cleanOutDir: true }),
          );
        });
      });

      describe("when yamlDir exists", () => {
        it("should set yamlDir", () => {
          const config = new ConfigLoader().loadFromObject(
            buildSchemaObject({
              yamlDir: "dummy_yaml_dir",
            }),
          );

          expect(config.compileConfig).toEqual(
            buildCompileConfig({ yamlDir: "dummy_yaml_dir" }),
          );
        });
      });

      describe("when retry exists", () => {
        it("should set retry", () => {
          const config = new ConfigLoader().loadFromObject(
            buildSchemaObject({
              retry: 123,
            }),
          );

          expect(config.compileConfig).toEqual(
            buildCompileConfig({ retry: 123 }),
          );
        });
      });

      describe("when env exists", () => {
        it("should set env", () => {
          const config = new ConfigLoader().loadFromObject(
            buildSchemaObject({
              env: {
                DUMMY: "dummy",
                UNDEFINED: null,
              },
            }),
          );

          expect(config.compileConfig).toEqual(
            buildCompileConfig({
              env: {
                DUMMY: "dummy",
                UNDEFINED: null,
              },
            }),
          );
        });
      });

      describe("when plugin exists", () => {
        describe("when runner exists", () => {
          it("should set runner", () => {
            const config = new ConfigLoader().loadFromObject(
              buildSchemaObject({
                plugin: {
                  runners: [
                    {
                      name: "runner",
                      module: "dummy/runner",
                    },
                  ],
                },
              }),
            );

            expect(config.compileConfig).toEqual(
              buildCompileConfig({
                plugin: {
                  runners: [
                    {
                      name: "runner",
                      module: "dummy/runner",
                      option: undefined,
                    },
                  ],
                  asserters: [],
                  commons: [],
                },
              }),
            );
          });

          describe("when option exists", () => {
            it("should set option", () => {
              const config = new ConfigLoader().loadFromObject(
                buildSchemaObject({
                  plugin: {
                    runners: [
                      {
                        name: "runner",
                        module: "dummy/runner",
                        option: {
                          foo: "bar",
                          baz: 123,
                        },
                      },
                    ],
                  },
                }),
              );

              expect(config.compileConfig).toEqual(
                buildCompileConfig({
                  plugin: {
                    runners: [
                      {
                        name: "runner",
                        module: "dummy/runner",
                        option: {
                          foo: "bar",
                          baz: 123,
                        },
                      },
                    ],
                    asserters: [],
                    commons: [],
                  },
                }),
              );
            });
          });
        });

        describe("when asserter exists", () => {
          it("should set asserter", () => {
            const config = new ConfigLoader().loadFromObject(
              buildSchemaObject({
                plugin: {
                  asserters: [
                    {
                      name: "asserter",
                      module: "dummy/asserter",
                    },
                  ],
                },
              }),
            );

            expect(config.compileConfig).toEqual(
              buildCompileConfig({
                plugin: {
                  runners: [],
                  asserters: [
                    {
                      name: "asserter",
                      module: "dummy/asserter",
                      option: undefined,
                    },
                  ],
                  commons: [],
                },
              }),
            );
          });

          describe("when option exists", () => {
            it("should set option", () => {
              const config = new ConfigLoader().loadFromObject(
                buildSchemaObject({
                  plugin: {
                    asserters: [
                      {
                        name: "asserter",
                        module: "dummy/asserter",
                        option: {
                          foo: "bar",
                          baz: 123,
                        },
                      },
                    ],
                  },
                }),
              );

              expect(config.compileConfig).toEqual(
                buildCompileConfig({
                  plugin: {
                    runners: [],
                    asserters: [
                      {
                        name: "asserter",
                        module: "dummy/asserter",
                        option: {
                          foo: "bar",
                          baz: 123,
                        },
                      },
                    ],
                    commons: [],
                  },
                }),
              );
            });
          });
        });

        describe("when import exists", () => {
          describe("when names exists", () => {
            it("should set names", () => {
              const config = new ConfigLoader().loadFromObject(
                buildSchemaObject({
                  plugin: {
                    commons: [
                      {
                        names: ["import1", "import2"],
                        module: "dummy/import",
                      },
                    ],
                  },
                }),
              );

              expect(config.compileConfig).toEqual(
                buildCompileConfig({
                  plugin: {
                    runners: [],
                    asserters: [],
                    commons: [
                      {
                        names: ["import1", "import2"],
                        module: "dummy/import",
                        default: undefined,
                      },
                    ],
                  },
                }),
              );
            });
          });

          describe("when default exists", () => {
            it("should set default", () => {
              const config = new ConfigLoader().loadFromObject(
                buildSchemaObject({
                  plugin: {
                    commons: [
                      {
                        module: "dummy/import",
                        default: "defaultImport",
                      },
                    ],
                  },
                }),
              );

              expect(config.compileConfig).toEqual(
                buildCompileConfig({
                  plugin: {
                    runners: [],
                    asserters: [],
                    commons: [
                      {
                        names: [],
                        module: "dummy/import",
                        default: "defaultImport",
                      },
                    ],
                  },
                }),
              );
            });
          });
        });
      });
    });
  });
});
