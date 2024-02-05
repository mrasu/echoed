import { Asserter } from "@/scenario/compile/asserter";
import { AsserterConfig } from "@/scenario/compile/asserterConfig";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Asserter", () => {
  const config = buildConfig();

  describe("parse", () => {
    it("should work", () => {
      const asserter = Asserter.parse(config, { dummyAsserter: [1, 2] });

      expect(asserter.name).toEqual("dummyAsserter");
      expect(asserter.x).toEqual(new TsVariable(1));
      expect(asserter.y).toEqual(new TsVariable(2));
    });

    it("should fail when asserter is not registered", () => {
      const parseFunc = (): void => {
        Asserter.parse(config, { unknownAsserter: [1, 2] });
      };

      expect(parseFunc).toThrow(InvalidScenarioError);
    });

    it("should fail when multiple asserters are defined", () => {
      const config = buildConfig({
        asserters: [
          new AsserterConfig("asserter1", "", new Map()),
          new AsserterConfig("asserter2", "", new Map()),
        ],
      });
      const parseFunc = (): void => {
        Asserter.parse(config, {
          asserter1: [1, 2],
          asserter2: [1, 2],
        });
      };

      expect(parseFunc).toThrow(InvalidScenarioError);
    });
  });
});
