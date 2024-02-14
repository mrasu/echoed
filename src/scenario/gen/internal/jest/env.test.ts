import { buildEnv } from "@/scenario/gen/internal/jest/env";

describe("buildEnv", () => {
  describe("when environment variable is set", () => {
    beforeEach(() => {
      process.env["DUMMY_KEY"] = "dummy_value";
    });
    afterEach(() => {
      delete process.env["DUMMY_KEY"];
    });

    describe("when value is not null", () => {
      it("should return environment variable", () => {
        const actual = buildEnv({ DUMMY_KEY: "defaultValue" });
        expect(actual["DUMMY_KEY"]).toBe("dummy_value");
      });
    });

    describe("when value is null", () => {
      it("should return environment variable", () => {
        const actual = buildEnv({ DUMMY_KEY: null });
        expect(actual["DUMMY_KEY"]).toBe("dummy_value");
      });
    });
  });

  describe("when environment variable is not set", () => {
    describe("when value is not null", () => {
      it("should return specified value", () => {
        const actual = buildEnv({ DUMMY_KEY: "defaultValue" });
        expect(actual["DUMMY_KEY"]).toBe("defaultValue");
      });
    });

    describe("when value is null", () => {
      it("should raise error", () => {
        expect(() => {
          buildEnv({ DUMMY_KEY: null });
        }).toThrow(/DUMMY_KEY/);
      });
    });
  });
});
