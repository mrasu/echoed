import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

describe("AsserterConfig", () => {
  describe("parse", () => {
    it("should parse", () => {
      const config = AsserterConfig.parse({
        module: "echoed/dummy/asserter",
        name: "dummyAsserter",
        option: {
          foo: "bar",
          complex: { foo: { bar: "buz" } },
        },
      });

      expect(config.module).toBe("echoed/dummy/asserter");
      expect(config.name).toBe("dummyAsserter");
      expect(config.option).toEqual(
        new Map([
          ["foo", TsVariable.parse("bar")],
          ["complex", TsVariable.parse({ foo: { bar: "buz" } })],
        ]),
      );
    });
  });
});
