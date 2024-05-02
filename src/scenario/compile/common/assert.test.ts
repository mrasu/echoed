import { Assert } from "@/scenario/compile/common/assert";
import { Asserter } from "@/scenario/compile/common/asserter";
import { RawString } from "@/scenario/compile/common/rawString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Assert", () => {
  const config = buildConfig();

  describe("parse", () => {
    it("should parse string", () => {
      const assert = Assert.parse(config, "foo");

      expect(assert.tsString).toEqual(new RawString("foo"));
      expect(assert.asserter).toBeUndefined();
    });

    it("should parse asserter", () => {
      const assert = Assert.parse(config, { dummyAsserter: [1, 2] });

      expect(assert.tsString).toBeUndefined();
      expect(assert.asserter).toEqual(
        new Asserter("dummyAsserter", new TsVariable(1), new TsVariable(2)),
      );
    });
  });
});
