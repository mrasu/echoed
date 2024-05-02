import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { TemplateString } from "@/scenario/compile/common/templateString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

describe("RunnerConfig", () => {
  describe("parse", () => {
    it("should returns RunnerConfig", () => {
      const runnerConfig = RunnerConfig.parse({
        module: "echoed/dummy2/runner",
        name: "runner2",
        option: {
          foo: "bar",
          baz: 1,
        },
      });

      expect(runnerConfig).toEqual(
        new RunnerConfig(
          "runner2",
          "echoed/dummy2/runner",
          new RunnerOption(
            new Map([
              ["foo", new TsVariable(new TemplateString("bar"))],
              ["baz", new TsVariable(1)],
            ]),
          ),
        ),
      );
    });
  });
});
