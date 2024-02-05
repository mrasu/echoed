import { CommonPluginConfig } from "@/scenario/compile/commonPluginConfig";

describe("ImportConfig", () => {
  describe("parse", () => {
    describe("when no default specified", () => {
      it("should set defaultName undefined", () => {
        const config = CommonPluginConfig.parse({
          module: "echoed/dummy/import",
          names: ["foo", "bar"],
        });

        expect(config).toEqual(
          new CommonPluginConfig(
            ["foo", "bar"],
            undefined,
            "echoed/dummy/import",
          ),
        );
      });
    });

    describe("when default specified", () => {
      it("should set defaultName", () => {
        const config = CommonPluginConfig.parse({
          module: "echoed/dummy/import",
          names: ["foo", "bar"],
          default: "defaultName",
        });

        expect(config).toEqual(
          new CommonPluginConfig(
            ["foo", "bar"],
            "defaultName",
            "echoed/dummy/import",
          ),
        );
      });
    });
  });

  describe("importClause", () => {
    describe("when one name are specified", () => {
      const config = new CommonPluginConfig(
        ["foo"],
        undefined,
        "echoed/dummy/import",
      );

      it("should return import clause", () => {
        expect(config.importClause).toEqual(" { foo } ");
      });
    });

    describe("when multiple names are specified", () => {
      const config = new CommonPluginConfig(
        ["foo", "bar"],
        undefined,
        "echoed/dummy/import",
      );

      it("should return import clause", () => {
        expect(config.importClause).toEqual(" { foo, bar } ");
      });
    });

    describe("when default are specified", () => {
      const config = new CommonPluginConfig(
        [],
        "defaultName",
        "echoed/dummy/import",
      );

      it("should return import clause", () => {
        expect(config.importClause).toEqual(" defaultName ");
      });
    });

    describe("when default and names are specified", () => {
      const config = new CommonPluginConfig(
        ["foo", "bar"],
        "defaultName",
        "echoed/dummy/import",
      );

      it("should return import clause", () => {
        expect(config.importClause).toEqual(" defaultName , { foo, bar } ");
      });
    });
  });
});
