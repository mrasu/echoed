import { RawString } from "@/scenario/compile/common/rawString";
import { parseArrange } from "@/scenario/compile/playwright/arrange";
import { LocatorAssertionString } from "@/scenario/compile/playwright/locatorAssertionString";
import { buildConfig } from "@/testUtil/scenario/util";

describe("parseArrange", () => {
  const config = buildConfig();

  describe("when schema is AssertionShortcutSchema", () => {
    it("should returnArrange including AssertionShortcut", () => {
      const schema = { expectToBeAttached: "q.q.q" };

      const arrange = parseArrange(config, schema);
      expect(arrange.tsString).toStrictEqual(
        new LocatorAssertionString("toBeAttached", "q.q.q", [], false),
      );
    });
  });

  describe("when schema is not AssertionShortcutSchema", () => {
    it("should return Arrange", () => {
      const arrange = parseArrange(config, "foo");
      expect(arrange.tsString).toStrictEqual(new RawString("foo"));
    });
  });
});
