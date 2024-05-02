import { RawString } from "@/scenario/compile/common/rawString";
import { parseAssert } from "@/scenario/compile/playwright/assert";
import { LocatorAssertionString } from "@/scenario/compile/playwright/locatorAssertionString";
import { buildConfig } from "@/testUtil/scenario/util";

describe("parseAssert", () => {
  const config = buildConfig();

  describe("when schema is AssertionShortcutSchema", () => {
    it("should returnArrange including AssertionShortcut", () => {
      const schema = { expectToBeAttached: "q.q.q" };

      const assert = parseAssert(config, schema);
      expect(assert.tsString).toStrictEqual(
        new LocatorAssertionString("toBeAttached", "q.q.q", [], false),
      );
    });
  });

  describe("when schema is not AssertionShortcutSchema", () => {
    it("should return Arrange", () => {
      const assert = parseAssert(config, "foo");
      expect(assert.tsString).toStrictEqual(new RawString("foo"));
    });
  });
});
