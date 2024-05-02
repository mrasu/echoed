import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { LocatorAssertionString } from "@/scenario/compile/playwright/locatorAssertionString";

describe("LocatorAssertionString", () => {
  describe("toTsLine", () => {
    describe("when args is empty", () => {
      it("should return await without arguments", () => {
        const locatorAssertionString = new LocatorAssertionString(
          "foo",
          "bar",
          [],
          false,
        );
        expect(locatorAssertionString.toTsLine()).toBe(
          'await expect(page.locator("bar")).foo();',
        );
      });
    });

    describe("when args exists", () => {
      it("should return await without arguments", () => {
        const locatorAssertionString = new LocatorAssertionString(
          "foo",
          "bar",
          [TsVariable.parse("aaa"), TsVariable.parse([1, 2, { a: "ccc" }])],
          false,
        );
        expect(locatorAssertionString.toTsLine()).toBe(
          'await expect(page.locator("bar")).foo(`aaa`, [1,2,{"a": `ccc`,}]);',
        );
      });
    });
  });
});
