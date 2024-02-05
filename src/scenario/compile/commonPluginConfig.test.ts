import { CommonPluginConfig } from "@/scenario/compile/commonPluginConfig";

describe("CommonPluginConfig", () => {
  describe("parse", () => {
    it("should parse", () => {
      const config = CommonPluginConfig.parse({
        module: "echoed/dummy/asserter",
        names: ["dummyAsserter1", "dummyAsserter2"],
        default: "defaultAsserter",
      });

      expect(config).toEqual(
        new CommonPluginConfig(
          ["dummyAsserter1", "dummyAsserter2"],
          "defaultAsserter",
          "echoed/dummy/asserter",
        ),
      );
    });
  });

  describe("importClause", () => {
    const buildConfig = ({
      names,
      defaultName,
    }: {
      names?: string[];
      defaultName?: string;
    }): CommonPluginConfig => {
      return new CommonPluginConfig(
        names ?? [],
        defaultName,
        "echoed/dummy/asserter",
      );
    };

    describe("when one name are defined", () => {
      it("should return import clause", () => {
        const config = buildConfig({ names: ["dummyAsserter"] });
        expect(config.importClause).toBe(" { dummyAsserter } ");
      });
    });

    describe("when multiple names are defined", () => {
      it("should return import clause", () => {
        const config = buildConfig({
          names: ["dummyAsserter1, dummyAsserter2"],
        });
        expect(config.importClause).toBe(
          " { dummyAsserter1, dummyAsserter2 } ",
        );
      });
    });

    describe("when defaultName is defined", () => {
      it("should return import clause", () => {
        const config = buildConfig({
          defaultName: "defaultAsserter",
        });
        expect(config.importClause).toBe(" defaultAsserter ");
      });
    });

    describe("when names and defaultName are defined", () => {
      it("should return import clause", () => {
        const config = buildConfig({
          names: ["dummyAsserter1, dummyAsserter2"],
          defaultName: "defaultAsserter",
        });
        expect(config.importClause).toBe(
          " defaultAsserter , { dummyAsserter1, dummyAsserter2 } ",
        );
      });
    });
  });
});
