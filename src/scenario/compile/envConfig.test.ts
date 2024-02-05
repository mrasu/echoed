import { EnvConfig } from "@/scenario/compile/envConfig";

describe("EnvConfig", () => {
  describe("parse", () => {
    it("should parse", () => {
      const config = EnvConfig.parse({
        foo: "bar",
        buz: null,
      });

      expect(config).toEqual(
        new EnvConfig(
          new Map([
            ["foo", "bar"],
            ["buz", null],
          ]),
        ),
      );
    });
  });
});
