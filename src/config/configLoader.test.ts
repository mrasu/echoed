import { ConfigLoader } from "@/config/configLoader";
import { Config, ServiceConfig } from "@/config/config";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { ConfigFileSchema } from "@/config/configFileSchema";

describe("ConfigLoader", () => {
  describe("loadFromObject", () => {
    describe("when services section exists", () => {
      const buildDefaultSchemaObject = (
        services: ConfigFileSchema["services"],
      ) => {
        return {
          output: "dummy",
          services,
        };
      };

      const buildConfig = (serviceConfigs: ServiceConfig[]) => {
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
        it("should load multiple openapi config", () => {
          const config = new ConfigLoader().loadFromObject(
            buildDefaultSchemaObject([
              {
                name: "service1",
                openapi: "/1/dummy-openapi.yaml",
              },
              {
                name: "service2",
                openapi: "./2/dummy-openapi.yaml",
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
                openapi: {
                  filePath: "./2/dummy-openapi.yaml",
                  basePath: undefined,
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
    });
  });
});
