import { Assert } from "@/scenario/compile/assert";
import { Asserter } from "@/scenario/compile/asserter";
import { RawString } from "@/scenario/compile/rawString";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Assert", () => {
  const config = buildConfig();

  describe("parse", () => {
    it("should parse string", () => {
      const assert = Assert.parse(config, "foo");

      expect(assert.rawString).toEqual(new RawString("foo"));
      expect(assert.asserter).toBeUndefined();
    });

    it("should parse string", () => {
      const assert = Assert.parse(config, { dummyAsserter: [1, 2] });

      expect(assert.rawString).toBeUndefined();
      expect(assert.asserter).toEqual(
        new Asserter("dummyAsserter", new TsVariable(1), new TsVariable(2)),
      );
    });
  });
});
