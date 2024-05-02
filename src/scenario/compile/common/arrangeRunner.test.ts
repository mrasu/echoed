import { ArrangeRunner } from "@/scenario/compile/common/arrangeRunner";
import { RunnerContainer } from "@/scenario/compile/common/runnerContainer";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

describe("ArrangeRunner", () => {
  describe("boundVariables", () => {
    it("should return bound variables", () => {
      const runner = new ArrangeRunner(
        new RunnerContainer(
          "dummyRunner",
          undefined,
          new RunnerOption(new Map()),
        ),
        new Map([
          ["foo", TsVariable.parse("fooVar")],
          ["bar", TsVariable.parse("barVar")],
        ]),
      );

      expect(runner.boundVariables().sort()).toEqual(["bar", "foo"]);
    });
  });
});
