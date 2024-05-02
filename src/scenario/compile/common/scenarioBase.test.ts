import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { DummyScenario } from "@/testUtil/scenario/dummyScenario";
import { DummyStep } from "@/testUtil/scenario/dummyStep";

const buildScenario = (): DummyScenario => {
  return new DummyScenario({
    steps: [
      new DummyStep({
        bind: new Map([["step0", TsVariable.parse("foo")]]),
      }),
      new DummyStep({
        bind: new Map([["step1", TsVariable.parse("foo")]]),
      }),
      new DummyStep({
        bind: new Map([["step2", TsVariable.parse("foo")]]),
      }),
    ],
  });
};

describe("ScenarioBase", () => {
  describe("getBoundVariablesBefore", () => {
    describe("when bound before", () => {
      it("should return bound variables", () => {
        const scenario = buildScenario();
        expect(scenario.getBoundVariablesBefore(2)).toEqual(["step0", "step1"]);
      });
    });

    describe("when not bound before", () => {
      it("should return empty", () => {
        const scenario = buildScenario();
        expect(scenario.getBoundVariablesBefore(0)).toEqual([]);
      });
    });
  });

  describe("escapedName", () => {
    it("should return escaped name", () => {
      const scenario = new DummyScenario({ name: "my `best` scenario" });
      expect(scenario.escapedName).toEqual("my \\`best\\` scenario");
    });
  });
});
