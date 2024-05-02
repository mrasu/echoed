import { StepContext } from "@/scenario/gen/internal/common/stepContext";
import { buildScenarioContext } from "@/testUtil/scenario/gen/internal/jest/scenarioContext";

describe("ScenarioContext", () => {
  describe("runStep", () => {
    it("should run function with StepContext", async () => {
      const ctx = buildScenarioContext();

      let stepArg: StepContext | undefined;
      await ctx.runStep(async (step) => {
        stepArg = step;
        return Promise.resolve();
      });

      expect(stepArg).toStrictEqual(new StepContext(ctx, 0, {}, [undefined]));
    });

    describe("when running multiple times", () => {
      it("should bring previous step's data", async () => {
        const ctx = buildScenarioContext();

        await ctx.runStep(async (step) => {
          step.bindNewVariable("newVar", "newVal");
          step.recordActResult(step.actResultHistory, 1234);

          return Promise.resolve();
        });

        let stepArg: StepContext | undefined;
        await ctx.runStep(async (step) => {
          stepArg = step;
          return Promise.resolve();
        });

        expect(stepArg).toStrictEqual(
          new StepContext(ctx, 1, { newVar: "newVal" }, [1234, undefined]),
        );
      });
    });
  });
});
