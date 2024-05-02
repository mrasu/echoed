import { Act } from "@/scenario/compile/common/act";
import { ActRunner } from "@/scenario/compile/common/actRunner";
import { Arrange } from "@/scenario/compile/common/arrange";
import { ArrangeRunner } from "@/scenario/compile/common/arrangeRunner";
import { Assert } from "@/scenario/compile/common/assert";
import { Asserter } from "@/scenario/compile/common/asserter";
import { RunnerContainer } from "@/scenario/compile/common/runnerContainer";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { DummyScenario } from "@/testUtil/scenario/dummyScenario";
import { DummyScenarioBookBase } from "@/testUtil/scenario/dummyScenarioBook";
import { DummyStep } from "@/testUtil/scenario/dummyStep";
import { buildConfig } from "@/testUtil/scenario/util";

const buildScenario = (): DummyScenarioBookBase => {
  return new DummyScenarioBookBase({
    scenarios: [
      new DummyScenario({
        steps: [
          new DummyStep({
            arranges: [
              new Arrange(
                undefined,
                new ArrangeRunner(
                  new RunnerContainer(
                    "arrangeRunner",
                    undefined,
                    new RunnerOption(new Map()),
                  ),
                  new Map(),
                ),
              ),
            ],
          }),
          new DummyStep({
            act: new Act(
              new ActRunner(
                new RunnerContainer(
                  "actRunner",
                  undefined,
                  new RunnerOption(new Map()),
                ),
              ),
            ),
          }),
        ],
      }),
      new DummyScenario({
        steps: [
          new DummyStep({
            asserts: [
              new Assert(
                undefined,
                new Asserter(
                  "Asserter",
                  new TsVariable(null),
                  new TsVariable(null),
                ),
              ),
            ],
          }),
        ],
      }),
    ],
  });
};

describe("ScenarioBookBase", () => {
  describe("getRetryCount", () => {
    const config = buildConfig({ retry: 1234 });

    describe("when retry is set", () => {
      it("should return retry count", () => {
        const book = new DummyScenarioBookBase({ retry: 3 });
        expect(book.getRetryCount(config)).toEqual(3);
      });
    });

    describe("when retry is not set", () => {
      it("should return retry count from config", () => {
        const book = new DummyScenarioBookBase();
        expect(book.getRetryCount(config)).toEqual(1234);
      });
    });
  });

  describe("getUsedRunners", () => {
    const book = buildScenario();

    it("should return used runners", () => {
      expect(book.getUsedRunners()).toEqual(
        new Set(["arrangeRunner", "actRunner"]),
      );
    });
  });

  describe("getUsedAsserters", () => {
    const book = buildScenario();

    it("should return used asserters", () => {
      expect(book.getUsedAsserters()).toEqual(new Set(["Asserter"]));
    });
  });
});
