import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { PageAssertionString } from "@/scenario/compile/playwright/pageAssertionString";

describe("PageAssertionString", () => {
  describe("toTsLine", () => {
    describe("when args is empty", () => {
      it("should return await without arguments", () => {
        const pageAssertionString = new PageAssertionString("foo", [], false);
        expect(pageAssertionString.toTsLine()).toBe(
          "await expect(page).foo();",
        );
      });
    });

    describe("when args exists", () => {
      it("should return await without arguments", () => {
        const pageAssertionString = new PageAssertionString(
          "foo",
          [TsVariable.parse("aaa"), TsVariable.parse([1, 2, { a: "ccc" }])],
          false,
        );
        expect(pageAssertionString.toTsLine()).toBe(
          'await expect(page).foo(`aaa`, [1,2,{"a": `ccc`,}]);',
        );
      });
    });
  });
});
