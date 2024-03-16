import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import { Config, ServiceConfig } from "@/config/config";
import { ConfigLoader } from "@/config/configLoader";
import {
  PropagationTestConfig,
  PropagationTestIgnoreConditionConfig,
} from "@/config/propagationTestConfig";
import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { ConfigSchema } from "@/schema/configSchema";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { MockFile } from "@/testUtil/fs/mockFile";
import { buildMockFsContainer } from "@/testUtil/fs/mockFsContainer";

describe("ConfigLoader", () => {
  const fsContainer = buildMockFsContainer();

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

      const buildExpectedConfig = (serviceConfigs: ServiceConfig[]): Config => {
        return new Config(
          new MockFile("dummy"),
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
              conditions: [],
            },
          }),
          serviceConfigs,
          undefined,
        );
      };

      describe("when only name exists", () => {
        it("should load name", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
              },
            ]),
          );
          expect(config).toEqual(
            buildExpectedConfig([
              {
                name: "service",
              },
            ]),
          );
        });
      });

      describe("when namespace exists", () => {
        it("should load namespace too", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                namespace: "awesome-namespace",
              },
            ]),
          );
          expect(config).toEqual(
            buildExpectedConfig([
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
          const config = new ConfigLoader(fsContainer).loadFromObject(
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
            buildExpectedConfig([
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
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                openapi: "/hello/dummy-openapi.yaml",
              },
            ]),
          );
          expect(config).toEqual(
            buildExpectedConfig([
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
          const config = new ConfigLoader(fsContainer).loadFromObject(
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
            buildExpectedConfig([
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
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service",
                proto: "/hello/dummy.proto",
              },
            ]),
          );
          expect(config).toEqual(
            buildExpectedConfig([
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
          const config = new ConfigLoader(fsContainer).loadFromObject(
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
            buildExpectedConfig([
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

      const buildExpectedCompileConfig = (
        compileConfig?: Partial<ScenarioCompileConfig>,
      ): ScenarioCompileConfig => {
        return new ScenarioCompileConfig(
          compileConfig?.outDir ?? new MockDirectory("scenario_gen"),
          compileConfig?.cleanOutDir ?? false,
          compileConfig?.yamlDir ?? new MockDirectory("scenario"),
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
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject(undefined),
          );

          expect(config.compileConfig).toEqual(undefined);
        });
      });

      describe("when config is empty", () => {
        it("should load default CompileConfig", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({}),
          );

          expect(config.compileConfig).toEqual(buildExpectedCompileConfig({}));
        });
      });

      describe("when outDir exists", () => {
        it("should set outDir", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({
              outDir: "dummy_out",
            }),
          );

          expect(config.compileConfig).toEqual(
            buildExpectedCompileConfig({
              outDir: new MockDirectory("dummy_out"),
            }),
          );
        });
      });

      describe("when cleanOutDir exists", () => {
        it("should set cleanOutDir", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({
              cleanOutDir: true,
            }),
          );

          expect(config.compileConfig).toEqual(
            buildExpectedCompileConfig({ cleanOutDir: true }),
          );
        });
      });

      describe("when yamlDir exists", () => {
        it("should set yamlDir", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({
              yamlDir: "dummy_yaml_dir",
            }),
          );

          expect(config.compileConfig).toEqual(
            buildExpectedCompileConfig({
              yamlDir: new MockDirectory("dummy_yaml_dir"),
            }),
          );
        });
      });

      describe("when retry exists", () => {
        it("should set retry", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({
              retry: 123,
            }),
          );

          expect(config.compileConfig).toEqual(
            buildExpectedCompileConfig({ retry: 123 }),
          );
        });
      });

      describe("when env exists", () => {
        it("should set env", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({
              env: {
                DUMMY: "dummy",
                UNDEFINED: null,
              },
            }),
          );

          expect(config.compileConfig).toEqual(
            buildExpectedCompileConfig({
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
            const config = new ConfigLoader(fsContainer).loadFromObject(
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
              buildExpectedCompileConfig({
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
              const config = new ConfigLoader(fsContainer).loadFromObject(
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
                buildExpectedCompileConfig({
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
            const config = new ConfigLoader(fsContainer).loadFromObject(
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
              buildExpectedCompileConfig({
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
              const config = new ConfigLoader(fsContainer).loadFromObject(
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
                buildExpectedCompileConfig({
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
              const config = new ConfigLoader(fsContainer).loadFromObject(
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
                buildExpectedCompileConfig({
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
              const config = new ConfigLoader(fsContainer).loadFromObject(
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
                buildExpectedCompileConfig({
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

    describe("when propagationTest section exists", () => {
      const buildSchemaObject = (
        propagationTest: NonNullable<ConfigSchema["propagationTest"]>,
      ): {
        output: string;
        propagationTest: ConfigSchema["propagationTest"];
      } => {
        return {
          output: "dummy",
          propagationTest,
        };
      };

      describe("when no value is set", () => {
        it("should set propagationTest disabled", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({}),
          );

          expect(config.propagationTestConfig.enabled).toEqual(true);
          expect(config.propagationTestConfig.ignoreConditions).toEqual([]);
        });
      });

      describe("when enabled is false", () => {
        it("should set propagationTest disabled", () => {
          const config = new ConfigLoader(fsContainer).loadFromObject(
            buildSchemaObject({
              enabled: false,
            }),
          );

          expect(config.propagationTestConfig.enabled).toEqual(false);
        });
      });

      describe("when ignore is set", () => {
        const buildIgnoreConditions = (
          conditions: {
            attributes?: [string, Comparable][];
            resource?: { attributes?: [string, Comparable][] };
          }[],
        ): PropagationTestIgnoreConditionConfig[] => {
          return conditions.map((c) => {
            return new PropagationTestIgnoreConditionConfig({
              attributes: new Map(c.attributes ?? []),
              resource: {
                attributes: new Map(c.resource?.attributes ?? []),
              },
            });
          });
        };

        describe("when attributes is set", () => {
          it("should spread conditions", () => {
            const config = new ConfigLoader(fsContainer).loadFromObject(
              buildSchemaObject({
                ignore: {
                  attributes: {
                    foo1: "bar1",
                    foo2: "bar2",
                  },
                },
              }),
            );

            expect(config.propagationTestConfig.ignoreConditions).toEqual(
              buildIgnoreConditions([
                {
                  attributes: [["foo1", new Eq("bar1")]],
                },
                {
                  attributes: [["foo2", new Eq("bar2")]],
                },
              ]),
            );
          });

          describe("when value uses regexp", () => {
            it("should set as Reg", () => {
              const config = new ConfigLoader(fsContainer).loadFromObject(
                buildSchemaObject({
                  ignore: {
                    attributes: {
                      foo: {
                        regexp: "bar.+",
                      },
                    },
                  },
                }),
              );

              expect(config.propagationTestConfig.ignoreConditions).toEqual(
                buildIgnoreConditions([
                  {
                    attributes: [["foo", new Reg(/bar.+/)]],
                  },
                ]),
              );
            });
          });
        });

        describe("when resource is set", () => {
          describe("when no value is set", () => {
            it("should set no condition", () => {
              const config = new ConfigLoader(fsContainer).loadFromObject(
                buildSchemaObject({
                  ignore: {
                    resource: {},
                  },
                }),
              );

              expect(config.propagationTestConfig.ignoreConditions).toEqual([]);
            });
          });

          describe("when attribute is set", () => {
            it("should spread condition", () => {
              const config = new ConfigLoader(fsContainer).loadFromObject(
                buildSchemaObject({
                  ignore: {
                    resource: {
                      attributes: {
                        foo1: "bar1",
                        foo2: "bar2",
                      },
                    },
                  },
                }),
              );

              expect(config.propagationTestConfig.ignoreConditions).toEqual(
                buildIgnoreConditions([
                  {
                    resource: { attributes: [["foo1", new Eq("bar1")]] },
                  },
                  {
                    resource: { attributes: [["foo2", new Eq("bar2")]] },
                  },
                ]),
              );
            });

            describe("when regexp is used", () => {
              it("should set as Reg", () => {
                const config = new ConfigLoader(fsContainer).loadFromObject(
                  buildSchemaObject({
                    ignore: {
                      resource: {
                        attributes: {
                          foo: { regexp: "bar.+" },
                        },
                      },
                    },
                  }),
                );

                expect(config.propagationTestConfig.ignoreConditions).toEqual(
                  buildIgnoreConditions([
                    {
                      resource: {
                        attributes: [["foo", new Reg(/bar.+/)]],
                      },
                    },
                  ]),
                );
              });
            });
          });
        });

        describe("when conditions are set", () => {
          it("should set conditions", () => {
            const config = new ConfigLoader(fsContainer).loadFromObject(
              buildSchemaObject({
                ignore: {
                  conditions: [
                    {
                      attributes: {
                        foo1: "bar1",
                      },
                      resource: {
                        attributes: {
                          foo2: "bar2",
                        },
                      },
                    },
                    {
                      attributes: {
                        foo: "bar",
                      },
                    },
                  ],
                },
              }),
            );

            expect(config.propagationTestConfig.ignoreConditions).toEqual(
              buildIgnoreConditions([
                {
                  attributes: [["foo1", new Eq("bar1")]],
                  resource: { attributes: [["foo2", new Eq("bar2")]] },
                },
                {
                  attributes: [["foo", new Eq("bar")]],
                },
              ]),
            );
          });

          describe("when regexp is used", () => {
            it("should set as Reg", () => {
              const config = new ConfigLoader(fsContainer).loadFromObject(
                buildSchemaObject({
                  ignore: {
                    conditions: [
                      {
                        attributes: {
                          foo1: { regexp: "bar1.+" },
                          foo2: { regexp: "bar2.+" },
                        },
                      },
                    ],
                  },
                }),
              );

              expect(config.propagationTestConfig.ignoreConditions).toEqual(
                buildIgnoreConditions([
                  {
                    attributes: [
                      ["foo1", new Reg(/bar1.+/)],
                      ["foo2", new Reg(/bar2.+/)],
                    ],
                  },
                ]),
              );
            });
          });
        });
      });
    });
  });
});
