import { Arrange } from "@/scenario/compile/common/arrange";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { DummyStep } from "@/testUtil/scenario/dummyStep";

const buildStep = (): DummyStep => {
  return new DummyStep({
    arranges: [
      new Arrange(
        undefined,
        undefined,
        new Map([["val0", TsVariable.parse("foo")]]),
      ),
      new Arrange(
        undefined,
        undefined,
        new Map([["val1", TsVariable.parse("bar")]]),
      ),
      new Arrange(
        undefined,
        undefined,
        new Map([["val2", TsVariable.parse("buz")]]),
      ),
    ],
  });
};

describe("StepBase", () => {
  describe("boundVariables", () => {
    describe("when bound", () => {
      it("should return bound variables", () => {
        const step = new DummyStep({
          bind: new Map([
            ["foo", TsVariable.parse("fooVal")],
            ["bar", TsVariable.parse("barVal")],
          ]),
        });

        expect(step.boundVariables().sort()).toEqual(["bar", "foo"]);
      });
    });

    describe("when bind is empty", () => {
      it("should return empty", () => {
        const step = new DummyStep({
          bind: new Map([]),
        });

        expect(step.boundVariables().sort()).toEqual([]);
      });
    });
  });

  describe("getArrangeBoundVariablesBefore", () => {
    const step = buildStep();

    describe("when bound before", () => {
      it("should return bound variables", () => {
        expect(step.getArrangeBoundVariablesBefore(2)).toEqual([
          "val0",
          "val1",
        ]);
      });
    });

    describe("when not bound before", () => {
      it("should return nothing", () => {
        expect(step.getArrangeBoundVariablesBefore(0)).toEqual([]);
      });
    });
  });

  describe("getArrangeBoundVariables", () => {
    const step = buildStep();

    it("should return all variables", () => {
      expect(step.getArrangeBoundVariables()).toEqual(["val0", "val1", "val2"]);
    });
  });
});
