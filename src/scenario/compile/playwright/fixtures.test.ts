import { Fixtures } from "@/scenario/compile/playwright/fixtures";

describe("Fixtures", () => {
  describe("toTs", () => {
    describe("when fixtures is empty", () => {
      it("should return empty string", () => {
        const fixtures = new Fixtures([]);
        expect(fixtures.toTs()).toBe("");
      });
    });

    describe("when fixtures is not empty", () => {
      it("should return joined fixtures", () => {
        const fixtures = new Fixtures(["foo", "bar"]);
        expect(fixtures.toTs()).toBe("foo, bar");
      });
    });
  });
});
