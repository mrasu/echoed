import { RawString } from "@/scenario/compile/common/rawString";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

describe("RunnerOption", () => {
  describe("parse", () => {
    it("should return RunnerOption", () => {
      const runnerOption = RunnerOption.parse({
        foo: "bar",
        baz: 1,
      });

      expect(runnerOption).toEqual(
        new RunnerOption(
          new Map([
            ["foo", new TsVariable(new RawString("bar"))],
            ["baz", new TsVariable(1)],
          ]),
        ),
      );
    });
  });
});
