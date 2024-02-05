import { RawString } from "@/scenario/compile/rawString";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { TsVariable } from "@/scenario/compile/tsVariable";

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
